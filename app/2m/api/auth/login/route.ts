import { getDb } from '@/lib/db';
import { redirectTo } from '@/lib/http';
import { createSession, ensureAdminAccount, verifyPassword } from '@/lib/auth';

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');

  const fail = (message: string) =>
    redirectTo(request, `/2m/connexion?erreur=${encodeURIComponent(message)}`);

  if (!email || !password) return fail('Email et mot de passe sont obligatoires.');

  let db;
  try {
    db = await getDb();
    // Creates the admin account declared in the environment on first sign-in.
    await ensureAdminAccount();
  } catch {
    return fail('Le service de connexion est momentanément indisponible.');
  }

  const user = await db
    .prepare('SELECT id, password_hash, role FROM users WHERE email = ?1')
    .bind(email)
    .first<{ id: number; password_hash: string; role: string }>();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return fail('Email ou mot de passe incorrect.');
  }

  await createSession(user.id);
  return redirectTo(request, user.role === 'admin' ? '/2m/admin' : '/2m/compte');
}
