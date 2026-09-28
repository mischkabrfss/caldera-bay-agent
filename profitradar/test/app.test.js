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

test('API : test gratuit limité à 3 analyses, résultats verrouillés', async () => {
  let cookie = '';
  for (let i = 0; i < 3; i++) {
    const res = await call('/api/audit', { method: 'POST', body: { store: 'demo' }, cookie });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.plan, 'test');
    assert.equal(data.trialLeft, 2 - i);
    assert.ok(data.report.fixes[3].locked && !data.report.fixes[3].why);
    assert.ok(data.report.products[2].pros && data.report.products[2].locked === undefined);
    cookie = cookiesOf(res) || cookie;
  }
  const blocked = await call('/api/audit', { method: 'POST', body: { store: 'demo' }, cookie });
  assert.equal(blocked.status, 402);
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

test('Radar : tâche quotidienne sans erreur', async () => {
  installFetch();
  const jobs = [];
  await worker.scheduled({}, env(), { waitUntil: (p) => jobs.push(p) });
  const results = await Promise.all(jobs);
  assert.ok(results.length === 1 && results[0].every((r) => r.status === 'fulfilled'));
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
