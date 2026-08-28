"""Clipwave API — POST a YouTube URL, get scored viral clips back."""

from __future__ import annotations

import os
import threading
import uuid
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, HttpUrl

from pipeline import WORK_DIR, run_pipeline

load_dotenv()

app = FastAPI(title="Clipwave API", version="0.1.0")
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


def _run_job(job_id: str, req: AnalyzeRequest) -> None:
    JOBS[job_id] = {"status": "running", "progress": "downloading"}
    try:
        result = run_pipeline(str(req.youtube_url), n_clips=req.n_clips, do_cut=req.cut)
        JOBS[job_id] = {"status": "done", **result}
    except Exception as e:
        JOBS[job_id] = {"status": "error", "error": str(e)}


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest) -> dict:
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(500, "ANTHROPIC_API_KEY not set")
    job_id = uuid.uuid4().hex[:12]
    JOBS[job_id] = {"status": "queued"}
    threading.Thread(target=_run_job, args=(job_id, req), daemon=True).start()
    return {"job_id": job_id}


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
