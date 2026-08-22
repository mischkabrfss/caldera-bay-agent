import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://nexora-digital-academy.barfussmischka.chatgpt.site'),
  title: 'NEXORA — Digital Business Academy',
  description: 'La formation autonome pour créer, lancer et revendre une offre digitale.',
  openGraph: { title: 'NEXORA — Digital Business Academy', description: 'Construis une offre. Apprends à la vendre.', type: 'website', images: [{ url: '/og.png', width: 1731, height: 909, alt: 'NEXORA — Digital Business Academy' }] },
  twitter: { card: 'summary_large_image', title: 'NEXORA — Digital Business Academy', description: 'Construis une offre. Apprends à la vendre.', images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
