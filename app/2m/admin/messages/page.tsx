import { requireAdmin } from '@/lib/admin';
import { getDb, tryDb } from '@/lib/db';
import { frenchDate } from '@/lib/format';
import { AdminNav } from '@/components/p2m/AdminNav';

export const dynamic = 'force-dynamic';

type Message = {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  created_at: string;
};

export default async function AdminMessages() {
  await requireAdmin();
  const db = await tryDb();
  const rows: Message[] = db
    ? ((await (await getDb())
        .prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 100')
        .all<Message>()).results ?? [])
    : [];

  return (
    <section className="section">
      <div className="wrap stack gap-14">
        <h1 className="disp page-title">MESSAGES</h1>
        <AdminNav active="/2m/admin/messages" />

        {!db ? (
          <div className="notice notice-error">
            La base de données n’est pas encore branchée sur ce site.
          </div>
        ) : null}

        {rows.length === 0 && db ? (
          <div className="card-flat">
            <p className="small muted">Aucun message reçu pour le moment.</p>
          </div>
        ) : null}

        <div className="stack gap-10">
          {rows.map((message) => (
            <article key={message.id} className="card-flat">
              <div className="between">
                <b>{message.name}</b>
                <span className="xs dim">{frenchDate(message.created_at)}</span>
              </div>
              <p className="small gold mt-8">{message.subject || 'Sans sujet'}</p>
              <p className="small muted mt-8" style={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {message.body}
              </p>
              <p className="xs dim mt-8">
                <a href={`mailto:${message.email}`}>{message.email}</a>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
