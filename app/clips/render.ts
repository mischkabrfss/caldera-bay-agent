export type Format = '9:16' | '1:1' | '16:9';

export type ClipStyle = {
  hook: string;
  handle: string;
  format: Format;
  zoom: number; // 1 = plein cadre, >1 = recadrage serré
  blurBackground: boolean;
  showProgress: boolean;
  accent: string;
};

export const FORMATS: Record<Format, { width: number; height: number; label: string }> = {
  '9:16': { width: 720, height: 1280, label: 'Vertical 9:16 — Reels, Shorts, TikTok' },
  '1:1': { width: 1080, height: 1080, label: 'Carré 1:1 — feed Instagram, LinkedIn' },
  '16:9': { width: 1280, height: 720, label: 'Horizontal 16:9 — YouTube, X' },
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Dessine une image du clip : fond flouté, vidéo recadrée, accroche et barre de progression. */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  style: ClipStyle,
  progress: number,
) {
  const { width, height } = ctx.canvas;
  const vw = video.videoWidth || 16;
  const vh = video.videoHeight || 9;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#05060a';
  ctx.fillRect(0, 0, width, height);

  if (style.blurBackground) {
    // Le fond reprend l'image en "cover" très flouté pour combler les bandes.
    const coverScale = Math.max(width / vw, height / vh) * 1.25;
    const bw = vw * coverScale;
    const bh = vh * coverScale;
    ctx.save();
    ctx.filter = 'blur(28px) brightness(0.55) saturate(1.3)';
    ctx.drawImage(video, (width - bw) / 2, (height - bh) / 2, bw, bh);
    ctx.restore();
  }

  // Sujet principal : "cover" pour un cadre plein, avec zoom réglable.
  const scale = Math.max(width / vw, height / vh) * style.zoom;
  const dw = vw * scale;
  const dh = vh * scale;
  ctx.save();
  roundRect(ctx, 0, 0, width, height, 0);
  ctx.clip();
  ctx.drawImage(video, (width - dw) / 2, (height - dh) / 2, dw, dh);
  ctx.restore();

  // Léger dégradé haut/bas pour que le texte reste lisible.
  const shade = ctx.createLinearGradient(0, 0, 0, height);
  shade.addColorStop(0, 'rgba(0,0,0,0.55)');
  shade.addColorStop(0.3, 'rgba(0,0,0,0)');
  shade.addColorStop(0.75, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);

  const hook = style.hook.trim();
  if (hook) {
    const fontSize = Math.round(width * 0.072);
    ctx.font = `800 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const maxWidth = width * 0.84;
    const lines = wrapText(ctx, hook.toUpperCase(), maxWidth);
    const lineHeight = fontSize * 1.18;
    let y = height * 0.07;

    for (const line of lines) {
      const w = ctx.measureText(line).width;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      roundRect(
        ctx,
        (width - w) / 2 - fontSize * 0.32,
        y - fontSize * 0.16,
        w + fontSize * 0.64,
        lineHeight,
        fontSize * 0.28,
      );
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(line, width / 2, y);
      y += lineHeight + fontSize * 0.16;
    }
  }

  const handle = style.handle.trim();
  if (handle) {
    const fontSize = Math.round(width * 0.036);
    ctx.font = `600 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fillText(handle, width / 2, height - height * (style.showProgress ? 0.055 : 0.04));
  }

  if (style.showProgress) {
    const barHeight = Math.max(4, Math.round(height * 0.006));
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillRect(0, height - barHeight, width, barHeight);
    ctx.fillStyle = style.accent;
    ctx.fillRect(0, height - barHeight, width * Math.min(1, Math.max(0, progress)), barHeight);
  }
}

export function pickMimeType(): string {
  const candidates = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return 'video/webm';
}

export function extensionFor(mimeType: string): string {
  return mimeType.startsWith('video/mp4') ? 'mp4' : 'webm';
}
