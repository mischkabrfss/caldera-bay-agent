const PROMO_END = Date.parse('2026-08-29T21:59:59.000Z');
const TRUSTED_SITE_URL = 'https://nexora-digital-academy.barfussmischka.chatgpt.site';

function currentPriceInCents() {
  return Date.now() < PROMO_END ? 3499 : 5000;
}

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return Response.json(
      { error: 'Le paiement est en cours de sécurisation. Réessaie après l’ouverture officielle.' },
      { status: 503 },
    );
  }

  const siteUrl = process.env.PUBLIC_SITE_URL || TRUSTED_SITE_URL;
  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('locale', 'fr');
  body.set('submit_type', 'pay');
  body.set('customer_creation', 'always');
  body.set('success_url', `${siteUrl}/vente/succes?session_id={CHECKOUT_SESSION_ID}`);
  body.set('cancel_url', `${siteUrl}/vente#paiement`);
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', 'eur');
  body.set('line_items[0][price_data][unit_amount]', String(currentPriceInCents()));
  body.set('line_items[0][price_data][product_data][name]', 'NEXORA — Digital Business Academy');
  body.set(
    'line_items[0][price_data][product_data][description]',
    'Accès complet aux 3 parcours, aux missions, aux quiz, à Nexo et à la licence MRR.',
  );
  body.set('metadata[offer]', 'nexora_academy_access');
  body.set('metadata[promo_ends_at]', '2026-08-29T21:59:59.000Z');
  body.set('integration_identifier', 'nexora_qjxkwepz');

  try {
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2026-07-29.dahlia',
      },
      body,
    });

    const session = (await stripeResponse.json()) as {
      url?: string;
      error?: { type?: string; code?: string; param?: string; message?: string };
    };
    if (!stripeResponse.ok || !session.url) {
      console.error('Stripe Checkout creation failed', {
        status: stripeResponse.status,
        type: session.error?.type,
        code: session.error?.code,
        param: session.error?.param,
        message: session.error?.message,
      });
      return Response.json({ error: 'Stripe n’a pas pu ouvrir le paiement. Réessaie dans un instant.' }, { status: 502 });
    }

    return Response.json({ url: session.url });
  } catch {
    return Response.json({ error: 'Le service de paiement est momentanément indisponible.' }, { status: 502 });
  }
}
