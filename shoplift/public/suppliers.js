// Fournisseurs de qualité qui se connectent à Shopify : recherche directe du produit + app d'import.
// Liens vérifiés le 30/09/2026.
const enc = encodeURIComponent;

export const SUPPLIERS = [
  { id: 'aliexpress', name: 'AliExpress', via: 'app DSers', tag: 'Le plus grand choix', delay: '7–20 j', search: (q) => `https://www.aliexpress.com/w/wholesale-${q.trim().replace(/\s+/g, '-')}.html`, app: 'https://apps.shopify.com/dsers' },
  { id: 'cj', name: 'CJ Dropshipping', via: 'app CJ', tag: 'Entrepôts US/EU, sourcing sur demande', delay: '3–10 j', search: (q) => `https://cjdropshipping.com/search/${enc(q)}.html`, app: 'https://apps.shopify.com/search?q=CJdropshipping' },
  { id: 'spocket', name: 'Spocket', via: 'app Spocket', tag: 'Fournisseurs européens et US', delay: '2–7 j', search: (q) => `https://app.spocket.co/search?query=${enc(q)}`, app: 'https://apps.shopify.com/spocket' },
  { id: 'zendrop', open: true, name: 'Zendrop', via: 'app Zendrop', tag: 'Livraison rapide, emballage perso', delay: '3–8 j', search: () => 'https://app.zendrop.com/', app: 'https://apps.shopify.com/zendrop' },
  { id: 'autods', open: true, name: 'AutoDS', via: 'app AutoDS', tag: 'Commandes et prix automatisés', delay: 'selon fournisseur', search: () => 'https://www.autods.com/', app: 'https://apps.shopify.com/autods' },
  { id: 'syncee', open: true, name: 'Syncee', via: 'app Syncee', tag: 'Marques vérifiées EU/US', delay: '2–8 j', search: () => 'https://www.syncee.com/', app: 'https://apps.shopify.com/syncee-1' },
  { id: 'alibaba', name: 'Alibaba', via: 'app Alibaba', tag: 'Achat en gros, meilleur prix unitaire', delay: '10–30 j', search: (q) => `https://www.alibaba.com/trade/search?SearchText=${enc(q)}`, app: 'https://apps.shopify.com/search?q=alibaba' },
];

// Mots-clés de recherche à partir du titre : sans marque, couleur, taille ni petits mots.
// En anglais comme en français, les derniers mots utiles disent ce qu'est le produit (« … collar midi dress »).
const STOP = new Set('the a an of in on with to for and you me my your our by at from new de du des la le les et pour avec en un une'.split(' '));
const words = (t) => t.toLowerCase().replace(/[™®©"',.!?:+]/g, ' ').split(/\s+/).filter(Boolean);
export function supplierQuery(item) {
  const brand = new Set(words(String(item.store || '')).concat(words(String(item.store || '').replace(/\./g, ''))));
  const segments = String(item.title || '').split(/\s[|–—-]\s|\s\(|\swith\s|\savec\s/i);
  const useful = (seg, keepBrand = false) => words(seg).filter((w) => !STOP.has(w) && (keepBrand || !brand.has(w)) && !/^\d+([.,]\d+)?(cm|mm|in|oz|ml|l|pcs|pack)?$/.test(w) && w.length > 1);
  const core = (segments.map(useful).find((w) => w.length) || []).slice(-3);
  const type = useful(String(item.type || ''), true).slice(0, 2);
  if (type.length && !core.some((w) => type.some((t) => w.startsWith(t.slice(0, 4)) || t.startsWith(w.slice(0, 4))))) core.push(...type);
  return core.join(' ') || String(item.title || '').toLowerCase();
}

export const supplierLinks = (item) => {
  const q = supplierQuery(item);
  return SUPPLIERS.map((s) => ({ ...s, url: s.search(q), query: q }));
};
