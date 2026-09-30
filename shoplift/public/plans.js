// Offres. Modifie les prix ici (en centimes) : Stripe s'adapte tout seul.
export const PLANS = {
  test: { name: 'Test', price: 0, rank: 0 },
  basic: { name: 'Basique', price: 1900, rank: 1 },
  pro: { name: 'Pro', price: 4900, rank: 2 },
  scale: { name: 'Scale', price: 9900, rank: 3 },
};

// Fonctionnalité → offre minimale.
export const FEATURES = {
  fullAudit: 'basic',
  allProducts: 'basic',
  spyInsights: 'basic', // conseils + graphiques de l'espion
  spy: 'pro',           // espion complet (12 best-sellers, 12 nouveautés, fournisseurs)
  watch: 'pro',         // suivi des boutiques concurrentes
  radar: 'pro',
  compare: 'scale',
  export: 'scale',
};

export const TEST_LIMITS = { audits: 1, fixes: 3, products: 3, teaser: 3 };
// Espion : ce que chaque offre voit, et combien de boutiques elle peut suivre.
export const SPY_LIMITS = { test: { items: 1, insights: 2 }, basic: { items: 3, insights: 99 }, pro: { items: 99, insights: 99 }, scale: { items: 99, insights: 99 } };
export const WATCH_LIMITS = { test: 0, basic: 0, pro: 5, scale: 20 };

export const can = (plan, feature) => (PLANS[plan]?.rank ?? 0) >= PLANS[FEATURES[feature]].rank;

// Version « Test » : résultats visibles en partie, le reste flouté.
export function lockAudit(report) {
  const fixes = report.fixes.map((fix, i) => (i < TEST_LIMITS.fixes ? fix : { cat: fix.cat, impact: fix.impact, title: fix.title, locked: true }));
  const products = report.products.map((p, i) => (i < TEST_LIMITS.products ? p : { title: p.title, image: p.image, score: p.score, verdict: p.verdict, locked: true }));
  return { ...report, fixes, products };
}

export const lockItems = (items, keep) => items.map((item, i) => (i < keep ? item : { image: item.image, score: item.score, locked: true }));

// Espion selon l'offre : Test = aperçu, Basique = conseils + graphiques + top 3, Pro/Scale = tout.
export function lockSpy(report, plan) {
  const lim = SPY_LIMITS[plan] || SPY_LIMITS.test;
  const r = { ...report, level: can(plan, 'spy') ? 'full' : can(plan, 'spyInsights') ? 'insights' : 'teaser' };
  r.bestsellers = lockItems(report.bestsellers, lim.items);
  r.launches = lockItems(report.launches, lim.items);
  r.insights = (report.insights || []).map((x, i) => (i < lim.insights ? x : { icon: x.icon, title: x.title, locked: true }));
  if (!can(plan, 'spyInsights')) r.charts = null;
  r.locked = r.level !== 'full';
  return r;
}
