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
  if (status === 403 || status === 429) return new StoreError('blocked', `« ${host} » bloque les lectures automatiques (protection anti-robots). Réessaie dans quelques minutes ou analyse une autre boutique.`);
  return status === 0
    ? new StoreError('not_found', `« ${host} » n’existe pas ou ne répond pas. Vérifie l’orthographe de l’adresse.`)
    : new StoreError('not_shopify', `« ${host} » existe mais ce n’est pas une boutique Shopify ouverte (autre plateforme, boutique fermée ou protégée par mot de passe).`);
}

// Boutique en préparation : Shopify redirige vers /password et cache le catalogue (products.json → 401).
const isLocked = (page) => !!page?.finalUrl && new URL(page.finalUrl).pathname.startsWith('/password');
const passwordError = (host) => new StoreError('password', `« ${host} » est protégée par un mot de passe : Shopify cache tous ses produits tant qu’il est actif.`);

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
    // Seules les vraies pages sont gardées 15 min : une redirection vers /password ou une erreur n'est jamais mise en cache
    // (sinon une boutique dont on vient de retirer le mot de passe resterait « verrouillée » un quart d'heure).
    cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': 900, '300-599': 0 } },
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

export async function fetchProducts(host, maxPages = 4, limit = 250) {
  const products = [];
  for (let page = 1; page <= maxPages; page++) {
    const data = await getJson(`https://${host}/products.json?limit=${limit}&page=${page}`);
    if (!data || !Array.isArray(data.products)) {
      if (page === 1) return null;
      break;
    }
    products.push(...data.products.map(slimProduct));
    if (data.products.length < limit) break;
  }
  return products;
}

export function bestsellerHandles(html) {
  const seen = new Set();
  for (const match of html.matchAll(/href=["'][^"']*\/products\/([a-z0-9][a-z0-9\-_%]*)/gi)) {
    seen.add(decodeURIComponent(match[1]).toLowerCase());
    if (seen.size >= 40) break;
  }
  return [...seen];
}

// Lecture légère (espion, radar, comparateur).
// withHome : lit aussi la page d'accueil (outils marketing détectés par l'espion).
async function fetchLite(host, { withHome = false } = {}) {
  const [products, meta, best, home] = await Promise.all([
    // 100 fiches les plus récentes : assez pour l'espion et le radar, et la lecture tient dans les 10 ms de calcul gratuites.
    fetchProducts(host, 1, 100),
    getJson(`https://${host}/meta.json`),
    getText(`https://${host}/collections/all?sort_by=best-selling`),
    withHome ? getText(`https://${host}/`) : null,
  ]);
  if (!products) throw isLocked(best) || isLocked(home) ? passwordError(host) : notFound(host, best.status);
  const known = new Set(products.map((p) => p.handle));
  let bestsellers = bestsellerHandles(best.text);
  let bestSource = 'sales';
  if (withHome) { // espion uniquement (le radar reste dans la limite de requêtes Cloudflare)
    // Page de tri générée en JavaScript → collection « best-sellers », sinon produits mis en avant sur l'accueil.
    if (bestsellers.filter((h) => known.has(h)).length < 4) {
      const col = (await getJson(`https://${host}/collections/best-sellers/products.json?limit=24`))?.products || [];
      if (col.length >= 4) {
        for (const p of col) if (!known.has(p.handle)) { products.push(slimProduct(p)); known.add(p.handle); }
        bestsellers = col.map((p) => p.handle); bestSource = 'collection';
      } else if (home?.text) {
        const featured = bestsellerHandles(home.text);
        if (featured.length >= 4) { bestsellers = featured; bestSource = 'home'; }
      }
    }
    // Gros catalogues : les produits classés absents des 100 premiers sont lus un par un (12 maximum).
    const missing = bestsellers.filter((h) => !known.has(h)).slice(0, 12);
    for (const r of await Promise.all(missing.map((h) => getJson(`https://${host}/products/${h}.json`)))) {
      if (r?.product && !known.has(r.product.handle)) { products.push(slimProduct(r.product)); known.add(r.product.handle); }
    }
  }
  return { host, meta: meta || {}, products, bestsellers, bestSource, html: home ? home.text : null };
}

// Lecture complète pour l'audit.
async function fetchFull(host) {
  const [products, meta, collections, home, best, refund, privacy, terms, shipping, contact, sitemap] = await Promise.all([
    fetchProducts(host, 1, 150), // 150 fiches analysées en détail ; le vrai total vient de meta.json
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
  if (isLocked(home)) throw passwordError(host);
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

// Vitrine headless sur www (Hydrogen…) : le catalogue Shopify reste souvent servi sur le domaine nu.
const withApexFallback = (read) => async (host, options) => {
  try {
    return await read(host, options);
  } catch (error) {
    if (error.code !== 'not_shopify' || !host.startsWith('www.')) throw error;
    return read(host.slice(4), options).catch(() => { throw error; });
  }
};
export const fetchStoreLite = withApexFallback(fetchLite);
export const fetchStoreFull = withApexFallback(fetchFull);
