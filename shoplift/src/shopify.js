// Lecture des données publiques d'une boutique Shopify : aucune installation, aucun token.
const UA = 'Mozilla/5.0 (compatible; Shoplift/1.0; +https://shoplift.app)';
const MAX_HTML = 700_000;

export class StoreError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// Adresse inexistante (aucune réponse) ≠ site existant qui n'est pas une boutique Shopify.
function notFound(host, status) {
  return status === 0
    ? new StoreError('not_found', `« ${host} » n’existe pas ou ne répond pas. Vérifie l’orthographe de l’adresse.`)
    : new StoreError('not_shopify', `« ${host} » existe mais ce n’est pas une boutique Shopify ouverte (autre plateforme, boutique fermée ou protégée par mot de passe).`);
}

export function normalizeStore(input) {
  let value = String(input || '').trim().toLowerCase();
  if (!value) throw new StoreError('invalid', 'Entre l’adresse de ta boutique.');
  value = value.replace(/^[a-z]+:\/\//, '').split(/[/?#]/)[0].replace(/:\d+$/, '').replace(/\.$/, '');
  if (!value.includes('.')) value += '.myshopify.com';
  const valid = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(value);
  if (!valid || /^\d+(\.\d+)+$/.test(value) || /(^|\.)(localhost|local|internal)$/.test(value)) {
    throw new StoreError('invalid', 'Adresse invalide. Exemple : maboutique.com ou maboutique.myshopify.com');
  }
  return value;
}

async function get(url, { json = false, timeout = 9000 } = {}) {
  // Développement local uniquement : SHOPIFY_MOCK redirige vers un faux Shopify (test/mock-shop.mjs).
  const mock = globalThis.SHOPIFY_MOCK;
  if (mock) url = `${mock}/${url.replace(/^https:\/\//, '')}`;
  const attempt = () => fetch(url, {
    headers: { 'User-Agent': UA, Accept: json ? 'application/json' : 'text/html,*/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout),
    cf: { cacheTtl: 900, cacheEverything: true },
  });
  // Une 2e tentative si Shopify limite (429), plante (5xx) ou si le réseau coupe.
  try {
    const response = await attempt();
    if (response.status !== 429 && response.status < 500) return response;
  } catch { /* on retente */ }
  await new Promise((r) => setTimeout(r, 700));
  return attempt();
}

async function getJson(url) {
  try {
    const response = await get(url, { json: true });
    if (!response.ok || (response.url && new URL(response.url).pathname.startsWith('/password'))) return null;
    const type = response.headers.get('content-type') || '';
    if (!type.includes('json')) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function getText(url) {
  try {
    const response = await get(url);
    const text = response.ok ? (await response.text()).slice(0, MAX_HTML) : '';
    return { ok: response.ok, status: response.status, finalUrl: response.url, text };
  } catch {
    return { ok: false, status: 0, finalUrl: url, text: '' };
  }
}

async function exists(url) {
  try {
    const response = await get(url, { timeout: 6000 });
    return response.ok;
  } catch {
    return false;
  }
}

function slimProduct(product) {
  return {
    id: product.id,
    title: product.title || '',
    handle: product.handle || '',
    body: String(product.body_html || '').slice(0, 20_000),
    vendor: product.vendor || '',
    type: product.product_type || '',
    tags: Array.isArray(product.tags) ? product.tags : String(product.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    createdAt: product.created_at || product.published_at || null,
    publishedAt: product.published_at || null,
    updatedAt: product.updated_at || null,
    images: (product.images || []).map((image) => ({ src: image.src, alt: image.alt || '' })).slice(0, 12),
    variants: (product.variants || []).map((variant) => ({
      price: Number(variant.price) || 0,
      compareAt: Number(variant.compare_at_price) || 0,
      available: variant.available !== false,
    })),
    options: (product.options || []).map((option) => option.name),
  };
}

export async function fetchProducts(host, maxPages = 4) {
  const products = [];
  for (let page = 1; page <= maxPages; page++) {
    const data = await getJson(`https://${host}/products.json?limit=250&page=${page}`);
    if (!data || !Array.isArray(data.products)) {
      if (page === 1) return null;
      break;
    }
    products.push(...data.products.map(slimProduct));
    if (data.products.length < 250) break;
  }
  return products;
}

export function bestsellerHandles(html) {
  const seen = new Set();
  for (const match of html.matchAll(/href="[^"]*\/products\/([a-z0-9][a-z0-9\-_%]*)/gi)) {
    seen.add(decodeURIComponent(match[1]).toLowerCase());
    if (seen.size >= 40) break;
  }
  return [...seen];
}

// Lecture légère (espion, radar, comparateur).
export async function fetchStoreLite(host) {
  const [products, meta, best] = await Promise.all([
    fetchProducts(host, 2),
    getJson(`https://${host}/meta.json`),
    getText(`https://${host}/collections/all?sort_by=best-selling`),
  ]);
  if (!products) throw notFound(host, best.status);
  return { host, meta: meta || {}, products, bestsellers: bestsellerHandles(best.text) };
}

// Lecture complète pour l'audit.
export async function fetchStoreFull(host) {
  const [products, meta, collections, home, best, refund, privacy, terms, shipping, contact, sitemap] = await Promise.all([
    fetchProducts(host, 4),
    getJson(`https://${host}/meta.json`),
    getJson(`https://${host}/collections.json?limit=250`),
    getText(`https://${host}/`),
    getText(`https://${host}/collections/all?sort_by=best-selling`),
    exists(`https://${host}/policies/refund-policy`),
    exists(`https://${host}/policies/privacy-policy`),
    exists(`https://${host}/policies/terms-of-service`),
    exists(`https://${host}/policies/shipping-policy`),
    exists(`https://${host}/pages/contact`),
    exists(`https://${host}/sitemap.xml`),
  ]);
  if (home.finalUrl && new URL(home.finalUrl).pathname.startsWith('/password')) {
    throw new StoreError('password', 'Ta boutique est protégée par un mot de passe. Retire-le (Boutique en ligne → Préférences) le temps de l’analyse.');
  }
  if (!products) throw notFound(host, home.status);
  return {
    host,
    meta: meta || {},
    products,
    collections: (collections?.collections || []).map((c) => ({ title: c.title, handle: c.handle, count: c.products_count ?? null })),
    html: home.text,
    bestsellers: bestsellerHandles(best.text),
    checks: { refund, privacy, terms, shipping, contact, sitemap },
  };
}
