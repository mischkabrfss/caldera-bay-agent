import { pickHighlights, scoreWindows, type Highlight } from './highlights';

const ENVELOPE_HZ = 10; // 10 mesures d'énergie par seconde

/**
 * Décode la piste audio du fichier et renvoie les meilleurs extraits.
 * Tout se passe dans le navigateur : la vidéo ne quitte jamais l'appareil.
 */
export async function analyzeVideo(
  file: File,
  options: { clipLength: number; count: number; onProgress?: (p: number) => void },
): Promise<{ highlights: Highlight[]; envelope: Float32Array; hz: number; duration: number }> {
  const { clipLength, count, onProgress } = options;
  onProgress?.(0.05);

  const buffer = await file.arrayBuffer();
  onProgress?.(0.25);

  const AudioCtor =
    window.OfflineAudioContext ??
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;
  if (!AudioCtor) throw new Error('Web Audio non disponible sur ce navigateur.');

  // Un contexte court sert uniquement à décoder ; le décodage est asynchrone.
  const decoder = new AudioCtor(1, 1, 44100);
  const audio = await decoder.decodeAudioData(buffer);
  onProgress?.(0.7);

  const channel = audio.getChannelData(0);
  const samplesPerBucket = Math.max(1, Math.round(audio.sampleRate / ENVELOPE_HZ));
  const buckets = Math.floor(channel.length / samplesPerBucket);
  const envelope = new Float32Array(buckets);

  for (let b = 0; b < buckets; b += 1) {
    let sum = 0;
    const offset = b * samplesPerBucket;
    for (let i = 0; i < samplesPerBucket; i += 1) {
      const v = channel[offset + i];
      sum += v * v;
    }
    envelope[b] = Math.sqrt(sum / samplesPerBucket); // RMS
  }

  // Normalise pour que les scores soient comparables d'une vidéo à l'autre.
  let max = 0;
  for (const v of envelope) if (v > max) max = v;
  if (max > 0) for (let i = 0; i < envelope.length; i += 1) envelope[i] /= max;

  onProgress?.(0.9);

  const duration = audio.duration;
  const scored = scoreWindows(envelope, ENVELOPE_HZ, duration, clipLength);
  const highlights = pickHighlights(scored, count, clipLength * 0.8);
  onProgress?.(1);

  return { highlights, envelope, hz: ENVELOPE_HZ, duration };
}
