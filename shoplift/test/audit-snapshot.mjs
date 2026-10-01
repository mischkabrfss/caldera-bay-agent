// Essai gratuit de l'aperçu : vraies analyses des boutiques exemples, figées avec leurs photos (public/audit-snapshot.js).
// Les photos sont intégrées en data URI (l'aperçu bloque les images externes et limite le nombre de fichiers).
// Usage : npm run snapshot
import { writeFileSync } from 'node:fs';
import { auditStore } from '../public/analyze.js';
import { SPY_EXAMPLES } from '../public/seeds.js';
import { fetchStoreFull } from '../src/shopify.js';
const KEEP = 10; // produits gardés par boutique (le reste alourdirait l'aperçu)
async function inline(src) {
  const u = new URL(src);
  u.searchParams.set('width', '320');
  const r = await fetch(u, { headers: { Accept: 'image/webp' } });
  if (!r.ok) return '';
  const type = r.headers.get('content-type') || 'image/jpeg';
  return `data:${type};base64,${Buffer.from(await r.arrayBuffer()).toString('base64')}`;
}
const out = {};
for (const host of SPY_EXAMPLES) {
  try {
    const report = auditStore(await fetchStoreFull(host));
    report.products = report.products.slice(0, KEEP);
    for (const p of report.products) { p.image = p.image ? await inline(p.image).catch(() => '') : ''; p.image2 = ''; }
    out[host] = report;
    console.log(`audit  ${host.padEnd(24)} score ${report.score}, ${report.fixes.length} corrections`);
  } catch (e) { console.log(`audit  ${host.padEnd(24)} échec : ${e.message}`); }
}
const date = new Date().toISOString().slice(0, 10);
writeFileSync(new URL('../public/audit-snapshot.js', import.meta.url), `// Généré par \`npm run snapshot\` le ${date} : vraies analyses pour l'essai gratuit de l'aperçu.\nexport const AUDIT_SNAPSHOT = ${JSON.stringify(out)};\n`);
