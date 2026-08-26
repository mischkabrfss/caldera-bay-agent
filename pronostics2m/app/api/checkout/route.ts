import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { offerBySlug } from '@/lib/offers';
import { redirectTo } from '@/lib/http';
import { createCheckoutSession, stripeConfigured } from '@/lib/stripe';

async function start(request: Request, slug: string, rawPlan: string): Promise<Response> {
  const plan = rawPlan === 'lifetime' ? 'lifetime' : 'monthly';
  const offer = offerBySlug(slug);
  const fail = (message: string) =>
    redirectTo(request, `/vip?erreur=${encodeURIComponent(message)}`);

  if (!offer) return fail('Formule inconnue.');

  const user = await getCurrentUser();
  if (!user) {
    return redirectTo(request, `/inscription?offre=${offer.slug}&formule=${plan}`);
  }

  if (!stripeConfigured()) {
    return fail('Le paiement en ligne n’est pas encore activé sur ce site.');
  }

  // Records the intent as pending; only the Stripe webhook may mark it active.
  try {
    const db = await getDb();
    const product = await db
      .prepare('SELECT id FROM vip_products WHERE slug = ?1')
      .bind(offer.slug)
      .first<{ id: number }>();
    const amount = plan === 'monthly' ? offer.monthly : offer.lifetime;
    await db
      .prepare(
        `INSERT INTO subscriptions (user_id, vip_product_id, vip_type, plan, status, amount)
         VALUES (?1, ?2, ?3, ?4, 'pending', ?5)`,
      )
      .bind(user.id, product?.id ?? 0, offer.vipType, plan, amount)
      .run();

    const url = await createCheckoutSession({
      userId: user.id,
      email: user.email,
      productSlug: offer.slug,
      productName: offer.name,
      vipType: offer.vipType,
      plan,
      amount,
    });
    return redirectTo(request, url);
  } catch (error) {
    console.error('checkout failed', error);
    return fail('Le paiement n’a pas pu être ouvert. Réessayez dans un instant.');
  }
}

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  return start(request, String(form.get('slug') ?? ''), String(form.get('plan') ?? 'monthly'));
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  return start(request, url.searchParams.get('slug') ?? '', url.searchParams.get('plan') ?? 'monthly');
}
