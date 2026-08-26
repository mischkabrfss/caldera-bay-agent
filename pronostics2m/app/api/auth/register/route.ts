import { getDb } from '@/lib/db';
import { redirectTo } from '@/lib/http';
import { createSession, hashPassword } from '@/lib/auth';
import { offerBySlug } from '@/lib/offers';

function back(request: Request, message: string, slug?: string, plan?: string): Response {
  const query = new URLSearchParams({ erreur: message });
  if (slug) query.set('offre', slug);
  if (plan) query.set('formule', plan);
  return redirectTo(request, `/inscription?${query}`);
}

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');
  const confirm = String(form.get('confirm') ?? '');
  const slug = String(form.get('slug') ?? '') || undefined;
  const plan = String(form.get('plan') ?? 'monthly');

  if (!name || !email || !password) return back(request, 'Merci de remplir tous les champs.', slug, plan);
  if (password.length < 8) return back(request, 'Le mot de passe doit faire au moins 8 caractères.', slug, plan);
  if (password !== confirm) return back(request, 'Les deux mots de passe ne correspondent pas.', slug, plan);
  if (!form.get('terms')) return back(request, 'Vous devez accepter les conditions générales.', slug, plan);

  let db;
  try {
    db = await getDb();
  } catch {
    return back(request, 'Le service d’inscription est momentanément indisponible.', slug, plan);
  }

  const existing = await db
    .prepare('SELECT id FROM users WHERE email = ?1')
    .bind(email)
    .first<{ id: number }>();
  if (existing) return back(request, 'Un compte existe déjà avec cet email.', slug, plan);

  const inserted = await db
    .prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?1, ?2, ?3, 'user') RETURNING id",
    )
    .bind(name, email, await hashPassword(password))
    .first<{ id: number }>();

  if (!inserted) return back(request, 'La création du compte a échoué. Réessayez.', slug, plan);

  await createSession(inserted.id);

  const offer = slug ? offerBySlug(slug) : undefined;
  if (offer) {
    return redirectTo(
      request,
      `/api/checkout?slug=${offer.slug}&plan=${plan === 'lifetime' ? 'lifetime' : 'monthly'}`,
    );
  }
  return redirectTo(request, '/compte');
}
