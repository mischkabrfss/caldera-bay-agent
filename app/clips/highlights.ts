export type Highlight = {
  start: number;
  end: number;
  score: number;
  peak: number;
};

const CLIP_LENGTH = 30;

/**
 * Note un extrait à partir de l'énergie audio : un bon moment viral combine
 * un volume moyen élevé (personne qui parle fort / réagit) et de la variation
 * (rythme, coupures, rires) plutôt qu'un silence plat ou un bruit constant.
 */
export function scoreWindows(
  envelope: Float32Array,
  hz: number,
  duration: number,
  clipLength = CLIP_LENGTH,
): Highlight[] {
  const windowSize = Math.max(1, Math.round(clipLength * hz));
  const step = Math.max(1, Math.round(hz)); // une fenêtre candidate par seconde
  const scored: Highlight[] = [];

  for (let start = 0; start + windowSize <= envelope.length; start += step) {
    let sum = 0;
    let peak = 0;
    for (let i = start; i < start + windowSize; i += 1) {
      const v = envelope[i];
      sum += v;
      if (v > peak) peak = v;
    }
    const mean = sum / windowSize;

    let variance = 0;
    for (let i = start; i < start + windowSize; i += 1) {
      const d = envelope[i] - mean;
      variance += d * d;
    }
    variance /= windowSize;

    // Le pic d'attaque au tout début aide la rétention sur les 3 premières secondes.
    const openingBoost = envelope
      .slice(start, start + Math.min(windowSize, Math.round(3 * hz)))
      .reduce((a, b) => Math.max(a, b), 0);

    const score = mean * 0.55 + Math.sqrt(variance) * 0.3 + openingBoost * 0.15;
    scored.push({
      start: start / hz,
      end: Math.min(duration, start / hz + clipLength),
      score,
      peak,
    });
  }

  return scored;
}

/** Garde les meilleurs extraits sans qu'ils se chevauchent. */
export function pickHighlights(
  scored: Highlight[],
  count: number,
  minGap: number,
): Highlight[] {
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const chosen: Highlight[] = [];

  for (const candidate of sorted) {
    if (chosen.length >= count) break;
    const overlaps = chosen.some(
      (c) => Math.abs(c.start - candidate.start) < minGap,
    );
    if (!overlaps) chosen.push(candidate);
  }

  return chosen.sort((a, b) => a.start - b.start);
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export { CLIP_LENGTH };
