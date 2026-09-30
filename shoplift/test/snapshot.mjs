// Scanne les vraies boutiques du radar et fige le résultat pour l'aperçu statique (public/radar-snapshot.js).
// Usage : npm run snapshot
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { radarFrom } from '../public/analyze.js';
import { kindOf, NICHES } from '../public/seeds.js';
import { fetchStoreLite } from '../src/shopify.js';

// L'aperçu (artifact) bloque les images externes : on copie une miniature de chaque vraie photo à côté de la page.
const dir = new URL('../public/radar-img/', import.meta.url);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir);
async function thumb(src, name) {
  const u = new URL(src);
  u.searchParams.set('width', '480'); // net sur écrans haute définition
  const r = await fetch(u, { headers: { Accept: 'image/webp' } });
  if (!r.ok) throw new Error(`image ${r.status}`);
  const ext = { 'image/webp': 'webp', 'image/png': 'png', 'image/gif': 'gif' }[r.headers.get('content-type')] || 'jpg';
  writeFileSync(new URL(`${name}.${ext}`, dir), Buffer.from(await r.arrayBuffer()));
  return `radar-img/${name}.${ext}`;
}

const out = {};
for (const [niche, { stores }] of Object.entries(NICHES)) {
  const results = await Promise.allSettled(stores.map((h) => fetchStoreLite(h)));
  results.forEach((r, i) => console.log(`${niche.padEnd(8)} ${stores[i].padEnd(24)} ${r.status === 'fulfilled' ? `${r.value.products.length} produits, ${r.value.bestsellers.length} best-sellers` : `ÉCHEC ${r.reason?.message}`}`));
  out[niche] = radarFrom(results.filter((r) => r.status === 'fulfilled').map((r) => r.value), { kind: (p) => kindOf(niche, p) });
  for (const [i, item] of out[niche].entries()) {
    item.image = await thumb(item.image, `${niche}-${i}`);
    item.image2 = item.image2 ? await thumb(item.image2, `${niche}-${i}b`).catch(() => '') : '';
  }
}
const date = new Date().toISOString().slice(0, 10);
writeFileSync(new URL('../public/radar-snapshot.js', import.meta.url), `// Généré par \`npm run snapshot\` le ${date} : vrais produits des boutiques du radar.\nexport const SNAPSHOT_DATE = '${date}';\nexport const SNAPSHOT = ${JSON.stringify(out)};\n`);
console.log('OK', Object.values(out).map((v) => v.length).join(' / '));
