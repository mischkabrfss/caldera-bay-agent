import Link from 'next/link';
import { CheckoutButton, PromoBar } from './SalesActions';
import styles from './vente.module.css';

export default function SalesPage() {
  return (
    <main className={styles.page}>
      <PromoBar />
      <nav className={styles.nav} aria-label="Navigation principale">
        <Link className={styles.brand} href="/vente" aria-label="Nexora, accueil">
          <span>N</span>
          NEXORA
        </Link>
        <a className={styles.navCta} href="#offre">Découvrir la formation</a>
      </nav>

      <section className={styles.hero}>
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>DIGITAL BUSINESS ACADEMY</p>
          <h1>Ta première vente digitale commence par un plan clair.</h1>
          <p className={styles.lead}>
            Apprends à trouver une idée rentable, créer ton produit, construire ta page de vente
            et attirer tes premiers clients — étape par étape, même si tu pars de zéro.
          </p>
          <div className={styles.actions}>
            <a className={styles.primary} href="#offre">Je construis mon business <b>→</b></a>
            <a className={styles.secondary} href="#programme">Voir le programme</a>
          </div>
          <p className={styles.reassurance}>3 parcours personnalisés · Coach Nexo intégré · Accès à vie</p>
        </div>

        <div className={styles.heroVisual} aria-label="Aperçu de l'offre NEXORA">
          <div className={styles.resultCard}>
            <small>RÉSULTAT DU CRÉATEUR</small>
            <strong>+12 000 €</strong>
            <span>de paiements encaissés</span>
            <em>Résultat personnel · ne garantit pas les résultats futurs</em>
          </div>
          <div className={styles.productMiniCard}>
            <div className={styles.productArt}><span>N</span><b>NEXORA</b><small>Digital Business Academy</small></div>
            <div><small>FORMATION COMPLÈTE</small><strong>34,99 €</strong><del>50 €</del></div>
          </div>
        </div>
      </section>

      <section id="programme" className={styles.previewBand}>
        <span>Une méthode simple.</span>
        <span>Des missions concrètes.</span>
        <span>Une progression guidée.</span>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>PAS BESOIN D&apos;ÊTRE EXPERT</p>
          <h2>Tu ne manques pas de motivation.<br />Tu manques d&apos;un chemin clair.</h2>
          <p>
            Entre les vidéos contradictoires, les outils compliqués et les promesses rapides,
            beaucoup commencent tout… et ne terminent rien. NEXORA transforme le digital en
            petites étapes simples, avec un résultat concret à chaque module.
          </p>
        </div>
        <div className={styles.beforeAfter}>
          <article>
            <span>AVANT</span>
            <ul>
              <li>Tu ne sais pas quelle idée choisir</li>
              <li>Tu crées sans savoir si quelqu&apos;un achètera</li>
              <li>Tu publies sans stratégie ni message clair</li>
              <li>Tu bloques sur la page de vente et le paiement</li>
            </ul>
          </article>
          <div className={styles.arrow} aria-hidden="true">→</div>
          <article className={styles.afterCard}>
            <span>AVEC NEXORA</span>
            <ul>
              <li>Une offre précise pour un vrai problème</li>
              <li>Un produit utile, simple et vendable</li>
              <li>Un compte professionnel qui inspire confiance</li>
              <li>Un système complet jusqu&apos;à ta première vente</li>
            </ul>
          </article>
        </div>
      </section>

      <section className={`${styles.section} ${styles.darkSection}`}>
        <div className={styles.centerIntro}>
          <p className={styles.eyebrow}>TON PARCOURS S&apos;ADAPTE À TON OBJECTIF</p>
          <h2>Une seule académie. Trois façons d&apos;avancer.</h2>
          <p>Le diagnostic de départ construit ton chemin selon ton temps, ton niveau et ton modèle.</p>
        </div>
        <div className={styles.paths}>
          <article>
            <div className={styles.pathIcon}>C</div>
            <p className={styles.pathMeta}>30 JOURS · CRÉATION</p>
            <h3>Creator Lab</h3>
            <p>Pars de ton idée et transforme-la en produit digital original, prêt à être vendu.</p>
            <ul><li>Validation de l&apos;idée</li><li>Création du produit</li><li>Marque et lancement</li></ul>
          </article>
          <article className={styles.featuredPath}>
            <span className={styles.pathBadge}>LE PLUS RAPIDE</span>
            <div className={styles.pathIcon}>M</div>
            <p className={styles.pathMeta}>7 JOURS · REVENTE</p>
            <h3>MRR Sprint</h3>
            <p>Personnalise une offre avec droits de revente et construis ton système commercial.</p>
            <ul><li>Positionnement rapide</li><li>Offre et bonus</li><li>Vente et livraison</li></ul>
          </article>
          <article>
            <div className={styles.pathIcon}>H</div>
            <p className={styles.pathMeta}>21 JOURS · HYBRIDE</p>
            <h3>Hybrid Empire</h3>
            <p>Combine une base prête à vendre avec tes propres ressources pour créer une offre unique.</p>
            <ul><li>Personnalisation</li><li>Écosystème de contenus</li><li>Montée en gamme</li></ul>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>DE ZÉRO À UN BUSINESS PRÊT À VENDRE</p>
          <h2>Tout ce que tu aurais aimé comprendre dès le premier jour.</h2>
        </div>
        <div className={styles.curriculum}>
          <article><span>01</span><div><small>FONDATIONS</small><h3>Trouver une idée qui répond à une vraie demande</h3><p>Niche, client idéal, problème urgent, recherche marché et validation avant de créer.</p></div></article>
          <article><span>02</span><div><small>OFFRE</small><h3>Créer un produit simple que les gens comprennent</h3><p>Transformation promise, format, contenu, valeur, prix et bonus utiles.</p></div></article>
          <article><span>03</span><div><small>VISIBILITÉ</small><h3>Construire un compte professionnel crédible</h3><p>Bio à copier, lien cliquable, contenus, lives, démonstrations et conversations privées.</p></div></article>
          <article><span>04</span><div><small>CONVERSION</small><h3>Présenter ton offre et convertir sans forcer</h3><p>Messages, objections, page de vente, appels à l&apos;action et suivi des prospects.</p></div></article>
          <article><span>05</span><div><small>LANCEMENT</small><h3>Encaisser, livrer et améliorer ton système</h3><p>Stripe, mise en ligne, livraison, suivi client, indicateurs et prochaines ventes.</p></div></article>
        </div>
      </section>

      <section className={`${styles.section} ${styles.experience}`}>
        <div className={styles.experienceCopy}>
          <p className={styles.eyebrow}>TU N&apos;ES JAMAIS LIVRÉ À TOI-MÊME</p>
          <h2>Lis moins. Comprends mieux. Passe à l&apos;action.</h2>
          <p>Chaque leçon transforme une notion en décision concrète. Tu avances dans l&apos;ordre, tu sauvegardes ta progression et tu peux revenir sur n&apos;importe quelle étape.</p>
          <div className={styles.featureList}>
            <div><b>01</b><span><strong>Leçon claire</strong><small>Des explications détaillées avec des exemples concrets.</small></span></div>
            <div><b>02</b><span><strong>Mission guidée</strong><small>Une action précise pour construire ton business.</small></span></div>
            <div><b>03</b><span><strong>Mini-quiz corrigé</strong><small>Une correction détaillée pour vérifier ce que tu as compris.</small></span></div>
            <div><b>04</b><span><strong>Modèles à copier</strong><small>Des scripts et structures prêts à personnaliser.</small></span></div>
          </div>
        </div>
        <div className={styles.lessonMock} aria-label="Aperçu d'une leçon Nexora">
          <div className={styles.mockTop}><span>MODULE 04 · OFFRE</span><i>68%</i></div>
          <p className={styles.mockKicker}>TRANSFORMATION CLIENT</p>
          <h3>Vends le résultat, pas le fichier.</h3>
          <p>Ton client n&apos;achète pas 47 pages. Il achète une façon plus simple d&apos;arriver à son objectif.</p>
          <div className={styles.exampleBox}><small>EXEMPLE NEXORA</small><b>“En 7 jours, construis une offre digitale claire et présente-la à tes premiers prospects.”</b></div>
          <button type="button">Bien vu, passe à ma mission <span>→</span></button>
        </div>
      </section>

      <section className={`${styles.section} ${styles.nexoSection}`}>
        <div className={styles.nexoOrb} aria-hidden="true"><span>N</span></div>
        <div>
          <p className={styles.eyebrow}>TON COACH INTÉGRÉ</p>
          <h2>Quand tu bloques, demande à Nexo.</h2>
          <p>Nexo connaît le contenu de la formation et t&apos;aide à reformuler une offre, préparer une bio, trouver un angle de contenu, comprendre une leçon ou décider de ta prochaine action.</p>
          <div className={styles.chatSample}>
            <p><b>Toi</b> Je ne sais pas quoi écrire dans ma bio Instagram.</p>
            <p><b>Nexo</b> Commence par dire qui tu aides, quel résultat tu proposes et quoi faire ensuite. Par exemple : “J&apos;aide les débutants à lancer leur premier produit digital · Conseils simples chaque jour · Découvre la méthode ↓”</p>
          </div>
        </div>
      </section>

      <section className={styles.resaleSection}>
        <div>
          <p className={styles.eyebrow}>UNE FORMATION QUI PEUT AUSSI DEVENIR TON OFFRE</p>
          <h2>Tu peux la revendre et conserver 100% de tes ventes.</h2>
          <p>NEXORA inclut des droits de revente MRR. Tu apprends d&apos;abord à maîtriser le système, puis tu peux personnaliser ton positionnement, créer ta page de vente et proposer la formation à ton audience selon les conditions de la licence remise avec le produit.</p>
        </div>
        <div className={styles.licenseCard}>
          <span>LICENCE MRR INCLUSE</span>
          <strong>100%</strong>
          <p>des revenus de tes ventes conservés</p>
          <small>Après les frais éventuels de paiement et selon les conditions de licence.</small>
        </div>
      </section>

      <section id="offre" className={`${styles.section} ${styles.offerSection}`}>
        <div className={styles.centerIntro}>
          <p className={styles.eyebrow}>TON POINT DE DÉPART</p>
          <h2>Tout le système NEXORA dans un seul accès.</h2>
        </div>
        <div className={styles.offerCard}>
          <div className={styles.offerMain}>
            <p className={styles.pathMeta}>NEXORA DIGITAL BUSINESS ACADEMY</p>
            <h3>Construis ton offre. Lance-la. Fais ta première vente.</h3>
            <ul>
              <li>Les 3 parcours personnalisés</li>
              <li>Les leçons, missions et quiz corrigés</li>
              <li>Les modèles et scripts prêts à copier</li>
              <li>Le coach Nexo disponible dans la formation</li>
              <li>Les droits de revente MRR</li>
              <li>Les futures mises à jour de la formation</li>
            </ul>
          </div>
          <div className={styles.offerCheckout}>
            <span className={styles.launchTag}>OFFRE DE LANCEMENT</span>
            <div className={styles.priceLine}><strong>34,99 €</strong><del>50 €</del></div>
            <p className={styles.priceNote}>Prix valable jusqu&apos;au 29 août 2026 à 23 h 59, puis passage automatique à 50 €.</p>
            <CheckoutButton />
            <div className={styles.paymentMethods} aria-label="Moyens de paiement gérés par Stripe">
              <span>Carte</span><span>Apple Pay</span><span>Google Pay</span><span>Link</span>
            </div>
            <p className={styles.secureNote}>Paiement sécurisé par Stripe · Les moyens affichés dépendent du pays et de l&apos;appareil.</p>
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.centerIntro}>
          <p className={styles.eyebrow}>QUESTIONS FRÉQUENTES</p>
          <h2>Tout ce qu&apos;il faut savoir avant de commencer.</h2>
        </div>
        <div className={styles.faqs}>
          <details><summary>Est-ce adapté si je pars complètement de zéro ?</summary><p>Oui. Le diagnostic et l&apos;introduction t&apos;orientent, puis chaque notion est expliquée avec des exemples avant de te demander d&apos;agir.</p></details>
          <details><summary>Dois-je obligatoirement créer mon propre produit ?</summary><p>Non. Tu peux choisir le parcours création, le parcours revente MRR ou le parcours hybride selon ton objectif.</p></details>
          <details><summary>Combien de temps dois-je prévoir ?</summary><p>Le rythme dépend du parcours choisi. Les missions sont conçues pour être réalisées en sessions courtes et régulières.</p></details>
          <details><summary>Ai-je le droit de revendre la formation ?</summary><p>Oui, selon les conditions précises de la licence MRR fournie avec ton achat. Elle explique ce que tu peux modifier, revendre et transmettre.</p></details>
          <details><summary>Nexo remplace-t-il un expert fiscal ou juridique ?</summary><p>Non. Nexo peut t&apos;aider à comprendre les principes et à préparer tes questions, mais les décisions fiscales et juridiques importantes doivent être validées avec un professionnel de ton pays.</p></details>
          <details><summary>Comment vais-je recevoir l&apos;accès ?</summary><p>Après la mise en place du paiement, l&apos;accès sera transmis automatiquement avec les instructions pour commencer ton diagnostic.</p></details>
        </div>
      </section>

      <section id="contact" className={styles.finalCta}>
        <p className={styles.eyebrow}>PRÊT À ARRÊTER DE TOURNER EN ROND ?</p>
        <h2>Ton idée mérite mieux qu&apos;un dossier oublié.</h2>
        <p>Transforme-la en une offre claire, présentable et prête à vendre.</p>
        <CheckoutButton compact />
      </section>

      <footer className={styles.footer}>
        <Link className={styles.brand} href="/vente"><span>N</span>NEXORA</Link>
        <p>Digital Business Academy · Une méthode claire pour construire et vendre.</p>
        <small>© 2026 NEXORA. Tous droits réservés.</small>
      </footer>
    </main>
  );
}
