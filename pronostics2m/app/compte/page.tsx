import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { activeSubscriptions, listSubscriptions, VIP_LABELS, VIP_SLUGS, VIP_TYPES } from '@/lib/access';
import { OFFERS, offerByVipType } from '@/lib/offers';
import { euros, frenchDate } from '@/lib/format';
import { computeStats, history } from '@/lib/predictions';
import { tryDb } from '@/lib/db';
import { MemberTabs } from '@/components/p2m/MemberTabs';
import { IconChart, IconLock, IconShield, IconBoot } from '@/components/icons';

export const dynamic = 'force-dynamic';

const marks = { safe: IconShield, premium: IconBoot, grosse_cote: IconChart } as const;

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ paiement?: string; erreur?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect('/connexion');

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

  const all = await listSubscriptions(user.id);
  const active = await activeSubscriptions(user.id);
  const activeTypes = active.map((sub) => sub.vip_type);
  const main = active[0];
  const stats = activeTypes.length
    ? computeStats(await history({ vipTypes: activeTypes, limit: 200 }))
    : null;

  return (
    <>
      <section style={{ padding: '20px 0 18px', background: 'linear-gradient(160deg, #12351f 0%, #05100a 100%)', borderBottom: '1px solid rgba(240,197,60,0.16)' }}>
        <div className="wrap stack gap-14">
          <div className="between">
            <div>
              <span className="small" style={{ color: 'var(--muted-2)' }}>
                Bonjour
              </span>
              <h1 className="disp" style={{ fontSize: 30, lineHeight: 1.1, textTransform: 'uppercase' }}>
                {user.name}
              </h1>
            </div>
            <form method="post" action="/api/auth/logout">
              <button type="submit" className="btn-ghost btn-sm">
                Déconnexion
              </button>
            </form>
          </div>

          {params.paiement === 'succes' ? (
            <div className="notice notice-ok">
              Paiement enregistré. Votre accès s’active dès que Stripe confirme la transaction —
              rechargez cette page dans quelques secondes si l’espace est encore verrouillé.
            </div>
          ) : null}
          {params.erreur ? (
            <div className="notice notice-error">{decodeURIComponent(params.erreur)}</div>
          ) : null}

          <div className="card-flat" style={{ background: 'rgba(0,0,0,0.35)', borderColor: 'rgba(240,197,60,0.28)' }}>
            <div className="between">
              <span className="xs" style={{ letterSpacing: '0.14em', color: 'var(--muted-2)' }}>
                VOTRE ABONNEMENT
              </span>
              {main ? (
                <span className="badge badge-green">ACTIF</span>
              ) : (
                <span className="badge badge-grey">AUCUN</span>
              )}
            </div>
            <div className="disp gold mt-8" style={{ fontSize: 28, lineHeight: 1.1 }}>
              {main
                ? `${VIP_LABELS[main.vip_type].toUpperCase()} · ${main.plan === 'monthly' ? 'MENSUEL' : 'À VIE'}`
                : 'PAS ENCORE D’ACCÈS VIP'}
            </div>
            <div className="between small muted mt-12">
              <span>
                {main
                  ? main.plan === 'lifetime'
                    ? 'Accès à vie'
                    : `Renouvellement le ${frenchDate(main.end_date)}`
                  : 'Choisissez une formule pour ouvrir votre espace'}
              </span>
              {main ? (
                <form method="post" action="/api/portail">
                  <button type="submit" className="gold" style={{ background: 'none', border: 0, fontWeight: 700, cursor: 'pointer' }}>
                    Gérer
                  </button>
                </form>
              ) : (
                <a href="/vip">Voir les VIP</a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap stack gap-14">
          <h2 className="disp" style={{ fontSize: 22 }}>
            VOS ESPACES
          </h2>

          <div className="stack gap-12">
            {VIP_TYPES.map((type) => {
              const Mark = marks[type];
              const unlocked = activeTypes.includes(type) || user.role === 'admin';
              const offer = offerByVipType(type);
              return (
                <div key={type} className={`vip-row ${unlocked ? 'on' : ''}`}>
                  <span className="vip-icon">
                    {unlocked ? <Mark size={20} color="#f0c53c" /> : <IconLock size={19} color="#5d7568" />}
                  </span>
                  <div className="grow">
                    <div className="disp" style={{ fontSize: 20, lineHeight: 1.15, color: unlocked ? '#fff' : 'var(--muted-2)' }}>
                      {VIP_LABELS[type].toUpperCase()}
                    </div>
                    <p className="small mt-8" style={{ color: unlocked ? 'var(--green)' : 'var(--dim)' }}>
                      {unlocked ? 'Accès ouvert' : `Débloquer · ${euros(offer.monthly)} / mois`}
                    </p>
                  </div>
                  {unlocked ? (
                    <a href={`/vip/${VIP_SLUGS[type]}`} className="btn btn-sm">
                      Ouvrir
                    </a>
                  ) : (
                    <a href={`/vip#${offer.slug}`} className="btn-line btn-sm">
                      Débloquer
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {stats ? (
            <>
              <h2 className="disp mt-16" style={{ fontSize: 22 }}>
                VOS RÉSULTATS
              </h2>
              <div className="grid-3">
                <div className="tile">
                  <b>{stats.total}</b>
                  <span>Pronostics</span>
                </div>
                <div className="tile" style={{ background: 'rgba(63,217,127,0.08)', borderColor: 'rgba(63,217,127,0.25)' }}>
                  <b style={{ color: 'var(--green)' }}>{stats.won}</b>
                  <span>Gagnés</span>
                </div>
                <div className="tile" style={{ background: 'rgba(240,197,60,0.08)', borderColor: 'rgba(240,197,60,0.25)' }}>
                  <b className="gold">
                    {stats.successRate === null ? '—' : `${stats.successRate.toFixed(0)}%`}
                  </b>
                  <span>Réussite</span>
                </div>
              </div>
              <p className="xs dim">
                Statistiques calculées automatiquement à partir des résultats enregistrés en base.
              </p>
            </>
          ) : (
            <div className="card-flat">
              <p className="small muted">
                Vos statistiques apparaîtront ici dès votre premier abonnement actif.
              </p>
              <a href="/vip" className="btn btn-block mt-16">
                Choisir un VIP
              </a>
            </div>
          )}

          {all.length > 0 ? (
            <>
              <h2 className="disp mt-16" style={{ fontSize: 22 }}>
                MES ABONNEMENTS
              </h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Formule</th>
                      <th>Type</th>
                      <th>Montant</th>
                      <th>Début</th>
                      <th>Expiration</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {all.map((sub) => (
                      <tr key={sub.id}>
                        <td>{VIP_LABELS[sub.vip_type]}</td>
                        <td>{sub.plan === 'monthly' ? 'Mensuel' : 'À vie'}</td>
                        <td>{euros(sub.amount)}</td>
                        <td>{frenchDate(sub.start_date)}</td>
                        <td>{sub.plan === 'lifetime' ? '—' : frenchDate(sub.end_date)}</td>
                        <td>{sub.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          {OFFERS.length && activeTypes.length < 3 ? (
            <a href="/vip" className="btn-line btn-block mt-8">
              Ajouter une autre formule
            </a>
          ) : null}
        </div>
      </section>

      <MemberTabs active="/compte" />
    </>
  );
}
