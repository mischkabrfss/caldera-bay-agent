// Faux Shopify local pour tester l'app sans réseau : node test/mock-shop.mjs (port 8790).
import { createServer } from 'node:http';

const PORT = 8790;
const BASE = `http://127.0.0.1:${PORT}`;
const NAMES = ['Lampe coucher de soleil', 'Gourde isotherme inox', 'Coque magnétique iPhone', 'Masseur cervical chauffant', 'Tapis de yoga antidérapant', 'Brosse nettoyante visage', 'Collier prénom personnalisé', 'Harnais anti-traction chien', 'Mini projecteur galaxie', 'Organisateur de voiture', 'Sweat oversize brodé', 'Bague ajustable acier', 'Diffuseur huiles essentielles', 'Poêle céramique 28 cm', 'Couverture lestée', 'Lunettes anti-lumière bleue', 'Montre connectée sport', 'Legging gainant sculptant', 'Pistolet de massage', 'Veilleuse nuage enfant'];
const COLORS = ['#00f5a0', '#8b5cff', '#ff4fd8', '#ffd166', '#00c2ff', '#ff5c7a'];

function seeded(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) / 4294967296);
}

function catalog(host) {
  const rnd = seeded(host);
  const count = 8 + Math.floor(rnd() * 14);
  return Array.from({ length: count }, (_, i) => {
    const name = NAMES[Math.floor(rnd() * NAMES.length)];
    const good = rnd() > 0.45;
    const price = [9.9, 19.99, 24.9, 29.99, 34.99, 49.9, 59, 79.99][Math.floor(rnd() * 8)];
    const compare = rnd() > 0.5 ? Math.round(price * (1.3 + rnd() * 0.5)) + 0.99 : null;
    const images = Array.from({ length: good ? 4 + Math.floor(rnd() * 4) : 1 + Math.floor(rnd() * 2) }, (_, k) => ({ src: `${BASE}/img/${encodeURIComponent(host)}-${i}-${k}.svg`, alt: good ? name : '' }));
    return {
      id: 1000 + i, title: good ? `${name} – édition premium` : name.toUpperCase(), handle: `produit-${i}`,
      body_html: good ? `<p>${'Un produit pensé pour ton confort au quotidien. '.repeat(25)}</p><ul><li>Qualité premium</li><li>Livraison rapide</li></ul>` : '<p>Super produit.</p>',
      vendor: host, product_type: good ? 'Accessoire' : '', tags: good ? ['tendance', 'cadeau', 'best'] : [],
      created_at: new Date(Date.now() - Math.floor(rnd() * 200) * 86_400_000).toISOString(),
      images, options: [{ name: 'Couleur' }],
      variants: Array.from({ length: 1 + Math.floor(rnd() * 3) }, () => ({ price: String(price), compare_at_price: compare ? String(compare) : null, available: rnd() > 0.12 })),
    };
  });
}

function img(name) {
  const rnd = seeded(name);
  const a = COLORS[Math.floor(rnd() * COLORS.length)];
  const b = COLORS[Math.floor(rnd() * COLORS.length)];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="400" fill="#15122a"/><circle cx="200" cy="190" r="${90 + rnd() * 50}" fill="url(#g)" opacity=".85"/><rect x="120" y="300" width="160" height="18" rx="9" fill="#fff" opacity=".2"/></svg>`;
}

createServer((req, res) => {
  const url = new URL(req.url, BASE);
  const [, host, ...rest] = url.pathname.split('/');
  const path = `/${rest.join('/')}`;
  const send = (code, body, type = 'application/json') => { res.writeHead(code, { 'content-type': type }); res.end(typeof body === 'string' ? body : JSON.stringify(body)); };
  if (host === 'img') return send(200, img(rest.join('/')), 'image/svg+xml');
  if (host.startsWith('pas-shopify')) return send(404, 'Not found', 'text/html');
  const products = catalog(host);
  const rich = seeded(host)() > 0.5;
  if (path === '/products.json') return send(200, { products: url.searchParams.get('page') === '1' ? products : [] });
  if (path === '/meta.json') return send(200, { name: host.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), currency: 'EUR' });
  if (path === '/collections.json') return send(200, { collections: [{ title: 'Nouveautés', handle: 'new' }, { title: 'Best-sellers', handle: 'best' }] });
  if (path === '/collections/all') return send(200, [...products].sort(() => 0.5 - Math.random()).map((p) => `<a href="/products/${p.handle}">x</a>`).join(''), 'text/html');
  if (path === '/') return send(200, `<html><head><title>${rich ? `${host} – La boutique tendance livrée en 48h` : host}</title>${rich ? '<meta name="description" content="Découvre nos best-sellers livrés en 48h. Paiement sécurisé, satisfait ou remboursé 30 jours. Rejoins des milliers de clients.">' : ''}<script>Shopify.theme = {"name":"${rich ? 'Dawn' : 'Debut'}","id":1};</script>${rich ? '<script src="https://connect.facebook.net/en_US/fbevents.js"></script><div class="jdgm-widget"></div>' : ''}</head><body><h1>Bienvenue</h1><p>${rich ? 'Livraison gratuite dès 49€ · Paiement sécurisé' : ''}</p></body></html>`, 'text/html');
  if (path.startsWith('/policies/')) return rich || path.includes('privacy') ? send(200, 'ok', 'text/html') : send(404, 'no', 'text/html');
  if (path === '/pages/contact' || path === '/sitemap.xml') return rich ? send(200, 'ok', 'text/html') : send(404, 'no', 'text/html');
  send(404, 'no', 'text/html');
}).listen(PORT, '127.0.0.1', () => console.log(`Faux Shopify sur ${BASE}`));
