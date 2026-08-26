import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { getDb, tryDb } from '@/lib/db';
import { euros, frenchDate } from '@/lib/format';
import { adminPredictions, computeStats } from '@/lib/predictions';
import { VIP_LABELS } from '@/lib/access';
import { AdminNav } from '@/components/p2m/AdminNav';
import { IconPlus } from '@/components/icons';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
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
  const users = await handle.prepare('SELECT COUNT(*) AS n FROM users').first<{ n: number }>();
  const active = await handle
    .prepare(
      `SELECT COUNT(*) AS n FROM subscriptions
       WHERE status = 'active' AND (plan = 'lifetime' OR end_date IS NULL OR end_date > datetime('now'))`,
    )
    .first<{ n: number }>();
  const expired = await handle
    .prepare(
      `SELECT COUNT(*) AS n FROM subscriptions
       WHERE status IN ('expired', 'cancelled', 'payment_failed')
          OR (status = 'active' AND plan = 'monthly' AND end_date IS NOT NULL AND end_date <= datetime('now'))`,
    )
    .first<{ n: number }>();
  const revenue = await handle
    .prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'paid'")
    .first<{ total: number }>();
  const monthRevenue = await handle
    .prepare(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'paid' AND created_at >= datetime('now', 'start of month')",
    )
    .first<{ total: number }>();
  const { results: lastPayments } = await handle
    .prepare(
      `SELECT p.id, p.amount, p.status, p.label, p.stripe_reference, p.created_at, u.email
       FROM payments p LEFT JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC LIMIT 8`,
    )
    .all<{
      id: number;
      amount: number;
      status: string;
      label: string | null;
      stripe_reference: string | null;
      created_at: string;
      email: string | null;
    }>();

  const predictions = await adminPredictions(300);
  const published = predictions.filter((row) => row.status !== 'draft');
  const drafts = predictions.filter((row) => row.status === 'draft');
  const today = new Date().toISOString().slice(0, 10);
  const stats = computeStats(published);

  return (
    <section className="section">
      <div className="wrap stack gap-14">
        <div className="between">
          <h1 className="disp page-title">ADMINISTRATION</h1>
          <span className="badge badge-gold">ADMIN</span>
        </div>

        <AdminNav active="/admin" />

        <div className="grid-4">
          <div className="card-flat">
            <span className="xs" style={{ color: 'var(--muted-2)' }}>
              Utilisateurs
            </span>
            <div className="disp" style={{ fontSize: 30, lineHeight: 1.15 }}>
              {users?.n ?? 0}
            </div>
          </div>
          <div className="card-flat" style={{ background: 'rgba(63,217,127,0.07)', borderColor: 'rgba(63,217,127,0.25)' }}>
            <span className="xs" style={{ color: 'var(--muted-2)' }}>
              Abonnements actifs
            </span>
            <div className="disp" style={{ fontSize: 30, lineHeight: 1.15, color: 'var(--green)' }}>
              {active?.n ?? 0}
            </div>
          </div>
          <div className="card-flat">
            <span className="xs" style={{ color: 'var(--muted-2)' }}>
              Expirés / annulés
            </span>
            <div className="disp" style={{ fontSize: 30, lineHeight: 1.15, color: 'var(--muted)' }}>
              {expired?.n ?? 0}
            </div>
          </div>
          <div className="card-flat" style={{ background: 'rgba(240,197,60,0.09)', borderColor: 'rgba(240,197,60,0.3)' }}>
            <span className="xs" style={{ color: 'var(--muted-2)' }}>
              CA du mois
            </span>
            <div className="disp gold" style={{ fontSize: 30, lineHeight: 1.15 }}>
              {euros(monthRevenue?.total ?? 0)}
            </div>
          </div>
        </div>

        <p className="xs dim">Chiffre d’affaires total encaissé : {euros(revenue?.total ?? 0)}.</p>

        <Link href="/admin/pronostics/nouveau" className="btn btn-block">
          <IconPlus size={20} color="#06170e" />
          Ajouter un pronostic
        </Link>

        <h2 className="disp mt-16" style={{ fontSize: 20 }}>
          PRONOSTICS PUBLIÉS
        </h2>
        <div className="grid-3">
          <div className="tile">
            <b>{published.filter((row) => row.match_date === today).length}</b>
            <span>Aujourd’hui</span>
          </div>
          <div className="tile">
            <b>{published.length}</b>
            <span>Total publiés</span>
          </div>
          <div className="tile" style={{ background: 'rgba(240,197,60,0.08)', borderColor: 'rgba(240,197,60,0.25)' }}>
            <b className="gold">{drafts.length}</b>
            <span>Brouillons</span>
          </div>
        </div>

        <div className="grid-3">
          <div className="tile">
            <b style={{ color: 'var(--green)' }}>{stats.won}</b>
            <span>Gagnés</span>
          </div>
          <div className="tile">
            <b style={{ color: 'var(--red)' }}>{stats.lost}</b>
            <span>Perdus</span>
          </div>
          <div className="tile">
            <b className="gold">
              {stats.successRate === null ? '—' : `${stats.successRate.toFixed(0)}%`}
            </b>
            <span>Réussite</span>
          </div>
        </div>

        <h2 className="disp mt-16" style={{ fontSize: 20 }}>
          DERNIERS PAIEMENTS
        </h2>
        {(lastPayments ?? []).length === 0 ? (
          <div className="card-flat">
            <p className="small muted">Aucun paiement enregistré pour le moment.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Libellé</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Référence Stripe</th>
                </tr>
              </thead>
              <tbody>
                {(lastPayments ?? []).map((payment) => (
                  <tr key={payment.id}>
                    <td>{frenchDate(payment.created_at)}</td>
                    <td>{payment.email ?? '—'}</td>
                    <td>{payment.label ? VIP_LABELS[payment.label.split(' · ')[0] as 'safe'] ?? payment.label : '—'}</td>
                    <td>{euros(payment.amount)}</td>
                    <td>{payment.status === 'paid' ? 'Payé' : payment.status}</td>
                    <td className="dim">{payment.stripe_reference ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
