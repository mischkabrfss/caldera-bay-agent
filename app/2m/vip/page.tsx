import Link from 'next/link';
import { OFFERS } from '@/lib/offers';
import { OfferCard } from '@/components/p2m/OfferCard';
import { getCurrentUser } from '@/lib/auth';
import { grantedVipTypes } from '@/lib/access';
import { tryDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function VipPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; paiement?: string; erreur?: string }>;
}) {
  const params = await searchParams;
  const plan = params.plan === 'lifetime' ? 'lifetime' : 'monthly';
  const user = await getCurrentUser();
  const db = await tryDb();
  const owned = user && db ? await grantedVipTypes(user.id) : [];

  return (
    <section className="section">
      <div className="wrap stack gap-14">
        <h1 className="disp page-title">CHOISISSEZ VOTRE VIP</h1>
        <p className="lead">
          Paiement sécurisé par Stripe. L’accès VIP est activé uniquement après confirmation réelle
          du paiement.
        </p>

        {params.paiement === 'annule' ? (
          <div className="notice notice-info">Paiement annulé — aucun montant n’a été débité.</div>
        ) : null}
        {params.erreur ? (
          <div className="notice notice-error">{decodeURIComponent(params.erreur)}</div>
        ) : null}

        <div
          className="row"
          style={{
            padding: 5,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--line)',
            gap: 0,
          }}
        >
          <Link
            href="/2m/vip?plan=monthly"
            className={`chip grow ${plan === 'monthly' ? 'chip-on' : ''}`}
            style={{ justifyContent: 'center', border: 0 }}
          >
            Mensuel
          </Link>
          <Link
            href="/2m/vip?plan=lifetime"
            className={`chip grow ${plan === 'lifetime' ? 'chip-on' : ''}`}
            style={{ justifyContent: 'center', border: 0 }}
          >
            À vie
          </Link>
        </div>

        <div className="grid-cards mt-8">
          {OFFERS.map((offer) => (
            <div key={offer.slug} id={offer.slug}>
              <OfferCard offer={offer} plan={plan} owned={owned.includes(offer.vipType)} />
            </div>
          ))}
        </div>

        {!user ? (
          <p className="small center" style={{ color: 'var(--muted-2)' }}>
            Vous serez invité à créer votre compte avant le paiement.{' '}
            <Link href="/2m/connexion">J’ai déjà un compte</Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
