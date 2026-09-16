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


ASPECT_DIMS = {
    "9:16": (1080, 1920),
    "1:1": (1080, 1080),
    "16:9": (1920, 1080),
}

# Numpad-style ASS alignment: 8=top, 5=middle, 2=bottom (all center-horizontal)
POSITION_ALIGNMENT = {
    "top": 8,
    "middle": 5,
    "bottom": 2,
}


def _hex_to_ass_color(hx: str) -> str:
    """Convert #RRGGBB to ASS &HAABBGGRR& (fully opaque)."""
    s = (hx or "").strip().lstrip("#")
    if len(s) == 3:
        s = "".join(c * 2 for c in s)
    if len(s) != 6:
        return "&H0000FFFF&"  # fallback: yellow
    r, g, b = s[0:2], s[2:4], s[4:6]
    return f"&H00{b}{g}{r}&".upper()


def generate_ass(
    words: list[Word],
    clip_duration: float,
    aspect_ratio: str = "9:16",
    font: str = "Impact",
    font_size: int = 96,
    position: str = "bottom",
    highlight_color: str = "#FFFF00",
) -> str:
    """TikTok-style captions: 3 words at a time, active word highlighted."""
    play_w, play_h = ASPECT_DIMS.get(aspect_ratio, ASPECT_DIMS["9:16"])
    alignment = POSITION_ALIGNMENT.get(position, 2)
    margin_v = max(60, int(play_h * 0.11))
    hi_color = _hex_to_ass_color(highlight_color)

    style_line = (
        f"Style: Base,{font},{font_size},&H00FFFFFF,{hi_color},&H00000000,&H00000000,"
        f"1,0,0,0,100,100,2,0,1,7,2,{alignment},60,60,{margin_v},1"
    )

    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {play_w}
PlayResY: {play_h}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
{style_line}

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
            # Active-word swap uses the secondary colour via the karaoke tag \kf
            parts.append(rf"{{\kf{k}}}{text}")
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


def _aspect_crop_scale_filter(aspect_ratio: str) -> list[str]:
    """FFmpeg filter chain that center-crops then scales to the target box."""
    w, h = ASPECT_DIMS.get(aspect_ratio, ASPECT_DIMS["9:16"])
    if w >= h:
        # Landscape/square: pick a width <= source width, height derived from ratio
        crop_expr = f"crop='min(iw,ih*{w}/{h})':'min(ih,iw*{h}/{w})'"
    else:
        # Portrait
        crop_expr = f"crop='min(iw,ih*{w}/{h})':'min(ih,iw*{h}/{w})'"
    return [
        crop_expr,
        f"scale={w}:{h}:force_original_aspect_ratio=increase",
        f"crop={w}:{h}",
    ]


def render_clip(
    source: Path,
    out_path: Path,
    start: float,
    end: float,
    clip_words: list[Word] | None = None,
    aspect_ratio: str = "9:16",
    caption_style: dict | None = None,
) -> Path:
    """Render a clip in the chosen aspect ratio with optional burned-in captions.

    ``clip_words`` are already clip-relative (start=0 at ``start``).
    ``caption_style`` (dict) may set: font, font_size, position, highlight_color.
    """
    out_path.parent.mkdir(parents=True, exist_ok=True)
    duration = max(0.5, end - start)

    filters = _aspect_crop_scale_filter(aspect_ratio)

    if clip_words:
        style = caption_style or {}
        ass_body = generate_ass(
            clip_words,
            duration,
            aspect_ratio=aspect_ratio,
            font=style.get("font", "Impact"),
            font_size=int(style.get("font_size", 96)),
            position=style.get("position", "bottom"),
            highlight_color=style.get("highlight_color", "#FFFF00"),
        )
        subs_path = out_path.with_suffix(".ass")
        subs_path.write_text(ass_body, encoding="utf-8")
        filters.append(f"subtitles='{_ffmpeg_escape_subs_path(subs_path)}'")

    vf = ",".join(filters)

    cmd = [
        "ffmpeg", "-y", "-ss", f"{start:.2f}", "-i", str(source),
        "-t", f"{duration:.2f}", "-vf", vf,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
        "-c:a", "aac", "-b:a", "128k",
        str(out_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return out_path


def cut_clip_9x16(
    source: Path,
    clip: Clip,
    out_dir: Path,
    index: int,
    segments: list[TranscriptSegment] | None = None,
) -> Path:
    """Compatibility shim used during the initial pipeline pass."""
    words = _clip_words(segments, clip) if segments else None
    return render_clip(
        source=source,
        out_path=out_dir / f"clip_{index:02d}.mp4",
        start=clip.start,
        end=clip.end,
        clip_words=words,
    )


def _clip_words_source(segments: list[TranscriptSegment], clip: Clip) -> list[dict]:
    """Words that fall in this clip, with SOURCE-time timestamps (for the editor)."""
    out: list[dict] = []
    for seg in segments:
        for w in seg.words:
            if w.end <= clip.start or w.start >= clip.end:
                continue
            out.append({"start": float(w.start), "end": float(w.end), "text": w.text})
    return out


def run_pipeline(
    youtube_url: str | None = None,
    source_path: Path | None = None,
    n_clips: int = 6,
    do_cut: bool = True,
    job_id: str | None = None,
) -> dict:
    if not youtube_url and not source_path:
        raise ValueError("youtube_url or source_path required")

    # Reuse the caller-provided job_id (from the API) if any, otherwise
    # fall back to the source path's parent, otherwise create a fresh one.
    if not job_id and source_path:
        parent = source_path.parent
        try:
            rel = parent.relative_to(WORK_DIR)
            if rel.parts:
                job_id = rel.parts[0]
        except ValueError:
            pass
    if not job_id:
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

    # Persist meta.json so the editor can re-render individual clips later.
    meta_clips = []
    for i, clip in enumerate(clips):
        d = asdict(clip)
        d["index"] = i
        d["words"] = _clip_words_source(segments, clip)
        meta_clips.append(d)
    meta = {
        "job_id": job_id,
        "source": source_rel,
        "clips": meta_clips,
    }
    (job_dir / "meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return {
        "job_id": job_id,
        "source": source_rel,
        "clips": [asdict(c) for c in clips],
    }


def load_meta(job_id: str) -> dict | None:
    """Load a job's persisted meta.json, or None if missing."""
    p = WORK_DIR / job_id / "meta.json"
    if not p.is_file():
        return None
    return json.loads(p.read_text(encoding="utf-8"))


def save_meta(job_id: str, meta: dict) -> None:
    p = WORK_DIR / job_id / "meta.json"
    p.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")


def render_edited_clip(
    job_id: str,
    clip_index: int,
    trim_start: float,
    trim_end: float,
    edited_words: list[dict],
    aspect_ratio: str = "9:16",
    caption_style: dict | None = None,
) -> str:
    """Re-render a clip with edited trim, word text, format and caption style.

    ``edited_words`` are in SOURCE time (same reference as ``trim_start``).
    Returns the relative path (from WORK_DIR) of the new clip file.
    """
    meta = load_meta(job_id)
    if not meta:
        raise ValueError(f"job {job_id} has no meta.json")

    source = WORK_DIR / meta["source"]
    if not source.is_file():
        # Handle stored absolute paths on Windows.
        source = Path(meta["source"])
    if not source.is_file():
        raise FileNotFoundError(f"source not found for job {job_id}")

    # Filter and shift words to be clip-relative.
    clip_words: list[Word] = []
    for w in edited_words:
        s = float(w["start"])
        e = float(w["end"])
        if e <= trim_start or s >= trim_end:
            continue
        start = max(0.0, s - trim_start)
        end = min(trim_end - trim_start, e - trim_start)
        if end - start < 0.02:
            continue
        clip_words.append(Word(start=start, end=end, text=str(w["text"]).strip()))

    out_path = WORK_DIR / job_id / f"clip_{clip_index:02d}.mp4"
    render_clip(
        source=source,
        out_path=out_path,
        start=trim_start,
        end=trim_end,
        clip_words=clip_words,
        aspect_ratio=aspect_ratio,
        caption_style=caption_style,
    )

    # Update meta.json so subsequent edits see the current trim + words + style.
    for c in meta["clips"]:
        if c.get("index") == clip_index:
            c["start"] = trim_start
            c["end"] = trim_end
            c["words"] = [
                {"start": float(w["start"]), "end": float(w["end"]), "text": str(w["text"])}
                for w in edited_words
            ]
            c["file"] = str(out_path.relative_to(WORK_DIR))
            c["aspect_ratio"] = aspect_ratio
            if caption_style:
                c["caption_style"] = caption_style
            break
    save_meta(job_id, meta)

    return str(out_path.relative_to(WORK_DIR))
