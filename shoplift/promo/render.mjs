// Rend promo.html image par image (30 i/s, 1080×1920) puis encode en MP4 avec la bande-son.
// Prérequis : serveur statique sur public/ (python3 -m http.server 8811), Playwright, ffmpeg (FFMPEG=chemin).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const FPS = 30, DUR = 15, dir = new URL('.', import.meta.url).pathname;
const ff = spawn(process.env.FFMPEG || 'ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', `${dir}sound.wav`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', `${dir}shoplift-15s.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('http://localhost:8811/404.html'); await p.setContent(fs.readFileSync(`${dir}promo.html`, 'utf8')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
for (let f = 0; f < FPS * DUR; f++) {
  await p.evaluate((t) => render(t), f / FPS);
  const img = await p.screenshot({ type: 'jpeg', quality: 92 });
  if (!ff.stdin.write(img)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % 90 === 0) console.log('image', f);
}
ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close(); console.log('fini');
