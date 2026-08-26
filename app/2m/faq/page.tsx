import Link from 'next/link';

const QUESTIONS = [
  [
    'Comment se passe l’accès après le paiement ?',
    'Dès que Stripe confirme réellement le paiement, l’espace VIP correspondant se déverrouille automatiquement sur votre compte. Aucun accès n’est ouvert sur simple clic sur le bouton de paiement.',
  ],
  [
    'À quelle heure les pronostics sont-ils publiés ?',
    'Ils sont publiés chaque jour par l’équipe, généralement en matinée, et mis à jour après les matchs avec leur résultat (gagné, perdu, annulé).',
  ],
  [
    'Puis-je cumuler plusieurs VIP ?',
    'Oui. Chaque formule est indépendante : si vous êtes abonné à plusieurs VIP, tous les espaces correspondants apparaissent dans votre compte.',
  ],
  [
    'Quelle différence entre mensuel et à vie ?',
    'Le mensuel est un abonnement Stripe renouvelé automatiquement chaque mois, résiliable à tout moment. La formule à vie est un paiement unique, sans expiration.',
  ],
  [
    'Comment résilier mon abonnement mensuel ?',
    'Depuis votre profil, le bouton « Gérer / résilier » ouvre le portail client Stripe où vous pouvez arrêter le renouvellement en un clic.',
  ],
  [
    'Les gains sont-ils garantis ?',
    'Non. Aucun pronostic ne garantit un gain. Les paris sportifs comportent un risque de perte d’argent et les performances passées ne préjugent pas des performances futures.',
  ],
  [
    'Les statistiques affichées sont-elles réelles ?',
    'Oui. Le taux de réussite et le rendement sont calculés automatiquement à partir des résultats enregistrés en base, pronostic par pronostic. Rien n’est saisi à la main.',
  ],
];

export default function FaqPage() {
  return (
    <section className="section">
      <div className="wrap stack gap-14" style={{ maxWidth: 640 }}>
        <h1 className="disp page-title">QUESTIONS FRÉQUENTES</h1>

        <div className="stack gap-10">
          {QUESTIONS.map(([question, answer]) => (
            <details key={question} className="card-flat">
              <summary style={{ cursor: 'pointer', fontWeight: 700, minHeight: 32, display: 'flex', alignItems: 'center' }}>
                {question}
              </summary>
              <p className="small muted mt-12" style={{ lineHeight: 1.6 }}>
                {answer}
              </p>
            </details>
          ))}
        </div>

        <Link href="/2m/contact" className="btn-line btn-block mt-8">
          Une autre question ? Contactez-nous
        </Link>
      </div>
    </section>
  );
}
