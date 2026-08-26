import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { tryDb } from '@/lib/db';
import { adminPredictions, STATUS_LABELS, TYPE_LABELS } from '@/lib/predictions';
import { VIP_LABELS } from '@/lib/access';
import { frenchDate, odds as fmtOdds } from '@/lib/format';
import { AdminNav } from '@/components/p2m/AdminNav';
import { StatusBadge } from '@/components/p2m/Prediction';
import { IconPlus } from '@/components/icons';

export const dynamic = 'force-dynamic';

export default async function AdminPredictions({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const db = await tryDb();
  const rows = db ? await adminPredictions(80) : [];

  return (
    <section className="section">
      <div className="wrap stack gap-14">
        <h1 className="disp page-title">PRONOSTICS</h1>
        <AdminNav active="/2m/admin/pronostics" />

        {params.ok ? <div className="notice notice-ok">{decodeURIComponent(params.ok)}</div> : null}
        {!db ? (
          <div className="notice notice-error">
            La base de données n’est pas encore branchée sur ce site.
          </div>
        ) : null}

        <Link href="/2m/admin/pronostics/nouveau" className="btn btn-block">
          <IconPlus size={20} color="#06170e" />
          Ajouter un pronostic
        </Link>

        <div className="stack gap-10">
          {rows.length === 0 && db ? (
            <div className="card-flat">
              <p className="small muted">Aucun pronostic enregistré pour le moment.</p>
            </div>
          ) : null}

          {rows.map((row) => (
            <Link
              key={row.id}
              href={`/2m/admin/pronostics/${row.id}`}
              className={`list-row ${row.status}`}
              style={{ display: 'block', color: 'inherit' }}
            >
              <div className="between">
                <span className="xs" style={{ color: 'var(--muted-2)' }}>
                  {frenchDate(row.match_date)} · {VIP_LABELS[row.vip_type]} ·{' '}
                  {TYPE_LABELS[row.prediction_type] ?? row.prediction_type}
                </span>
                <StatusBadge status={row.status} />
              </div>
              <b className="mt-8" style={{ display: 'block' }}>
                {row.match_label || `${row.legs.length} sélections`}
              </b>
              <div className="between mt-8">
                <span className="small muted">
                  {row.bet || STATUS_LABELS[row.status]}
                  {row.player ? ` · ${row.player}` : ''}
                </span>
                <span className="odds odds-sm">{fmtOdds(row.total_odds)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
