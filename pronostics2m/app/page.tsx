import { OFFERS } from '@/lib/offers';
import { euros } from '@/lib/format';
import { getCurrentUser } from '@/lib/auth';
import { IconCheck } from '@/components/icons';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <>
      <section className="hero">
        <div className="wrap stack gap-14">
          <span className="badge badge-green" style={{ alignSelf: 'flex-start' }}>
            <span className="dot-live" />
            PRONOS DU JOUR PUBLIÉS
          </span>

          <h1 className="disp">
            DES PRONOSTICS
            <br />
            SPORTIFS VIP,
            <br />
            <span className="gold">PUBLIÉS CHAQUE JOUR.</span>
          </h1>

          <p className="lead">
            Choisissez votre VIP et accédez à vos pronostics directement depuis votre espace
            personnel.
          </p>

          <div className="stack gap-10 mt-8 hero-actions">
            <a href="/vip" className="btn btn-block">
              Découvrir les VIP
            </a>
            <a href={user ? '/compte' : '/connexion'} className="btn-ghost btn-block">
              {user ? 'Mon espace' : 'Se connecter'}
            </a>
          </div>

          <div className="grid-3 mt-16">
            <div className="tile">
              <b className="gold">3</b>
              <span>Formules VIP</span>
            </div>
            <div className="tile">
              <b className="gold">7j/7</b>
              <span>Publication</span>
            </div>
            <div className="tile">
              <b className="gold">100%</b>
              <span>Résultats archivés</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap stack gap-14">
          <h2 className="disp section-title">CHOISISSEZ VOTRE VIP</h2>
          <p className="lead">
            Chaque formule ouvre son propre espace. L’accès est activé après confirmation réelle du
            paiement.
          </p>

          <div className="stack gap-12 mt-8 offer-teasers">
            {OFFERS.map((offer) => (
              <a
                key={offer.slug}
                href={`/vip#${offer.slug}`}
                className={`card ${offer.highlight ? 'card-gold' : ''}`}
                style={{ color: 'inherit', display: 'block' }}
              >
                <div className="between">
                  <span className="disp" style={{ fontSize: 22 }}>
                    {offer.name}
                  </span>
                  {offer.highlight ? (
                    <span className="badge badge-gold">LE PLUS PRIS</span>
                  ) : (
                    <span className="small" style={{ color: 'var(--muted-2)' }}>
                      {offer.tagline}
                    </span>
                  )}
                </div>
                <div className="row mt-12" style={{ alignItems: 'baseline', gap: 8 }}>
                  <span className="odds odds-lg">{euros(offer.monthly)}</span>
                  <span className="small muted">/ mois · {euros(offer.lifetime)} à vie</span>
                </div>
              </a>
            ))}
          </div>

          <div
            className="mt-16"
            style={{
              padding: 14,
              borderRadius: 14,
              border: '1px dashed rgba(255,255,255,0.12)',
              fontSize: 11,
              lineHeight: 1.5,
              color: 'var(--muted-2)',
            }}
          >
            Les paris sportifs comportent un risque de perte. Aucun résultat n’est garanti. Réservé
            aux personnes majeures.
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap stack gap-14">
          <h2 className="disp section-title">COMMENT ÇA MARCHE</h2>
          <div className="stack gap-12 steps-grid">
            {[
              ['1', 'Créez votre compte', 'Prénom ou pseudo, email, mot de passe. Deux minutes.'],
              ['2', 'Choisissez votre VIP', 'Mensuel ou à vie, paiement sécurisé par Stripe.'],
              [
                '3',
                'Votre espace se déverrouille',
                'Dès que Stripe confirme le paiement, l’espace VIP correspondant s’ouvre automatiquement.',
              ],
              [
                '4',
                'Vos pronostics chaque jour',
                'Publiés par l’équipe, avec analyse, cote et statut mis à jour après les matchs.',
              ],
            ].map(([step, title, body]) => (
              <div key={step} className="card-flat row" style={{ alignItems: 'flex-start' }}>
                <span className="leg-index">{step}</span>
                <div className="grow">
                  <b>{title}</b>
                  <p className="small muted mt-8">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="card card-gold stack gap-12 center">
            <h2 className="disp section-title">PRÊT À REJOINDRE LE CLUB ?</h2>
            <p className="lead">
              Un accès, un espace, des pronostics publiés chaque jour avec leur analyse.
            </p>
            <ul className="stack gap-10 mt-8" style={{ textAlign: 'left' }}>
              {['Analyse écrite pour chaque pronostic', 'Résultats archivés et vérifiables', 'Résiliation possible à tout moment'].map(
                (item) => (
                  <li key={item} className="row" style={{ alignItems: 'flex-start' }}>
                    <span style={{ marginTop: 3, flexShrink: 0 }}>
                      <IconCheck color="#f0c53c" />
                    </span>
                    <span className="small muted">{item}</span>
                  </li>
                ),
              )}
            </ul>
            <a href="/vip" className="btn btn-block mt-8">
              Rejoindre le VIP
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
