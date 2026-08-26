import { env, getDb } from '@/lib/db';
import { stripeRequest, verifyWebhookSignature } from '@/lib/stripe';

type StripeSession = {
  id: string;
  mode: string;
  customer?: string | null;
  subscription?: string | null;
  payment_intent?: string | null;
  amount_total?: number | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string>;
};

type StripeSubscription = {
  id: string;
  customer?: string | null;
  status?: string;
  current_period_end?: number | null;
  items?: { data?: { current_period_end?: number | null }[] };
  metadata?: Record<string, string>;
};

type StripeInvoice = {
  id: string;
  customer?: string | null;
  subscription?: string | null;
  amount_paid?: number | null;
  parent?: { subscription_details?: { subscription?: string | null } | null } | null;
};

function isoFromUnix(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString().replace('T', ' ').slice(0, 19);
}

function periodEnd(subscription: StripeSubscription): number | null {
  return (
    subscription.current_period_end ??
    subscription.items?.data?.[0]?.current_period_end ??
    null
  );
}

async function markActive(input: {
  userId: number;
  vipType: string;
  plan: string;
  amount: number;
  customerId: string | null;
  subscriptionId: string | null;
  sessionId: string | null;
  endDate: string | null;
}): Promise<void> {
  const db = await getDb();
  const product = await db
    .prepare('SELECT id FROM vip_products WHERE type = ?1')
    .bind(input.vipType)
    .first<{ id: number }>();

  // Reuse the pending row created at checkout when there is one.
  const pending = await db
    .prepare(
      `SELECT id FROM subscriptions
       WHERE user_id = ?1 AND vip_type = ?2 AND plan = ?3 AND status = 'pending'
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(input.userId, input.vipType, input.plan)
    .first<{ id: number }>();

  if (pending) {
    await db
      .prepare(
        `UPDATE subscriptions SET
           status = 'active', amount = ?2, start_date = datetime('now'), end_date = ?3,
           stripe_customer_id = ?4, stripe_subscription_id = ?5, stripe_session_id = ?6,
           updated_at = datetime('now')
         WHERE id = ?1`,
      )
      .bind(
        pending.id,
        input.amount,
        input.endDate,
        input.customerId,
        input.subscriptionId,
        input.sessionId,
      )
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO subscriptions
          (user_id, vip_product_id, vip_type, plan, status, amount, start_date, end_date,
           stripe_customer_id, stripe_subscription_id, stripe_session_id)
         VALUES (?1, ?2, ?3, ?4, 'active', ?5, datetime('now'), ?6, ?7, ?8, ?9)`,
      )
      .bind(
        input.userId,
        product?.id ?? 0,
        input.vipType,
        input.plan,
        input.amount,
        input.endDate,
        input.customerId,
        input.subscriptionId,
        input.sessionId,
      )
      .run();
  }

  await db
    .prepare(
      `INSERT INTO payments (user_id, amount, status, stripe_reference, label)
       VALUES (?1, ?2, 'paid', ?3, ?4)`,
    )
    .bind(
      input.userId,
      input.amount,
      input.subscriptionId ?? input.sessionId,
      `${input.vipType} · ${input.plan}`,
    )
    .run();
}

async function setStatusBySubscription(subscriptionId: string, status: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      "UPDATE subscriptions SET status = ?2, updated_at = datetime('now') WHERE stripe_subscription_id = ?1",
    )
    .bind(subscriptionId, status)
    .run();
}

export async function POST(request: Request): Promise<Response> {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');
  const secret = env().STRIPE_WEBHOOK_SECRET;

  if (!(await verifyWebhookSignature(payload, signature, secret))) {
    return new Response('signature invalide', { status: 400 });
  }

  const event = JSON.parse(payload) as { type: string; data: { object: unknown } };

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as StripeSession;
      const userId = Number(session.metadata?.user_id ?? session.client_reference_id ?? 0);
      const vipType = session.metadata?.vip_type ?? '';
      const plan = session.metadata?.plan === 'lifetime' ? 'lifetime' : 'monthly';
      if (!userId || !vipType) return new Response('ok');

      let endDate: string | null = null;
      let subscriptionId: string | null = null;
      if (plan === 'monthly' && session.subscription) {
        subscriptionId = session.subscription;
        const subscription = await stripeRequest<StripeSubscription>(
          `/subscriptions/${session.subscription}`,
        );
        endDate = isoFromUnix(periodEnd(subscription));
      }

      await markActive({
        userId,
        vipType,
        plan,
        amount: session.amount_total ?? 0,
        customerId: session.customer ?? null,
        subscriptionId,
        sessionId: session.id,
        endDate,
      });
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as StripeInvoice;
      const subscriptionId =
        invoice.subscription ?? invoice.parent?.subscription_details?.subscription ?? null;
      if (subscriptionId) {
        const subscription = await stripeRequest<StripeSubscription>(
          `/subscriptions/${subscriptionId}`,
        );
        const db = await getDb();
        await db
          .prepare(
            `UPDATE subscriptions SET status = 'active', end_date = ?2, updated_at = datetime('now')
             WHERE stripe_subscription_id = ?1`,
          )
          .bind(subscriptionId, isoFromUnix(periodEnd(subscription)))
          .run();
        const owner = await db
          .prepare('SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ?1')
          .bind(subscriptionId)
          .first<{ user_id: number }>();
        if (owner) {
          await db
            .prepare(
              `INSERT INTO payments (user_id, amount, status, stripe_reference, label)
               VALUES (?1, ?2, 'paid', ?3, 'Renouvellement mensuel')`,
            )
            .bind(owner.user_id, invoice.amount_paid ?? 0, invoice.id)
            .run();
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as StripeInvoice;
      const subscriptionId =
        invoice.subscription ?? invoice.parent?.subscription_details?.subscription ?? null;
      if (subscriptionId) await setStatusBySubscription(subscriptionId, 'payment_failed');
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as StripeSubscription;
      await setStatusBySubscription(subscription.id, 'cancelled');
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as StripeSubscription;
      const status =
        subscription.status === 'active' || subscription.status === 'trialing'
          ? 'active'
          : subscription.status === 'canceled'
            ? 'cancelled'
            : subscription.status === 'past_due' || subscription.status === 'unpaid'
              ? 'payment_failed'
              : 'expired';
      const db = await getDb();
      await db
        .prepare(
          `UPDATE subscriptions SET status = ?2, end_date = ?3, updated_at = datetime('now')
           WHERE stripe_subscription_id = ?1`,
        )
        .bind(subscription.id, status, isoFromUnix(periodEnd(subscription)))
        .run();
    }
  } catch (error) {
    console.error('webhook handling failed', event.type, error);
    return new Response('erreur interne', { status: 500 });
  }

  return new Response('ok');
}
