import { requireAdmin } from '@/lib/admin';
import { getDb, tryDb } from '@/lib/db';
import { euros, frenchDate } from '@/lib/format';
import { VIP_LABELS, type VipType } from '@/lib/access';
import { AdminNav } from '@/components/p2m/AdminNav';

export const dynamic = 'force-dynamic';

type Row = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  vip_type: VipType | null;
  plan: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  paid: number | null;
};

export default async function AdminUsers() {
  await requireAdmin();
  const db = await tryDb();
  if (!db) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="notice notice-error">
            La base de données n’est pas encore branchée sur ce site.
          </div>
        </div>
      </section>
    );
  }

  const handle = await getDb();
  const { results } = await handle
    .prepare(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              s.vip_type, s.plan, s.status, s.start_date, s.end_date,
              (SELECT COALESCE(SUM(amount), 0) FROM payments p
                WHERE p.user_id = u.id AND p.status = 'paid') AS paid
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id
       ORDER BY u.created_at DESC, u.id DESC
       LIMIT 300`,
    )
    .all<Row>();

  const rows = results ?? [];

  return (
    <section className="section">
      <div className="wrap stack gap-14">
        <h1 className="disp page-title">UTILISATEURS</h1>
        <AdminNav active="/2m/admin/utilisateurs" />
        <p className="xs dim">
          Les mots de passe ne sont jamais lisibles : seule une empreinte chiffrée est stockée.
        </p>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nom / pseudo</th>
                <th>Email</th>
                <th>Inscription</th>
                <th>VIP</th>
                <th>Formule</th>
                <th>Statut</th>
                <th>Début</th>
                <th>Expiration</th>
                <th>Total payé</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.id}-${index}`}>
                  <td>
                    {row.name}
                    {row.role === 'admin' ? <span className="badge badge-gold" style={{ marginLeft: 8 }}>ADMIN</span> : null}
                  </td>
                  <td>{row.email}</td>
                  <td>{frenchDate(row.created_at)}</td>
                  <td>{row.vip_type ? VIP_LABELS[row.vip_type] : '—'}</td>
                  <td>{row.plan ? (row.plan === 'monthly' ? 'Mensuel' : 'À vie') : '—'}</td>
                  <td>{row.status ?? '—'}</td>
                  <td>{frenchDate(row.start_date)}</td>
                  <td>{row.plan === 'lifetime' ? '—' : frenchDate(row.end_date)}</td>
                  <td>{euros(row.paid ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
