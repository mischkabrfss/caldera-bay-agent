// Moteur d'analyse : règles d'expert e-commerce, 100 % déterministe, 0 € d'IA.
const DAY = 86_400_000;
const IMPACT_WEIGHT = { élevé: 3, moyen: 2, faible: 1 };

export const CATEGORIES = {
  seo: { label: 'SEO & visibilité', weight: 18 },
  trust: { label: 'Confiance', weight: 20 },
  catalog: { label: 'Fiches produit', weight: 22 },
  offer: { label: 'Prix & offre', weight: 16 },
  marketing: { label: 'Marketing & tracking', weight: 14 },
  tech: { label: 'Performance', weight: 10 },
};

const stripHtml = (html) => String(html || '').replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
const words = (text) => (text ? text.split(' ').filter(Boolean).length : 0);
const avg = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0);
const pct = (part, total) => (total ? Math.round((part / total) * 100) : 0);
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));
const tag = (html, re) => (html.match(re) || [])[1]?.trim() || '';
const round2 = (n) => Math.round(n * 100) / 100;

export function priceOf(product) {
  const prices = product.variants.map((v) => v.price).filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : 0;
}

export function discountOf(product) {
  let best = 0;
  for (const v of product.variants) if (v.compareAt > v.price && v.price > 0) best = Math.max(best, (v.compareAt - v.price) / v.compareAt);
  return Math.round(best * 100);
}

const ageDays = (product, now) => {
  const date = Date.parse(product.createdAt || product.publishedAt || '');
  return Number.isFinite(date) ? Math.max(0, Math.floor((now - date) / DAY)) : null;
};

// ---------- Analyse d'un produit ----------
export function analyzeProduct(product, { now = Date.now(), rank = null } = {}) {
  const pros = [];
  const cons = [];
  let score = 50;
  const title = product.title.trim();
  const text = stripHtml(product.body);
  const wordCount = words(text);
  const images = product.images.length;
  const altMissing = product.images.filter((i) => !i.alt.trim()).length;
  const price = priceOf(product);
  const discount = discountOf(product);
  const available = product.variants.filter((v) => v.available).length;
  const age = ageDays(product, now);

  if (title.length >= 20 && title.length <= 70) { score += 6; pros.push('Titre bien dimensionné : lisible sur mobile et dans Google.'); }
  else if (title.length < 20) { score -= 6; cons.push({ t: 'Titre trop court', why: 'Un titre court ne dit pas ce que le client gagne et rate les recherches Google.', fix: 'Format : [Produit] + [bénéfice clé] + [caractéristique]. Ex : « Lampe coucher de soleil – ambiance cosy, 16 couleurs ».' }); }
  else { score -= 4; cons.push({ t: 'Titre trop long', why: 'Au-delà de 70 caractères il est coupé dans Google et illisible sur mobile.', fix: 'Garde le produit + 1 bénéfice. Déplace les détails dans la description.' }); }
  if (title === title.toUpperCase() && /[A-Z]{6}/.test(title)) { score -= 3; cons.push({ t: 'Titre en MAJUSCULES', why: 'Les majuscules donnent un effet spam et réduisent la confiance.', fix: 'Écris le titre en minuscules avec une majuscule initiale.' }); }

  if (wordCount >= 150) { score += 10; pros.push(`Description riche (${wordCount} mots) : rassure et répond aux objections.`); }
  else if (wordCount >= 50) { score += 2; cons.push({ t: 'Description un peu légère', why: `${wordCount} mots seulement : le client n’a pas assez d’arguments pour acheter.`, fix: 'Ajoute 3 bénéfices, une liste de caractéristiques, le contenu du colis et une FAQ courte.' }); }
  else { score -= 12; cons.push({ t: 'Description quasi vide', why: 'Sans texte, pas de désir, pas de SEO et beaucoup de questions sans réponse : les visiteurs repartent.', fix: 'Structure : accroche bénéfice → 3 à 5 puces → détails techniques → livraison/retours → FAQ.' }); }
  if (/<(ul|li)\b/i.test(product.body)) { score += 3; pros.push('Liste à puces : la fiche se lit en 5 secondes.'); }

  if (images >= 5) { score += 10; pros.push(`${images} visuels : le client voit le produit sous tous les angles.`); }
  else if (images >= 3) { score += 3; cons.push({ t: 'Ajoute 2 visuels', why: `${images} photos : les fiches qui convertissent le mieux en ont 5 à 8.`, fix: 'Ajoute une photo en situation, un zoom détail, une photo taille/échelle et une image « avant/après » ou bénéfice.' }); }
  else { score -= 12; cons.push({ t: images ? 'Trop peu de photos' : 'Aucune photo', why: 'Sur mobile, la photo fait 80 % de la décision. Une seule image = doute.', fix: 'Vise 5 visuels minimum dont 1 lifestyle et 1 vidéo courte ou GIF.' }); }
  if (images && altMissing / images > 0.5) { score -= 3; cons.push({ t: 'Images sans texte alternatif', why: 'Google Images ne peut pas référencer tes photos et l’accessibilité en pâtit.', fix: 'Renseigne un alt descriptif sur chaque image (ex : « lampe coucher de soleil orange dans un salon »).' }); }

  if (price <= 0 && product.variants.length) { score -= 20; cons.push({ t: 'Prix à 0 €', why: 'Le produit est affiché gratuit : soit une erreur qui fait perdre de l’argent, soit un produit invendable au paiement.', fix: 'Renseigne le vrai prix de vente dans la fiche (et un prix barré si tu fais une promo).' }); }
  if (price > 0) {
    const cents = Math.round((price % 1) * 100);
    if ([99, 95, 90, 97].includes(cents)) { score += 3; pros.push('Prix psychologique (.99/.90) : paraît plus accessible.'); }
    if (price < 12) cons.push({ t: 'Prix très bas', why: 'Sous 12 €, la marge couvre rarement la pub et la livraison.', fix: 'Vends-le en lot (x2, x3) ou en bundle pour monter le panier au-dessus de 25 €.' });
    else if (price <= 90) { score += 4; pros.push('Prix dans la zone « achat impulsif » (12–90 €).'); }
  }
  if (discount >= 15 && discount <= 60) { score += 5; pros.push(`Prix barré -${discount}% : crée de l’urgence et de la valeur perçue.`); }
  else if (discount > 60) { score -= 4; cons.push({ t: `Réduction de -${discount}% suspecte`, why: 'Une remise énorme fait penser à un faux prix barré et fait fuir les clients méfiants.', fix: 'Reste entre -20 % et -50 % avec un prix barré réaliste.' }); }
  else if (price > 0) cons.push({ t: 'Pas de prix barré', why: 'Sans ancrage de prix, le client ne mesure pas la bonne affaire.', fix: 'Affiche un prix comparatif honnête (-20 à -40 %) ou une offre lot.' });

  if (product.variants.length && !available) { score -= 15; cons.push({ t: 'En rupture de stock', why: 'Chaque visite sur un produit épuisé est une vente perdue et du budget pub brûlé.', fix: 'Réapprovisionne, active la précommande ou masque le produit.' }); }
  else if (product.variants.length > 1) { score += 3; pros.push(`${product.variants.length} variantes : plus de choix, plus de conversions.`); }

  if (product.tags.length >= 3) score += 2;
  else cons.push({ t: 'Peu de tags', why: 'Les tags alimentent les filtres, la recherche interne et les collections automatiques.', fix: 'Ajoute 3 à 8 tags : usage, cible, matière, occasion.' });
  if (!product.type) cons.push({ t: 'Type de produit vide', why: 'Shopify et Google Shopping classent mieux un produit typé.', fix: 'Renseigne le champ « Type » (ex : Lampe, Coque, Robe).' });

  if (rank !== null) {
    if (rank < 5) { score += 12; pros.push(`Top ${rank + 1} des ventes de la boutique.`); }
    else if (rank < 15) { score += 6; pros.push(`Dans le top 15 des ventes (#${rank + 1}).`); }
  }
  if (age !== null && age <= 45) pros.push(`Lancé récemment (il y a ${age} j).`);

  score = clamp(score);
  const verdict = score >= 75 ? 'Produit fort' : score >= 55 ? 'À optimiser' : 'Faible';
  return {
    id: product.id, title, handle: product.handle, image: product.images[0]?.src || '', price: round2(price), discount,
    available: !!available, score, verdict, pros, cons, age, rank,
  };
}

// ---------- Audit boutique ----------
export function detect(html) {
  const h = html.toLowerCase().replace(/\\/g, ''); // les Web Pixels Shopify sont en JSON échappé
  const has = (...needles) => needles.some((n) => h.includes(n));
  return {
    // apiClientId = app Shopify officielle installée en « Web Pixel » (Facebook & Instagram, TikTok, Google & YouTube).
    metaPixel: has('fbevents.js', 'facebook-pixel', 'fbq(', 'facebook_pixel', '"apiclientid":2329312', '"facebookcapienabled":true'),
    tiktokPixel: has('analytics.tiktok.com', 'ttq.load', '"apiclientid":4383523'),
    google: has('googletagmanager.com', 'gtag(', 'google-analytics.com', '"apiclientid":1780363'),
    pinterest: has('pintrk', 's.pinimg.com/ct'),
    snapchat: has('sc-static.net/scevent'),
    klaviyo: has('klaviyo'),
    newsletter: has('contact[email]', 'newsletter', 'form_type" value="customer'),
    reviews: has('judge.me', 'judgeme', 'loox', 'yotpo', 'stamped.io', 'okendo', 'reviews.io', 'productreviews', 'ali-reviews', 'trustpilot', 'rivyo', 'kudobuzz'),
    trustText: has('paiement sécurisé', 'secure payment', 'secure checkout', 'satisfait ou remboursé', 'money back', 'garantie', 'guarantee'),
    freeShipping: has('livraison gratuite', 'livraison offerte', 'free shipping', 'frais de port offerts'),
    upsell: has('reconvert', 'zipify', 'frequently bought', 'fréquemment achetés', 'bold-upsell', 'selleasy', 'upsell'),
    chat: has('tidio', 'gorgias', 'intercom', 'crisp.chat', 'zendesk', 'shopify-chat', 'inbox'),
    social: has('instagram.com/', 'tiktok.com/@', 'facebook.com/', 'youtube.com/'),
    currencyConverter: has('currency-converter', 'currency_converter'),
  };
}

function themeName(html) {
  return (tag(html, /Shopify\.theme\s*=\s*\{[^}]*?"name"\s*:\s*"([^"]+)"/i) || tag(html, /"theme_store_id"[\s\S]{0,80}?"name":"([^"]+)"/i) || '').replace(/\\\//g, '/');
}

export function auditStore(store, { now = Date.now() } = {}) {
  const html = store.html || '';
  const products = store.products || [];
  const rankOf = new Map((store.bestsellers || []).map((h, i) => [h, i]));
  const analyzed = products.map((p) => analyzeProduct(p, { now, rank: rankOf.has(p.handle) ? rankOf.get(p.handle) : null }));
  const d = detect(html);
  const checks = [];
  const add = (cat, ok, impact, title, why, fix, detail = '') => checks.push({ cat, ok, impact, title, why, fix, detail });
  // Boutique connectée via Shopify (store.html === null) : pas de page d'accueil à lire, ces points sont ignorés.
  const hasWeb = store.html !== null && store.html !== undefined;
  const web = (...args) => hasWeb && add(...args);
  const adm = store.admin;
  if (adm) {
    add('seo', (adm.description || '').length >= 70, 'élevé', 'Méta-description de la boutique', adm.description ? `${adm.description.length} caractères.` : 'Aucune description de boutique : Google invente un extrait au hasard.', 'Boutique en ligne → Préférences : rédige 120–160 caractères avec ton offre et un bénéfice.');
    const seoRate = pct(adm.seoCustom, products.length);
    add('seo', seoRate >= 50, 'moyen', 'Titres SEO des fiches produit', `${seoRate}% de tes fiches ont un titre ou une description SEO personnalisés.`, 'Sur chaque fiche : « Référencement sur les moteurs de recherche » → titre avec le mot-clé principal + description qui donne envie de cliquer.');
    add('trust', adm.pages >= 3, 'moyen', 'Pages d’information (FAQ, livraison, à propos)', `${adm.pages} page(s) publiée(s).`, 'Crée au minimum : Contact, FAQ, Livraison, Retours, Notre histoire.');
  }

  // SEO
  const title = tag(html, /<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s+/g, ' ');
  const description = tag(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || tag(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  web('seo', title.length >= 25 && title.length <= 70, 'élevé', 'Titre de la page d’accueil', `Google affiche ce titre dans ses résultats. Actuel : « ${title || 'vide'} » (${title.length} car.).`, 'Écris 40–65 caractères : Marque – ce que tu vends + bénéfice. Boutique en ligne → Préférences.');
  web('seo', description.length >= 70 && description.length <= 170, 'élevé', 'Méta-description', description ? `${description.length} caractères : ${description.length < 70 ? 'trop courte' : description.length > 170 ? 'coupée par Google' : 'bonne longueur'}.` : 'Aucune méta-description : Google invente un extrait au hasard.', 'Rédige 120–160 caractères avec ton offre, un bénéfice et un appel à l’action.');
  web('seo', /<meta[^>]+property=["']og:image["']/i.test(html), 'moyen', 'Image de partage (réseaux sociaux)', 'Sans image og:image, tes liens partagés sur WhatsApp, Instagram ou Facebook s’affichent sans visuel.', 'Ajoute une image de partage dans Préférences de la boutique en ligne.');
  web('seo', /<h1[\s>]/i.test(html), 'faible', 'Titre H1 sur l’accueil', 'Le H1 indique à Google le sujet principal de ta page.', 'Ajoute une bannière avec un titre principal clair (ex : « Lampes d’ambiance design »).');
  add('seo', !!store.checks?.sitemap, 'faible', 'Sitemap', 'Le sitemap aide Google à découvrir toutes tes pages.', 'Soumets /sitemap.xml dans Google Search Console.');
  const imgs = products.flatMap((p) => p.images);
  const altRate = pct(imgs.filter((i) => i.alt.trim()).length, imgs.length);
  add('seo', altRate >= 60, 'moyen', 'Textes alternatifs des images', `${altRate}% de tes images produit ont un texte alternatif.`, 'Renseigne un alt descriptif sur chaque photo pour ressortir dans Google Images.');

  // Confiance
  const c = store.checks || {};
  add('trust', !!c.refund, 'élevé', 'Politique de remboursement', 'Obligatoire en France (droit de rétractation 14 j) et exigée par Meta/Google Ads.', 'Paramètres → Politiques → Politique de remboursement.');
  add('trust', !!c.privacy, 'élevé', 'Politique de confidentialité', 'Obligatoire (RGPD). Son absence peut bloquer tes pubs.', 'Paramètres → Politiques → Politique de confidentialité.');
  add('trust', !!c.terms, 'moyen', 'Conditions générales de vente', 'Les CGV sont obligatoires pour vendre en ligne en France.', 'Paramètres → Politiques → Conditions d’utilisation / CGV.');
  add('trust', !!c.shipping, 'moyen', 'Politique de livraison', 'Le délai de livraison est la question n°1 des clients e-commerce.', 'Ajoute délais, transporteurs et frais dans Paramètres → Politiques.');
  add('trust', !!c.contact, 'moyen', 'Page contact', 'Une boutique sans contact visible paraît louche : le taux de conversion chute.', 'Crée une page /pages/contact avec formulaire, e-mail et délai de réponse.');
  web('trust', d.reviews, 'élevé', 'Avis clients visibles', 'La preuve sociale est le levier n°1 de conversion : jusqu’à +30 % sur les fiches avec avis.', 'Installe Judge.me (gratuit) et affiche les étoiles sur les fiches et l’accueil.');
  web('trust', d.trustText, 'moyen', 'Réassurance (paiement sécurisé, garantie)', 'Les badges de réassurance réduisent la peur d’acheter chez une boutique inconnue.', 'Ajoute sous le bouton d’achat : paiement sécurisé, satisfait ou remboursé 30 j, livraison suivie.');

  // Fiches produit
  const n = analyzed.length || 1;
  const avgImages = avg(products.map((p) => p.images.length));
  const avgWords = avg(products.map((p) => words(stripHtml(p.body))));
  const soldOut = analyzed.filter((p) => !p.available).length;
  const weak = analyzed.filter((p) => p.verdict === 'Faible').length;
  add('catalog', products.length >= 5, 'moyen', 'Taille du catalogue', `${products.length} produit(s) en ligne.`, products.length < 5 ? 'Ajoute des produits complémentaires pour augmenter le panier moyen (3 à 15 produits suffisent pour une boutique de niche).' : 'Bon volume.');
  add('catalog', avgImages >= 4, 'élevé', 'Photos par produit', `Moyenne : ${avgImages.toFixed(1)} photo(s) par produit.`, 'Vise 5 à 8 visuels : lifestyle, détail, échelle, bénéfice, vidéo.');
  add('catalog', avgWords >= 120, 'élevé', 'Descriptions produit', `Moyenne : ${Math.round(avgWords)} mots par fiche.`, 'Écris au moins 150 mots : bénéfices, puces, caractéristiques, FAQ.');
  add('catalog', pct(soldOut, n) <= 15, 'élevé', 'Produits en rupture', `${soldOut} produit(s) épuisé(s) (${pct(soldOut, n)}%).`, 'Masque ou réapprovisionne les ruptures : elles gaspillent ton trafic.');
  add('catalog', pct(weak, n) <= 30, 'moyen', 'Qualité globale des fiches', `${weak} fiche(s) jugée(s) faible(s) sur ${analyzed.length}.`, 'Ouvre l’onglet Produits : chaque fiche a sa liste de corrections.');
  add('catalog', (store.collections || []).length >= 2, 'faible', 'Collections', `${(store.collections || []).length} collection(s).`, 'Crée des collections par usage ou cible : navigation plus simple, meilleur SEO.');

  // Prix & offre
  const prices = analyzed.map((p) => p.price).filter((p) => p > 0);
  const avgPrice = avg(prices);
  const discounted = analyzed.filter((p) => p.discount >= 10).length;
  const bundles = products.filter((p) => /\b(pack|lot|bundle|kit|coffret|duo|trio|x2|x3)\b/i.test(p.title)).length;
  add('offer', avgPrice >= 20, 'élevé', 'Panier moyen potentiel', `Prix moyen : ${avgPrice.toFixed(2)} ${store.meta?.currency || '€'}.`, 'Sous 20 €, la pub est rarement rentable : crée des lots et des bundles.');
  add('offer', pct(discounted, n) >= 20, 'moyen', 'Prix barrés / promotions', `${discounted} produit(s) avec un prix barré.`, 'Ajoute un prix comparatif honnête sur tes best-sellers pour créer l’urgence.');
  add('offer', bundles > 0, 'élevé', 'Lots & bundles', bundles ? `${bundles} offre(s) groupée(s) détectée(s).` : 'Aucun lot ni bundle détecté.', 'Crée un « Pack x2 -15 % » et un « Kit complet » : +20 à 40 % de panier moyen.');
  web('offer', d.freeShipping, 'moyen', 'Livraison offerte mise en avant', 'La livraison payante est la 1re cause d’abandon de panier.', 'Affiche « Livraison offerte dès X € » dans une barre d’annonce.');
  web('offer', d.upsell, 'faible', 'Ventes additionnelles', 'Aucun module « souvent acheté ensemble » détecté.', 'Active les recommandations produit du thème ou une app d’upsell gratuite.');

  // Marketing
  web('marketing', d.metaPixel, 'élevé', 'Pixel Meta (Facebook/Instagram)', 'Sans pixel, impossible de mesurer et d’optimiser tes pubs Meta ni de recibler.', 'Installe l’app « Facebook & Instagram » de Shopify et connecte ton pixel.');
  web('marketing', d.tiktokPixel, 'moyen', 'Pixel TikTok', 'TikTok est le canal le moins cher pour lancer un produit viral.', 'Installe l’app TikTok de Shopify.');
  web('marketing', d.google, 'moyen', 'Google Analytics / Tag Manager', 'Tu pilotes à l’aveugle sans analytics.', 'Installe l’app « Google & YouTube » de Shopify.');
  web('marketing', d.newsletter || d.klaviyo, 'moyen', 'Capture d’e-mails', 'Un e-mail capté = des ventes relancées gratuitement.', 'Ajoute un pop-up -10 % contre l’e-mail (Shopify Forms, gratuit).');
  web('marketing', d.social, 'faible', 'Liens réseaux sociaux', 'Les réseaux prouvent que la marque existe vraiment.', 'Ajoute tes liens Instagram/TikTok dans le pied de page.');

  // Performance
  const scripts = (html.match(/<script\b/gi) || []).length;
  const kb = Math.round(html.length / 1024);
  web('tech', kb <= 450, 'moyen', 'Poids de la page d’accueil', `${kb} Ko de HTML.`, 'Retire les sections inutiles et les apps non utilisées.');
  web('tech', scripts <= 45, 'moyen', 'Scripts chargés', `${scripts} scripts sur l’accueil.`, 'Désinstalle les apps inutilisées : chaque script ralentit le mobile.');
  web('tech', pct((html.match(/loading=["']lazy["']/gi) || []).length, (html.match(/<img\b/gi) || []).length || 1) >= 40 || !/<img\b/i.test(html), 'faible', 'Chargement différé des images', 'Les images hors écran doivent être chargées en différé.', 'Utilise un thème 2.0 récent (Dawn, Sense…) qui gère le lazy-loading.');

  const categories = Object.entries(CATEGORIES).map(([id, meta]) => {
    const list = checks.filter((x) => x.cat === id);
    const total = list.reduce((s, x) => s + IMPACT_WEIGHT[x.impact], 0);
    const got = list.reduce((s, x) => s + (x.ok ? IMPACT_WEIGHT[x.impact] : 0), 0);
    return { id, label: meta.label, weight: meta.weight, score: pct(got, total), total };
  }).filter((c) => c.total > 0);
  const score = clamp(categories.reduce((s, x) => s + x.score * x.weight, 0) / categories.reduce((s, x) => s + x.weight, 0));
  const fixes = checks.filter((x) => !x.ok).sort((a, b) => IMPACT_WEIGHT[b.impact] - IMPACT_WEIGHT[a.impact]);
  const strengths = checks.filter((x) => x.ok).map((x) => x.title);

  return {
    host: store.host,
    source: store.source || 'web',
    name: store.meta?.name || store.host,
    currency: store.meta?.currency || 'EUR',
    theme: themeName(html),
    score,
    grade: score >= 80 ? 'Excellente' : score >= 65 ? 'Solide' : score >= 45 ? 'À booster' : 'Critique',
    categories,
    fixes,
    strengths,
    stack: Object.entries(d).filter(([, v]) => v).map(([k]) => k),
    stats: {
      products: products.length, collections: (store.collections || []).length, avgPrice: round2(avgPrice),
      soldOut, discounted, avgImages: round2(avgImages), avgWords: Math.round(avgWords),
    },
    products: analyzed.sort((a, b) => a.score - b.score),
  };
}

// ---------- Espion concurrent ----------
// Outils marketing repérés sur la page d'accueil (libellés lisibles).
export const STACK_LABELS = { metaPixel: 'Pixel Meta', tiktokPixel: 'Pixel TikTok', google: 'Google Analytics', pinterest: 'Pinterest', snapchat: 'Snapchat', klaviyo: 'Klaviyo (e-mails)', newsletter: 'Newsletter', reviews: 'Avis clients', trustText: 'Réassurance', freeShipping: 'Livraison offerte', upsell: 'Ventes additionnelles', chat: 'Chat client', social: 'Réseaux sociaux', currencyConverter: 'Multi-devises' };

export function spyStore(store, { now = Date.now() } = {}) {
  const rankOf = new Map(store.bestsellers.map((h, i) => [h, i]));
  const analyzed = store.products.map((p) => ({ ...analyzeProduct(p, { now, rank: rankOf.has(p.handle) ? rankOf.get(p.handle) : null }), url: p.url !== undefined ? p.url : `https://${store.host}/products/${p.handle}` }));
  const prices = analyzed.map((p) => p.price).filter((p) => p > 0);
  const types = {};
  for (const p of store.products) if (p.type) types[p.type] = (types[p.type] || 0) + 1;
  const stack = store.html ? Object.entries(detect(store.html)).filter(([, v]) => v).map(([k]) => STACK_LABELS[k] || k) : null;
  return {
    host: store.host,
    name: store.meta?.name || store.host,
    currency: store.meta?.currency || 'EUR',
    stats: {
      products: analyzed.length,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      avgPrice: round2(avg(prices)),
      discounted: pct(analyzed.filter((p) => p.discount >= 10).length, analyzed.length),
      launches30: analyzed.filter((p) => p.age !== null && p.age <= 30).length,
    },
    stack,
    topTypes: Object.entries(types).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count })),
    bestsellers: analyzed.filter((p) => p.rank !== null).sort((a, b) => a.rank - b.rank).slice(0, 12),
    launches: analyzed.filter((p) => p.age !== null).sort((a, b) => a.age - b.age).slice(0, 12),
  };
}

// ---------- Radar : score "produit gagnant" ----------
export function winningScore(product, { rank, now = Date.now() }) {
  const reasons = [];
  let score = 30;
  const price = priceOf(product);
  const discount = discountOf(product);
  const age = ageDays(product, now);
  if (rank !== null && rank !== undefined) {
    const bonus = rank < 3 ? 35 : rank < 10 ? 25 : rank < 25 ? 12 : 4;
    score += bonus;
    reasons.push(rank < 10 ? `Top ${rank + 1} des ventes` : `Classé #${rank + 1} des ventes`);
  }
  if (age !== null && age <= 30) { score += 15; reasons.push(`Lancé il y a ${age} j`); }
  else if (age !== null && age <= 90) { score += 7; reasons.push('Lancement récent'); }
  if (price >= 15 && price <= 90) { score += 8; reasons.push('Prix « impulsif »'); }
  if (discount >= 15 && discount <= 60) { score += 6; reasons.push(`Promo -${discount}%`); }
  if (product.variants.length >= 3) { score += 4; reasons.push(`${product.variants.length} variantes`); }
  if (product.images.length >= 5) score += 3;
  if (!product.variants.some((v) => v.available)) { score -= 10; reasons.push('Victime de son succès (rupture)'); }
  return { score: clamp(score), reasons };
}

// Pas des produits à revendre : cartes cadeaux, assurances colis, abonnements, échantillons…
const NOT_PRODUCT = /gift ?card|carte[- ]cadeau|e-?gift|insurance|assurance|shipping protection|protection plan|warranty|garantie|subscription|abonnement|of the month|sample|échantillon|donation|\broute\b/i;

export function radarFrom(stores, { now = Date.now(), limit = 24, perStore = 6 } = {}) {
  const items = [];
  for (const store of stores) {
    const rankOf = new Map(store.bestsellers.map((h, i) => [h, i]));
    for (const p of store.products) {
      if (NOT_PRODUCT.test(`${p.title} ${p.type}`) || !p.images.length || priceOf(p) < 3) continue;
      const rank = rankOf.has(p.handle) ? rankOf.get(p.handle) : null;
      const { score, reasons } = winningScore(p, { rank, now });
      const price = priceOf(p);
      items.push({
        title: p.title, image: p.images[0]?.src || '', price: round2(price), currency: store.meta?.currency || 'EUR',
        discount: discountOf(p), store: store.meta?.name || store.host, host: store.host,
        url: `https://${store.host}/products/${p.handle}`, score, reasons,
        resale: { low: round2(price * 0.85), high: round2(price * 1.15) },
      });
    }
  }
  // Plafond par boutique : le radar reste varié même si une boutique domine.
  const count = {};
  return items.sort((a, b) => b.score - a.score).filter((i) => (count[i.host] = (count[i.host] || 0) + 1) <= perStore).slice(0, limit);
}

// ---------- Comparateur (Scale) ----------
export function compareStores(stores, { now = Date.now() } = {}) {
  return stores.map((store) => {
    const spy = spyStore(store, { now });
    const avgScore = Math.round(avg(spy.bestsellers.concat(spy.launches).map((p) => p.score)));
    return { host: spy.host, name: spy.name, currency: spy.currency, ...spy.stats, avgScore, top: spy.bestsellers[0] || null };
  });
}
