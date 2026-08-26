import { env } from './db';

const STRIPE_API = 'https://api.stripe.com/v1';

export function stripeConfigured(): boolean {
  return Boolean(env().STRIPE_SECRET_KEY);
}

export function siteUrl(): string {
  return (env().PUBLIC_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
}

export async function stripeRequest<T>(
  path: string,
  init?: { method?: string; body?: URLSearchParams },
): Promise<T> {
  const key = env().STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY manquant');
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: init?.body,
  });
  const payload = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Stripe a répondu ${response.status}`);
  }
  return payload;
}

export type CheckoutInput = {
  userId: number;
  email: string;
  productSlug: string;
  productName: string;
  vipType: string;
  plan: 'monthly' | 'lifetime';
  amount: number;
};

export async function createCheckoutSession(input: CheckoutInput): Promise<string> {
  const body = new URLSearchParams();
  body.set('mode', input.plan === 'monthly' ? 'subscription' : 'payment');
  body.set('locale', 'fr');
  body.set('customer_email', input.email);
  body.set('client_reference_id', String(input.userId));
  body.set('success_url', `${siteUrl()}/compte?paiement=succes`);
  body.set('cancel_url', `${siteUrl()}/vip?paiement=annule`);
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', 'eur');
  body.set('line_items[0][price_data][unit_amount]', String(input.amount));
  body.set(
    'line_items[0][price_data][product_data][name]',
    `${input.productName} — ${input.plan === 'monthly' ? 'abonnement mensuel' : 'accès à vie'}`,
  );
  if (input.plan === 'monthly') {
    body.set('line_items[0][price_data][recurring][interval]', 'month');
    body.set('subscription_data[metadata][user_id]', String(input.userId));
    body.set('subscription_data[metadata][vip_type]', input.vipType);
    body.set('subscription_data[metadata][plan]', input.plan);
  } else {
    body.set('customer_creation', 'always');
  }
  body.set('metadata[user_id]', String(input.userId));
  body.set('metadata[vip_type]', input.vipType);
  body.set('metadata[product_slug]', input.productSlug);
  body.set('metadata[plan]', input.plan);

  const session = await stripeRequest<{ url?: string }>('/checkout/sessions', {
    method: 'POST',
    body,
  });
  if (!session.url) throw new Error('Stripe n’a pas renvoyé d’URL de paiement.');
  return session.url;
}

export async function createBillingPortalSession(customerId: string): Promise<string> {
  const body = new URLSearchParams();
  body.set('customer', customerId);
  body.set('return_url', `${siteUrl()}/compte`);
  const session = await stripeRequest<{ url?: string }>('/billing_portal/sessions', {
    method: 'POST',
    body,
  });
  if (!session.url) throw new Error('Portail client indisponible.');
  return session.url;
}

const encoder = new TextEncoder();

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Verifies a Stripe webhook signature (t=…,v1=…) without pulling in the SDK. */
export async function verifyWebhookSignature(
  payload: string,
  header: string | null,
  secret: string | undefined,
  toleranceSeconds = 300,
): Promise<boolean> {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(',').map((chunk) => {
      const [key, ...rest] = chunk.split('=');
      return [key.trim(), rest.join('=')];
    }),
  ) as Record<string, string>;
  const timestamp = Number(parts.t);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expected = hex(
    await crypto.subtle.sign('HMAC', key, encoder.encode(`${parts.t}.${payload}`)),
  );
  const provided = header
    .split(',')
    .filter((chunk) => chunk.trim().startsWith('v1='))
    .map((chunk) => chunk.trim().slice(3));
  return provided.some(
    (candidate) =>
      candidate.length === expected.length &&
      [...candidate].reduce((diff, char, i) => diff | (char.charCodeAt(0) ^ expected.charCodeAt(i)), 0) === 0,
  );
}
