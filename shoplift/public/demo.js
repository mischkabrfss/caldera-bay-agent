// Mode démo : utilisé seulement quand le serveur n'est pas joignable (aperçu statique).
// Même moteur d'analyse que la production ; radar figé sur de vrais produits (radar-snapshot.js).
// catalog/homeHtml/imageSvg servent au faux Shopify local (test/mock-shop.mjs).
import { auditStore, spyStore } from './analyze.js';
import { can, lockAudit, lockItems, PLANS, TEST_LIMITS } from './plans.js';
import { NICHES } from './seeds.js';
import { SNAPSHOT, SNAPSHOT_DATE } from './radar-snapshot.js';

const NAMES = ['Lampe coucher de soleil', 'Gourde isotherme inox', 'Coque magnétique iPhone', 'Masseur cervical chauffant', 'Tapis de yoga antidérapant', 'Brosse nettoyante visage', 'Collier prénom personnalisé', 'Harnais anti-traction chien', 'Mini projecteur galaxie', 'Organisateur de voiture', 'Sweat oversize brodé', 'Bague ajustable acier', 'Diffuseur huiles essentielles', 'Poêle céramique 28 cm', 'Couverture lestée', 'Lunettes anti-lumière bleue', 'Montre connectée sport', 'Legging gainant sculptant', 'Pistolet de massage', 'Veilleuse nuage enfant'];
const COLORS = ['#00f5a0', '#8b5cff', '#ff4fd8', '#ffd166', '#00c2ff', '#ff5c7a'];

export function seeded(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) / 4294967296);
}

export function imageSvg(name) {
  const rnd = seeded(name);
  const a = COLORS[Math.floor(rnd() * COLORS.length)];
  const b = COLORS[Math.floor(rnd() * COLORS.length)];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="400" fill="#15122a"/><circle cx="200" cy="190" r="${Math.round(90 + rnd() * 50)}" fill="url(#g)" opacity=".85"/><rect x="120" y="300" width="160" height="18" rx="9" fill="#fff" opacity=".2"/></svg>`;
}

// Catalogue d'exemple au format interne (celui de shopify.js).
export function catalog(host, imageUrl = (name) => `data:image/svg+xml,${encodeURIComponent(imageSvg(name))}`) {
  const rnd = seeded(host);
  const count = 8 + Math.floor(rnd() * 14);
  return Array.from({ length: count }, (_, i) => {
    const name = NAMES[Math.floor(rnd() * NAMES.length)];
    const good = rnd() > 0.45;
    const price = [9.9, 19.99, 24.9, 29.99, 34.99, 49.9, 59, 79.99][Math.floor(rnd() * 8)];
    const compareAt = rnd() > 0.5 ? Math.round(price * (1.3 + rnd() * 0.5)) + 0.99 : 0;
    const created = new Date(Date.now() - Math.floor(rnd() * 200) * 86_400_000).toISOString();
    return {
      id: 1000 + i, title: good ? `${name} – édition premium` : name.toUpperCase(), handle: `produit-${i}`,
      body: good ? `<p>${'Un produit pensé pour ton confort au quotidien. '.repeat(25)}</p><ul><li>Qualité premium</li><li>Livraison rapide</li></ul>` : '<p>Super produit.</p>',
      vendor: host, type: good ? 'Accessoire' : '', tags: good ? ['tendance', 'cadeau', 'best'] : [],
      createdAt: created, publishedAt: created, updatedAt: created,
      images: Array.from({ length: good ? 4 + Math.floor(rnd() * 4) : 1 + Math.floor(rnd() * 2) }, (_, k) => ({ src: imageUrl(`${host}-${i}-${k}`), alt: good ? name : '' })),
      variants: Array.from({ length: 1 + Math.floor(rnd() * 3) }, () => ({ price, compareAt, available: rnd() > 0.12 })),
      options: ['Couleur'],
    };
  });
}

export const isRich = (host) => seeded(host)() > 0.5;

export function homeHtml(host) {
  const rich = isRich(host);
  return `<html><head><title>${rich ? `${host} – La boutique tendance livrée en 48h` : host}</title>${rich ? '<meta name="description" content="Découvre nos best-sellers livrés en 48h. Paiement sécurisé, satisfait ou remboursé 30 jours. Rejoins la communauté.">' : ''}<script>Shopify.theme = {"name":"${rich ? 'Dawn' : 'Debut'}","id":1};</script>${rich ? '<script src="https://connect.facebook.net/en_US/fbevents.js"></script><div class="jdgm-widget"></div>' : ''}</head><body><h1>Bienvenue</h1><p>${rich ? 'Livraison gratuite dès 49€ · Paiement sécurisé' : ''}</p></body></html>`;
}

// Boutique Shopify réellement connectée (lue via le connecteur), seule analysable sur l'aperçu.
let connected = null;
const clean = (v) => String(v || '').trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0];
function matchConnected(input) {
  if (!connected) return null;
  const typed = clean(input);
  const names = [connected.host, connected.meta?.name, String(connected.host).split('.')[0]].map(clean);
  return typed && names.includes(typed) ? connected : null;
}
const UNVERIFIABLE = () => 'Sur cet aperçu, seule ta boutique Shopify connectée peut être analysée : clique sur « Analyser ma vraie boutique ». Sur le site en ligne, toutes les boutiques Shopify le sont.';

const mem = {};
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return mem[k] ?? d; } };
const write = (k, v) => { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage indisponible */ } };
const ok = (data) => ({ ok: true, status: 200, data });
const fail = (status, error, extra = {}) => ({ ok: false, status, data: { error, ...extra } });

export function demoApi(path, body = {}) {
  const url = new URL(path, 'https://demo.local');
  const plan = read('pr_demo_plan', 'test');
  // Les essais gratuits de la démo repartent à zéro chaque jour.
  const today = new Date().toDateString();
  const trial = read('pr_demo_trial', { n: 0, day: today });
  const used = trial.day === today ? trial.n : 0;
  switch (url.pathname) {
    case '/api/config':
      return ok({ stripe: false, demo: true, plans: PLANS, niches: Object.fromEntries(Object.entries(NICHES).map(([k, v]) => [k, { label: v.label }])) });
    case '/api/me':
      return ok({ plan, email: '', trialLeft: Math.max(0, TEST_LIMITS.audits - used), portal: false, demo: true });
    case '/api/audit': {
      if (plan === 'test' && used >= TEST_LIMITS.audits) return fail(402, `Ton analyse gratuite est utilisée. Choisis une offre pour continuer.`);
      if (body.connected) connected = body.connected;
      const real = body.connected || matchConnected(body.store);
      if (!real) return fail(422, UNVERIFIABLE(body.store), { code: 'unverifiable' });
      const report = auditStore(real);
      if (plan === 'test') write('pr_demo_trial', { n: used + 1, day: today });
      return ok({ plan, trialLeft: plan === 'test' ? TEST_LIMITS.audits - used - 1 : null, report: can(plan, 'fullAudit') ? report : lockAudit(report) });
    }
    case '/api/spy': {
      if (body.connected) connected = body.connected;
      const real = body.connected || matchConnected(body.store);
      if (!real) return fail(422, UNVERIFIABLE(body.store), { code: 'unverifiable' });
      const report = spyStore(real);
      if (!can(plan, 'spy')) Object.assign(report, { bestsellers: lockItems(report.bestsellers, 1), launches: lockItems(report.launches, 1), locked: true });
      return ok({ plan, report });
    }
    case '/api/radar': {
      const niche = NICHES[url.searchParams.get('niche')] ? url.searchParams.get('niche') : 'mode';
      // Aperçu : vrais produits relevés sur les boutiques du radar (npm run snapshot), liens directs vers leur page.
      const items = (SNAPSHOT[niche] || []).map((i) => ({ ...i, snapshot: SNAPSHOT_DATE }));
      return ok({ plan, niche, locked: !can(plan, 'radar'), items: can(plan, 'radar') ? items : lockItems(items.slice(0, 8), 1) });
    }
    case '/api/compare':
      if (!can(plan, 'compare')) return fail(403, 'Le comparateur multi-boutiques est inclus dans l’offre Scale.');
      return fail(422, 'Le comparateur fonctionne sur le site en ligne.', { code: 'unverifiable' });
    case '/api/checkout':
      write('pr_demo_plan', body.plan);
      return ok({ changed: true, plan: body.plan });
    case '/api/logout':
      write('pr_demo_plan', 'test');
      return ok({ ok: true });
    case '/api/demo-reset':
      write('pr_demo_plan', 'test');
      write('pr_demo_trial', { n: 0, day: today });
      return ok({ ok: true });
    default:
      return fail(400, 'Disponible sur le site en ligne (mode démo).');
  }
}
