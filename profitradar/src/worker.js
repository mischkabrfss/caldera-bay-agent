import { auditStore, compareStores, radarFrom, spyStore } from './analyze.js';
import { cookie, readCookie, secretOf, sign, verify } from './auth.js';
import { can, PLANS, TEST_LIMITS } from './plans.js';
import { NICHES } from './seeds.js';
import { fetchStoreFull, fetchStoreLite, normalizeStore, StoreError } from './shopify.js';
import { accessFromCheckout, accessFromEmail, changePlan, createCheckout, portalUrl, refreshAccess } from './stripe.js';

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

async function cached(key, ttl, load) {
  const cache = globalThis.caches?.default;
  const request = new Request(`https://cache.profitradar.internal/${key}`);
  if (cache) {
    const hit = await cache.match(request);
    if (hit) return hit.json();
  }
  const value = await load();
  if (cache && !(Array.isArray(value) && !value.length)) await cache.put(request, new Response(JSON.stringify(value), { headers: { 'Cache-Control': `max-age=${ttl}` } }));
  return value;
}

// Limiteur simple (cache Cloudflare, 1 h) : suffisant contre le forçage des 4 chiffres.
async function allowAttempt(key, max) {
  const cache = globalThis.caches?.default;
  if (!cache) return true;
  const request = new Request(`https://cache.profitradar.internal/limit/${key}`);
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
    if (fresh && access.restored) fresh = { ...fresh, cus: undefined, restored: true };
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
    throw new HttpError(402, `Tes ${TEST_LIMITS.audits} analyses gratuites sont utilisées. Passe à une offre pour continuer.`, { upgrade: 'basic' });
  }
  const next = { n: trial.n + 1, exp: Date.now() + MONTH };
  ctx.cookies.push(cookie(TRIAL, await sign(next, ctx.secret), MONTH / 1000));
  return TEST_LIMITS.audits - next.n;
}

function lockAudit(report) {
  const fixes = report.fixes.map((fix, i) => (i < TEST_LIMITS.fixes ? fix : { cat: fix.cat, impact: fix.impact, title: fix.title, locked: true }));
  const products = report.products.map((p, i) => (i < TEST_LIMITS.products ? p : { title: p.title, image: p.image, score: p.score, verdict: p.verdict, locked: true }));
  return { ...report, fixes, products };
}

const lockItems = (items, keep) => items.map((item, i) => (i < keep ? item : { image: item.image, score: item.score, locked: true }));

async function loadStore(input, full) {
  const host = normalizeStore(input);
  return cached(`${full ? 'full' : 'lite'}/${host}`, full ? 1800 : 21600, () => (full ? fetchStoreFull(host) : fetchStoreLite(host)));
}

async function route(request, env, ctx) {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method;
  const origin = env.PUBLIC_URL || url.origin;

  if (pathname === '/api/config') {
    return json({ stripe: !!env.STRIPE_SECRET_KEY, plans: PLANS, niches: Object.fromEntries(Object.entries(NICHES).map(([k, v]) => [k, { label: v.label, emoji: v.emoji }])) });
  }

  if (pathname === '/api/me') {
    const access = await getAccess(request, env, ctx);
    const trial = (await verify(readCookie(request, TRIAL), ctx.secret)) || { n: 0 };
    return json({ plan: access.plan, email: access.email || '', expired: !!access.expired, trialLeft: Math.max(0, TEST_LIMITS.audits - trial.n), portal: !!access.cus, portalLogin: access.restored ? env.PORTAL_LOGIN_URL || '' : '' });
  }

  if (pathname === '/api/audit' && method === 'POST') {
    const { store } = await body(request);
    const access = await getAccess(request, env, ctx);
    const host = normalizeStore(store);
    const report = auditStore(await loadStore(host, true));
    const trialLeft = access.plan === 'test' ? await consumeTrial(request, ctx) : null;
    return json({ plan: access.plan, trialLeft, report: can(access.plan, 'fullAudit') ? report : lockAudit(report) });
  }

  if (pathname === '/api/spy' && method === 'POST') {
    const { store } = await body(request);
    const access = await getAccess(request, env, ctx);
    const report = spyStore(await loadStore(store, false));
    if (!can(access.plan, 'spy')) {
      report.bestsellers = lockItems(report.bestsellers, 1);
      report.launches = lockItems(report.launches, 1);
      report.locked = true;
    }
    return json({ plan: access.plan, report });
  }

  if (pathname === '/api/radar') {
    const niche = NICHES[url.searchParams.get('niche')] ? url.searchParams.get('niche') : 'mode';
    const access = await getAccess(request, env, ctx);
    const items = await cached(`radar/${niche}`, 43200, async () => {
      const results = await Promise.allSettled(NICHES[niche].stores.map((host) => fetchStoreLite(host)));
      return radarFrom(results.filter((r) => r.status === 'fulfilled').map((r) => r.value));
    });
    const allowed = can(access.plan, 'radar');
    return json({ plan: access.plan, niche, locked: !allowed, items: allowed ? items : lockItems(items.slice(0, 8), 1) });
  }

  if (pathname === '/api/compare' && method === 'POST') {
    const access = await getAccess(request, env, ctx);
    if (!can(access.plan, 'compare')) throw new HttpError(403, 'Le comparateur multi-boutiques est inclus dans l’offre Scale.', { upgrade: 'scale' });
    const { stores } = await body(request);
    const hosts = [...new Set((Array.isArray(stores) ? stores : []).filter(Boolean).map(normalizeStore))].slice(0, 4);
    if (hosts.length < 2) throw new HttpError(400, 'Entre au moins 2 boutiques à comparer.');
    const results = await Promise.allSettled(hosts.map((h) => loadStore(h, false)));
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
    const mail = email.trim().toLowerCase();
    if (!(await allowAttempt(`restore/${encodeURIComponent(mail)}`, 5))) throw new HttpError(429, 'Trop de tentatives. Réessaie dans une heure.');
    const access = await accessFromEmail(env, mail, String(last4));
    if (!access) throw new HttpError(404, 'Aucun abonnement actif ne correspond à ces informations.');
    // Accès récupéré : fonctionnalités oui, facturation non (elle passe par le lien e-mail sécurisé de Stripe).
    await issue(ctx, { ...access, cus: undefined, restored: true });
    return json({ plan: access.plan });
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
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    globalThis.SHOPIFY_MOCK = env.SHOPIFY_MOCK || '';
    const ctx = { cookies: [], secret: secretOf(env) };
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
