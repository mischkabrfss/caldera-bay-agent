'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { analyzeVideo } from './analyze';
import { CLIP_LENGTH, formatTime, type Highlight } from './highlights';
import {
  drawFrame,
  extensionFor,
  FORMATS,
  pickMimeType,
  type ClipStyle,
  type Format,
} from './render';
import styles from './clips.module.css';

type Clip = Highlight & {
  id: string;
  hook: string;
  result?: { url: string; mime: string; size: number };
};

type Status =
  | { kind: 'idle' }
  | { kind: 'analyzing'; progress: number }
  | { kind: 'ready' }
  | { kind: 'exporting'; clipId: string; progress: number }
  | { kind: 'error'; message: string };

const HOOK_TEMPLATES = [
  'Ce détail change tout',
  'Personne ne te dit ça',
  'L’erreur nº1 à éviter',
  'La méthode en 30 secondes',
  'Regarde jusqu’à la fin',
];

export default function ClipStudio() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioGraphRef = useRef<{
    context: AudioContext;
    destination: MediaStreamAudioDestinationNode;
  } | null>(null);
  const activeClipRef = useRef<Clip | null>(null);

  const [fileName, setFileName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [clips, setClips] = useState<Clip[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [clipLength, setClipLength] = useState(CLIP_LENGTH);
  const [count, setCount] = useState(4);

  const [style, setStyle] = useState<ClipStyle>({
    hook: '',
    handle: '@ta_marque',
    format: '9:16',
    zoom: 1,
    blurBackground: true,
    showProgress: true,
    accent: '#7c5cff',
  });

  // Le score brut dépend du mixage : on l'affiche relativement au meilleur extrait.
  const bestScore = useMemo(
    () => clips.reduce((max, c) => Math.max(max, c.score), 0),
    [clips],
  );

  const active = useMemo(
    () => clips.find((c) => c.id === activeId) ?? null,
    [clips, activeId],
  );

  useEffect(() => {
    activeClipRef.current = active;
  }, [active]);

  // Boucle de rendu : la même fonction sert à la prévisualisation et à l'export.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas && video && video.readyState >= 2) {
        const ctx = canvas.getContext('2d');
        const clip = activeClipRef.current;
        if (ctx) {
          const progress = clip
            ? (video.currentTime - clip.start) / Math.max(0.001, clip.end - clip.start)
            : 0;
          drawFrame(
            ctx,
            video,
            { ...style, hook: clip?.hook ?? style.hook },
            progress,
          );
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [style]);

  useEffect(() => {
    const { width, height } = FORMATS[style.format];
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  }, [style.format]);

  useEffect(
    () => () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    },
    [videoUrl],
  );

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('video/')) {
        setStatus({ kind: 'error', message: 'Choisis un fichier vidéo.' });
        return;
      }

      setClips([]);
      setActiveId(null);
      setFileName(file.name);
      const url = URL.createObjectURL(file);
      setVideoUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return url;
      });

      setStatus({ kind: 'analyzing', progress: 0 });
      try {
        const analysis = await analyzeVideo(file, {
          clipLength,
          count,
          onProgress: (progress) => setStatus({ kind: 'analyzing', progress }),
        });
        setDuration(analysis.duration);

        const built: Clip[] = analysis.highlights.map((h, index) => ({
          ...h,
          id: `clip-${index}-${Math.round(h.start)}`,
          hook: HOOK_TEMPLATES[index % HOOK_TEMPLATES.length],
        }));

        if (!built.length) {
          setStatus({
            kind: 'error',
            message: 'Vidéo trop courte pour découper un clip de cette durée.',
          });
          return;
        }

        setClips(built);
        setActiveId(built[0].id);
        setStatus({ kind: 'ready' });
      } catch (error) {
        setStatus({
          kind: 'error',
          message:
            error instanceof Error
              ? `Analyse impossible : ${error.message}`
              : 'Analyse impossible.',
        });
      }
    },
    [clipLength, count],
  );

  const seekTo = useCallback((clip: Clip) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = clip.start;
  }, []);

  const selectClip = useCallback(
    (clip: Clip) => {
      setActiveId(clip.id);
      seekTo(clip);
    },
    [seekTo],
  );

  const playPreview = useCallback(async () => {
    const video = videoRef.current;
    const clip = activeClipRef.current;
    if (!video || !clip) return;
    video.currentTime = clip.start;
    video.muted = false;
    await video.play().catch(() => undefined);

    const stop = () => {
      if (!activeClipRef.current) return;
      if (video.currentTime >= activeClipRef.current.end) {
        video.pause();
        video.removeEventListener('timeupdate', stop);
      }
    };
    video.addEventListener('timeupdate', stop);
  }, []);

  const ensureAudioGraph = useCallback(() => {
    const video = videoRef.current;
    if (!video) return null;
    if (audioGraphRef.current) return audioGraphRef.current;

    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;

    const context = new AudioCtor();
    const source = context.createMediaElementSource(video);
    const destination = context.createMediaStreamDestination();
    // Un seul MediaElementSource est autorisé par élément : on le garde en cache
    // et on branche à la fois les haut-parleurs et le flux d'enregistrement.
    source.connect(context.destination);
    source.connect(destination);

    audioGraphRef.current = { context, destination };
    return audioGraphRef.current;
  }, []);

  const exportClip = useCallback(
    async (clip: Clip) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      if (typeof MediaRecorder === 'undefined') {
        setStatus({
          kind: 'error',
          message: 'Ce navigateur ne gère pas l’enregistrement vidéo (MediaRecorder).',
        });
        return;
      }

      setActiveId(clip.id);
      activeClipRef.current = clip;
      setStatus({ kind: 'exporting', clipId: clip.id, progress: 0 });

      try {
        const graph = ensureAudioGraph();
        if (graph?.context.state === 'suspended') await graph.context.resume();

        const stream = canvas.captureStream(30);
        if (graph) {
          for (const track of graph.destination.stream.getAudioTracks()) {
            stream.addTrack(track);
          }
        }

        const mimeType = pickMimeType();
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 6_000_000,
        });
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        const finished = new Promise<Blob>((resolve) => {
          recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
        });

        video.muted = false;
        video.currentTime = clip.start;
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked);
        });

        recorder.start(200);
        await video.play();

        // L'enregistrement suit la lecture réelle : durée exacte du clip.
        await new Promise<void>((resolve) => {
          const tick = () => {
            const elapsed = video.currentTime - clip.start;
            const total = clip.end - clip.start;
            setStatus({
              kind: 'exporting',
              clipId: clip.id,
              progress: Math.min(1, elapsed / total),
            });
            if (video.currentTime >= clip.end || video.ended) {
              resolve();
              return;
            }
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });

        video.pause();
        recorder.stop();
        const blob = await finished;
        stream.getVideoTracks().forEach((track) => track.stop());

        const url = URL.createObjectURL(blob);
        setClips((previous) =>
          previous.map((c) =>
            c.id === clip.id
              ? { ...c, result: { url, mime: mimeType, size: blob.size } }
              : c,
          ),
        );
        setStatus({ kind: 'ready' });
      } catch (error) {
        setStatus({
          kind: 'error',
          message:
            error instanceof Error
              ? `Export impossible : ${error.message}`
              : 'Export impossible.',
        });
      }
    },
    [ensureAudioGraph],
  );

  const exportAll = useCallback(async () => {
    for (const clip of clips) {
      // Séquentiel : un seul MediaRecorder à la fois sur le même élément vidéo.
      await exportClip(clip);
    }
  }, [clips, exportClip]);

  const updateClip = useCallback((id: string, patch: Partial<Clip>) => {
    setClips((previous) =>
      previous.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }, []);

  const busy = status.kind === 'analyzing' || status.kind === 'exporting';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Clip Studio</p>
        <h1 className={styles.title}>Transforme une vidéo longue en clips viraux de 30 secondes</h1>
        <p className={styles.lead}>
          Dépose une vidéo : l’application repère les moments les plus forts, les recadre
          au format vertical, ajoute une accroche et exporte des clips prêts à publier.
          Tout est calculé dans ton navigateur — aucun fichier n’est envoyé sur un serveur.
        </p>
      </header>

      <section className={styles.panel}>
        <label className={styles.dropzone}>
          <input
            type="file"
            accept="video/*"
            className={styles.fileInput}
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <span className={styles.dropTitle}>
            {fileName || 'Choisir une vidéo longue (MP4, MOV, WebM)'}
          </span>
          <span className={styles.dropHint}>
            {duration ? `Durée : ${formatTime(duration)}` : 'Podcast, interview, live, cours…'}
          </span>
        </label>

        <div className={styles.settings}>
          <label className={styles.field}>
            <span>Durée des clips</span>
            <select
              value={clipLength}
              disabled={busy}
              onChange={(event) => setClipLength(Number(event.target.value))}
            >
              <option value={15}>15 s</option>
              <option value={30}>30 s</option>
              <option value={45}>45 s</option>
              <option value={60}>60 s</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Nombre de clips</span>
            <select
              value={count}
              disabled={busy}
              onChange={(event) => setCount(Number(event.target.value))}
            >
              {[2, 3, 4, 5, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Format</span>
            <select
              value={style.format}
              onChange={(event) =>
                setStyle((s) => ({ ...s, format: event.target.value as Format }))
              }
            >
              {Object.entries(FORMATS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {status.kind === 'analyzing' && (
          <p className={styles.status}>
            Analyse de la piste audio… {Math.round(status.progress * 100)} %
          </p>
        )}
        {status.kind === 'error' && <p className={styles.error}>{status.message}</p>}
      </section>

      <section className={styles.studio}>
        <div className={styles.previewColumn}>
          <canvas ref={canvasRef} className={styles.canvas} />
          <div className={styles.previewActions}>
            <button type="button" onClick={() => void playPreview()} disabled={!active || busy}>
              Lire l’aperçu
            </button>
            <button
              type="button"
              onClick={() => active && void exportClip(active)}
              disabled={!active || busy}
              className={styles.primary}
            >
              {status.kind === 'exporting' && status.clipId === active?.id
                ? `Export ${Math.round(status.progress * 100)} %`
                : 'Exporter ce clip'}
            </button>
          </div>
          <video
            ref={videoRef}
            src={videoUrl || undefined}
            className={styles.hiddenVideo}
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          />
        </div>

        <div className={styles.controls}>
          <h2 className={styles.sectionTitle}>Habillage</h2>
          <label className={styles.field}>
            <span>Accroche affichée</span>
            <input
              type="text"
              value={active?.hook ?? style.hook}
              placeholder="Ce détail change tout"
              onChange={(event) => {
                const value = event.target.value;
                if (active) updateClip(active.id, { hook: value });
                else setStyle((s) => ({ ...s, hook: value }));
              }}
            />
          </label>
          <label className={styles.field}>
            <span>Signature</span>
            <input
              type="text"
              value={style.handle}
              onChange={(event) => setStyle((s) => ({ ...s, handle: event.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>Zoom {style.zoom.toFixed(2)}×</span>
            <input
              type="range"
              min={1}
              max={2}
              step={0.05}
              value={style.zoom}
              onChange={(event) =>
                setStyle((s) => ({ ...s, zoom: Number(event.target.value) }))
              }
            />
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={style.blurBackground}
              onChange={(event) =>
                setStyle((s) => ({ ...s, blurBackground: event.target.checked }))
              }
            />
            <span>Fond flouté</span>
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={style.showProgress}
              onChange={(event) =>
                setStyle((s) => ({ ...s, showProgress: event.target.checked }))
              }
            />
            <span>Barre de progression (rétention)</span>
          </label>
          <label className={styles.field}>
            <span>Couleur d’accent</span>
            <input
              type="color"
              value={style.accent}
              onChange={(event) => setStyle((s) => ({ ...s, accent: event.target.value }))}
            />
          </label>
        </div>
      </section>

      {clips.length > 0 && (
        <section className={styles.panel}>
          <div className={styles.clipsHeader}>
            <h2 className={styles.sectionTitle}>Clips détectés</h2>
            <button type="button" onClick={() => void exportAll()} disabled={busy}>
              Tout exporter
            </button>
          </div>

          <ul className={styles.clipList}>
            {clips.map((clip, index) => (
              <li
                key={clip.id}
                className={clip.id === activeId ? styles.clipActive : styles.clip}
              >
                <button
                  type="button"
                  className={styles.clipSelect}
                  onClick={() => selectClip(clip)}
                >
                  <strong>Clip {index + 1}</strong>
                  <span>
                    {formatTime(clip.start)} → {formatTime(clip.end)}
                  </span>
                  <span className={styles.score}>
                    Potentiel {Math.round((clip.score / (bestScore || 1)) * 100)} / 100
                  </span>
                </button>

                <label className={styles.offset}>
                  <span>Décalage</span>
                  <input
                    type="range"
                    min={Math.max(0, clip.start - 10)}
                    max={Math.max(0, Math.min(duration - clipLength, clip.start + 10))}
                    step={0.5}
                    value={clip.start}
                    disabled={busy}
                    onChange={(event) => {
                      const start = Number(event.target.value);
                      updateClip(clip.id, { start, end: start + clipLength });
                      if (clip.id === activeId) {
                        const video = videoRef.current;
                        if (video) video.currentTime = start;
                      }
                    }}
                  />
                </label>

                {clip.result ? (
                  <a
                    className={styles.download}
                    href={clip.result.url}
                    download={`clip-${index + 1}.${extensionFor(clip.result.mime)}`}
                  >
                    Télécharger ({Math.round(clip.result.size / 1024 / 1024)} Mo)
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => void exportClip(clip)}
                    disabled={busy}
                  >
                    Exporter
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
