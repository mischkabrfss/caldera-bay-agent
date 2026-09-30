// Agents de sourcing connectables à Shopify, classés du meilleur au moins bon.
// Coordonnées relevées le 30/09/2026 : e-mail et adresse = fiche officielle de l'app sur le Shopify App Store ;
// téléphone / WhatsApp = site officiel de l'agent (jamais d'autre source). Pas de numéro publié = pas de numéro affiché.
// Servi uniquement via /api/agents (filtré selon l'offre) : le serveur bloque l'accès direct à ce fichier.
export const AGENTS_CHECKED = '2026-09-30';

export const AGENTS = [
  {
    id: 'cj', name: 'CJ Dropshipping', rating: 4.9, reviews: 2854, since: 2020, hq: 'Yiwu, Chine',
    pitch: 'Agent personnel gratuit, 400 000+ produits, sourcing sur demande en 24–48 h.',
    strengths: ['Agent dédié gratuit', 'Entrepôts US, EU et Chine', 'Personnalisation et packaging'], delay: '3–10 j (entrepôts US/EU)',
    whatsapp: '+86 180 6762 7100', phone: '', email: 'support@cjdropshipping.com', hours: '24 h/24, 7 j/7',
    site: 'https://cjdropshipping.com', app: 'https://apps.shopify.com/cucheng',
    source: 'WhatsApp : cjdropshipping.com · e-mail : Shopify App Store',
  },
  {
    id: 'sup', name: 'Sup Dropshipping', rating: 5.0, reviews: 107, since: 2021, hq: 'Hangzhou, Chine',
    pitch: 'Manager de sourcing dédié, accès direct aux usines, achat en gros dès 1 carton.',
    strengths: ['Manager dédié', 'Recherche par photo', 'Marque blanche et étiquettes'], delay: '8–12 j',
    whatsapp: '+1 571 523 9073', whatsapp2: '+1 702 604 4695', phone: '', email: 'info@supdropshipping.com', hours: 'Réponse sous 24 h',
    site: 'https://www.supdropshipping.com', app: 'https://apps.shopify.com/sup-dropshipping-2',
    source: 'WhatsApp : supdropshipping.com · e-mail : Shopify App Store',
  },
  {
    id: 'bucky', name: 'BuckyDrop', rating: 5.0, reviews: 85, since: 2021, hq: 'Shenzhen, Chine',
    pitch: 'Produits Taobao, 1688 et Tmall au prix usine, contrôle qualité et branding.',
    strengths: ['Prix usine 1688/Taobao', 'Contrôle qualité', 'Branding de colis'], delay: '7–15 j',
    whatsapp: '+852 6626 2730', phone: '', email: 'support@buckydrop.com', hours: 'Lun–ven 9h30–12h30 et 14h–18h30 (heure de Chine)',
    site: 'https://www.buckydrop.com/en/', app: 'https://apps.shopify.com/buckydrop',
    source: 'WhatsApp et horaires : buckydrop.com/en/contact_us · e-mail : Shopify App Store',
  },
  {
    id: 'sourcinbox', name: 'SourcinBox', rating: 4.9, reviews: 48, since: 2021, hq: 'Hangzhou, Chine',
    pitch: 'Agent de sourcing spécialisé qualité : devis rapide et suivi personnalisé.',
    strengths: ['Devis rapide', 'Qualité vérifiée', 'Suivi personnalisé'], delay: '7–12 j',
    whatsapp: '+86 173 2607 4089', phone: '+86 173 2607 4089', email: 'support@sourcinbox.com', hours: 'Réponse sous 24 h',
    site: 'https://www.sourcinbox.com', app: 'https://apps.shopify.com/sourcinbox',
    source: 'Téléphone et WhatsApp : sourcinbox.com/contact-us · e-mail : Shopify App Store',
  },
  {
    id: 'hypersku', name: 'HyperSKU', rating: 4.8, reviews: 307, since: 2020, hq: 'Shenzhen, Chine',
    pitch: 'Sourcing, impression à la demande et expédition rapide avec un seul interlocuteur.',
    strengths: ['Impression à la demande', 'Sourcing sur demande', 'Expédition rapide'], delay: '7–12 j',
    whatsapp: '+1 555 947 3756', phone: '', email: 'support@etailerhub.com', hours: 'Réponse sous 24 h',
    site: 'https://www.hypersku.com', app: 'https://apps.shopify.com/hypersku',
    source: 'WhatsApp : hypersku.com · e-mail (éditeur eTailerHub) : Shopify App Store',
  },
  {
    id: 'eprolo', name: 'EPROLO', rating: 4.8, reviews: 563, since: 2018, hq: 'Shenzhen, Chine',
    pitch: 'Plateforme gratuite de sourcing et de branding, spécialiste mode et accessoires.',
    strengths: ['Inscription gratuite', 'Branding (étiquettes, packaging)', 'Chat en direct'], delay: '7–15 j',
    whatsapp: '', phone: '', email: 'support@eprolo.com', email2: 'hi@eprolo.com', hours: 'Chat en direct sur le site',
    site: 'https://eprolo.com', app: 'https://apps.shopify.com/eprolo',
    source: 'E-mails : eprolo.com/contact-us et Shopify App Store · pas de numéro publié',
  },
  {
    id: 'zendrop', name: 'Zendrop', rating: 4.5, reviews: 1255, since: 2020, hq: 'Boca Raton, États-Unis',
    pitch: 'Entrepôts aux États-Unis, livraison rapide et support 24 h/24 dans l’app.',
    strengths: ['Entrepôts US', 'Support 24/7 dans l’app', 'Impression à la demande'], delay: '3–8 j (US)',
    whatsapp: '', phone: '', email: 'support@zendrop.com', hours: '24 h/24 via la messagerie de l’app',
    site: 'https://www.zendrop.com', app: 'https://apps.shopify.com/zendrop',
    source: 'E-mail et adresse : Shopify App Store · pas de numéro publié',
  },
  {
    id: 'dropshipman', name: 'Dropshipman', rating: 4.3, reviews: 330, since: 2020, hq: 'Hong Kong',
    pitch: 'Sourcing AliExpress, Temu et Alibaba avec un manager dédié (WhatsApp donné à l’inscription).',
    strengths: ['Manager dédié', 'Packaging personnalisé', 'Support 24/7'], delay: '7–15 j',
    whatsapp: '', phone: '', email: 'support@dropshipman.com', hours: '24 h/24 (chat et e-mail)',
    site: 'https://www.dropshipman.com', app: 'https://apps.shopify.com/aliexpress-dropshipping-master',
    source: 'E-mail et adresse : Shopify App Store · WhatsApp du manager fourni après inscription',
  },
  {
    id: 'usadrop', name: 'USAdrop', rating: 4.2, reviews: 94, since: 2021, hq: 'Hangzhou, Chine',
    pitch: 'Dropshipping et impression à la demande vers les États-Unis et l’Europe.',
    strengths: ['Impression à la demande', 'Sourcing', 'Suivi de commande'], delay: '7–12 j',
    whatsapp: '', phone: '', email: 'info@usadrop.com', hours: 'Réponse sous 24 h',
    site: 'https://www.usadrop.com', app: 'https://apps.shopify.com/usadrop',
    source: 'E-mail : Shopify App Store · pas de numéro publié',
  },
  {
    id: 'skyfulfill', name: 'Skyfulfill', rating: 5.0, reviews: 2, since: 2025, hq: 'Hangzhou, Chine',
    pitch: 'Agent de sourcing récent et réactif, joignable directement sur WhatsApp.',
    strengths: ['Joignable sur WhatsApp', 'Sourcing en Chine', 'Traitement des commandes'], delay: '7–15 j',
    whatsapp: '+86 158 3970 5705', phone: '+86 158 3970 5705', email: 'support@skyfulfill.com', hours: 'Réponse sous 24 h',
    site: 'https://www.skyfulfill.com', app: 'https://apps.shopify.com/skyfulfill',
    source: 'Téléphone et WhatsApp : skyfulfill.com · e-mail : Shopify App Store',
  },
];

// Nombre d'agents par offre.
export const AGENT_LIMITS = { test: 0, basic: 1, pro: 3, scale: 10 };

const mask = (v) => (v ? v.replace(/(\+?\d{1,3}\s?\d{2,3})([\d\s]+)/, (_, a, b) => a + b.replace(/\d/g, '•')) : '');
const maskMail = (v) => (v ? v.replace(/^(.)[^@]*/, '$1•••••') : '');

// Agents visibles selon l'offre : les autres restent présentés (nom, note) avec les coordonnées floutées.
export function agentsFor(plan) {
  const n = AGENT_LIMITS[plan] ?? 0;
  return AGENTS.map((a, i) => (i < n ? { ...a, open: true } : {
    id: a.id, name: a.name, rating: a.rating, reviews: a.reviews, hq: a.hq, pitch: a.pitch, strengths: a.strengths, delay: a.delay,
    whatsapp: mask(a.whatsapp), phone: mask(a.phone), email: maskMail(a.email), open: false,
    unlock: i < 1 ? 'basic' : i < 3 ? 'pro' : 'scale',
  }));
}
