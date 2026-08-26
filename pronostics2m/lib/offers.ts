import type { VipType } from './access';

export type Offer = {
  slug: string;
  vipType: VipType;
  name: string;
  monthly: number;
  lifetime: number;
  features: string[];
  highlight?: boolean;
  tagline: string;
};

export const OFFERS: Offer[] = [
  {
    slug: 'safe',
    vipType: 'safe',
    name: 'VIP SAFE',
    monthly: 19999,
    lifetime: 89989,
    tagline: '1 safe + 1 montante par jour',
    features: [
      '1 pronostic Safe par jour',
      '1 montante par jour',
      'Analyse des pronostics',
      'Historique des résultats',
      'Accès à l’espace VIP Safe',
    ],
  },
  {
    slug: 'premium',
    vipType: 'premium',
    name: 'VIP PREMIUM',
    monthly: 4999,
    lifetime: 44999,
    highlight: true,
    tagline: 'Buteurs et combinés du jour',
    features: [
      'Pronostics buteurs',
      'Combinés du jour',
      'Analyse des sélections',
      'Historique des résultats',
      'Accès à l’espace VIP Premium',
    ],
  },
  {
    slug: 'grosse-cote',
    vipType: 'grosse_cote',
    name: 'VIP GROSSE COTE',
    monthly: 29989,
    lifetime: 109949,
    tagline: 'Cote totale supérieure à 30',
    features: [
      '1 grosse cote par jour',
      'Cote totale supérieure à 30',
      'Analyse détaillée',
      'Historique des résultats',
      'Accès à l’espace VIP Grosse Cote',
    ],
  },
];

export function offerBySlug(slug: string): Offer | undefined {
  return OFFERS.find((offer) => offer.slug === slug);
}

export function offerByVipType(vipType: VipType): Offer {
  return OFFERS.find((offer) => offer.vipType === vipType) as Offer;
}
