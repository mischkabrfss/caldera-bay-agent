// Faux Shopify local pour tester l'app sans réseau : node test/mock-shop.mjs (port 8790).
import { createServer } from 'node:http';
import { catalog, homeHtml, imageSvg, isRich } from '../public/demo.js';

const PORT = 8790;
const BASE = `http://127.0.0.1:${PORT}`;

const toShopify = (p) => ({
  id: p.id, title: p.title, handle: p.handle, body_html: p.body, vendor: p.vendor, product_type: p.type, tags: p.tags,
  created_at: p.createdAt, published_at: p.publishedAt, images: p.images, options: p.options.map((name) => ({ name })),
  variants: p.variants.map((v) => ({ price: String(v.price), compare_at_price: v.compareAt ? String(v.compareAt) : null, available: v.available })),
});

createServer((req, res) => {
  const url = new URL(req.url, BASE);
  const [, host, ...rest] = url.pathname.split('/');
  const path = `/${rest.join('/')}`;
  const send = (code, body, type = 'application/json') => { res.writeHead(code, { 'content-type': type }); res.end(typeof body === 'string' ? body : JSON.stringify(body)); };
  if (host === 'img') return send(200, imageSvg(decodeURIComponent(rest.join('/'))), 'image/svg+xml');
  if (host.startsWith('pas-shopify')) return send(404, 'Not found', 'text/html');
  const products = catalog(host, (name) => `${BASE}/img/${encodeURIComponent(name)}`);
  const rich = isRich(host);
  if (path === '/products.json') return send(200, { products: url.searchParams.get('page') === '1' ? products.map(toShopify) : [] });
  if (path === '/meta.json') return send(200, { name: host.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), currency: 'EUR' });
  if (path === '/collections.json') return send(200, { collections: [{ title: 'Nouveautés', handle: 'new' }, { title: 'Best-sellers', handle: 'best' }] });
  if (path === '/collections/all') return send(200, products.map((p) => `<a href="/products/${p.handle}">x</a>`).reverse().join(''), 'text/html');
  if (path === '/') return send(200, homeHtml(host), 'text/html');
  if (path.startsWith('/policies/')) return rich || path.includes('privacy') ? send(200, 'ok', 'text/html') : send(404, 'no', 'text/html');
  if (path === '/pages/contact' || path === '/sitemap.xml') return rich ? send(200, 'ok', 'text/html') : send(404, 'no', 'text/html');
  send(404, 'no', 'text/html');
}).listen(PORT, '127.0.0.1', () => console.log(`Faux Shopify sur ${BASE}`));
