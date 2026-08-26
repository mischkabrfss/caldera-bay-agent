import type { Metadata } from 'next';
import './p2m.css';
import { Header } from '@/components/p2m/Header';
import { Footer } from '@/components/p2m/Footer';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'PRONOSTICS 2M — Pronostics sportifs VIP',
  description:
    'Des pronostics sportifs VIP publiés chaque jour. Choisissez votre VIP et accédez à vos pronostics depuis votre espace personnel.',
};

export default async function P2mLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="p2m">
      <Header user={user} />
      <main style={{ flexGrow: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
