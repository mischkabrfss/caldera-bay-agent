import Link from 'next/link';
import { Logo } from '@/components/Logo';
import type { User } from '@/lib/auth';

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/vip', label: 'Nos VIP' },
  { href: '/historique', label: 'Résultats' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export function Header({ user }: { user: User | null }) {
  return (
    <header className="p2m-header">
      <div className="wrap">
        <div className="bar">
          <Link href="/" className="brand">
            <Logo />
            <span>
              <span className="disp brand-name">
                PRONOSTICS <span className="gold">2M</span>
              </span>
              <span className="brand-sub" style={{ display: 'block' }}>
                CLUB VIP
              </span>
            </span>
          </Link>

          <nav className="desk-nav">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <Link href="/compte" className="btn btn-sm">
                Mon espace
              </Link>
            ) : (
              <>
                <Link href="/connexion">Connexion</Link>
                <Link href="/vip" className="btn btn-sm">
                  Rejoindre le VIP
                </Link>
              </>
            )}
          </nav>

          <details className="menu">
            <summary aria-label="Ouvrir le menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0c53c" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <nav className="mobile-nav">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
              {user ? (
                <Link href="/compte">Mon espace</Link>
              ) : (
                <Link href="/connexion">Connexion</Link>
              )}
              <Link href="/vip" className="btn btn-block mt-8">
                Rejoindre le VIP
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
