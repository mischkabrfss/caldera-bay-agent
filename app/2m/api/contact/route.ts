import { getDb } from '@/lib/db';
import { redirectTo } from '@/lib/http';

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const subject = String(form.get('subject') ?? '').trim();
  const body = String(form.get('body') ?? '').trim();

  const fail = (message: string) =>
    redirectTo(request, `/2m/contact?erreur=${encodeURIComponent(message)}`);

  if (!name || !email || !body) return fail('Merci de remplir tous les champs.');
  if (body.length > 4000) return fail('Message trop long.');

  try {
    const db = await getDb();
    await db
      .prepare('INSERT INTO messages (name, email, subject, body) VALUES (?1, ?2, ?3, ?4)')
      .bind(name, email, subject.slice(0, 120), body)
      .run();
  } catch {
    return fail('L’envoi a échoué. Réessayez dans un instant.');
  }

  return redirectTo(
    request,
    `/2m/contact?ok=${encodeURIComponent('Message envoyé. Nous vous répondons sous 24 h.')}`,
  );
}
