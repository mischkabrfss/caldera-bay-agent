# Clipwave — backend

Première brique fonctionnelle : prend un lien YouTube, transcrit avec Whisper,
demande à Claude d'identifier et noter les meilleurs moments viraux, puis
découpe les clips en 9:16 avec FFmpeg.

## Prérequis système

- Python 3.10+
- `ffmpeg` installé et dans le PATH (`apt install ffmpeg` ou `brew install ffmpeg`)

## Installation

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# éditer .env et coller ta clé ANTHROPIC_API_KEY
```

## Lancer

```bash
python main.py
# API sur http://localhost:8000  —  docs interactives : http://localhost:8000/docs
```

## Utilisation

```bash
# 1. Lancer l'analyse
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"youtube_url": "https://youtube.com/watch?v=XXXX", "n_clips": 6}'
# -> { "job_id": "abc123..." }

# 2. Poller le statut
curl http://localhost:8000/api/jobs/abc123...
# -> { "status": "running" | "done" | "error", "clips": [...] }
```

Chaque clip du résultat contient :

```json
{
  "start": 42.5, "end": 71.2,
  "title": "Le vrai secret, c'est de commencer",
  "hook": 96, "retention": 91, "emotion": 93, "share": 95,
  "viral_score": 94,
  "rationale": "Hook fort dans les 3 premières secondes...",
  "file": "abc123.../clip_00.mp4"
}
```

Le fichier vidéo est servi sur `GET /api/clips/{file}`.

## Comment ça marche

1. `yt-dlp` télécharge la vidéo YouTube en 1080p max.
2. `faster-whisper` (modèle `base` par défaut, CPU int8) transcrit avec timestamps.
3. La transcription est envoyée à Claude (`claude-sonnet-5`) avec un prompt
   qui exige un JSON strict listant les meilleurs extraits + scores.
4. `ffmpeg` coupe la source aux timestamps retournés et recadre en 1080×1920.

## Prochaines briques

- Whisper `word_timestamps=True` + génération d'un `.ass` avec sous-titres
  animés brûlés dans le clip.
- Zoom auto sur le locuteur (détection de visage OpenCV/MediaPipe).
- Upload direct de fichier (endpoint multipart, déjà supporté par FastAPI).
- File d'attente Redis + workers pour tenir la charge.
- Auth + Postgres pour persister les jobs et les clips par utilisateur.
