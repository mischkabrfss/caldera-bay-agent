import { odds as fmtOdds, longFrenchDate } from '@/lib/format';
import { MULTI_TYPES, STATUS_LABELS, type PredictionWithLegs } from '@/lib/predictions';
import { IconBall } from '@/components/icons';

export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status;
  if (status === 'won') return <span className="badge badge-green">{label.toUpperCase()}</span>;
  if (status === 'lost') return <span className="badge badge-red">{label.toUpperCase()}</span>;
  if (status === 'upcoming') return <span className="badge badge-gold">{label.toUpperCase()}</span>;
  return <span className="badge badge-grey">{label.toUpperCase()}</span>;
}

function Confidence({ level }: { level: number }) {
  return (
    <div>
      <div className="between xs" style={{ color: 'var(--muted-2)' }}>
        <span>Niveau de confiance</span>
        <b style={{ color: 'var(--muted)' }}>{level} / 5</b>
      </div>
      <div className="confidence">
        {[1, 2, 3, 4, 5].map((step) => (
          <i key={step} className={step <= level ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
}

export function PredictionCard({ prediction }: { prediction: PredictionWithLegs }) {
  const multi = MULTI_TYPES.includes(prediction.prediction_type);

  return (
    <article className="card card-gold">
      <div className="between">
        <div className="row xs" style={{ color: 'var(--muted-2)' }}>
          <IconBall size={14} color="#7f9b8a" />
          <span>
            {prediction.sport}
            {prediction.competition ? ` · ${prediction.competition}` : ''}
          </span>
        </div>
        {prediction.kick_off ? (
          <b className="small" style={{ color: 'var(--muted)' }}>
            {prediction.kick_off}
          </b>
        ) : null}
      </div>

      {prediction.match_label ? (
        <h3 className="disp mt-12" style={{ fontSize: 27, lineHeight: 1.05 }}>
          {prediction.match_label}
        </h3>
      ) : null}

      {prediction.player ? (
        <p className="mt-8" style={{ fontWeight: 700 }}>
          {prediction.player}
        </p>
      ) : null}

      {multi ? (
        <div className="mt-16" style={{ borderRadius: 16, border: '1px solid var(--line)' }}>
          {prediction.legs.map((leg, index) => (
            <div key={leg.id} className="leg">
              <span className={`leg-index ${leg.status}`}>{index + 1}</span>
              <div className="grow">
                <b style={{ fontSize: 14 }}>{leg.match_label}</b>
                <p className="small muted mt-8">{leg.bet}</p>
                <div className="row mt-8">
                  <span className="small" style={{ color: 'var(--muted-2)' }}>
                    Cote <b className="odds odds-sm">{fmtOdds(leg.odds)}</b>
                  </span>
                  <StatusBadge status={leg.status} />
                </div>
              </div>
            </div>
          ))}
          <div className="total-odds" style={{ margin: 6 }}>
            <span className="small" style={{ letterSpacing: '0.08em', fontWeight: 700 }}>
              {prediction.prediction_type === 'montante' ? 'COTE CUMULÉE' : 'COTE TOTALE'}
            </span>
            <span className="odds odds-lg">{fmtOdds(prediction.total_odds)}</span>
          </div>
        </div>
      ) : (
        <div className="card-flat between mt-16">
          <div>
            <div className="xs" style={{ color: 'var(--muted-2)', letterSpacing: '0.12em' }}>
              PARI
            </div>
            <b className="mt-8" style={{ display: 'block', fontSize: 15 }}>
              {prediction.bet}
            </b>
          </div>
          <div className="right">
            <div className="xs" style={{ color: 'var(--muted-2)', letterSpacing: '0.12em' }}>
              COTE
            </div>
            <div className="odds odds-lg">{fmtOdds(prediction.odds)}</div>
          </div>
        </div>
      )}

      {!multi ? (
        <div className="mt-16">
          <Confidence level={prediction.confidence} />
        </div>
      ) : null}

      {prediction.analysis ? (
        <p className="mt-16" style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--muted)' }}>
          <b className="gold">Analyse — </b>
          {prediction.analysis}
        </p>
      ) : null}

      <div className="row mt-16">
        <StatusBadge status={prediction.status} />
        <span className="xs" style={{ color: 'var(--muted-2)' }}>
          {longFrenchDate(prediction.match_date)}
        </span>
      </div>
    </article>
  );
}

export function LockedPreview({
  title,
  message,
  href,
}: {
  title: string;
  message: string;
  href: string;
}) {
  return (
    <div className="locked">
      <div className="locked-inner card">
        <div className="between">
          <span className="disp" style={{ fontSize: 22 }}>
            MATCH — MATCH
          </span>
          <span className="odds odds-md">0.00</span>
        </div>
        <p className="muted mt-12">Sélection réservée aux abonnés.</p>
        <div className="card-flat mt-16" style={{ height: 90 }} />
      </div>
      <div className="locked-veil">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f0c53c" strokeWidth="1.7" strokeLinecap="round">
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 018 0v3" />
        </svg>
        <b className="disp" style={{ fontSize: 22 }}>
          {title}
        </b>
        <p className="small muted" style={{ maxWidth: 320 }}>
          {message}
        </p>
        <a href={href} className="btn btn-sm">
          Débloquer l’accès
        </a>
      </div>
    </div>
  );
}
