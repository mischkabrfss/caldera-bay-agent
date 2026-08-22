import Link from 'next/link';
import { CheckoutButton, PromoBar } from './SalesActions';
import styles from './vente.module.css';

export default function SalesPage() {
  return (
    <main className={styles.page}>
      <PromoBar />
      <nav className={styles.nav} aria-label="Navigation principale">
        <Link className={styles.brand} href="/vente" aria-label="Nexora, accueil"><span>N</span>NEXORA</Link>
        <a className={styles.navCta} href="#offre">Accéder à la formation</a>
      </nav>

      <section className={styles.hero}>
        <div className={styles.aurora} aria-hidden="true" />
        <div className={styles.paymentProof}>
          <div className={styles.proofTop}>
            <span className={styles.proofLogo}>S</span>
            <div><b>Paiements encaissés</b><small>Résultat personnel du créateur</small></div>
            <em>Vérifié sur le dashboard de paiement</em>
          </div>
          <div className={styles.proofAmount}>
            <span>Total encaissé</span><strong>+12 000 €</strong>
            <small>Ce résultat ne garantit pas les résultats futurs.</small>
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>NEXORA DIGITAL BUSINESS ACADEMY</p>
            <h1>Construis ton offre.<br />Lance-la. <span>Vends-la.</span></h1>
            <p className={styles.lead}>Une formation guidée pour trouver une idée, créer un produit digital, attirer tes premiers prospects et mettre en place un système de vente complet.</p>
            <div className={styles.heroActions}>
              <a className={styles.primary} href="#offre">Commencer pour 34,99 € <b>→</b></a>
              <a className={styles.secondary} href="#contenu">Voir ce qui est inclus</a>
            </div>
            <p className={styles.reassurance}>Accès à vie · 3 parcours · Coach Nexo · Licence MRR</p>
          </div>
          <a className={styles.nexoraProduct} href="#offre" aria-label="Voir l'offre NEXORA">
            <div className={styles.orbitOne} /><div className={styles.orbitTwo} />
            <div className={styles.nexoCore}><span>N</span><b>NEXORA</b><small>CLIQUER POUR ACCÉDER</small></div>
            <div className={styles.floatLabel}>FORMATION COMPLÈTE</div>
          </a>
        </div>
      </section>

      <section className={styles.trustBand}>
        <span>✓ Débutant accepté</span><span>✓ Progression sauvegardée</span><span>✓ Missions et quiz</span><span>✓ Droits de revente inclus</span>
      </section>

      <section id="contenu" className={styles.contentSection}>
        <div className={styles.sectionTitle}><p className={styles.eyebrow}>UN PLAN SIMPLE, PAS 200 VIDÉOS À REGARDER</p><h2>Tout ce qu’il te faut pour passer de zéro à une offre prête à vendre.</h2></div>
        <div className={styles.steps}>
          <article><b>01</b><span><small>TROUVER</small><strong>Une idée demandée</strong><p>Niche, client, problème et validation.</p></span></article>
          <article><b>02</b><span><small>CRÉER</small><strong>Une offre claire</strong><p>Produit, promesse, contenu, prix et bonus.</p></span></article>
          <article><b>03</b><span><small>ATTIRER</small><strong>Des prospects qualifiés</strong><p>Compte pro, bio, contenus, lives et messages.</p></span></article>
          <article><b>04</b><span><small>VENDRE</small><strong>Un système complet</strong><p>Page de vente, Stripe, objections et livraison.</p></span></article>
        </div>
      </section>

      <section className={styles.nexoStrip}>
        <div className={styles.nexoPulse} aria-hidden="true"><span>N</span></div>
        <div><p className={styles.eyebrow}>TON COACH DANS LA FORMATION</p><h2>Tu bloques ? Demande à Nexo.</h2><p>Nexo t’aide à comprendre une leçon, reformuler ton offre, écrire ta bio, préparer un contenu ou choisir ta prochaine action.</p></div>
        <a href="#offre">Découvrir Nexo <span>→</span></a>
      </section>

      <section id="offre" className={styles.offerSection}>
        <div className={styles.offerCard}>
          <div className={styles.offerVisual}><div className={styles.coverMark}>N</div><h3>NEXORA</h3><p>Digital Business Academy</p><span>CRÉER · VENDRE · GRANDIR</span></div>
          <div className={styles.offerDetails}>
            <p className={styles.eyebrow}>OFFRE DE LANCEMENT</p><h2>L’académie complète.</h2>
            <ul><li>3 programmes adaptés à ton objectif</li><li>Leçons, missions, quiz et modèles</li><li>Coach Nexo intégré</li><li>Licence de revente MRR incluse</li><li>Accès à vie et futures mises à jour</li><li>Confirmation Stripe puis accès par e-mail</li></ul>
          </div>
          <div className={styles.offerCheckout}>
            <span className={styles.launchTag}>JUSQU’AU 29 AOÛT</span>
            <div className={styles.priceLine}><strong>34,99 €</strong><del>50 €</del></div>
            <p className={styles.priceNote}>Paiement unique. Le tarif passera automatiquement à 50 € à la fin du compte à rebours.</p>
            <CheckoutButton />
            <div className={styles.paymentMethods} aria-label="Moyens de paiement gérés par Stripe"><span>Carte</span><span>Apple Pay</span><span>Google Pay</span><span>Link</span></div>
            <p className={styles.secureNote}>Paiement hébergé et sécurisé par Stripe. Les moyens disponibles varient selon le pays et l’appareil.</p>
          </div>
        </div>
      </section>

      <section className={styles.mrrSection}>
        <strong>100%</strong><div><p className={styles.eyebrow}>DROITS DE REVENTE MRR</p><h2>Apprends avec NEXORA, puis fais-en ta propre offre.</h2><p>Tu peux revendre la formation et conserver les revenus de tes ventes, après les frais de paiement et selon la licence fournie.</p></div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.sectionTitle}><p className={styles.eyebrow}>QUESTIONS FRÉQUENTES</p><h2>L’essentiel avant de commencer.</h2></div>
        <div className={styles.faqs}>
          <details><summary>Est-ce adapté si je pars de zéro ?</summary><p>Oui. Le diagnostic choisit ton parcours et chaque étape est expliquée avec un exemple avant la mission.</p></details>
          <details><summary>Comment vais-je recevoir la formation ?</summary><p>Après le paiement, Stripe confirme la commande et l’accès est envoyé à l’adresse e-mail utilisée pendant le paiement.</p></details>
          <details><summary>Quels paiements sont acceptés ?</summary><p>Stripe affiche automatiquement les moyens éligibles : carte, Apple Pay, Google Pay, Link et d’autres options selon le pays.</p></details>
          <details><summary>Puis-je vraiment revendre NEXORA ?</summary><p>Oui, dans les limites exactes de la licence MRR remise avec la formation.</p></details>
        </div>
      </section>

      <footer className={styles.footer}><Link className={styles.brand} href="/vente"><span>N</span>NEXORA</Link><p>Digital Business Academy</p><small>© 2026 NEXORA.</small></footer>
    </main>
  );
}
