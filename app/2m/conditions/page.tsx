const SECTIONS: [string, string][] = [
  [
    'Objet du service',
    'PRONOSTICS 2M est un service d’analyse et de pronostics sportifs proposé par abonnement. Le service consiste à publier des analyses et des sélections. Il ne constitue ni un conseil en investissement, ni une promesse de gain.',
  ],
  [
    'Absence de garantie de résultat',
    'Les paris sportifs comportent un risque de perte d’argent. Aucun résultat n’est garanti et les performances passées ne préjugent pas des performances futures. L’abonné reste seul responsable des mises qu’il engage.',
  ],
  [
    'Accès réservé aux majeurs',
    'Le service est strictement réservé aux personnes majeures. En créant un compte, l’utilisateur déclare avoir 18 ans révolus.',
  ],
  [
    'Abonnements et paiement',
    'Les paiements sont traités par Stripe. Les abonnements mensuels sont reconduits automatiquement jusqu’à résiliation par l’abonné depuis le portail client Stripe. Les formules « à vie » font l’objet d’un paiement unique. L’accès VIP est activé uniquement après confirmation du paiement par Stripe.',
  ],
  [
    'Résiliation',
    'L’abonné peut arrêter le renouvellement de son abonnement mensuel à tout moment depuis son profil. L’accès reste ouvert jusqu’au terme de la période déjà payée.',
  ],
  [
    'Compte et sécurité',
    'Chaque compte est personnel. Le partage des identifiants ou la rediffusion des pronostics entraîne la fermeture du compte sans remboursement. Les mots de passe sont stockés sous forme d’empreinte chiffrée et ne sont lisibles par personne.',
  ],
  [
    'Données personnelles',
    'Les données collectées (pseudo, email, historique d’abonnement) servent exclusivement à la fourniture du service. L’utilisateur peut demander leur suppression via la page contact.',
  ],
  [
    'Jeu responsable',
    'Jouer comporte des risques : endettement, isolement, dépendance. Joueurs Info Service : 09 74 75 13 13 (appel non surtaxé).',
  ],
];

export default function TermsPage() {
  return (
    <section className="section">
      <div className="wrap stack gap-14" style={{ maxWidth: 640 }}>
        <h1 className="disp page-title">CONDITIONS GÉNÉRALES</h1>
        <div className="stack gap-14">
          {SECTIONS.map(([title, body]) => (
            <div key={title} className="card-flat">
              <b className="disp" style={{ fontSize: 18 }}>
                {title.toUpperCase()}
              </b>
              <p className="small muted mt-12" style={{ lineHeight: 1.65 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
        <p className="xs dim">
          Éditeur du site : [RAISON SOCIALE] — [ADRESSE] — [SIRET]. Contact : [VOTRE EMAIL].
        </p>
      </div>
    </section>
  );
}
