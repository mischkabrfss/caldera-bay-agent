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
  spy: 'pro',
  radar: 'pro',
  compare: 'scale',
  export: 'scale',
};

export const TEST_LIMITS = { audits: 3, fixes: 3, products: 3, teaser: 3 };

export const can = (plan, feature) => (PLANS[plan]?.rank ?? 0) >= PLANS[FEATURES[feature]].rank;
