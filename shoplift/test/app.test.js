import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { analyzeProduct, auditStore, compareStores, radarFrom, spyStore } from '../public/analyze.js';
import { sign, verify } from '../src/auth.js';
import { can } from '../public/plans.js';
import { bestsellerHandles, fetchProducts, normalizeStore } from '../src/shopify.js';
import worker from '../src/worker.js';
import { fakeStore, installFetch } from './fixtures.js';

const env = (extra = {}) => ({ ASSETS: { fetch: () => new Response('asset') }, ...extra });
const call = (path, { method = 'GET', body, cookie, e = env() } = {}) =>
  worker.fetch(new Request(`https://app.test${path}`, { method, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined }), e);
const cookiesOf = (res) => res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');

let products;
beforeEach(async () => {
  installFetch();
  products = await fetchProducts('demo.myshopify.com');
});

test('normalise les adresses de boutique et bloque les hôtes dangereux', () => {
  assert.equal(normalizeStore('https://www.Demo.com/collections/x?y=1'), 'www.demo.com');
  assert.equal(normalizeStore('maboutique'), 'maboutique.myshopify.com');
  assert.equal(normalizeStore('shop.fr:443/'), 'shop.fr');
  for (const bad of ['', '127.0.0.1', 'a b.com', 'x.internal', 'shop.local']) assert.throws(() => normalizeStore(bad));
});

test('extrait les best-sellers dans l’ordre', () => {
  assert.deepEqual(bestsellerHandles('<a href="/products/a"><a href="/products/b"><a href="/products/a">'), ['a', 'b']);
});

test('note un bon produit fort et un mauvais produit faible, avec explications', () => {
  const good = analyzeProduct(products[0], { rank: 0 });
  const bad = analyzeProduct(products[1]);
  assert.equal(good.verdict, 'Produit fort');
  assert.ok(good.score > 80 && good.pros.length >= 4);
  assert.equal(bad.verdict, 'Faible');
  assert.ok(bad.cons.every((c) => c.t && c.why && c.fix));
  assert.ok(bad.cons.some((c) => c.t === 'En rupture de stock'));
  assert.equal(good.discount, 40);
});

test('audit boutique : score, catégories, corrections triées par impact', () => {
  const report = auditStore({ ...fakeStore(), products });
  assert.ok(report.score > 0 && report.score <= 100);
  assert.equal(report.categories.length, 6);
  assert.equal(report.theme, 'Dawn');
  assert.ok(report.stack.includes('metaPixel') && report.stack.includes('reviews'));
  const order = { élevé: 3, moyen: 2, faible: 1 };
  report.fixes.reduce((prev, f) => (assert.ok(order[f.impact] <= prev), order[f.impact]), 3);
  assert.ok(report.fixes.some((f) => f.title === 'Page contact'));
  assert.equal(report.products[0].title, 'MUG'); // pires fiches en premier
});

test('espion, radar et comparateur', () => {
  const store = { ...fakeStore(), products };
  const spy = spyStore(store);
  assert.equal(spy.bestsellers[0].handle, 'lampe-sunset');
  assert.equal(spy.stats.launches30, 1);
  const radar = radarFrom([store]);
  assert.equal(radar[0].title, products[0].title);
  assert.ok(radar[0].reasons.includes('Top 1 des ventes'));
  assert.equal(compareStores([store, store]).length, 2);
});

test('radar : ni cartes cadeaux ni assurances, 4 par boutique puis complété si la niche est étroite', () => {
  const store = { ...fakeStore(), products: [] };
  const p = (title, i) => ({ ...products[0], id: i, handle: `h${i}`, title });
  const junk = { ...store, products: [p('Gift Card', 1), p('Shipping Protection', 2), p('E-Gift Card', 3)] };
  assert.equal(radarFrom([junk]).length, 0);
  const big = { ...store, products: Array.from({ length: 10 }, (_, i) => p(`Lampe ${i}`, i)) };
  assert.equal(radarFrom([big], { limit: 4 }).length, 4);
  assert.equal(radarFrom([big]).length, 10); // pas d'autre boutique : la liste est complétée
});

test('radar : seulement des produits génériques demandés, variantes regroupées, demande multi-boutiques', async () => {
  const { kindOf } = await import('../public/seeds.js');
  const p = (title, i, host) => ({ ...products[0], id: i, handle: `h${i}`, title });
  const a = { ...fakeStore(), host: 'a.com', products: [p('No Pull Dog Harness - Red', 1), p('No Pull Dog Harness - Blue', 2), p('Forks Up, Sunnies On', 3)] };
  const b = { ...fakeStore(), host: 'b.com', products: [p('Easy Walk Harness', 4)] };
  const items = radarFrom([a, b], { kind: (x) => kindOf('animaux', x) });
  assert.equal(items.length, 2); // variante bleue regroupée, produit sans type écarté
  assert.ok(items.every((i) => i.kind === 'Harnais' && i.sellers === 2 && i.reasons[0] === 'Vendu par 2 boutiques'));
  assert.equal(kindOf('animaux', { title: 'Breakaway Cat Collar', type: 'Harness' }), 'Collier'); // le titre prime
});

test('jetons signés : infalsifiables et expirables', async () => {
  const token = await sign({ plan: 'pro', exp: Date.now() + 1000 }, 's1');
  assert.equal((await verify(token, 's1')).plan, 'pro');
  assert.equal(await verify(token, 's2'), null);
  const [b, s] = token.split('.');
  assert.equal(await verify(`${b.slice(0, -2)}xx.${s}`, 's1'), null);
  assert.equal(await verify(await sign({ plan: 'pro', exp: Date.now() - 1 }, 's1'), 's1'), null);
});

test('droits par offre', () => {
  assert.ok(!can('test', 'fullAudit') && can('basic', 'fullAudit'));
  assert.ok(!can('basic', 'spy') && can('pro', 'radar'));
  assert.ok(!can('pro', 'compare') && can('scale', 'compare'));
});

test('API : 1 analyse gratuite, résultats verrouillés, puis blocage', async () => {
  const res = await call('/api/audit', { method: 'POST', body: { store: 'demo' } });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.plan, 'test');
  assert.equal(data.trialLeft, 0);
  assert.ok(data.report.fixes[3].locked && !data.report.fixes[3].why);
  assert.ok(data.report.products[2].pros && data.report.products[2].locked === undefined);
  const blocked = await call('/api/audit', { method: 'POST', body: { store: 'demo' }, cookie: cookiesOf(res) });
  assert.equal(blocked.status, 402);
  assert.match((await blocked.json()).error, /analyse gratuite est utilisée/);
});

test('API : boutique introuvable = message clair', async () => {
  const res = await call('/api/audit', { method: 'POST', body: { store: 'pas-shopify.com' } });
  assert.equal(res.status, 422);
  assert.match((await res.json()).error, /Shopify/);
});

test('API : comparateur réservé à Scale, radar verrouillé en test', async () => {
  assert.equal((await call('/api/compare', { method: 'POST', body: { stores: ['a.com', 'b.com'] } })).status, 403);
  const radar = await (await call('/api/radar?niche=mode')).json();
  assert.equal(radar.locked, true);
});

test('API : paiement Stripe → activation → accès Pro → portail', async () => {
  const sub = { id: 'sub_1', status: 'active', customer: 'cus_1', metadata: { plan: 'pro' } };
  const calls = installFetch({
    stripe: {
      'checkout/sessions/cs_ok': () => [200, { status: 'complete', subscription: sub, customer_details: { email: 'a@b.fr' } }],
      'checkout/sessions': () => [200, { url: 'https://checkout.stripe.com/c/pay/cs_ok' }],
      'billing_portal/sessions': () => [200, { url: 'https://billing.stripe.com/p/1' }],
    },
  });
  const e = env({ STRIPE_SECRET_KEY: 'sk_test_x' });
  const checkout = await call('/api/checkout', { method: 'POST', body: { plan: 'pro' }, e });
  assert.equal((await checkout.json()).url, 'https://checkout.stripe.com/c/pay/cs_ok');
  const sent = new URLSearchParams(calls.find((c) => c.method === 'POST').body);
  assert.equal(sent.get('mode'), 'subscription');
  assert.equal(sent.get('line_items[0][price_data][unit_amount]'), '4900');
  assert.equal(sent.get('line_items[0][price_data][recurring][interval]'), 'month');
  assert.equal(sent.get('subscription_data[metadata][plan]'), 'pro');

  const activate = await call('/api/activate?session_id=cs_ok', { e });
  assert.equal(activate.status, 302);
  assert.match(activate.headers.get('Location'), /bienvenue=pro/);
  const cookie = cookiesOf(activate);
  assert.equal((await (await call('/api/me', { cookie, e })).json()).plan, 'pro');
  const radar = await (await call('/api/radar?niche=mode', { cookie, e })).json();
  assert.equal(radar.locked, false);
  assert.equal((await (await call('/api/portal', { method: 'POST', cookie, e })).json()).url, 'https://billing.stripe.com/p/1');
  assert.equal((await call('/api/compare', { method: 'POST', body: { stores: ['a.com', 'b.com'] }, cookie, e })).status, 403);
});

test('API : abonnement annulé = retour au plan test', async () => {
  installFetch({ stripe: { 'subscriptions/sub_1': () => [200, { id: 'sub_1', status: 'canceled', customer: 'cus_1', metadata: { plan: 'pro' } }] } });
  const e = env({ STRIPE_SECRET_KEY: 'sk_test_x' });
  const old = await sign({ plan: 'pro', sub: 'sub_1', cus: 'cus_1', chk: Date.now() - 13 * 3_600_000, exp: Date.now() + 1e9 }, 'sk_test_x');
  const me = await (await call('/api/me', { cookie: `pr_session=${old}`, e })).json();
  assert.equal(me.plan, 'test');
  assert.equal(me.expired, true);
});

test('API : cookie forgé refusé, checkout sans Stripe = 503, dev-login désactivé', async () => {
  const fake = await sign({ plan: 'scale', chk: Date.now(), exp: Date.now() + 1e9 }, 'mauvaise-cle');
  const e = env({ STRIPE_SECRET_KEY: 'sk_test_x' });
  assert.equal((await (await call('/api/me', { cookie: `pr_session=${fake}`, e })).json()).plan, 'test');
  assert.equal((await call('/api/checkout', { method: 'POST', body: { plan: 'pro' } })).status, 503);
  assert.equal((await call('/api/dev-login?plan=scale')).status, 404);
});

test('API : récupération d’accès par e-mail + 4 derniers chiffres', async () => {
  installFetch({
    stripe: {
      customers: () => [200, { data: [{ id: 'cus_1' }] }],
      subscriptions: () => [200, { data: [{ id: 'sub_1', status: 'active', customer: 'cus_1', metadata: { plan: 'scale' }, default_payment_method: { card: { last4: '4242' } } }] }],
    },
  });
  const e = env({ STRIPE_SECRET_KEY: 'sk_test_x' });
  assert.equal((await call('/api/restore', { method: 'POST', body: { email: 'a@b.fr', last4: '1111' }, e })).status, 404);
  const ok = await call('/api/restore', { method: 'POST', body: { email: 'a@b.fr', last4: '4242' }, e });
  assert.equal((await ok.json()).plan, 'scale');
});

test('API : un abonné qui change d’offre garde le même abonnement (prorata)', async () => {
  const calls = installFetch({
    stripe: {
      'subscriptions/sub_1': (url, init) => [200, init.method === 'POST'
        ? { id: 'sub_1', status: 'active', customer: 'cus_1', metadata: { plan: 'scale' } }
        : { id: 'sub_1', status: 'active', customer: 'cus_1', metadata: { plan: 'pro' }, items: { data: [{ id: 'si_1', price: { product: 'prod_1' } }] } }],
      'products/prod_1': () => [200, { id: 'prod_1' }],
    },
  });
  const e = env({ STRIPE_SECRET_KEY: 'sk_test_x' });
  const token = await sign({ plan: 'pro', sub: 'sub_1', cus: 'cus_1', email: 'a@b.fr', chk: Date.now(), exp: Date.now() + 1e9 }, 'sk_test_x');
  const res = await call('/api/checkout', { method: 'POST', body: { plan: 'scale' }, cookie: `pr_session=${token}`, e });
  assert.deepEqual(await res.json(), { changed: true, plan: 'scale' });
  const update = new URLSearchParams(calls.find((c) => c.method === 'POST' && c.url.includes('subscriptions/sub_1')).body);
  assert.equal(update.get('items[0][id]'), 'si_1');
  assert.equal(update.get('items[0][price_data][unit_amount]'), '9900');
  assert.equal(update.get('proration_behavior'), 'always_invoice');
  assert.equal(calls.filter((c) => c.url.includes('checkout/sessions')).length, 0);
  assert.equal((await (await call('/api/me', { cookie: cookiesOf(res), e })).json()).plan, 'scale');
});

test('API : accès récupéré = pas de facturation, pas de changement d’offre, tentatives limitées', async () => {
  installFetch({
    stripe: {
      customers: () => [200, { data: [{ id: 'cus_1' }] }],
      subscriptions: () => [200, { data: [{ id: 'sub_1', status: 'active', customer: 'cus_1', metadata: { plan: 'pro' }, default_payment_method: { card: { last4: '4242' } } }] }],
    },
  });
  const e = env({ STRIPE_SECRET_KEY: 'sk_test_x', PORTAL_LOGIN_URL: 'https://billing.stripe.com/p/login/x' });
  const ok = await call('/api/restore', { method: 'POST', body: { email: 'r@b.fr', last4: '4242' }, e });
  const cookie = cookiesOf(ok);
  const me = await (await call('/api/me', { cookie, e })).json();
  assert.equal(me.plan, 'pro');
  assert.equal(me.portal, false);
  assert.equal(me.portalLogin, 'https://billing.stripe.com/p/login/x');
  assert.equal((await call('/api/portal', { method: 'POST', cookie, e })).status, 400);
  assert.equal((await call('/api/checkout', { method: 'POST', body: { plan: 'scale' }, cookie, e })).status, 403);
});

test('API : limiteur de tentatives', async () => {
  const store = new Map();
  globalThis.caches = { default: {
    match: async (r) => (store.has(r.url) ? new Response(store.get(r.url)) : undefined),
    put: async (r, res) => store.set(r.url, await res.text()),
  } };
  installFetch({ stripe: { customers: () => [200, { data: [] }] } });
  const e = env({ STRIPE_SECRET_KEY: 'sk_test_x' });
  const codes = [];
  for (let i = 0; i < 6; i++) codes.push((await call('/api/restore', { method: 'POST', body: { email: 'x@y.fr', last4: String(1000 + i) }, e })).status);
  delete globalThis.caches;
  assert.deepEqual(codes, [404, 404, 404, 404, 404, 429]);
});

test('Shopify : 2e tentative automatique si la boutique renvoie une erreur', async () => {
  let calls = 0;
  globalThis.fetch = async () => (++calls === 1 ? new Response('busy', { status: 503 }) : new Response(JSON.stringify({ products: [] }), { headers: { 'content-type': 'application/json' } }));
  assert.deepEqual(await fetchProducts('x.myshopify.com', 1), []);
  assert.equal(calls, 2);
});

test('Radar : tâche planifiée (une boutique / 7 min dans KV), lecture KV puis repli sur le relevé figé', async () => {
  installFetch();
  const kv = new Map();
  const DATA = { get: async (k, type) => (kv.has(k) ? (type === 'json' ? JSON.parse(kv.get(k)) : kv.get(k)) : null), put: async (k, v) => { kv.set(k, v); } };
  // Sans KV rempli : vrais produits du dernier relevé figé
  const before = await (await call('/api/radar?niche=mode', { e: env({ DATA, APP_SECRET: 'test-secret' }) })).json();
  assert.ok(before.items.length > 0 && before.updatedAt === null && before.items[0].snapshot);
  // Une boutique de la niche déjà relue, la boutique du tour est injoignable : la niche est quand même recomposée
  const titles = ['Legging sculptant', 'Robe midi satin', 'Sweat oversize', 'Jean droit', 'Brassière sport', 'Jupe plissée'];
  const extra = ['Legging taille haute', 'Robe longue fleurie', 'Sweat zippé', 'Jean large', 'Brassière dos nu', 'Jupe midi'];
  for (const [k, host] of ['edikted.com', 'us.princesspolly.com', 'showpo.com', 'honeylove.com'].entries()) {
    // la tâche publie la niche dès que la moitié de ses boutiques est relue (ici 4 sur 8, la boutique du tour étant injoignable)
    kv.set(`store:${host}`, JSON.stringify({ host, meta: { name: host, currency: 'USD' }, bestsellers: [], products: products.slice(0, 6).map((p, i) => ({ ...p, title: `${(k % 2 ? extra : titles)[i]} ${host}`, handle: `h${k}${i}` })) }));
  }
  const jobs = [];
  await worker.scheduled({ scheduledTime: 0 }, env({ DATA, APP_SECRET: 'test-secret' }), { waitUntil: (p) => jobs.push(p) });
  await Promise.all(jobs);
  const stored = JSON.parse(kv.get('radar:mode'));
  assert.ok(stored.items.length >= 12 && stored.items.every((x) => x.host !== 'fashionnova.com'));
  const res = await (await call('/api/radar?niche=mode', { e: env({ DATA, APP_SECRET: 'test-secret' }) })).json();
  assert.equal(res.updatedAt, stored.at);
});

test('Connexion Shopify : réponse Admin GraphQL → audit réel sans page d’accueil', async () => {
  const { toStore } = await import('../public/connect.js');
  const payload = { data: {
    shop: { name: 'Test', currencyCode: 'EUR', description: '', primaryDomain: { host: 't.myshopify.com' }, shopPolicies: [{ type: 'PRIVACY_POLICY' }] },
    products: { nodes: [{ id: 'p1', title: 'Canapé', handle: 'canape', descriptionHtml: '<p>Beau</p>', productType: '', tags: [], createdAt: new Date().toISOString(), seo: { title: null, description: null },
      media: { nodes: [{ alt: '', preview: { image: { url: 'https://cdn.shopify.com/a.png', altText: '' } } }] }, variants: { nodes: [{ price: '0.00', compareAtPrice: null, availableForSale: true }] } }] },
    collectionsCount: { count: 2 }, pages: { nodes: [{ handle: 'contact' }, { handle: 'livraison' }, { handle: 'retours' }] },
  } };
  const report = auditStore(toStore(payload));
  assert.equal(report.source, 'shopify');
  assert.ok(!report.categories.some((c) => c.id === 'marketing' || c.id === 'tech')); // non vérifiables sans page d'accueil
  assert.ok(report.fixes.some((f) => f.title === 'Conditions générales de vente'));
  assert.ok(!report.fixes.some((f) => f.title === 'Politique de livraison')); // page « livraison » reconnue
  assert.ok(report.products[0].cons.some((c) => c.t === 'Prix à 0 €'));
});

test('Adresse inexistante ≠ site qui n’est pas Shopify', async () => {
  globalThis.fetch = async () => { throw new TypeError('getaddrinfo ENOTFOUND'); };
  const r1 = await (await call('/api/audit', { method: 'POST', body: { store: 'nexistepas-xyz.com' } })).json();
  assert.equal(r1.code, 'not_found');
  installFetch();
  const r2 = await (await call('/api/audit', { method: 'POST', body: { store: 'autre-site.com' } })).json();
  assert.equal(r2.code, 'not_shopify');
});

test('API : l’espion (Pro) détecte les outils marketing de la page d’accueil', async () => {
  installFetch();
  const token = await sign({ plan: 'pro', dev: true, chk: Date.now(), exp: Date.now() + 1e9 }, 'shoplift-dev-only-secret');
  const res = await call('/api/spy', { method: 'POST', body: { store: 'demo' }, cookie: `pr_session=${token}` });
  const { report } = await res.json();
  assert.ok(report.stack.includes('Pixel Meta') && report.stack.includes('Avis clients'));
  assert.equal(report.level, 'full');
  assert.equal(report.locked, false);
  assert.ok(report.launches.length > 0 && report.insights.length > 0 && report.charts.priceBuckets.length === 6);
});

test('espion : ce que voit chaque offre', async () => {
  const { lockSpy } = await import('../public/plans.js');
  const report = spyStore({ ...fakeStore(), products });
  const test_ = lockSpy(report, 'test'); const basic = lockSpy(report, 'basic'); const pro = lockSpy(report, 'pro');
  assert.equal(test_.level, 'teaser'); assert.equal(test_.charts, null);
  assert.ok(test_.insights.slice(2).every((i) => i.locked) && test_.launches.slice(2).every((p) => p.locked) && !test_.launches[1].locked);
  assert.equal(basic.level, 'insights'); assert.ok(basic.charts && basic.insights.every((i) => !i.locked));
  assert.ok(basic.launches.slice(0, 3).every((p) => !p.locked));
  assert.equal(pro.level, 'full'); assert.ok(pro.launches.every((p) => !p.locked));
});

test('boutique connectée : produit à 0 € et produit non publié signalés', () => {
  const p = { ...products[0], url: '', variants: [{ price: 0, compareAt: 0, available: true }] };
  const report = auditStore({ ...fakeStore(), html: null, products: [p], admin: { description: '', seoCustom: 0, pages: 5 } });
  const titles = report.fixes.map((f) => f.title);
  assert.ok(titles.includes('Produits à 0 €'));
  assert.ok(titles.includes('Produits visibles sur la boutique en ligne'));
  assert.ok(!titles.includes('Panier moyen potentiel')); // pas de « prix moyen 0 € » absurde
});

test('fournisseurs : recherche propre et 7 liens valides', async () => {
  const { supplierQuery, supplierLinks } = await import('../public/suppliers.js');
  assert.equal(supplierQuery({ title: 'Zee.Dog | Leash Hanger', store: 'Zee.Dog' }), 'leash hanger');
  assert.equal(supplierQuery({ title: 'Office Beauty Of The Week Collar Midi Dress - Heather Grey', store: 'Fashion Nova' }), 'collar midi dress');
  const links = supplierLinks({ title: 'Easy Fit Harness', store: 'Wild One', type: 'Harness' });
  assert.equal(links.length, 7);
  for (const l of links) { assert.ok(new URL(l.url).protocol === 'https:'); assert.ok(l.app.startsWith('https://apps.shopify.com/')); }
  assert.ok(links[0].url.includes('easy-fit-harness'));
});

test('radar : 2e photo et type transmis, heure du relevé renvoyée', async () => {
  const store = { ...fakeStore(), products };
  const item = radarFrom([store])[0];
  assert.ok('image2' in item && 'type' in item);
  const res = await call('/api/radar?niche=mode');
  const data = await res.json();
  assert.ok('updatedAt' in data);
});

test('connexion : mot de passe stocké haché chez Stripe, login sur un autre appareil, erreurs claires', async () => {
  const e = env({ STRIPE_SECRET_KEY: 'sk_test_x' });
  let saved = '';
  installFetch({ stripe: {
    'customers/cus_1': (url, init) => { saved = decodeURIComponent(new URLSearchParams(init.body).get('metadata[sl_pw]')); return [200, { id: 'cus_1' }]; },
    customers: () => [200, { data: [{ id: 'cus_1', email: 'ana@shop.fr', metadata: { sl_pw: saved } }] }],
    subscriptions: () => [200, { data: [{ id: 'sub_1', status: 'active', customer: 'cus_1', metadata: { plan: 'pro' } }] }],
  } });
  // 1) client payant sur l'appareil du paiement : il choisit son mot de passe
  const token = await sign({ plan: 'pro', sub: 'sub_1', cus: 'cus_1', email: 'ana@shop.fr', chk: Date.now(), exp: Date.now() + 1e9 }, 'sk_test_x');
  let res = await call('/api/password', { method: 'POST', body: { password: 'court' }, cookie: `pr_session=${token}`, e });
  assert.equal(res.status, 400);
  res = await call('/api/password', { method: 'POST', body: { password: 'MonMotDePasse!2026' }, cookie: `pr_session=${token}`, e });
  assert.equal(res.status, 200);
  assert.ok(saved.startsWith('v2$10000$') && !saved.includes('MonMotDePasse'));
  // 2) autre appareil : connexion
  res = await call('/api/login', { method: 'POST', body: { email: 'ana@shop.fr', password: 'mauvais-mot' }, e });
  assert.equal(res.status, 401);
  res = await call('/api/login', { method: 'POST', body: { email: 'ana@shop.fr', password: 'MonMotDePasse!2026' }, e });
  assert.equal(res.status, 200);
  const me = await (await call('/api/me', { cookie: cookiesOf(res), e })).json();
  assert.equal(me.plan, 'pro'); assert.equal(me.pw, true); assert.equal(me.portal, true);
});

test('agents de sourcing : 0 / 1 / 3 / 10 selon l’offre, coordonnées masquées sinon, fichier brut bloqué', async () => {
  const { agentsFor, AGENTS } = await import('../public/agents.js');
  const open = (plan) => agentsFor(plan).filter((a) => a.open).length;
  assert.deepEqual(['test', 'basic', 'pro', 'scale'].map(open), [0, 1, 3, 10]);
  const locked = agentsFor('basic')[1];
  assert.ok(!locked.open && locked.whatsapp.includes('•') && !locked.site && !locked.app && locked.unlock === 'pro');
  assert.equal(AGENTS.length, 10);
  for (const a of AGENTS) {
    assert.ok(/^[\w.+-]+@[\w-]+\.[a-z.]+$/.test(a.email) && a.app.startsWith('https://apps.shopify.com/') && a.source);
    for (const n of [a.whatsapp, a.whatsapp2, a.phone].filter(Boolean)) assert.ok(/^\+\d[\d ]{7,17}\d$/.test(n), n);
  }
  const res = await call('/agents.js');
  assert.equal(res.status, 404);
});

test('charge : 300 analyses simultanées de la même boutique → un seul chargement Shopify', async () => {
  const store = new Map();
  const tick = () => new Promise((r) => setTimeout(r, 1));
  globalThis.caches = { default: {
    match: async (r) => { await tick(); return store.has(r.url) ? new Response(store.get(r.url)) : undefined; },
    put: async (r, res) => { await tick(); store.set(r.url, await res.text()); },
    delete: async (r) => { await tick(); store.delete(r.url); },
  } };
  installFetch();
  const real = globalThis.fetch; let shop = 0;
  globalThis.fetch = async (input, init) => { if (String(input instanceof Request ? input.url : input).includes('demo.myshopify.com')) shop++; await new Promise((r) => setTimeout(r, 20)); return real(input, init); };
  const one = (i) => worker.fetch(new Request('https://app.test/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': `10.0.${i >> 8}.${i & 255}` }, body: JSON.stringify({ store: 'demo.myshopify.com' }) }), env());
  const { fetchStoreFull } = await import('../src/shopify.js');
  await fetchStoreFull('demo.myshopify.com'); // nombre d'appels d'un chargement unique
  const single = shop; shop = 0;
  const codes = (await Promise.all([...Array(300)].map((_, i) => one(i)))).map((r) => r.status);
  delete globalThis.caches;
  assert.ok(codes.every((c) => c === 200), JSON.stringify(codes.filter((c) => c !== 200)));
  assert.equal(shop, single);
});

test('mot de passe : ancien format v1 toujours accepté, v2 lié au secret du serveur', async () => {
  const { checkPassword, hashPassword } = await import('../src/stripe.js');
  const te = new TextEncoder(); const salt = new Uint8Array(16);
  const key = await crypto.subtle.importKey('raw', te.encode('Ancien2024!'), 'PBKDF2', false, ['deriveBits']);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256));
  const v1 = `v1$100000$${btoa(String.fromCharCode(...salt))}$${btoa(String.fromCharCode(...bits))}`;
  assert.equal(await checkPassword('Ancien2024!', v1, 's'), true);
  assert.equal(await checkPassword('autre', v1, 's'), false);
  const v2 = await hashPassword('Nouveau2026!', 'secret-a');
  assert.equal(await checkPassword('Nouveau2026!', v2, 'secret-a'), true);
  assert.equal(await checkPassword('Nouveau2026!', v2, 'secret-b'), false);
});

test('secret du serveur : généré une fois et gardé dans KV si APP_SECRET est absent', async () => {
  const { loadSecret, secretOf } = await import('../src/auth.js');
  const kv = new Map(); const DATA = { get: async (k) => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); } };
  assert.equal(secretOf({ APP_SECRET: 'fixe', DATA }), 'fixe');
  await loadSecret({ DATA });
  assert.ok(kv.get('app-secret')?.length >= 40 && secretOf({ STRIPE_SECRET_KEY: 'sk' }) === kv.get('app-secret'));
});
