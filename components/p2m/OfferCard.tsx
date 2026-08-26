import { euros } from '@/lib/format';
import type { Offer } from '@/lib/offers';
import { IconBall, IconBoot, IconChart, IconCheck, IconShield } from '@/components/icons';

const marks = {
  safe: IconShield,
  premium: IconBoot,
  grosse_cote: IconChart,
} as const;

export function OfferCard({
  offer,
  plan,
  owned = false,
}: {
  offer: Offer;
  plan: 'monthly' | 'lifetime';
  owned?: boolean;
}) {
  const Mark = marks[offer.vipType] ?? IconBall;
  const price = plan === 'monthly' ? offer.monthly : offer.lifetime;
  const other =
    plan === 'monthly'
      ? `ou ${euros(offer.lifetime)} en paiement unique à vie`
      : `ou ${euros(offer.monthly)} par mois`;

  return (
    <div className={`card ${offer.highlight ? 'card-gold' : ''}`}>
      <div className="between">
        <div className="row">
          <Mark size={22} color={offer.highlight ? '#ffdc6b' : '#6fd39b'} />
          <h3 className="disp" style={{ fontSize: 24 }}>
            {offer.name}
          </h3>
        </div>
        {offer.highlight ? <span className="badge badge-gold">POPULAIRE</span> : null}
      </div>

      <div className="row mt-12" style={{ alignItems: 'baseline', gap: 8 }}>
        <span className="odds odds-lg" style={{ fontSize: 38 }}>
          {euros(price)}
        </span>
        <span className="small muted">{plan === 'monthly' ? '/ mois' : 'à vie'}</span>
      </div>
      <p className="small" style={{ color: 'var(--muted-2)', marginTop: 4 }}>
        {other}
      </p>

      <div className="rule" style={{ margin: '16px 0' }} />

      <ul className="stack gap-10">
        {offer.features.map((feature) => (
          <li key={feature} className="row" style={{ alignItems: 'flex-start', fontSize: 14 }}>
            <span style={{ marginTop: 3, flexShrink: 0 }}>
              <IconCheck color="#f0c53c" />
            </span>
            <span style={{ color: 'var(--muted)' }}>{feature}</span>
          </li>
        ))}
      </ul>

      {owned ? (
        <div className="notice notice-ok mt-16 center">Vous avez déjà cet accès</div>
      ) : (
        <form method="post" action="/2m/api/checkout" className="mt-16">
          <input type="hidden" name="slug" value={offer.slug} />
          <input type="hidden" name="plan" value={plan} />
          <button type="submit" className={offer.highlight ? 'btn btn-block' : 'btn-line btn-block'}>
            Choisir {offer.name.replace('VIP ', 'VIP ')}
          </button>
        </form>
      )}
    </div>
  );
}
