"""Clipwave pipeline: YouTube -> transcript -> Claude viral scoring -> FFmpeg cuts."""

from __future__ import annotations

import json
import os
import re
import subprocess
import uuid
from dataclasses import dataclass, field, asdict
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
class Word:
    start: float
    end: float
    text: str


@dataclass
class TranscriptSegment:
    start: float
    end: float
    text: str
    words: list[Word] = field(default_factory=list)


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
        "format": "bv*[height<=1080]+ba/b[height<=1080]/bv*+ba/b",
        "merge_output_format": "mp4",
        "outtmpl": str(out),
        "quiet": True,
        "noprogress": True,
        "ignoreerrors": False,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
    ext = info.get("ext", "mp4")
    path = job_dir / f"source.{ext}"
    if not path.exists():
        for p in job_dir.glob("source.*"):
            return p
    return path


def transcribe(video_path: Path) -> list[TranscriptSegment]:
    model = _get_whisper()
    segments, _ = model.transcribe(
        str(video_path),
        vad_filter=True,
        beam_size=1,
        word_timestamps=True,
    )
    out: list[TranscriptSegment] = []
    for s in segments:
        words = [
            Word(start=float(w.start), end=float(w.end), text=w.word.strip())
            for w in (s.words or [])
            if w.start is not None and w.end is not None
        ]
        out.append(
            TranscriptSegment(
                start=s.start,
                end=s.end,
                text=s.text.strip(),
                words=words,
            )
        )
    return out


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

    raw = "".join(b.text for b in msg.content if hasattr(b, "text"))
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


# ---------- Subtitles ----------

def _fmt_ass_time(t: float) -> str:
    t = max(0.0, t)
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def _clip_words(segments: list[TranscriptSegment], clip: Clip) -> list[Word]:
    """Return words that fall inside the clip, with clip-relative timestamps."""
    words: list[Word] = []
    for seg in segments:
        for w in seg.words:
            if w.end <= clip.start or w.start >= clip.end:
                continue
            start = max(0.0, w.start - clip.start)
            end = min(clip.end - clip.start, w.end - clip.start)
            if end - start < 0.02:
                continue
            words.append(Word(start=start, end=end, text=w.text))
    return words


def _chunk_words(words: list[Word], max_per_chunk: int = 3) -> list[list[Word]]:
    chunks: list[list[Word]] = []
    cur: list[Word] = []
    for w in words:
        cur.append(w)
        ends_phrase = bool(re.search(r"[.!?…]$", w.text))
        if len(cur) >= max_per_chunk or ends_phrase:
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    return chunks


def generate_ass(words: list[Word], clip_duration: float) -> str:
    """TikTok-style captions: 3 words at a time, active word highlighted."""
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Base,Impact,96,&H00FFFFFF,&H0000FFFF,&H00000000,&H00000000,1,0,0,0,100,100,2,0,1,7,2,2,60,60,220,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    lines: list[str] = []
    for chunk in _chunk_words(words, max_per_chunk=3):
        if not chunk:
            continue
        start = chunk[0].start
        end = min(chunk[-1].end + 0.15, clip_duration)
        # Karaoke: each word highlighted for its own duration
        parts: list[str] = []
        for w in chunk:
            k = max(1, int(round((w.end - w.start) * 100)))
            text = w.text.replace("\\", "").replace("{", "").replace("}", "").upper()
            # Active-word gets a color swap via \1c
            parts.append(rf"{{\kf{k}\1c&H00FFFFFF&\3c&H00000000&}}{text}")
        body = " ".join(parts)
        # Add a pop-in scale animation
        body = rf"{{\fscx90\fscy90\t(0,120,\fscx100\fscy100)}}{body}"
        lines.append(
            f"Dialogue: 0,{_fmt_ass_time(start)},{_fmt_ass_time(end)},Base,,0,0,0,,{body}"
        )
    return header + "\n".join(lines) + "\n"


def _ffmpeg_escape_subs_path(p: Path) -> str:
    """Escape a path for use in ffmpeg's subtitles= filter."""
    s = str(p.resolve())
    # Windows paths need forward slashes and escaped colon
    s = s.replace("\\", "/")
    s = s.replace(":", r"\:")
    return s


def cut_clip_9x16(
    source: Path,
    clip: Clip,
    out_dir: Path,
    index: int,
    segments: list[TranscriptSegment] | None = None,
) -> Path:
    """Cut, center-crop to 9:16, and burn animated captions if segments are given."""
    out = out_dir / f"clip_{index:02d}.mp4"
    duration = clip.end - clip.start

    filters = [
        "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)'",
        "scale=1080:1920:force_original_aspect_ratio=increase",
        "crop=1080:1920",
    ]

    subs_path: Path | None = None
    if segments:
        words = _clip_words(segments, clip)
        if words:
            subs_path = out_dir / f"clip_{index:02d}.ass"
            subs_path.write_text(generate_ass(words, duration), encoding="utf-8")
            filters.append(f"subtitles='{_ffmpeg_escape_subs_path(subs_path)}'")

    vf = ",".join(filters)

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
                out = cut_clip_9x16(source, clip, job_dir, i, segments=segments)
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
