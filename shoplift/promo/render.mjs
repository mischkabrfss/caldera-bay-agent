// Rend youtube.html (ou tiktok.html avec TT=1 : voix off + sous-titres) en MP4 60 i/s — YouTube 1920×1080 (par défaut) ou TikTok 1080×1920 (V=1) : 120 images/s calculées puis fondues deux à deux (flou de mouvement), son 48 kHz stéréo.
// Prérequis : `python3 -m http.server 8812` lancé depuis shoplift/, Playwright, ffmpeg (FFMPEG=chemin), sound-20s.wav (python3 sound-20s.py).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
const TT = !!process.env.TT, V = TT || !!process.env.V, RATE = 120, DUR = +(process.env.DUR || 20), dir = new URL('.', import.meta.url).pathname, out = process.env.OUT || `${dir}shoplift-${V ? 'tiktok' : 'youtube'}-20s.mp4`;
const ff = spawn(process.env.FFMPEG || 'ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(RATE), '-c:v', TT ? 'png' : 'mjpeg', '-i', '-', '-i', `${dir}${TT ? 'tiktok-sound' : 'sound-20s'}.wav`,
  '-vf', 'tmix=frames=2,fps=60', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', '60',
  '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const b = await chromium.launch(); const p = await b.newPage({ viewport: V ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 } });
await p.goto('http://localhost:8812/promo/' + (TT ? 'tiktok.html' : 'youtube.html' + (V ? '?v' : ''))); await p.waitForFunction(() => window.__ready, null, { timeout: 30000 });
const t0 = Date.now();
for (let f = 0; f < RATE * DUR; f++) {
  await p.evaluate((t) => render(t), f / RATE);
  const img = await p.screenshot(TT ? { type: 'png' } : { type: 'jpeg', quality: 93 }); // PNG : texte net, sans artefacts
  if (!ff.stdin.write(img)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % 240 === 0) console.log(`image ${f}/${RATE * DUR} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close(); console.log('fini', ((Date.now() - t0) / 1000).toFixed(0), 's');
