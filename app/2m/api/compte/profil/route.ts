import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { redirectTo } from '@/lib/http';

export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return redirectTo(request, '/2m/connexion');

  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const fail = (message: string) =>
    redirectTo(request, `/2m/compte/profil?erreur=${encodeURIComponent(message)}`);

  if (!name || !email) return fail('Nom et email sont obligatoires.');

  const db = await getDb();
  const taken = await db
    .prepare('SELECT id FROM users WHERE email = ?1 AND id <> ?2')
    .bind(email, user.id)
    .first<{ id: number }>();
  if (taken) return fail('Cet email est déjà utilisé par un autre compte.');

  await db
    .prepare('UPDATE users SET name = ?2, email = ?3 WHERE id = ?1')
    .bind(user.id, name, email)
    .run();

  return redirectTo(
    request,
    `/2m/compte/profil?ok=${encodeURIComponent('Vos informations ont été mises à jour.')}`,
  );
}
