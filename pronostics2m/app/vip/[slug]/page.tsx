import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { requireVip, VIP_LABELS, VIP_SLUGS, vipTypeFromSlug } from '@/lib/access';
import { dailyPredictions, MULTI_TYPES, TYPE_LABELS } from '@/lib/predictions';
import { longFrenchDate } from '@/lib/format';
import { offerByVipType } from '@/lib/offers';
import { PredictionCard } from '@/components/p2m/Prediction';
import { MemberTabs } from '@/components/p2m/MemberTabs';
import { tryDb } from '@/lib/db';
import { IconLock } from '@/components/icons';

export const dynamic = 'force-dynamic';

/** Sections rendered for each VIP area, in order. */
const SECTIONS: Record<string, { type: string; title: string }[]> = {
  safe: [
    { type: 'safe', title: 'SAFE DU JOUR' },
    { type: 'montante', title: 'MONTANTE DU JOUR' },
  ],
  premium: [
    { type: 'buteur', title: 'BUTEURS DU JOUR' },
    { type: 'combine', title: 'COMBINÉ DU JOUR' },
  ],
  grosse_cote: [{ type: 'grosse_cote', title: 'GROSSE COTE DU JOUR' }],
};

export default async function VipAreaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { slug } = await params;
  const { date } = await searchParams;
  const vipType = vipTypeFromSlug(slug);
  if (!vipType) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?erreur=${encodeURIComponent('Connectez-vous pour accéder à votre espace VIP.')}`);

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

  // Server-side gate: changing the URL is not enough to see the content.
  const viewer = await requireVip(vipType);
  if (!viewer) {
    const offer = offerByVipType(vipType);
    return (
      <section className="section">
        <div className="wrap stack gap-14" style={{ maxWidth: 520 }}>
          <h1 className="disp page-title">{VIP_LABELS[vipType].toUpperCase()}</h1>
          <div className="card center stack gap-12">
            <span style={{ alignSelf: 'center' }}>
              <IconLock size={28} color="#f0c53c" />
            </span>
            <h2 className="disp" style={{ fontSize: 24 }}>
              ESPACE VERROUILLÉ
            </h2>
            <p className="small muted">
              Cet espace est réservé aux abonnés {VIP_LABELS[vipType]}. Votre accès s’ouvre
              automatiquement dès que le paiement est confirmé par Stripe.
            </p>
            <a href={`/vip#${offer.slug}`} className="btn btn-block mt-8">
              Débloquer {VIP_LABELS[vipType]}
            </a>
            <a href="/compte" className="small">
              Retour à mon espace
            </a>
          </div>
        </div>
        <MemberTabs active="/vip" />
      </section>
    );
  }

  const predictions = await dailyPredictions(vipType, date);
  const day = predictions[0]?.match_date ?? null;
  const sections = SECTIONS[vipType] ?? [];

  return (
    <>
      <section className="section">
        <div className="wrap stack gap-14">
          <div className="between">
            <h1 className="disp page-title">{VIP_LABELS[vipType].toUpperCase()}</h1>
            <span className="badge badge-green">ACTIF</span>
          </div>
          <p className="small" style={{ color: 'var(--muted-2)' }}>
            {day ? longFrenchDate(day) : 'Aucun pronostic publié pour le moment.'}
          </p>

          {predictions.length === 0 ? (
            <div className="card-flat">
              <p className="small muted">
                Les pronostics du jour ne sont pas encore publiés. Revenez un peu plus tard — ils
                apparaissent ici dès leur publication.
              </p>
            </div>
          ) : null}

          {sections.map((section) => {
            const rows = predictions.filter((row) => row.prediction_type === section.type);
            if (rows.length === 0) return null;
            return (
              <div key={section.type} className="stack gap-12">
                <h2 className="disp" style={{ fontSize: 24 }}>
                  {section.title}
                </h2>
                {rows.map((row) => (
                  <PredictionCard key={row.id} prediction={row} />
                ))}
              </div>
            );
          })}

          {/* Anything published in this area that is not covered by a named section. */}
          {(() => {
            const known = new Set(sections.map((section) => section.type));
            const extra = predictions.filter((row) => !known.has(row.prediction_type));
            if (extra.length === 0) return null;
            return (
              <div className="stack gap-12">
                <h2 className="disp" style={{ fontSize: 24 }}>
                  AUTRES PRONOSTICS
                </h2>
                {extra.map((row) => (
                  <div key={row.id} className="stack gap-8">
                    <span className="badge badge-grey" style={{ alignSelf: 'flex-start' }}>
                      {(TYPE_LABELS[row.prediction_type] ?? row.prediction_type).toUpperCase()}
                      {MULTI_TYPES.includes(row.prediction_type) ? ' · MULTI' : ''}
                    </span>
                    <PredictionCard prediction={row} />
                  </div>
                ))}
              </div>
            );
          })()}

          <div className="stack gap-10 mt-16">
            <a href={`/historique?vip=${VIP_SLUGS[vipType]}`} className="btn-line btn-block">
              Historique {VIP_LABELS[vipType]}
            </a>
            <a href="/compte" className="btn-ghost btn-block">
              Retour à mon espace
            </a>
          </div>
        </div>
      </section>
      <MemberTabs active="/vip" />
    </>
  );
}
