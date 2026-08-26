import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDb, tryDb } from '@/lib/db';
import { euros, frenchDate } from '@/lib/format';
import { MemberTabs } from '@/components/p2m/MemberTabs';

export const dynamic = 'force-dynamic';

type Payment = {
  id: number;
  amount: number;
  status: string;
  label: string | null;
  stripe_reference: string | null;
  created_at: string;
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erreur?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect('/2m/connexion');

  const db = await tryDb();
  let payments: Payment[] = [];
  if (db) {
    const handle = await getDb();
    const { results } = await handle
      .prepare('SELECT * FROM payments WHERE user_id = ?1 ORDER BY created_at DESC LIMIT 30')
      .bind(user.id)
      .all<Payment>();
    payments = results ?? [];
  }

  return (
    <>
      <section className="section">
        <div className="wrap stack gap-14" style={{ maxWidth: 520 }}>
          <h1 className="disp page-title">MON PROFIL</h1>

          {params.ok ? <div className="notice notice-ok">{decodeURIComponent(params.ok)}</div> : null}
          {params.erreur ? (
            <div className="notice notice-error">{decodeURIComponent(params.erreur)}</div>
          ) : null}

          <form method="post" action="/2m/api/compte/profil" className="card stack gap-14">
            <h2 className="disp" style={{ fontSize: 20 }}>
              MES INFORMATIONS
            </h2>
            <label className="field">
              <span>PRÉNOM OU PSEUDO</span>
              <input className="input" name="name" defaultValue={user.name} required maxLength={40} />
            </label>
            <label className="field">
              <span>EMAIL</span>
              <input className="input" type="email" name="email" defaultValue={user.email} required />
            </label>
            <button type="submit" className="btn btn-block">
              Enregistrer
            </button>
          </form>

          <form method="post" action="/2m/api/compte/mot-de-passe" className="card stack gap-14">
            <h2 className="disp" style={{ fontSize: 20 }}>
              CHANGER MON MOT DE PASSE
            </h2>
            <label className="field">
              <span>MOT DE PASSE ACTUEL</span>
              <input className="input" type="password" name="current" required autoComplete="current-password" />
            </label>
            <label className="field">
              <span>NOUVEAU MOT DE PASSE</span>
              <input className="input" type="password" name="password" required minLength={8} autoComplete="new-password" />
            </label>
            <label className="field">
              <span>CONFIRMATION</span>
              <input className="input" type="password" name="confirm" required minLength={8} autoComplete="new-password" />
            </label>
            <button type="submit" className="btn-line btn-block">
              Mettre à jour
            </button>
          </form>

          <div className="card stack gap-12">
            <h2 className="disp" style={{ fontSize: 20 }}>
              HISTORIQUE DE PAIEMENT
            </h2>
            {payments.length === 0 ? (
              <p className="small muted">Aucun paiement enregistré pour le moment.</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Libellé</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Référence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{frenchDate(payment.created_at)}</td>
                        <td>{payment.label ?? '—'}</td>
                        <td>{euros(payment.amount)}</td>
                        <td>{payment.status}</td>
                        <td className="dim">{payment.stripe_reference ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <form method="post" action="/2m/api/portail">
              <button type="submit" className="btn-ghost btn-block">
                Gérer / résilier mon abonnement (Stripe)
              </button>
            </form>
          </div>

          <form method="post" action="/2m/api/auth/logout">
            <button type="submit" className="btn-ghost btn-block">
              Déconnexion
            </button>
          </form>

          <Link href="/2m/compte" className="small center">
            Retour au tableau de bord
          </Link>
        </div>
      </section>
      <MemberTabs active="/2m/compte/profil" />
    </>
  );
}
