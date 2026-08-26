import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { redirectTo } from '@/lib/http';
import { createBillingPortalSession, stripeConfigured } from '@/lib/stripe';

/** Opens the Stripe customer portal so the member can manage or cancel. */
export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return redirectTo(request, '/connexion');

  const fail = (message: string) =>
    redirectTo(request, `/compte?erreur=${encodeURIComponent(message)}`);

  if (!stripeConfigured()) return fail('La gestion en ligne n’est pas encore activée.');

  try {
    const db = await getDb();
    const row = await db
      .prepare(
        `SELECT stripe_customer_id FROM subscriptions
         WHERE user_id = ?1 AND stripe_customer_id IS NOT NULL
         ORDER BY created_at DESC LIMIT 1`,
      )
      .bind(user.id)
      .first<{ stripe_customer_id: string }>();
    if (!row?.stripe_customer_id) return fail('Aucun paiement Stripe rattaché à ce compte.');
    return redirectTo(request, await createBillingPortalSession(row.stripe_customer_id));
  } catch (error) {
    console.error('portal failed', error);
    return fail('Le portail client est momentanément indisponible.');
  }
}
