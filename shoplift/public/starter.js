// Parcours « je pars de zéro » : plan de lancement assemblé à partir des réponses du quiz (règles fixes : aucun coût
// par client, rien à maintenir) et de vrais produits relevés par le radar. Utilisé par le serveur, l'aperçu et l'affichage.
export const START = {
  budget: { xs: 'Moins de 100 €', s: '100 à 500 €', m: '500 à 2 000 €', l: 'Plus de 2 000 €' },
  time: { low: 'Moins de 5 h/semaine', mid: '5 à 15 h/semaine', high: 'Plus de 15 h/semaine' },
  niche: { mode: 'Mode', beaute: 'Beauté', maison: 'Maison', bijoux: 'Bijoux & accessoires', sport: 'Sport & bien-être', animaux: 'Animaux', any: 'Je ne sais pas encore' },
  channel: { organic: 'Vidéos gratuites (TikTok, Reels)', ads: 'Publicité payante', unsure: 'Je ne sais pas' },
};
export const START_LIMITS = { weeks: 1, products: 1, checklist: 5 };

// Réponses inconnues → valeur par défaut (le serveur ne fait confiance à rien de ce qui arrive du navigateur).
export function cleanAnswers(a = {}) {
  const pick = (k, d) => (Object.hasOwn(START[k], a[k]) ? a[k] : d);
  return { budget: pick('budget', 's'), time: pick('time', 'mid'), niche: pick('niche', 'any'), channel: pick('channel', 'unsure') };
}

const NAMES = {
  mode: [['Maison', 'Atelier', 'Studio'], ['Nova', 'Rivage', 'Lune', 'Céleste']],
  beaute: [['Rituel', 'Glow', 'Pure'], ['Éclat', 'Lys', 'Velours', 'Aube']],
  maison: [['Nid', 'Casa', 'Atelier'], ['Doux', 'Lumière', 'Terra', 'Lin']],
  bijoux: [['Éclat', 'Maison', 'Atelier'], ['Or', 'Perle', 'Astre', 'Opale']],
  sport: [['Move', 'Pulse', 'Flow'], ['Club', 'Lab', 'Studio', 'Form']],
  animaux: [['Patte', 'Truffe', 'Moustache'], ['& Co', 'Club', 'Douce', 'Maison']],
  any: [['Maison', 'Atelier', 'Studio'], ['Nova', 'Lumière', 'Rivage', 'Céleste']],
};

// Fourchette de prix de revente visée : petit prix « impulsif » en vidéo gratuite, plus de marge si la pub doit payer.
const range = (a, ads) => (ads ? [25, 90] : a.budget === 'xs' ? [12, 45] : [15, 60]);

function pickProducts(a, items, ads) {
  const [lo, hi] = range(a, ads);
  const price = (p) => p.resale?.low || p.price;
  const fit = items.filter((p) => !p.locked && price(p) >= lo && price(p) <= hi);
  const seen = new Set();
  let pool = (fit.length >= 3 ? fit : items.filter((p) => !p.locked)).slice().sort((x, y) => (y.score || 0) - (x.score || 0)).filter((p) => !seen.has(p.title) && seen.add(p.title));
  // Niche pas encore choisie : le meilleur produit de chaque niche, à tour de rôle, pour lui donner des idées variées.
  if (a.niche === 'any') { const rank = {}; pool = pool.map((p) => [p, (rank[p.niche] = (rank[p.niche] ?? -1) + 1)]).sort((x, y) => x[1] - y[1]).map(([p]) => p); }
  return pool.slice(0, 5)
    .map((p) => ({ title: p.title, kind: p.kind || '', image: p.image || '', price: p.price, currency: p.currency || 'EUR', resale: p.resale || null, reasons: (p.reasons || []).slice(0, 3), url: p.url || '', score: p.score || 0, niche: p.niche || '' }));
}

export function buildStarter(answers, items = []) {
  const a = cleanAnswers(answers);
  const ads = a.channel === 'ads' || (a.channel === 'unsure' && (a.budget === 'm' || a.budget === 'l'));
  const small = a.budget === 'xs' || a.budget === 's';
  const extra = { low: 0, mid: 1, high: 2 }[a.time];
  const products = pickProducts(a, items, ads);
  const nicheTxt = a.niche === 'any' ? 'toutes les niches' : `la niche ${START.niche[a.niche]}`;
  const [lo, hi] = range(a, ads);
  const cut = (base, more) => [...base, ...more.slice(0, extra)];

  const model = small
    ? { title: 'Dropshipping avec un agent de sourcing', text: 'Zéro stock : tu paies le produit seulement quand un client commande. Ton budget sert à la boutique, au nom de domaine et à un échantillon pour filmer.' }
    : { title: 'Dropshipping pour tester, puis petit stock', text: 'Tu testes plusieurs produits sans stock. Dès qu’un produit vend tous les jours, tu en commandes un petit stock pour livrer plus vite et gagner en marge.' };
  const channel = ads
    ? { title: 'Publicité payante + vidéos', text: 'Garde au moins la moitié de ton budget pour tester tes pubs, avec un petit budget par jour. Les vidéos gratuites servent aussi de matière pour tes pubs.' }
    : { title: 'Vidéos gratuites TikTok et Reels', text: 'Pas de pub au début : 1 à 2 vidéos par jour suffisent pour trouver un angle qui fait vendre. La pub viendra quand une vidéo marche toute seule.' };

  const weeks = [
    { n: 1, title: 'Choisis ton produit', tasks: cut([
      `Ouvre le radar Shoplift sur ${nicheTxt} et garde 3 produits vendus par plusieurs boutiques.`,
      `Vise un prix de revente entre ${lo} et ${hi} € : ${ads ? 'assez de marge pour payer la pub' : 'un achat « coup de cœur » sans réfléchir'}.`,
      'Garde seulement un produit qu’on comprend en 3 secondes de vidéo (démonstration, avant/après).',
    ], [
      'Tape le produit dans la recherche TikTok : des vidéos récentes avec des commentaires « où l’acheter ? » = une vraie demande.',
      'Espionne 2 boutiques qui le vendent (onglet Espion) : leur prix, leurs photos, leurs avis.',
    ]) },
    { n: 2, title: 'Fournisseur et boutique', tasks: cut([
      'Contacte 2 agents de sourcing (onglet Agents) : prix, délai de livraison en France, prix d’un échantillon.',
      'Commande 1 échantillon : tu vérifies la qualité et tu filmes tes vidéos avec.',
      'Monte ta boutique avec la checklist Shopify ci-dessous (une seule page produit, mais soignée).',
    ], [
      'Fixe ton prix à au moins 2,5 fois ton coût total (produit + livraison) pour garder une marge.',
      'Prépare 5 photos du produit, dont une en situation.',
    ]) },
    { n: 3, title: 'Lancement', tasks: cut([
      ads ? 'Lance 3 à 5 vidéos en pub avec un petit budget par jour ; coupe celles qui ne font pas cliquer après 3 jours.' : 'Publie 1 à 2 vidéos par jour avec les scripts ci-dessous, à heure fixe.',
      'Analyse ta boutique avec l’audit Shoplift et corrige les 3 premiers points.',
      'Réponds à chaque commentaire, si possible en vidéo : c’est du contenu gratuit.',
    ], [
      'Demande à tes 5 premiers clients une photo ou un avis, contre un petit code promo.',
      ads ? 'Publie aussi tes vidéos en organique sur TikTok et Reels : certaines prendront sans payer.' : 'Teste 3 accroches différentes sur la même vidéo pour voir laquelle retient.',
    ]) },
    { n: 4, title: 'Garde ce qui marche', tasks: cut([
      'Refais 5 variantes de tes 2 meilleures vidéos (même idée, autre accroche ou autre décor).',
      'Toujours pas de vente après plusieurs centaines de visites : change d’angle, ou passe au produit n°2 de ta liste.',
      'Crée un « pack x2 » à prix réduit pour augmenter ton panier moyen.',
    ], [
      'Relance l’audit Shoplift et compare ton score à celui de la semaine 3.',
      'Note chaque jour visites, ventes et dépenses : tu sauras quoi garder et quoi couper.',
    ]) },
  ];

  const [w1, w2] = NAMES[a.niche];
  const names = w1.flatMap((x, i) => [`${x} ${w2[i]}`, `${x} ${w2[i + 1]}`]).slice(0, 5);
  const p0 = products[0];
  const content = {
    names,
    namesNote: 'Vérifie que le nom est libre sur Instagram, TikTok et en .fr / .com avant de le prendre.',
    description: `${p0 ? p0.title : 'Nom du produit'}\n\n[Une phrase : le problème qu’il règle ou l’envie qu’il crée.]\n\n• [Bénéfice n°1 que le client voit tout de suite]\n• [Matière, taille ou détail qui rassure : vérifie-le sur ton échantillon]\n• [Pour qui / dans quelle situation]\n\nLivraison suivie · Paiement sécurisé · Retours sous [14 ou 30] jours`,
    scripts: [
      { hook: '« Je ne m’attendais pas à ça pour ce prix… »', scenes: 'Plan 1 : le problème en 2 secondes. Plan 2 : tu sors le produit. Plan 3 : le résultat, en gros plan.', cta: 'Lien dans la bio.' },
      { hook: '« 3 raisons pour lesquelles tout le monde l’a en ce moment »', scenes: 'Une raison par plan, texte à l’écran, 2 secondes chacune. Finis sur le produit porté ou utilisé.', cta: 'Dis-moi en commentaire laquelle te parle.' },
      { hook: '« POV : tu trouves enfin celui qui… »', scenes: 'Filmé à la main, comme une vraie personne : déballage, premier essai, réaction honnête.', cta: 'Je mets le lien en bio.' },
    ],
  };

  const checklist = [
    'Crée ton compte Shopify (essai gratuit, puis abonnement : vérifie le tarif du moment sur shopify.com)',
    'Choisis un thème gratuit et rapide (Dawn par exemple)',
    'Achète ton nom de domaine et relie-le à la boutique',
    'Crée ton logo (même simple) et choisis 2 couleurs',
    'Ajoute ton produit : titre clair, 5 photos, description, prix',
    'Crée les pages : CGV, mentions légales, confidentialité, retours, contact',
    'Active les paiements (Shopify Payments + PayPal)',
    'Règle la livraison : tarifs et délais annoncés honnêtement',
    'Installe une application d’avis clients',
    'Connecte le canal TikTok ou Meta et installe le pixel',
    'Passe une commande test de bout en bout, puis rembourse-la',
    'Retire le mot de passe de la boutique (sinon personne ne peut acheter)',
    'Analyse la boutique avec l’audit Shoplift et corrige les points rouges',
    'Publie ta première vidéo',
  ];

  return { answers: a, profile: Object.fromEntries(Object.entries(a).map(([k, v]) => [k, START[k][v]])), model, channel, weeks, products, content, checklist };
}

// Version Test : semaine 1, 1 produit et le début de la checklist ; le reste garde son titre mais pas son contenu.
export function lockStarter(plan) {
  return {
    ...plan,
    locked: true,
    weeks: plan.weeks.map((w, i) => (i < START_LIMITS.weeks ? w : { n: w.n, title: w.title, count: w.tasks.length, locked: true })),
    products: plan.products.map((p, i) => (i < START_LIMITS.products ? p : { image: p.image, score: p.score, kind: p.kind, locked: true })),
    content: { locked: true, count: plan.content.names.length + plan.content.scripts.length + 1 },
    checklist: plan.checklist.map((t, i) => (i < START_LIMITS.checklist ? t : null)),
  };
}

// Affichage commun (quiz de l'accueil et onglet « Lancement » du tableau de bord).
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const img = (src) => (/^radar-img\/[\w.-]+$/.test(src || '') || /^https:\/\//.test(src || '') ? esc(src) : '');
const eur = (n, c) => { try { return Number(n).toLocaleString('fr-FR', { style: 'currency', currency: c || 'EUR', maximumFractionDigits: 0 }); } catch { return `${Math.round(n)} €`; } };

export function starterHtml(p, { icon = () => '', done = {}, unlock = 'Débloquer mon plan complet' } = {}) {
  const lockBtn = (txt) => `<button type="button" class="btn btn-main sp-unlock" data-start-unlock>${icon('unlock')} ${txt}</button>`;
  const prod = (x) => (x.locked
    ? `<div class="sp-prod is-locked"><span class="sp-img">${img(x.image) ? `<img src="${img(x.image)}" alt="" loading="lazy">` : ''}</span><b>${icon('lock')} ${esc(x.kind || 'Produit')}</b><small>Score ${x.score}/100</small></div>`
    : `<div class="sp-prod"><span class="sp-img">${img(x.image) ? `<img src="${img(x.image)}" alt="" loading="lazy">` : ''}<em>${x.score}/100</em></span><b>${esc(x.title)}</b>
      ${x.resale ? `<small>Revente conseillée : ${eur(x.resale.low, x.currency)} à ${eur(x.resale.high, x.currency)}</small>` : ''}<ul>${x.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      ${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener nofollow">Voir chez le vendeur →</a>` : ''}</div>`);
  const week = (w) => (w.locked
    ? `<div class="sp-week is-locked"><p class="sp-k">Semaine ${w.n}</p><h4>${esc(w.title)}</h4><p class="sp-blur">${icon('lock')} ${w.count} actions détaillées</p></div>`
    : `<div class="sp-week"><p class="sp-k">Semaine ${w.n}</p><h4>${esc(w.title)}</h4><ol>${w.tasks.map((t) => `<li>${esc(t)}</li>`).join('')}</ol></div>`);
  const c = p.content;
  const contentHtml = c.locked
    ? `<div class="sp-card is-locked"><p class="sp-blur">${icon('lock')} ${c.count} contenus prêts à copier : noms de boutique, fiche produit, scripts de vidéos</p>${lockBtn(unlock)}</div>`
    : `<div class="sp-card"><h4>Noms de boutique</h4><p class="sp-names">${c.names.map((n) => `<span>${esc(n)}</span>`).join('')}</p><small>${esc(c.namesNote)}</small></div>
      <div class="sp-card"><h4>Fiche produit à compléter <button type="button" class="sp-copy" data-copy="${esc(c.description)}" data-copy-label="Fiche produit">${icon('copy')} Copier</button></h4><pre>${esc(c.description)}</pre></div>
      ${c.scripts.map((s, i) => `<div class="sp-card"><h4>Script vidéo ${i + 1} <button type="button" class="sp-copy" data-copy="${esc(`Accroche : ${s.hook}\n${s.scenes}\nFin : ${s.cta}`)}" data-copy-label="Script">${icon('copy')} Copier</button></h4><p><b>Accroche :</b> ${esc(s.hook)}</p><p>${esc(s.scenes)}</p><p><b>Fin :</b> ${esc(s.cta)}</p></div>`).join('')}`;
  const left = p.checklist.filter((t) => t === null).length;
  return `<div class="sp">
    <div class="sp-profile">${Object.values(p.profile).map((v) => `<span>${esc(v)}</span>`).join('')}</div>
    <div class="sp-duo"><div class="sp-card"><p class="sp-k">Ton modèle</p><h4>${esc(p.model.title)}</h4><p>${esc(p.model.text)}</p></div>
      <div class="sp-card"><p class="sp-k">Tes ventes viendront de</p><h4>${esc(p.channel.title)}</h4><p>${esc(p.channel.text)}</p></div></div>
    <h3 class="sp-h">${icon('target')} Ton plan sur 4 semaines</h3><div class="sp-weeks">${p.weeks.map(week).join('')}</div>
    <h3 class="sp-h">${icon('radar')} Produits qui se vendent en ce moment</h3>
    <p class="sp-note">Vrais produits relevés par le radar Shoplift, choisis pour ton budget et ta façon de vendre.</p>
    <div class="sp-prods">${p.products.map(prod).join('') || '<p class="sp-note">Le radar se recharge : réessaie dans quelques minutes.</p>'}</div>
    <h3 class="sp-h">${icon('pen')} Contenus prêts</h3><div class="sp-contents">${contentHtml}</div>
    <h3 class="sp-h">${icon('store')} Checklist Shopify</h3>
    <ul class="sp-check">${p.checklist.map((t, i) => (t === null ? '' : `<li><label><input type="checkbox" data-check="${i}"${done[i] ? ' checked' : ''}><span>${esc(t)}</span></label></li>`)).join('')}
      ${left ? `<li class="is-locked"><span>${icon('lock')} ${left} étapes de plus</span></li>` : ''}</ul>
    ${p.locked ? `<div class="sp-cta"><p>Le plan complet : les 4 semaines détaillées, tous les produits, les contenus prêts à copier et la checklist entière.</p>${lockBtn(unlock)}</div>` : ''}
  </div>`;
}
