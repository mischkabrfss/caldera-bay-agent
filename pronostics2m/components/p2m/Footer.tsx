import Link from 'next/link';

export function Footer() {
  return (
    <footer className="p2m-footer">
      <div className="wrap stack gap-12">
        <div className="row gap-18" style={{ flexWrap: 'wrap' }}>
          <Link href="/vip">Nos VIP</Link>
          <Link href="/historique">Résultats</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/conditions">Conditions générales</Link>
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
