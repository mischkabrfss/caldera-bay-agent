const links = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/pronostics', label: 'Pronostics' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs' },
  { href: '/admin/abonnements', label: 'Abonnements' },
  { href: '/admin/messages', label: 'Messages' },
];

export function AdminNav({ active }: { active: string }) {
  return (
    <div className="chips">
      {links.map((link) => (
        <a key={link.href} href={link.href} className={`chip ${active === link.href ? 'chip-on' : ''}`}>
          {link.label}
        </a>
      ))}
      <a href="/" className="chip">
        Voir le site
      </a>
      {/* Sans ça, impossible de se déconnecter depuis l'administration. */}
      <form method="post" action="/api/auth/logout" style={{ flexShrink: 0 }}>
        <button type="submit" className="chip" style={{ cursor: 'pointer' }}>
          Déconnexion
        </button>
      </form>
    </div>
  );
}
