"""Clipwave API — POST a YouTube URL or upload a file, get scored viral clips back."""

from __future__ import annotations

import os
import shutil
import threading
import uuid
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, HttpUrl

from pipeline import WORK_DIR, run_pipeline

load_dotenv()

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(8 * 1024**3)))  # 8 GB
ALLOWED_EXTS = {".mp4", ".mov", ".mkv", ".webm", ".m4v"}
STATIC_DIR = Path(__file__).parent / "static"

app = FastAPI(title="Clipwave API", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

JOBS: dict[str, dict] = {}


class AnalyzeRequest(BaseModel):
    youtube_url: HttpUrl
    n_clips: int = 6
    cut: bool = True


def _run_job(job_id: str, *, youtube_url: str | None, source_path: Path | None,
             n_clips: int, cut: bool) -> None:
    JOBS[job_id] = {"status": "running", "progress": "processing"}
    try:
        result = run_pipeline(
            youtube_url=youtube_url,
            source_path=source_path,
            n_clips=n_clips,
            do_cut=cut,
        )
        JOBS[job_id] = {"status": "done", **result}
    except Exception as e:
        JOBS[job_id] = {"status": "error", "error": str(e)}


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest) -> dict:
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(500, "ANTHROPIC_API_KEY not set")
    job_id = uuid.uuid4().hex[:12]
    JOBS[job_id] = {"status": "queued"}
    threading.Thread(
        target=_run_job,
        kwargs={"job_id": job_id, "youtube_url": str(req.youtube_url),
                "source_path": None, "n_clips": req.n_clips, "cut": req.cut},
        daemon=True,
    ).start()
    return {"job_id": job_id}


@app.post("/api/upload")
async def upload(
    file: UploadFile = File(...),
    n_clips: int = Form(6),
    cut: bool = Form(True),
) -> dict:
    """Upload a video file and start the pipeline on it."""
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(500, "ANTHROPIC_API_KEY not set")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(400, f"extension {ext!r} not allowed; use {sorted(ALLOWED_EXTS)}")

    job_id = uuid.uuid4().hex[:12]
    job_dir = WORK_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    dest = job_dir / f"source{ext}"

    # Stream to disk with a size guard.
    written = 0
    with dest.open("wb") as out:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            written += len(chunk)
            if written > MAX_UPLOAD_BYTES:
                out.close()
                shutil.rmtree(job_dir, ignore_errors=True)
                raise HTTPException(413, f"file exceeds {MAX_UPLOAD_BYTES} bytes")
            out.write(chunk)

    JOBS[job_id] = {"status": "queued", "filename": file.filename, "bytes": written}
    threading.Thread(
        target=_run_job,
        kwargs={"job_id": job_id, "youtube_url": None,
                "source_path": dest, "n_clips": n_clips, "cut": cut},
        daemon=True,
    ).start()
    return {"job_id": job_id, "filename": file.filename, "bytes": written}


@app.get("/api/jobs/{job_id}")
def job_status(job_id: str) -> dict:
    if job_id not in JOBS:
        raise HTTPException(404, "unknown job")
    return {"job_id": job_id, **JOBS[job_id]}


@app.get("/api/clips/{path:path}")
def get_clip(path: str) -> FileResponse:
    file = (WORK_DIR / path).resolve()
    if not file.is_file() or WORK_DIR.resolve() not in file.parents:
        raise HTTPException(404, "not found")
    return FileResponse(file, media_type="video/mp4")


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.get("/")
def index() -> FileResponse:
    """Serve the Clipwave UI so the frontend and API share an origin."""
    return FileResponse(STATIC_DIR / "index.html", media_type="text/html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
