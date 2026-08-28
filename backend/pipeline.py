"""Clipwave pipeline: YouTube -> transcript -> Claude viral scoring -> FFmpeg cuts."""

from __future__ import annotations

import json
import os
import re
import subprocess
import uuid
from dataclasses import dataclass, asdict
from pathlib import Path

import anthropic
import yt_dlp
from faster_whisper import WhisperModel

WORK_DIR = Path(os.getenv("WORK_DIR", "./work"))
WORK_DIR.mkdir(parents=True, exist_ok=True)

_whisper: WhisperModel | None = None


def _get_whisper() -> WhisperModel:
    global _whisper
    if _whisper is None:
        _whisper = WhisperModel(
            os.getenv("WHISPER_MODEL", "base"),
            device=os.getenv("WHISPER_DEVICE", "cpu"),
            compute_type=os.getenv("WHISPER_COMPUTE", "int8"),
        )
    return _whisper


@dataclass
class TranscriptSegment:
    start: float
    end: float
    text: str


@dataclass
class Clip:
    start: float
    end: float
    title: str
    hook: int
    retention: int
    emotion: int
    share: int
    viral_score: int
    rationale: str
    file: str | None = None


def download_youtube(url: str, job_dir: Path) -> Path:
    out = job_dir / "source.%(ext)s"
    opts = {
        "format": "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
        "merge_output_format": "mp4",
        "outtmpl": str(out),
        "quiet": True,
        "noprogress": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
    return job_dir / f"source.{info.get('ext', 'mp4')}"


def transcribe(video_path: Path) -> list[TranscriptSegment]:
    model = _get_whisper()
    segments, _ = model.transcribe(str(video_path), vad_filter=True, beam_size=1)
    return [
        TranscriptSegment(start=s.start, end=s.end, text=s.text.strip())
        for s in segments
    ]


VIRAL_PROMPT = """Tu es un monteur senior spécialisé dans les Shorts TikTok / Reels / YouTube.

Voici la transcription horodatée d'une vidéo (start_s -> end_s : texte).
Ton travail : identifier les {n} meilleurs extraits candidats à devenir des clips viraux de 20 à 30 secondes.

Contraintes strictes :
- Chaque clip fait entre 20 et 30 secondes.
- start_s et end_s doivent tomber sur des débuts/fins de phrase de la transcription (pas au milieu d'un mot).
- Le clip doit avoir un HOOK fort dans les 3 premières secondes.
- Pas de chevauchement entre clips.

Pour chaque clip, retourne un objet JSON avec :
- start_s (float), end_s (float)
- title (string, court, en français, accrocheur, style TikTok — 6 mots max)
- hook (0-100), retention (0-100), emotion (0-100), share (0-100)
- viral_score (0-100, moyenne pondérée où hook compte double)
- rationale (1 phrase courte en français, explique pourquoi ça marchera)

Réponds UNIQUEMENT avec un JSON valide de la forme :
{{"clips": [ {{...}}, {{...}} ]}}

TRANSCRIPTION :
{transcript}
"""


def score_with_claude(segments: list[TranscriptSegment], n_clips: int = 6) -> list[Clip]:
    lines = [f"{s.start:.1f} -> {s.end:.1f} : {s.text}" for s in segments]
    transcript = "\n".join(lines)

    client = anthropic.Anthropic()
    msg = client.messages.create(
        model=os.getenv("CLAUDE_MODEL", "claude-sonnet-5"),
        max_tokens=4000,
        messages=[
            {
                "role": "user",
                "content": VIRAL_PROMPT.format(n=n_clips, transcript=transcript),
            }
        ],
    )

    raw = msg.content[0].text
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError(f"Claude did not return JSON: {raw[:200]}")
    data = json.loads(match.group(0))

    clips: list[Clip] = []
    for c in data.get("clips", []):
        clips.append(
            Clip(
                start=float(c["start_s"]),
                end=float(c["end_s"]),
                title=c["title"],
                hook=int(c["hook"]),
                retention=int(c["retention"]),
                emotion=int(c["emotion"]),
                share=int(c["share"]),
                viral_score=int(c["viral_score"]),
                rationale=c["rationale"],
            )
        )
    return clips


def cut_clip_9x16(source: Path, clip: Clip, out_dir: Path, index: int) -> Path:
    """Cut, center-crop to 9:16, and burn nothing (subtitles come later)."""
    out = out_dir / f"clip_{index:02d}.mp4"
    duration = clip.end - clip.start
    vf = (
        "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',"
        "scale=1080:1920:force_original_aspect_ratio=increase,"
        "crop=1080:1920"
    )
    cmd = [
        "ffmpeg", "-y", "-ss", f"{clip.start:.2f}", "-i", str(source),
        "-t", f"{duration:.2f}", "-vf", vf,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
        "-c:a", "aac", "-b:a", "128k",
        str(out),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return out


def run_pipeline(
    youtube_url: str | None = None,
    source_path: Path | None = None,
    n_clips: int = 6,
    do_cut: bool = True,
) -> dict:
    if not youtube_url and not source_path:
        raise ValueError("youtube_url or source_path required")

    job_id = uuid.uuid4().hex[:12]
    job_dir = WORK_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    if source_path:
        source = source_path
    else:
        source = download_youtube(youtube_url, job_dir)  # type: ignore[arg-type]
    segments = transcribe(source)
    clips = score_with_claude(segments, n_clips=n_clips)

    if do_cut:
        for i, clip in enumerate(clips):
            try:
                out = cut_clip_9x16(source, clip, job_dir, i)
                clip.file = str(out.relative_to(WORK_DIR))
            except subprocess.CalledProcessError:
                clip.file = None

    try:
        source_rel = str(source.relative_to(WORK_DIR))
    except ValueError:
        source_rel = str(source)

    return {
        "job_id": job_id,
        "source": source_rel,
        "clips": [asdict(c) for c in clips],
    }
