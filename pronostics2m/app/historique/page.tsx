import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { grantedVipTypes, VIP_LABELS, VIP_SLUGS, VIP_TYPES, vipTypeFromSlug } from '@/lib/access';
import { computeStats, history, STATUS_LABELS } from '@/lib/predictions';
import { frenchDate, odds as fmtOdds } from '@/lib/format';
import { tryDb } from '@/lib/db';
import { MemberTabs } from '@/components/p2m/MemberTabs';
import { StatusBadge } from '@/components/p2m/Prediction';

export const dynamic = 'force-dynamic';

const STATUS_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'won', label: 'Gagnés' },
  { value: 'lost', label: 'Perdus' },
  { value: 'void', label: 'Annulés' },
  { value: 'upcoming', label: 'À venir' },
];

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ vip?: string; statut?: string; mois?: string }>;
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

  const granted = user.role === 'admin' ? VIP_TYPES : await grantedVipTypes(user.id);
  const selected = params.vip ? vipTypeFromSlug(params.vip) : null;

  const rows = await history({
    vipTypes: granted,
    vipType: selected ?? undefined,
    status: params.statut,
    month: params.mois,
    limit: 150,
  });
  const stats = computeStats(rows);

  const query = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { vip: params.vip, statut: params.statut, mois: params.mois, ...patch };
    for (const [key, value] of Object.entries(merged)) if (value) next.set(key, value);
    const suffix = next.toString();
    return suffix ? `/historique?${suffix}` : '/historique';
  };

  return (
    <>
      <section className="section">
        <div className="wrap stack gap-14">
          <h1 className="disp page-title">HISTORIQUE DES PRONOSTICS</h1>

          {granted.length === 0 ? (
            <div className="card-flat">
              <p className="small muted">
                L’historique est réservé aux abonnés. Il reprend tous les pronostics publiés dans vos
                espaces, avec leur résultat.
              </p>
              <Link href="/vip" className="btn btn-block mt-16">
                Choisir un VIP
              </Link>
            </div>
          ) : (
            <>
              <div className="chips">
                <Link href={query({ vip: undefined })} className={`chip ${!selected ? 'chip-on' : ''}`}>
                  Tous mes VIP
                </Link>
                {granted.map((type) => (
                  <Link
                    key={type}
                    href={query({ vip: VIP_SLUGS[type] })}
                    className={`chip ${selected === type ? 'chip-on' : ''}`}
                  >
                    {VIP_LABELS[type]}
                  </Link>
                ))}
              </div>

              <div className="chips">
                {STATUS_FILTERS.map((filter) => (
                  <Link
                    key={filter.value || 'all'}
                    href={query({ statut: filter.value || undefined })}
                    className={`chip ${(params.statut ?? '') === filter.value ? 'chip-on' : ''}`}
                  >
                    {filter.label}
                  </Link>
                ))}
              </div>

              <form method="get" action="/historique" className="row gap-8">
                {params.vip ? <input type="hidden" name="vip" value={params.vip} /> : null}
                {params.statut ? <input type="hidden" name="statut" value={params.statut} /> : null}
                <input
                  className="input grow"
                  type="month"
                  name="mois"
                  defaultValue={params.mois ?? ''}
                  aria-label="Filtrer par mois"
                />
                <button type="submit" className="btn-line btn-sm" style={{ minHeight: 52 }}>
                  Filtrer
                </button>
              </form>

              <div className="card">
                <div className="grid-2">
                  <div>
                    <div className="xs" style={{ color: 'var(--muted-2)' }}>
                      Total pronostics
                    </div>
                    <div className="disp" style={{ fontSize: 30, lineHeight: 1.1 }}>
                      {stats.total}
                    </div>
                  </div>
                  <div>
                    <div className="xs" style={{ color: 'var(--muted-2)' }}>
                      Taux de réussite
                    </div>
                    <div className="disp gold" style={{ fontSize: 30, lineHeight: 1.1 }}>
                      {stats.successRate === null ? '—' : `${stats.successRate.toFixed(1)} %`}
                    </div>
                  </div>
                </div>

                {stats.won + stats.lost + stats.void > 0 ? (
                  <div className="bar-split mt-16">
                    <div
                      style={{
                        width: `${(stats.won / (stats.won + stats.lost + stats.void)) * 100}%`,
                        background: 'var(--green)',
                      }}
                    />
                    <div
                      style={{
                        width: `${(stats.lost / (stats.won + stats.lost + stats.void)) * 100}%`,
                        background: 'var(--red)',
                      }}
                    />
                    <div
                      style={{
                        width: `${(stats.void / (stats.won + stats.lost + stats.void)) * 100}%`,
                        background: 'var(--dim)',
                      }}
                    />
                  </div>
                ) : null}

                <div className="between small mt-12">
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>{stats.won} gagnés</span>
                  <span style={{ color: 'var(--red)', fontWeight: 700 }}>{stats.lost} perdus</span>
                  <span style={{ color: 'var(--muted-2)', fontWeight: 700 }}>{stats.void} annulés</span>
                </div>

                <div className="rule mt-16" />
                <div className="between mt-12">
                  <span className="small muted">Rendement (ROI) — mise fixe 1 u</span>
                  <span
                    className="disp"
                    style={{ fontSize: 22, color: (stats.roi ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}
                  >
                    {stats.roi === null ? '—' : `${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(1)} %`}
                  </span>
                </div>
                <p className="xs dim mt-8">
                  Calculé sur les {stats.won + stats.lost} pronostics dont le résultat est
                  enregistré. Les pronostics à venir et annulés sont exclus.
                </p>
              </div>

              <div className="stack gap-10">
                {rows.length === 0 ? (
                  <div className="card-flat">
                    <p className="small muted">Aucun pronostic ne correspond à ces filtres.</p>
                  </div>
                ) : null}
                {rows.map((row) => (
                  <div key={row.id} className={`list-row ${row.status}`}>
                    <div className="between">
                      <span className="xs" style={{ color: 'var(--muted-2)' }}>
                        {frenchDate(row.match_date)} · {VIP_LABELS[row.vip_type]}
                      </span>
                      <StatusBadge status={row.status} />
                    </div>
                    <b className="mt-8" style={{ display: 'block' }}>
                      {row.match_label || `${STATUS_LABELS[row.status]} — ${row.legs.length} sélections`}
                    </b>
                    <div className="between mt-8">
                      <span className="small muted">
                        {row.bet || `${row.legs.length} sélections`}
                        {row.player ? ` · ${row.player}` : ''}
                      </span>
                      <span className="odds odds-sm">{fmtOdds(row.total_odds)}</span>
                    </div>
                    {row.analysis ? (
                      <p className="xs muted mt-8" style={{ lineHeight: 1.5 }}>
                        {row.analysis}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      <MemberTabs active="/historique" />
    </>
  );
}
