import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { redirectTo } from '@/lib/http';

export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return redirectTo(request, '/connexion');

  const form = await request.formData();
  const current = String(form.get('current') ?? '');
  const password = String(form.get('password') ?? '');
  const confirm = String(form.get('confirm') ?? '');
  const fail = (message: string) =>
    redirectTo(request, `/compte/profil?erreur=${encodeURIComponent(message)}`);

  if (password.length < 8) return fail('Le nouveau mot de passe doit faire au moins 8 caractères.');
  if (password !== confirm) return fail('Les deux mots de passe ne correspondent pas.');

  const db = await getDb();
  const row = await db
    .prepare('SELECT password_hash FROM users WHERE id = ?1')
    .bind(user.id)
    .first<{ password_hash: string }>();
  if (!row || !(await verifyPassword(current, row.password_hash))) {
    return fail('Mot de passe actuel incorrect.');
  }

  await db
    .prepare('UPDATE users SET password_hash = ?2 WHERE id = ?1')
    .bind(user.id, await hashPassword(password))
    .run();

  return redirectTo(
    request,
    `/compte/profil?ok=${encodeURIComponent('Mot de passe mis à jour.')}`,
  );
}
