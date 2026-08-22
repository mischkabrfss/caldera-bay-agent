import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NEXORA — Construis et vends ton produit digital',
  description: 'La méthode guidée pour trouver une idée, créer une offre digitale et construire un système prêt à vendre.',
};

export default function SalesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
