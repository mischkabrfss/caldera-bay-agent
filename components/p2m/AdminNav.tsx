import Link from 'next/link';

const links = [
  { href: '/2m/admin', label: 'Tableau de bord' },
  { href: '/2m/admin/pronostics', label: 'Pronostics' },
  { href: '/2m/admin/utilisateurs', label: 'Utilisateurs' },
  { href: '/2m/admin/abonnements', label: 'Abonnements' },
  { href: '/2m/admin/messages', label: 'Messages' },
];

export function AdminNav({ active }: { active: string }) {
  return (
    <div className="chips">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={`chip ${active === link.href ? 'chip-on' : ''}`}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}
