import { IconBall, IconHome, IconList, IconUser } from '@/components/icons';

const tabs = [
  { href: '/compte', label: 'Tableau', Icon: IconHome },
  { href: '/vip', label: 'Du jour', Icon: IconBall },
  { href: '/historique', label: 'Historique', Icon: IconList },
  { href: '/compte/profil', label: 'Profil', Icon: IconUser },
];

export function MemberTabs({ active }: { active: string }) {
  return (
    <>
      {/* Laisse la place à la barre fixe pour ne rien masquer en bas de page. */}
      <div aria-hidden style={{ height: 24 }} />
      <nav className="p2m-tabbar">
      {tabs.map(({ href, label, Icon }) => {
        const on = href === active;
        return (
          <a key={href} href={href} className={on ? 'on' : ''}>
            <Icon size={20} color={on ? '#f0c53c' : '#7f9b8a'} />
            <span>{label}</span>
          </a>
        );
      })}
      </nav>
    </>
  );
}
