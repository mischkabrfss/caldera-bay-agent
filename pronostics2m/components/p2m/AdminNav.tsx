
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
    </div>
  );
}
