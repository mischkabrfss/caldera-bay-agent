// Fausse boutique Shopify + faux Stripe pour tester sans réseau.
const now = Date.now();
const iso = (daysAgo) => new Date(now - daysAgo * 86_400_000).toISOString();

export const rawProducts = [
  {
    id: 1, title: 'Lampe coucher de soleil – ambiance cosy 16 couleurs', handle: 'lampe-sunset', product_type: 'Lampe', vendor: 'Demo',
    tags: ['deco', 'salon', 'led', 'cadeau'], created_at: iso(10), published_at: iso(10),
    body_html: `<p>${'Transforme ton salon en coucher de soleil. '.repeat(30)}</p><ul><li>16 couleurs</li><li>USB</li></ul>`,
    images: Array.from({ length: 6 }, (_, i) => ({ src: `https://cdn.test/sunset-${i}.jpg`, alt: 'lampe sunset' })),
    variants: [{ price: '29.99', compare_at_price: '49.99', available: true }, { price: '34.99', compare_at_price: '54.99', available: true }, { price: '39.99', compare_at_price: null, available: true }],
    options: [{ name: 'Taille' }],
  },
  {
    id: 2, title: 'MUG', handle: 'mug', product_type: '', vendor: 'Demo', tags: [], created_at: iso(400), published_at: iso(400),
    body_html: '<p>Un mug.</p>', images: [{ src: 'https://cdn.test/mug.jpg', alt: '' }],
    variants: [{ price: '8.00', compare_at_price: null, available: false }], options: [],
  },
  {
    id: 3, title: 'Pack x2 bouteilles isothermes inox', handle: 'pack-bouteilles', product_type: 'Gourde', vendor: 'Demo', tags: ['sport', 'eco', 'inox'],
    created_at: iso(50), published_at: iso(50), body_html: `<p>${'Garde ton eau fraîche 24h. '.repeat(12)}</p>`,
    images: Array.from({ length: 3 }, (_, i) => ({ src: `https://cdn.test/b-${i}.jpg`, alt: '' })),
    variants: [{ price: '44.90', compare_at_price: '59.90', available: true }], options: [],
  },
];

export const homeHtml = `<!doctype html><html><head><title>Demo Shop – Lampes d'ambiance design</title>
<meta name="description" content="Des lampes d'ambiance design livrées en 48h. Paiement sécurisé et satisfait ou remboursé 30 jours. Découvre la collection.">
<meta property="og:image" content="https://cdn.test/og.jpg">
<script>Shopify.theme = {"name":"Dawn","id":1};</script><script src="https://connect.facebook.net/en_US/fbevents.js"></script>
</head><body><h1>Lampes design</h1><p>Livraison gratuite dès 50€</p><img src="a.jpg" loading="lazy">
<a href="https://instagram.com/demo">IG</a><div class="jdgm-widget judge.me"></div></body></html>`;

export const bestHtml = '<a href="/products/lampe-sunset">x</a><a href="/collections/all/products/pack-bouteilles">y</a>';

export const fakeStore = () => ({
  host: 'demo.myshopify.com',
  meta: { name: 'Demo Shop', currency: 'EUR' },
  products: null,
  collections: [{ title: 'Lampes', handle: 'lampes' }, { title: 'Sport', handle: 'sport' }],
  html: homeHtml,
  bestsellers: ['lampe-sunset', 'pack-bouteilles'],
  checks: { refund: true, privacy: true, terms: false, shipping: true, contact: false, sitemap: true },
});

// Remplace fetch global : Shopify (demo.myshopify.com) + Stripe.
export function installFetch({ stripe = {} } = {}) {
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    calls.push({ url: url.toString(), method: init.method || 'GET', body: init.body ? String(init.body) : '' });
    const ok = (data, type = 'application/json') => new Response(typeof data === 'string' ? data : JSON.stringify(data), { status: 200, headers: { 'content-type': type } });
    if (url.hostname === 'api.stripe.com') {
      const handler = Object.entries(stripe).find(([k]) => url.pathname.startsWith(`/v1/${k}`));
      if (!handler) return new Response(JSON.stringify({ error: { message: 'not mocked' } }), { status: 400 });
      const [status, data] = handler[1](url, init);
      return new Response(JSON.stringify(data), { status });
    }
    if (url.hostname === 'demo.myshopify.com') {
      if (url.pathname === '/products.json') return ok({ products: url.searchParams.get('page') === '1' ? rawProducts : [] });
      if (url.pathname === '/meta.json') return ok({ name: 'Demo Shop', currency: 'EUR' });
      if (url.pathname === '/collections.json') return ok({ collections: [{ title: 'Lampes', handle: 'lampes' }] });
      if (url.pathname === '/') return ok(homeHtml, 'text/html');
      if (url.pathname === '/collections/all') return ok(bestHtml, 'text/html');
      if (url.pathname.startsWith('/policies/')) return ok('policy', 'text/html');
      return new Response('nope', { status: 404 });
    }
    return new Response('not shopify', { status: 404, headers: { 'content-type': 'text/html' } });
  };
  return calls;
}
