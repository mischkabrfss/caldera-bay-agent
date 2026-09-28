// Analyse réelle d'une boutique via le connecteur Shopify de claude.ai (aperçu publié uniquement).
// Lecture seule : une requête GraphQL Admin, aucune modification de la boutique.
const SERVER = 'Shopify';
const QUERY = `query ShopliftAudit { shop { name currencyCode description primaryDomain { host url } shopPolicies { type } } products(first: 100, query: "status:active") { nodes { id title handle descriptionHtml vendor productType tags createdAt publishedAt onlineStoreUrl seo { title description } media(first: 10) { nodes { alt preview { image { url altText } } } } variants(first: 20) { nodes { price compareAtPrice availableForSale } } } } collectionsCount { count } pages(first: 50) { nodes { handle title } } }`;

const MESSAGES = {
  server_not_connected: 'Connecteur Shopify absent : ajoute-le dans claude.ai → Paramètres → Connecteurs.',
  needs_reauth: 'Ta connexion Shopify a expiré : reconnecte-la dans claude.ai → Paramètres → Connecteurs.',
  selection_required: 'Plusieurs connecteurs Shopify : choisis-en un dans la fenêtre proposée, puis réessaie.',
  not_in_manifest: 'Accès à Shopify refusé pour cette page. Recharge la page pour autoriser à nouveau.',
  consent_required: 'Autorise l’accès à Shopify pour lancer l’analyse.',
  blocked_by_policy: 'Ton organisation bloque cet outil Shopify.',
  approval_required: 'Ton organisation exige une approbation pour cet outil Shopify.',
};

let mcpPromise;
export function shopifyAvailable() {
  mcpPromise ??= window.claude?.use ? window.claude.use('mcp').catch(() => null) : Promise.resolve(null);
  return mcpPromise.then(Boolean);
}

async function call() {
  const mcp = await mcpPromise;
  if (!mcp) throw new Error('La connexion Shopify n’est pas disponible sur cette page.');
  try {
    return await mcp.callTool(SERVER, 'graphql_query', { query: QUERY });
  } catch (error) {
    if (error?.retryable) {
      await new Promise((r) => setTimeout(r, Math.min(error.retryAfterMs || 1500, 5000) + Math.random() * 500));
      return mcp.callTool(SERVER, 'graphql_query', { query: QUERY });
    }
    throw error;
  }
}

export function toStore(payload) {
  let data = payload;
  if (typeof data === 'string') data = JSON.parse(data);
  data = data?.data ?? data;
  if (!data?.shop) throw new Error('Réponse Shopify inattendue.');
  const policies = new Set((data.shop.shopPolicies || []).map((p) => p.type));
  const pages = (data.pages?.nodes || []).map((p) => p.handle);
  const nodes = data.products?.nodes || [];
  const products = nodes.map((p) => ({
    id: p.id, title: p.title || '', handle: p.handle || '', body: p.descriptionHtml || '', vendor: p.vendor || '', type: p.productType || '',
    tags: p.tags || [], createdAt: p.createdAt, publishedAt: p.publishedAt, updatedAt: null,
    images: (p.media?.nodes || []).filter((m) => m.preview?.image?.url).map((m) => ({ src: m.preview.image.url, alt: m.preview.image.altText || m.alt || '' })),
    variants: (p.variants?.nodes || []).map((v) => ({ price: Number(v.price) || 0, compareAt: Number(v.compareAtPrice) || 0, available: v.availableForSale !== false })),
    options: [],
  }));
  return {
    source: 'shopify',
    host: data.shop.primaryDomain?.host || data.shop.name,
    meta: { name: data.shop.name, currency: data.shop.currencyCode || 'EUR' },
    products,
    collections: Array.from({ length: data.collectionsCount?.count || 0 }, () => ({})),
    html: null,
    bestsellers: [],
    checks: {
      refund: policies.has('REFUND_POLICY') || pages.some((h) => /retour|rembours|refund/.test(h)),
      privacy: policies.has('PRIVACY_POLICY'),
      terms: policies.has('TERMS_OF_SERVICE') || policies.has('TERMS_OF_SALE') || pages.some((h) => /cgv|conditions/.test(h)),
      shipping: policies.has('SHIPPING_POLICY') || pages.some((h) => /livraison|shipping/.test(h)),
      contact: pages.some((h) => /contact/.test(h)),
      sitemap: true,
    },
    admin: {
      description: data.shop.description || '',
      seoCustom: nodes.filter((p) => p.seo?.title || p.seo?.description).length,
      pages: pages.length,
    },
  };
}

export async function readConnectedStore() {
  try {
    const result = await call();
    return toStore(result.payload ?? result);
  } catch (error) {
    throw new Error(MESSAGES[error?.code] || error?.message || 'Lecture de la boutique impossible.');
  }
}
