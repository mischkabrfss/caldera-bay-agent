import { auditStore, compareStores, radarFrom, spyStore } from '../public/analyze.js';
import { cookie, loadSecret, readCookie, secretOf, sign, verify } from './auth.js';
import { can, lockAudit, lockItems, lockSpy, PLANS, TEST_LIMITS } from '../public/plans.js';
import { kindOf, NICHES, SPY_EXAMPLES } from '../public/seeds.js';
import { agentsFor, AGENTS_CHECKED } from '../public/agents.js';
import { SNAPSHOT, SNAPSHOT_DATE } from '../public/radar-snapshot.js';
import { fetchStoreFull, fetchStoreLite, normalizeStore, StoreError } from './shopify.js';
import { accessFromCheckout, accessFromEmail, accessFromLogin, changePlan, createCheckout, portalUrl, refreshAccess, setPassword } from './stripe.js';

const MONTH = 30 * 86_400_000;
const RECHECK = 12 * 3_600_000;
const SESSION = 'pr_session';
const TRIAL = 'pr_trial';

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });

class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

// Cache tenu sous forte charge (sans promesse partagée entre requêtes, interdit par Cloudflare) :
// - verrou en cache : une seule requête calcule une clé, les autres relisent le cache jusqu'à ce que le résultat arrive ;
// - « stale-while-revalidate » : passé `ttl`, l'ancien résultat est servi tout de suite pendant qu'un seul
//   rafraîchissement tourne en arrière-plan (personne n'attend, Shopify n'est pas inondé) ;
// - au plus 4 catalogues chargés en même temps par instance (128 Mo de mémoire) : les autres patientent.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let running = 0;
// Mémoire locale de l'instance (50 résultats) : le cache Cloudflare n'agit pas sur les adresses *.workers.dev gratuites,
// cette mémoire garde donc les résultats récents même sans nom de domaine. Valeurs simples, jamais de promesse partagée.
const memo = new Map();
function remember(key, entry, life) {
  memo.delete(key); memo.set(key, { ...entry, exp: Date.now() + life * 1000 });
  if (memo.size > 50) memo.delete(memo.keys().next().value);
}
const computing = new Set(); // clés en cours de calcul dans cette instance (simple texte, pas de promesse partagée)
async function heavy(fn) {
  for (let i = 0; running >= 4; i++) {
    if (i > 240) throw new HttpError(503, 'Forte affluence : réessaie dans quelques secondes.');
    await sleep(50);
  }
  running++;
  try { return await fn(); } finally { running--; }
}
async function cached(key, ttl, load, { overwrite = false, stale = 0, wait = null } = {}) {
  const cache = globalThis.caches?.default;
  if (!cache) return load();
  const request = new Request(`https://cache.shoplift.internal/v3/${key}`);
  const lock = new Request(`https://cache.shoplift.internal/v3-lock/${key}`);
  const read = async () => {
    const m = memo.get(key);
    if (m && m.exp > Date.now()) return m;
    const hit = await cache.match(request);
    if (!hit) return null;
    const entry = await hit.json();
    remember(key, entry, entry.e ? 120 : ttl + stale - (Date.now() - entry.at) / 1000);
    return entry;
  };
  // save() suppose la clé déjà réservée dans `computing` (réservation synchrone : aucune requête ne peut s'intercaler).
  const save = async () => {
    try {
      await cache.put(lock, new Response('1', { headers: { 'Cache-Control': 'max-age=20' } }));
      let value;
      try {
        value = await load();
      } catch (error) {
        // Boutique introuvable ou bloquée : réponse gardée 2 min pour ne pas relancer l'analyse à chaque requête.
        // Sauf le mot de passe : le marchand le retire puis clique « Réessayer » aussitôt.
        const keep = error instanceof StoreError && error.code !== 'password';
        if (keep) remember(key, { at: Date.now(), e: { message: error.message, code: error.code } }, 120);
        if (keep) await cache.put(request, new Response(JSON.stringify({ at: Date.now(), e: { message: error.message, code: error.code } }), { headers: { 'Cache-Control': 'max-age=120' } }));
        throw error;
      }
      const empty = (Array.isArray(value) && !value.length) || (Array.isArray(value?.items) && !value.items.length);
      if (!empty) remember(key, { at: Date.now(), v: value }, ttl + stale);
      if (!empty) await cache.put(request, new Response(JSON.stringify({ at: Date.now(), v: value }), { headers: { 'Cache-Control': `max-age=${ttl + stale}` } }));
      return value;
    } finally {
      computing.delete(key);
      await cache.delete(lock);
    }
  };
  const claim = () => !computing.has(key) && !!computing.add(key);
  if (overwrite) { computing.add(key); return save(); }
  const fail = (e) => { throw new StoreError(e.code, e.message); };
  let entry = await read();
  if (entry?.e) fail(entry.e);
  if (entry && Date.now() - entry.at < ttl * 1000) return entry.v;
  if (entry && stale && wait) {
    if (claim()) wait(save().catch(() => {}));
    return entry.v;
  }
  for (let i = 0, waited = 0; waited < 15_000; i++) {
    if (claim()) {
      if (!(await cache.match(lock))) return save();
      computing.delete(key); // une autre instance calcule déjà : on attend son résultat
    }
    const pause = Math.min(1200, 150 * 1.5 ** i) * (.75 + Math.random() * .5); // attente croissante, étalée
    waited += pause; await sleep(pause);
    entry = await read();
    if (entry?.e) fail(entry.e);
    if (entry && Date.now() - entry.at < (ttl + stale) * 1000) return entry.v;
  }
  throw new HttpError(503, 'Forte affluence : réessaie dans quelques secondes.');
}

// Limiteur simple (cache Cloudflare, 1 h) : suffisant contre le forçage des 4 chiffres.
async function allowAttempt(key, max) {
  const cache = globalThis.caches?.default;
  if (!cache) return true;
  const request = new Request(`https://cache.shoplift.internal/limit/${key}`);
  const hit = await cache.match(request);
  const count = hit ? Number(await hit.text()) : 0;
  if (count >= max) return false;
  await cache.put(request, new Response(String(count + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));
  return true;
}

async function body(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function issue(ctx, access) {
  const token = await sign({ ...access, chk: Date.now(), exp: Date.now() + MONTH }, ctx.secret);
  ctx.cookies.push(cookie(SESSION, token, MONTH / 1000));
}

async function getAccess(request, env, ctx) {
  const access = await verify(readCookie(request, SESSION), ctx.secret);
  if (!access) return { plan: 'test' };
  if (access.dev || !env.STRIPE_SECRET_KEY || Date.now() - access.chk < RECHECK) return access;
  try {
    let fresh = await refreshAccess(env, access);
    if (fresh && access.restored) fresh = { ...fresh, cid: fresh.cus, cus: undefined, restored: true };
    if (fresh) fresh.pw = access.pw;
    if (!fresh) {
      ctx.cookies.push(cookie(SESSION, '', 0));
      return { plan: 'test', expired: true };
    }
    await issue(ctx, fresh);
    return fresh;
  } catch {
    return access; // Stripe injoignable : on garde l'accès plutôt que de bloquer un client payant.
  }
}

async function consumeTrial(request, ctx) {
  const trial = (await verify(readCookie(request, TRIAL), ctx.secret)) || { n: 0 };
  if (trial.n >= TEST_LIMITS.audits) {
    throw new HttpError(402, `Ton analyse gratuite est utilisée. Choisis une offre pour continuer.`, { upgrade: 'basic' });
  }
  const next = { n: trial.n + 1, exp: Date.now() + MONTH };
  ctx.cookies.push(cookie(TRIAL, await sign(next, ctx.secret), MONTH / 1000));
  return TEST_LIMITS.audits - next.n;
}

// Radar, conçu pour l'offre gratuite de Cloudflare (10 ms de calcul par requête) :
// la tâche planifiée relit UNE boutique toutes les 7 minutes (46 boutiques → chacune toutes les ~5 h 20),
// garde sa version allégée dans KV (DATA), puis recompose la niche. Les visiteurs ne font qu'une lecture.
// Tant que KV est vide (juste après la mise en ligne), on sert les vrais produits figés du dernier relevé.
const RADAR_STORES = Object.entries(NICHES).flatMap(([niche, n]) => n.stores.map((host) => ({ niche, host })));
const TICK = 7 * 60_000;
const slimForRadar = (store, niche) => ({
  host: store.host, meta: { name: store.meta?.name, currency: store.meta?.currency }, bestsellers: (store.bestsellers || []).slice(0, 40),
  products: store.products.filter((p) => kindOf(niche, p)).slice(0, 60).map((p) => ({ title: p.title, type: p.type, handle: p.handle,
    images: p.images.slice(0, 6).map((i, k) => ({ src: k < 2 ? i.src : '' })), variants: p.variants.map((v) => ({ price: v.price, compareAt: v.compareAt, available: v.available })) })),
});
async function radarTick(env, when) {
  if (!env.DATA) return;
  const { niche, host } = RADAR_STORES[Math.floor(when / TICK) % RADAR_STORES.length];
  try {
    await env.DATA.put(`store:${host}`, JSON.stringify(slimForRadar(await fetchStoreLite(host), niche)));
  } catch (error) {
    console.error('radar', host, error?.message); // boutique momentanément injoignable : on garde sa dernière lecture
  }
  const stores = (await Promise.all(NICHES[niche].stores.map((h) => env.DATA.get(`store:${h}`, 'json')))).filter(Boolean);
  // Publié seulement quand la niche est assez couverte (juste après la mise en ligne, une seule boutique relue
  // donnerait 2 ou 3 produits) : d'ici là, les vrais produits du dernier relevé figé restent affichés.
  if (stores.length < Math.ceil(NICHES[niche].stores.length / 2)) return;
  const items = radarFrom(stores, { kind: (p) => kindOf(niche, p) });
  if (items.length >= 12) await env.DATA.put(`radar:${niche}`, JSON.stringify({ at: new Date(when).toISOString(), items }));
}
const snapshotRadar = (niche) => ({ at: null, items: (SNAPSHOT[niche] || []).map((i) => ({ ...i, snapshot: SNAPSHOT_DATE })) });
// Lecture KV mise en cache 10 min par centre de données (les lectures KV gratuites sont limitées à 100 000/jour).
const radar = (niche, env) => cached(`radar/${niche}`, 600, async () => (env.DATA && (await env.DATA.get(`radar:${niche}`, 'json'))) || snapshotRadar(niche));

// mode : 'full' (audit), 'spy' (catalogue + page d'accueil), 'lite' (catalogue seul)
async function loadStore(input, mode, wait) {
  const host = normalizeStore(input);
  const withHome = mode === 'spy';
  return cached(`${mode}/${host}`, 21600, () => heavy(() => fetchStoreLite(host, { withHome })), { stale: 86_400, wait });
}
// Rapports déjà calculés en cache (et non la boutique brute) : moins de CPU et de mémoire par visite.
const auditOf = (host) => cached(`audit/${host}`, 1800, () => heavy(async () => auditStore(await fetchStoreFull(host))));
const spyOf = (input, wait) => { const host = normalizeStore(input); return cached(`spy/${host}`, 21600, () => heavy(async () => spyStore(await fetchStoreLite(host, { withHome: true }))), { stale: 86_400, wait }); };

// Anti-abus par adresse IP sur les routes coûteuses (analyse, espion, comparateur, connexion).
// Utilise le limiteur intégré de Cloudflare (binding LIMITER) s'il est configuré, sinon un compteur en cache.
async function limitIp(request, env, kind, perHour = 120) {
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const ok = env.LIMITER ? (await env.LIMITER.limit({ key: `${kind}:${ip}` })).success : await allowAttempt(`ip/${kind}/${ip}`, perHour);
  if (!ok) throw new HttpError(429, 'Beaucoup de demandes d’un coup : réessaie dans une minute.');
}

async function route(request, env, ctx) {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method;
  const origin = env.PUBLIC_URL || url.origin;

  const config = () => ({ stripe: !!env.STRIPE_SECRET_KEY, plans: PLANS, niches: Object.fromEntries(Object.entries(NICHES).map(([k, v]) => [k, { label: v.label }])), spyExamples: SPY_EXAMPLES });
  if (pathname === '/api/config') return json(config());

  if (pathname === '/api/me') {
    const access = await getAccess(request, env, ctx);
    const trial = (await verify(readCookie(request, TRIAL), ctx.secret)) || { n: 0 };
    return json({ plan: access.plan, email: access.email || '', expired: !!access.expired, trialLeft: Math.max(0, TEST_LIMITS.audits - trial.n), portal: !!access.cus, pw: !!access.pw, canSetPw: !!(access.cus || access.cid), portalLogin: access.restored ? env.PORTAL_LOGIN_URL || '' : '', config: config() });
  }

  if (pathname === '/api/audit' && method === 'POST') {
    const { store } = await body(request);
    await limitIp(request, env, 'audit');
    const access = await getAccess(request, env, ctx);
    const host = normalizeStore(store);
    if (access.plan === 'test' && ((await verify(readCookie(request, TRIAL), ctx.secret))?.n || 0) >= TEST_LIMITS.audits) await consumeTrial(request, ctx); // essai épuisé : refus avant d'appeler Shopify
    const report = await auditOf(host);
    const trialLeft = access.plan === 'test' ? await consumeTrial(request, ctx) : null;
    return json({ plan: access.plan, trialLeft, report: can(access.plan, 'fullAudit') ? report : lockAudit(report) });
  }

  if (pathname === '/api/spy' && method === 'POST') {
    const { store } = await body(request);
    await limitIp(request, env, 'spy');
    const access = await getAccess(request, env, ctx);
    const report = lockSpy(await spyOf(store, ctx.wait), access.plan);
    return json({ plan: access.plan, report });
  }

  if (pathname === '/api/agents') {
    const access = await getAccess(request, env, ctx);
    return json({ plan: access.plan, checked: AGENTS_CHECKED, agents: agentsFor(access.plan) });
  }

  if (pathname === '/api/radar') {
    const niche = NICHES[url.searchParams.get('niche')] ? url.searchParams.get('niche') : 'mode';
    const access = await getAccess(request, env, ctx);
    const { at, items } = await radar(niche, env);
    const allowed = can(access.plan, 'radar');
    return json({ plan: access.plan, niche, updatedAt: at, locked: !allowed, items: allowed ? items : lockItems(items.slice(0, 12), TEST_LIMITS.radar) });
  }

  if (pathname === '/api/compare' && method === 'POST') {
    const access = await getAccess(request, env, ctx);
    if (!can(access.plan, 'compare')) throw new HttpError(403, 'Le comparateur multi-boutiques est inclus dans l’offre Scale.', { upgrade: 'scale' });
    const { stores } = await body(request);
    await limitIp(request, env, 'compare');
    const hosts = [...new Set((Array.isArray(stores) ? stores : []).filter(Boolean).map(normalizeStore))].slice(0, 4);
    if (hosts.length < 2) throw new HttpError(400, 'Entre au moins 2 boutiques à comparer.');
    const results = await Promise.allSettled(hosts.map((h) => loadStore(h, 'lite', ctx.wait)));
    const ok = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    const failed = hosts.filter((_, i) => results[i].status === 'rejected');
    return json({ rows: compareStores(ok), failed });
  }

  if (pathname === '/api/checkout' && method === 'POST') {
    const { plan, email } = await body(request);
    if (!PLANS[plan] || plan === 'test') throw new HttpError(400, 'Offre inconnue.');
    if (!env.STRIPE_SECRET_KEY) throw new HttpError(503, 'Le paiement sera ouvert très bientôt. Profite du test gratuit en attendant !');
    const access = await getAccess(request, env, ctx);
    if (access.sub) {
      if (access.restored) throw new HttpError(403, 'Pour changer d’offre depuis cet appareil, utilise « Gérer mon abonnement ».');
      if (access.plan === plan) throw new HttpError(400, 'Tu as déjà cette offre.');
      const changed = await changePlan(env, access, plan);
      if (!changed) throw new HttpError(402, 'Le paiement du changement d’offre a échoué. Mets à jour ta carte dans « Gérer mon abonnement ».');
      await issue(ctx, changed);
      return json({ changed: true, plan: changed.plan });
    }
    const session = await createCheckout(env, plan, origin, typeof email === 'string' && email.includes('@') ? email : '');
    return json({ url: session.url });
  }

  if (pathname === '/api/activate') {
    const sessionId = url.searchParams.get('session_id') || '';
    if (!env.STRIPE_SECRET_KEY || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return Response.redirect(`${origin}/app?paiement=erreur`, 302);
    const access = await accessFromCheckout(env, sessionId).catch(() => null);
    if (!access) return Response.redirect(`${origin}/app?paiement=attente`, 302);
    await issue(ctx, access);
    return new Response(null, { status: 302, headers: { Location: `${origin}/app?bienvenue=${access.plan}` } });
  }

  if (pathname === '/api/restore' && method === 'POST') {
    const { email, last4 } = await body(request);
    if (!env.STRIPE_SECRET_KEY) throw new HttpError(503, 'Paiement non configuré.');
    if (typeof email !== 'string' || !email.includes('@') || !/^\d{4}$/.test(String(last4))) throw new HttpError(400, 'Entre ton e-mail et les 4 derniers chiffres de ta carte.');
    const mail = email.trim();
    await limitIp(request, env, 'restore', 20);
    if (env.AUTH_LIMITER && !(await env.AUTH_LIMITER.limit({ key: `restore:${mail.toLowerCase()}` })).success) throw new HttpError(429, 'Trop de tentatives. Réessaie dans une minute.');
    if (!(await allowAttempt(`restore/${encodeURIComponent(mail.toLowerCase())}`, 5))) throw new HttpError(429, 'Trop de tentatives. Réessaie dans une heure.');
    const access = await accessFromEmail(env, mail, String(last4));
    if (!access) throw new HttpError(404, 'Aucun abonnement actif ne correspond à ces informations.');
    // Accès récupéré : fonctionnalités oui, facturation non (elle passe par le lien e-mail sécurisé de Stripe).
    await issue(ctx, { ...access, cid: access.cus, cus: undefined, restored: true });
    return json({ plan: access.plan, pw: access.pw });
  }

  // Connexion sur n'importe quel appareil : e-mail + mot de passe.
  if (pathname === '/api/login' && method === 'POST') {
    const { email, password } = await body(request);
    if (!env.STRIPE_SECRET_KEY) throw new HttpError(503, 'Paiement non configuré.');
    if (typeof email !== 'string' || !email.includes('@') || typeof password !== 'string' || !password) throw new HttpError(400, 'Entre ton e-mail et ton mot de passe.');
    const mail = email.trim();
    await limitIp(request, env, 'login', 30);
    if (env.AUTH_LIMITER && !(await env.AUTH_LIMITER.limit({ key: `login:${mail.toLowerCase()}` })).success) throw new HttpError(429, 'Trop de tentatives. Réessaie dans une minute ou utilise « Mot de passe oublié ».');
    if (!(await allowAttempt(`login/${encodeURIComponent(mail.toLowerCase())}`, 8))) throw new HttpError(429, 'Trop de tentatives. Réessaie dans une heure ou utilise « Mot de passe oublié ».');
    const access = await accessFromLogin(env, mail, password);
    if (!access) throw new HttpError(401, 'E-mail ou mot de passe incorrect.');
    if (access.expired) throw new HttpError(402, 'Ton abonnement n’est plus actif. Choisis une offre pour retrouver ton accès.', { upgrade: 'basic' });
    await issue(ctx, access);
    return json({ plan: access.plan });
  }

  // Création / changement du mot de passe (client payant, sur cet appareil).
  if (pathname === '/api/password' && method === 'POST') {
    const { password } = await body(request);
    const access = await getAccess(request, env, ctx);
    const customer = access.cus || access.cid;
    if (!customer) throw new HttpError(403, 'Connecte-toi d’abord à ton abonnement.');
    if (typeof password !== 'string' || password.length < 8 || password.length > 200) throw new HttpError(400, 'Ton mot de passe doit faire au moins 8 caractères.');
    await setPassword(env, customer, password);
    // Mot de passe choisi : accès complet sur cet appareil (facturation comprise).
    await issue(ctx, { ...access, cus: customer, cid: undefined, restored: undefined, pw: true });
    return json({ ok: true });
  }

  if (pathname === '/api/portal' && method === 'POST') {
    const access = await getAccess(request, env, ctx);
    if (!access.cus || !env.STRIPE_SECRET_KEY) throw new HttpError(400, 'Aucun abonnement à gérer.');
    return json({ url: await portalUrl(env, access.cus, origin) });
  }

  if (pathname === '/api/logout' && method === 'POST') {
    ctx.cookies.push(cookie(SESSION, '', 0));
    return json({ ok: true });
  }

  // Accès de test local uniquement (DEV_UNLOCK=true dans .dev.vars, jamais en production).
  if (pathname === '/api/dev-login' && env.DEV_UNLOCK === 'true') {
    const plan = PLANS[url.searchParams.get('plan')] ? url.searchParams.get('plan') : 'scale';
    await issue(ctx, { plan, dev: true, email: 'demo@local' });
    return new Response(null, { status: 302, headers: { Location: '/app' } });
  }

  throw new HttpError(404, 'Route inconnue.');
}

export default {
  // Tâche planifiée gratuite toutes les 7 minutes : une boutique du radar relue à chaque fois (voir radarTick).
  async scheduled(event, env, ctx) {
    ctx.waitUntil(radarTick(env, event.scheduledTime ?? Date.now()));
  },

  async fetch(request, env, exec) {
    const url = new URL(request.url);
    // Coordonnées des agents : jamais servies en fichier brut, seulement via /api/agents (filtré selon l'offre).
    if (url.pathname === '/agents.js') return new Response('Not found', { status: 404 });
    if (url.pathname === '/robots.txt') return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /app\nSitemap: ${url.origin}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } });
    if (url.pathname === '/sitemap.xml') {
      const pages = ['/', '/mentions-legales', '/cgv', '/confidentialite'];
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((p) => `<url><loc>${url.origin}${p}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } });
    }
    // Page d'accueil : adresses absolues pour l'aperçu de partage (Facebook, WhatsApp, LinkedIn les exigent).
    if ((url.pathname === '/' || url.pathname === '/index.html') && typeof HTMLRewriter !== 'undefined') {
      const abs = (v) => (v && v.startsWith('/') ? url.origin + v : v);
      const fix = (attr) => ({ element: (el) => el.setAttribute(attr, abs(el.getAttribute(attr))) });
      return new HTMLRewriter()
        .on('meta[property="og:image"], meta[name="twitter:image"], meta[property="og:url"]', fix('content'))
        .on('link[rel="canonical"]', fix('href'))
        .transform(await env.ASSETS.fetch(request));
    }
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    globalThis.SHOPIFY_MOCK = env.SHOPIFY_MOCK || '';
    await loadSecret(env);
    const ctx = { cookies: [], secret: secretOf(env), wait: (p) => exec?.waitUntil ? exec.waitUntil(p) : p };
    let response;
    try {
      response = await route(request, env, ctx);
    } catch (error) {
      if (error instanceof StoreError) response = json({ error: error.message, code: error.code }, 422);
      else if (error instanceof HttpError) response = json({ error: error.message, ...error.extra }, error.status);
      else {
        console.error('Unhandled', error?.stack || error);
        response = json({ error: 'Oups, une erreur est survenue. Réessaie dans un instant.' }, 500);
      }
    }
    if (ctx.cookies.length) {
      response = new Response(response.body, response);
      for (const c of ctx.cookies) response.headers.append('Set-Cookie', c);
    }
    return response;
  },
};
