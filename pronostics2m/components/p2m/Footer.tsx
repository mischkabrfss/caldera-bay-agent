
export function Footer() {
  return (
    <footer className="p2m-footer">
      <div className="wrap stack gap-12">
        <div className="row gap-18" style={{ flexWrap: 'wrap' }}>
          <a href="/vip">Nos VIP</a>
          <a href="/historique">Résultats</a>
          <a href="/faq">FAQ</a>
          <a href="/contact">Contact</a>
          <a href="/conditions">Conditions générales</a>
        </div>
        <p>
          PRONOSTICS 2M — service d’analyse et de pronostics sportifs par abonnement. Les paris
          sportifs comportent un risque de perte d’argent : aucun résultat n’est garanti et les
          performances passées ne préjugent pas des performances futures. Service réservé aux
          personnes majeures. Jouer comporte des risques : endettement, isolement, dépendance.
          Joueurs Info Service : 09 74 75 13 13 (appel non surtaxé).
        </p>
        <p>© {new Date().getFullYear()} PRONOSTICS 2M. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
