// Client Stripe minimal (API REST, aucune dépendance).
import { PLANS } from '../public/plans.js';

const ACTIVE = new Set(['active', 'trialing', 'past_due']);

function form(data, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(data)) {
    const name = prefix ? `${prefix}[${k}]` : k;
    if (v === undefined || v === null) continue;
    if (typeof v === 'object') form(v, name, out);
    else out.append(name, String(v));
  }
  return out;
}

export async function stripe(env, method, path, data) {
  const url = new URL(`https://api.stripe.com/v1/${path}`);
  if (method === 'GET' && data) for (const [k, v] of form(data)) url.searchParams.append(k, v);
  const response = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method === 'GET' ? undefined : form(data || {}),
  });
  const json = await response.json();
  if (!response.ok) {
    console.error('Stripe error', path, json.error?.type, json.error?.code, json.error?.message);
    throw new Error(json.error?.message || 'Erreur Stripe');
  }
  return json;
}

export function createCheckout(env, plan, origin, email) {
  const offer = PLANS[plan];
  return stripe(env, 'POST', 'checkout/sessions', {
    mode: 'subscription',
    locale: 'fr',
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    customer_email: email || undefined,
    success_url: `${origin}/api/activate?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#tarifs`,
    line_items: {
      0: {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: offer.price,
          recurring: { interval: 'month' },
          product_data: { name: `Shoplift ${offer.name}`, metadata: { plan } },
        },
      },
    },
    metadata: { plan },
    subscription_data: { metadata: { plan } },
  });
}

export function subscriptionToAccess(subscription, email) {
  if (!subscription || !ACTIVE.has(subscription.status)) return null;
  const plan = subscription.metadata?.plan;
  if (!PLANS[plan] || plan === 'test') return null;
  const customer = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  return { plan, sub: subscription.id, cus: customer, email: email || '' };
}

export async function accessFromCheckout(env, sessionId) {
  const session = await stripe(env, 'GET', `checkout/sessions/${encodeURIComponent(sessionId)}`, { expand: ['subscription'] });
  if (session.status !== 'complete') return null;
  return subscriptionToAccess(session.subscription, session.customer_details?.email || session.customer_email);
}

export async function refreshAccess(env, access) {
  const subscription = await stripe(env, 'GET', `subscriptions/${encodeURIComponent(access.sub)}`);
  return subscriptionToAccess(subscription, access.email);
}

// Récupération d'accès sur un nouvel appareil : e-mail + 4 derniers chiffres de la carte.
export async function accessFromEmail(env, email, last4) {
  // Stripe compare les e-mails en tenant compte des majuscules : on essaie la saisie telle quelle puis en minuscules.
  const variants = [...new Set([email, email.toLowerCase()])];
  const found = [];
  for (const variant of variants) found.push(...((await stripe(env, 'GET', 'customers', { email: variant, limit: 5 })).data || []));
  for (const customer of found) {
    const subs = await stripe(env, 'GET', 'subscriptions', { customer: customer.id, status: 'all', limit: 10, expand: ['data.default_payment_method'] });
    for (const sub of subs.data || []) {
      const access = subscriptionToAccess(sub, email);
      if (!access) continue;
      let card = sub.default_payment_method?.card?.last4;
      if (!card) {
        const methods = await stripe(env, 'GET', 'payment_methods', { customer: customer.id, type: 'card', limit: 5 });
        if ((methods.data || []).some((m) => m.card?.last4 === last4)) card = last4;
      }
      if (card === last4) return access;
    }
  }
  return null;
}

export async function portalUrl(env, customer, origin) {
  const session = await stripe(env, 'POST', 'billing_portal/sessions', { customer, return_url: `${origin}/app#compte` });
  return session.url;
}

// Changement d'offre d'un abonné : même abonnement, prorata facturé immédiatement.
export async function changePlan(env, access, plan) {
  const sub = await stripe(env, 'GET', `subscriptions/${encodeURIComponent(access.sub)}`);
  const item = sub.items?.data?.[0];
  if (!item) throw new Error('Abonnement introuvable');
  const product = typeof item.price.product === 'string' ? item.price.product : item.price.product.id;
  const updated = await stripe(env, 'POST', `subscriptions/${encodeURIComponent(access.sub)}`, {
    items: { 0: { id: item.id, price_data: { currency: 'eur', product, unit_amount: PLANS[plan].price, recurring: { interval: 'month' } } } },
    metadata: { plan },
    proration_behavior: 'always_invoice',
  });
  await stripe(env, 'POST', `products/${encodeURIComponent(product)}`, { name: `Shoplift ${PLANS[plan].name}`, metadata: { plan } }).catch(() => null);
  return subscriptionToAccess(updated, access.email);
}
