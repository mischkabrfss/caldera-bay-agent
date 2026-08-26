import { requireAdmin } from '@/lib/admin';
import { getDb, tryDb } from '@/lib/db';
import { euros, frenchDate } from '@/lib/format';
import { VIP_LABELS, type VipType } from '@/lib/access';
import { AdminNav } from '@/components/p2m/AdminNav';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  pending: 'En attente de paiement',
  expired: 'Expiré',
  cancelled: 'Annulé',
  payment_failed: 'Paiement échoué',
};

type Row = {
  id: number;
  email: string | null;
  name: string | null;
  vip_type: VipType;
  plan: string;
  status: string;
  amount: number;
  start_date: string | null;
  end_date: string | null;
  stripe_subscription_id: string | null;
  stripe_session_id: string | null;
};

export default async function AdminSubscriptions() {
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
      `SELECT s.id, u.email, u.name, s.vip_type, s.plan, s.status, s.amount,
              s.start_date, s.end_date, s.stripe_subscription_id, s.stripe_session_id
       FROM subscriptions s LEFT JOIN users u ON u.id = s.user_id
       ORDER BY s.created_at DESC LIMIT 300`,
    )
    .all<Row>();

  const rows = results ?? [];

  return (
    <section className="section">
      <div className="wrap stack gap-14">
        <h1 className="disp page-title">ABONNEMENTS</h1>
        <AdminNav active="/admin/abonnements" />
        <p className="xs dim">
          Le statut est synchronisé automatiquement par les webhooks Stripe (paiement confirmé,
          renouvellement, échec, résiliation).
        </p>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Formule</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Début</th>
                <th>Expiration</th>
                <th>Statut</th>
                <th>Référence Stripe</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.email ?? row.name ?? '—'}</td>
                  <td>{VIP_LABELS[row.vip_type] ?? row.vip_type}</td>
                  <td>{row.plan === 'monthly' ? 'Mensuel' : 'À vie'}</td>
                  <td>{euros(row.amount)}</td>
                  <td>{frenchDate(row.start_date)}</td>
                  <td>{row.plan === 'lifetime' ? '—' : frenchDate(row.end_date)}</td>
                  <td>{STATUS_LABELS[row.status] ?? row.status}</td>
                  <td className="dim">
                    {row.stripe_subscription_id ?? row.stripe_session_id ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
