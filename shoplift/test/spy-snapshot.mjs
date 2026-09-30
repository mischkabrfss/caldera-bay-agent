// Espion de l'aperçu : analyses réelles de 6 concurrents (un par niche), figées avec leurs photos (public/spy-snapshot.js).
// Usage : npm run snapshot
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { compareStores, spyStore } from '../public/analyze.js';
import { SPY_EXAMPLES as SPY_HOSTS } from '../public/seeds.js';
import { fetchStoreLite } from '../src/shopify.js';
const dir = new URL('../public/spy-img/', import.meta.url);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir);
async function thumb(src, name) {
  const u = new URL(src);
  u.searchParams.set('width', '480');
  const r = await fetch(u, { headers: { Accept: 'image/webp' } });
  if (!r.ok) throw new Error(`image ${r.status}`);
  const ext = { 'image/webp': 'webp', 'image/png': 'png', 'image/gif': 'gif' }[r.headers.get('content-type')] || 'jpg';
  writeFileSync(new URL(`${name}.${ext}`, dir), Buffer.from(await r.arrayBuffer()));
  return `spy-img/${name}.${ext}`;
}

const out = {};
for (const host of SPY_HOSTS) {
  const store = await fetchStoreLite(host, { withHome: true });
  const report = spyStore(store);
  const row = compareStores([store])[0];
  const id = host.split('.')[0];
  for (const [list, key] of [[report.bestsellers, 'b'], [report.launches, 'n']]) {
    for (const [i, p] of list.entries()) { p.image = p.image ? await thumb(p.image, `${id}-${key}${i}`).catch(() => '') : ''; p.image2 = ''; }
  }
  if (row.top) row.top.image = '';
  out[host] = { report, row };
  console.log(`espion ${host.padEnd(24)} ${report.bestsellers.length} best-sellers, ${report.launches.length} nouveautés, ${report.insights.length} conseils`);
}
const date = new Date().toISOString().slice(0, 10);
writeFileSync(new URL('../public/spy-snapshot.js', import.meta.url), `// Généré par \`npm run snapshot\` le ${date} : vraies analyses espion pour l'aperçu.\nexport const SPY_DATE = '${date}';\nexport const SPY_SNAPSHOT = ${JSON.stringify(out)};\n`);
