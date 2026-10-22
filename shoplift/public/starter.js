// Parcours « je pars de zéro » : plan de lancement assemblé à partir des réponses du quiz (règles fixes : aucun coût
// par client, rien à maintenir) et de vrais produits relevés par le radar. Utilisé par le serveur, l'aperçu et l'affichage.
import { GLOSSARY, MISTAKES, NICHE_INFO, planDays, readyContent, roadmap, TOOLS, WEEK_CHECK } from './starter-days.js';
export const START = {
  budget: { xs: 'Moins de 100 €', s: '100 à 500 €', m: '500 à 2 000 €', l: 'Plus de 2 000 €' },
  time: { low: 'Moins de 5 h/semaine', mid: '5 à 15 h/semaine', high: 'Plus de 15 h/semaine' },
  niche: { mode: 'Mode', beaute: 'Beauté', maison: 'Maison', bijoux: 'Bijoux & accessoires', sport: 'Sport & bien-être', animaux: 'Animaux', any: 'Je ne sais pas encore' },
  channel: { organic: 'Vidéos gratuites (TikTok, Reels)', ads: 'Publicité payante', unsure: 'Je ne sais pas' },
  goal: { first: 'Ma première vente', side: 'Un complément de revenu', salary: 'Un vrai salaire', brand: 'Créer une vraie marque' },
};
const GOALS = { first: 0, side: 400, salary: 1500, brand: 3000 }; // bénéfice mensuel visé, en euros
export const START_LIMITS = { days: 7, products: 1, checklist: 5, hooks: 3, scripts: 1 };

// Réponses inconnues → valeur par défaut (le serveur ne fait confiance à rien de ce qui arrive du navigateur).
export function cleanAnswers(a = {}) {
  const pick = (k, d) => (Object.hasOwn(START[k], a[k]) ? a[k] : d);
  const name = String(a.name || '').normalize('NFC').replace(/[^\p{L}\p{M}' -]/gu, '').trim().slice(0, 20);
  return { budget: pick('budget', 's'), time: pick('time', 'mid'), niche: pick('niche', 'any'), channel: pick('channel', 'unsure'), goal: pick('goal', 'side'), name: name && name[0].toUpperCase() + name.slice(1) };
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


const REF = { xs: 80, s: 300, m: 1000, l: 3000 }; // budget d'exemple au milieu de chaque tranche
const PACE = {
  low: 'Moins de 5 h par semaine : fais une mission tous les 2 jours. Ton lancement prendra environ 2 mois, c’est normal et ça marche aussi.',
  mid: 'Une mission par jour, de 20 minutes à 1 h 30. En 30 jours, ta boutique est lancée et tu as tes premiers chiffres.',
  high: 'Tu as du temps : enchaîne 2 missions par jour pendant les 2 premières semaines, puis garde une mission par jour pour le contenu.',
};

export function buildStarter(answers, items = []) {
  const a = cleanAnswers(answers);
  const ads = a.channel === 'ads' || (a.channel === 'unsure' && (a.budget === 'm' || a.budget === 'l'));
  const small = a.budget === 'xs' || a.budget === 's';
  const products = pickProducts(a, items, ads);
  const nicheTxt = a.niche === 'any' ? 'toutes les niches' : `la niche ${START.niche[a.niche]}`;
  const [lo, hi] = range(a, ads);
  const p0 = products[0];
  const N = NICHE_INFO[a.niche];
  // Objectif en chiffres : marge estimée à 35 % du prix de revente du produit n°1 (à affiner avec le calculateur).
  const price = p0?.resale ? Math.round((p0.resale.low + p0.resale.high) / 2) : 30;
  const margin = Math.max(3, Math.round(price * 0.35));
  const target = GOALS[a.goal];
  const sales = target ? Math.ceil(target / margin) : 1;
  const goal = { label: START.goal[a.goal], target, price, margin, sales, perDay: Math.round((sales / 30) * 10) / 10, visits: Math.ceil(sales / 0.02) };
  const goalLine = target ? `environ ${target.toLocaleString('fr-FR')} € de bénéfice par mois, soit à peu près ${sales} ventes (${goal.perDay < 1 ? 'moins d’une' : `environ ${String(goal.perDay).replace('.', ',')}`} par jour).` : 'ta première vente : vise environ 50 à 100 visites sur ta page produit pour l’obtenir.';
  const L = START.niche[a.niche];
  const why = [
    `${a.name ? `${a.name}, tu` : 'Tu'} pars de zéro avec ${START.budget[a.budget].toLowerCase()} et ${START.time[a.time].toLowerCase()}.`,
    small ? 'Le plus sûr pour toi : démarrer sans stock, avec un agent qui expédie à ta place. Tu ne risques que le prix d’un échantillon.' : 'Ton budget te permet de tester plusieurs produits sans stock, puis de prendre un petit stock du produit gagnant.',
    ads ? 'Tu vendras avec de la publicité : le plan t’apprend à tester petit et à couper vite ce qui ne vend pas.' : 'Tu vendras avec des vidéos gratuites : le plan te dit quoi filmer et quand publier.',
    a.niche === 'any' ? 'Tu n’as pas encore de niche : le plan t’aide à la choisir dès le jour 2.' : `En ${L} : ${N.audience.charAt(0).toLowerCase()}${N.audience.slice(1)}`,
    `Ton objectif : ${goalLine}`,
  ].join(' ');
  const id = `SL-${String([...JSON.stringify(a)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 9000, 7) + 1000)}`;

  const model = small
    ? { title: 'Dropshipping avec un agent de sourcing', text: 'Zéro stock : tu paies le produit seulement quand un client commande. Ton budget sert à la boutique, au nom de domaine et à un échantillon pour filmer.' }
    : { title: 'Dropshipping pour tester, puis petit stock', text: 'Tu testes plusieurs produits sans stock. Dès qu’un produit vend tous les jours, tu en commandes un petit stock pour livrer plus vite et gagner en marge.' };
  const channel = ads
    ? { title: 'Publicité payante + vidéos', text: 'Garde au moins la moitié de ton budget pour tester tes pubs, avec un petit budget par jour. Les vidéos gratuites servent aussi de matière pour tes pubs.' }
    : { title: 'Vidéos gratuites TikTok et Reels', text: 'Pas de pub au début : 1 à 2 vidéos par jour suffisent pour trouver un angle qui fait vendre. La pub viendra quand une vidéo marche toute seule.' };

  // Budget : frais fixes connus, puis répartition du reste (exemple chiffré au milieu de sa tranche).
  const ref = REF[a.budget];
  const split = ads ? [['Publicité (tests puis vidéos gagnantes)', 60], ['Échantillons et produits de secours', 20], ['Réserve pour les imprévus', 20]]
    : a.budget === 'xs' ? [['Échantillon(s) pour filmer', 50], ['Réserve pour les imprévus', 50]]
      : [['Échantillons et produits de secours', 40], ['Booster une vidéo qui marche déjà', 30], ['Réserve pour les imprévus', 30]];
  const budget = {
    ref,
    fixed: [
      ['Nom de domaine', 'environ 10 à 15 € par an'],
      ['Abonnement Shopify', 'essai gratuit au début, puis tarif mensuel affiché sur shopify.com'],
      ['Logo, montage vidéo', '0 € avec Canva et CapCut (gratuits)'],
      ['Applications', '0 € : commence avec les versions gratuites'],
    ],
    split: split.map(([label, pct]) => ({ label, pct, amount: Math.round((ref * pct) / 100 / 5) * 5 })),
    note: ads ? 'Ne mets jamais tout ton budget pub d’un coup : de petits montants par jour, et tu coupes vite ce qui ne vend pas.' : 'Sans pub, ton vrai capital c’est ton temps : chaque vidéo publiée est un ticket gratuit pour être vu.',
  };

  const kpis = [
    ['Taux de conversion', 'ventes ÷ visites × 100', 'Repère courant en e-commerce : 1 à 3 %. En dessous de 1 %, travaille ta page produit avant d’amener plus de monde.'],
    ['Panier moyen', 'chiffre d’affaires ÷ nombre de commandes', 'Pour le monter : pack x2, livraison offerte dès un montant, petit accessoire en plus.'],
    ['Taux d’ajout au panier', 'ajouts au panier ÷ visites × 100', 'Bas : ta page ou ton prix ne convainc pas. Haut mais peu d’achats : livraison, délai ou confiance.'],
    ['Coût par achat maximum', 'ta marge par vente', 'Si une vente te coûte plus que ta marge en pub, tu perds de l’argent : le calculateur te donne ton seuil.'],
  ];

  const ctx = { ads, small, nicheTxt, lo, hi, product: p0?.title, url: p0?.url, niche: a.niche, nicheLabel: L, budgetLabel: START.budget[a.budget], timeLabel: START.time[a.time].toLowerCase(),
    daily: ads ? Math.min(50, Math.max(5, Math.round((REF[a.budget] * 0.6) / 14 / 5) * 5)) : 0, goalLine: goalLine.charAt(0).toUpperCase() + goalLine.slice(1) };
  const [w1, w2] = NAMES[a.niche];
  const content = {
    names: w1.flatMap((x, i) => [`${x} ${w2[i]}`, `${x} ${w2[i + 1]}`]).slice(0, 5),
    namesNote: 'Vérifie que le nom est libre sur Instagram, TikTok et en .fr / .com avant de le prendre.',
    ...readyContent(ctx),
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
    'Connecte le canal TikTok ou Meta et installe le suivi des ventes',
    'Passe une commande test de bout en bout',
    'Retire le mot de passe de la boutique (sinon personne ne peut acheter)',
    'Analyse la boutique avec l’audit Shoplift et corrige les points rouges',
    'Publie ta première vidéo',
  ];

  return { answers: a, id, why, goal, niche: { label: a.niche === 'any' ? 'Ta future niche' : L, ...N }, profile: Object.fromEntries(Object.entries(a).filter(([k]) => START[k]).map(([k, v]) => [k, START[k][v]])), model, channel, pace: PACE[a.time],
    glossary: GLOSSARY, mistakes: MISTAKES, roadmap: roadmap(ctx), weekCheck: WEEK_CHECK,
    budget, calc: { price: p0?.resale && p0.currency === 'EUR' ? Math.round((p0.resale.low + p0.resale.high) / 2) : '' }, kpis, days: planDays(ctx), products, content, checklist };
}

// Version Test : les 7 premiers jours, le budget, le calculateur, les repères, 1 produit et une partie des contenus.
// Le reste garde son titre (on voit ce qu'on débloque) mais pas son contenu.
export function lockStarter(plan) {
  const L = START_LIMITS, c = plan.content;
  return {
    ...plan,
    locked: true,
    days: plan.days.map((d) => (d.d <= L.days ? d : { d: d.d, week: d.week, weekTitle: d.weekTitle, title: d.title, min: d.min, locked: true })),
    products: plan.products.map((p, i) => (i < L.products ? p : { image: p.image, score: p.score, kind: p.kind, locked: true })),
    content: { names: c.names, namesNote: c.namesNote, hooks: c.hooks.slice(0, L.hooks), scripts: c.scripts.slice(0, L.scripts), locked: true,
      more: [`${c.hooks.length - L.hooks} accroches de plus`, `${c.scripts.length - L.scripts} scripts vidéo de plus`, 'Fiche produit à compléter', 'Page À propos', `FAQ (${c.faq.length} réponses)`, 'Page Livraison et retours', 'Message pour ton agent (en anglais)'] },
    checklist: plan.checklist.map((t, i) => (i < L.checklist ? t : null)),
    roadmap: plan.roadmap.map(([w, t]) => [w, t, null]),
  };
}

// ---------- Affichage commun (quiz de l'accueil et onglet « Plan » du tableau de bord) ----------
// Un plan découpé en onglets : « Aujourd'hui » (la mission du jour, étape par étape), le programme, l'objectif, etc.
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Photos des boutiques : version 400 px (les originaux Shopify font souvent 2 000 px et plus, très lourds sur téléphone).
const img = (src) => {
  if (/^radar-img\/[\w.-]+$/.test(src || '')) return esc(src);
  try { const u = new URL(src); if (u.protocol !== 'https:') return ''; if (u.hostname === 'cdn.shopify.com') u.searchParams.set('width', '400'); return esc(u.href); } catch { return ''; }
};
const eur = (n, c) => { try { return Number(n).toLocaleString('fr-FR', { style: 'currency', currency: c || 'EUR', maximumFractionDigits: 0 }); } catch { return `${Math.round(n)} €`; } };
const dur = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60}` : ''}` : `${m} min`);
// Date de chaque mission selon le rythme choisi (moins de 5 h : 1 jour sur 2 ; plus de 15 h : 2 missions par jour les 2 premières semaines).
const when = (start, d, time) => {
  const k = time === 'low' ? (d - 1) * 2 : time === 'high' ? (d <= 14 ? Math.floor((d - 1) / 2) : d - 8) : d - 1;
  return new Date(start + k * 86_400_000).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};
const mem = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage indisponible */ } },
};
const offerHtml = (icon, unlock, txt) => `<div class="sp-offer"><span class="sp-pill">Offre Lancement · -83 %</span><h4>${txt}</h4><p><b>99 €/an</b>, soit 8,25 €/mois au lieu de 49 €/mois : ton plan complet + tout Shoplift Pro (radar, espion, agents) pendant 1 an.</p>
  <button type="button" class="btn btn-main sp-unlock" data-start-unlock>${icon('unlock')} ${unlock}</button><small>Puis 89 € la 2e année, 79 € ensuite. Résiliable en 1 clic.</small></div>`;
const TABS = [['today', 'zap', 'Aujourd’hui'], ['prog', 'target', 'Programme'], ['track', 'activity', 'Suivi'], ['goal', 'coins', 'Objectif & budget'], ['prods', 'radar', 'Produits'], ['content', 'pen', 'Contenus'], ['check', 'store', 'Checklist'], ['guide', 'help', 'Guide']];

export function starterHtml(p, { icon = () => '', start = Date.now(), unlock = 'Débloquer mon plan complet' } = {}) {
  const lockBtn = (txt = unlock) => `<button type="button" class="btn btn-main sp-unlock" data-start-unlock>${icon('unlock')} ${txt}</button>`;
  const offer = (txt) => offerHtml(icon, unlock, txt);
  const copyBtn = (text, label) => `<button type="button" class="sp-copy" data-copy="${esc(text)}" data-copy-label="${esc(label)}">${icon('copy')} Copier</button>`;
  const card = (title, body, copy) => `<div class="sp-card"><h4>${title}${copy || ''}</h4>${body}</div>`;
  const prod = (x) => (x.locked
    ? `<div class="sp-prod is-locked"><span class="sp-img">${img(x.image) ? `<img src="${img(x.image)}" alt="" loading="lazy" decoding="async">` : ''}</span><b>${icon('lock')} ${esc(x.kind || 'Produit')}</b><small>Score ${x.score}/100</small></div>`
    : `<div class="sp-prod"><span class="sp-img">${img(x.image) ? `<img src="${img(x.image)}" alt="" loading="lazy" decoding="async">` : ''}<em>${x.score}/100</em></span><b>${esc(x.title)}</b>
      ${x.resale ? `<small>Revente conseillée : ${eur(x.resale.low, x.currency)} à ${eur(x.resale.high, x.currency)}</small>` : ''}<ul>${x.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      ${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener nofollow">Voir chez le vendeur →</a>` : ''}</div>`);
  const ctaLocked = (txt) => (p.locked ? offer(txt) : '');
  const c = p.content, b = p.budget, g = p.goal, N = p.niche;
  const weeks = [1, 2, 3, 4].map((w) => {
    const list = p.days.filter((d) => d.week === w);
    return `<div class="sp-wk"><p class="sp-k">Semaine ${w} · ${dur(list.reduce((s, d) => s + d.min, 0))}</p><h4>${esc(list[0].weekTitle)}</h4>
      ${list.map((d) => `<button type="button" class="sp-row${d.locked ? ' is-locked' : ''}" data-open-day="${d.d}"><span class="sp-dn">${d.d}</span><span class="sp-rt"><b>${esc(d.title)}</b><i>${when(start, d.d, p.answers.time)} · ${dur(d.min)}</i></span>${icon(d.locked ? 'lock' : 'arrow')}</button>`).join('')}
      <div class="sp-cp"><p class="sp-k">${icon('award')} Bilan de la semaine ${w}</p>${p.weekCheck[w - 1].map((t, i) => `<label><input type="checkbox" data-cp="${w}-${i}"><span>${esc(t)}</span></label>`).join('')}</div></div>`;
  }).join('');
  const contents = [
    card('Noms de boutique', `<p class="sp-names">${c.names.map((n) => `<span>${esc(n)}</span>`).join('')}</p><small>${esc(c.namesNote)}</small>`),
    card('Accroches qui retiennent', `<ol class="sp-list">${c.hooks.map((h) => `<li>${esc(h)}</li>`).join('')}</ol>`, copyBtn(c.hooks.join('\n'), 'Accroches')),
    ...c.scripts.map((s, i) => card(`Script vidéo ${i + 1}`, `<p><b>Accroche :</b> ${esc(s.hook)}</p><p>${esc(s.scenes)}</p><p><b>Fin :</b> ${esc(s.cta)}</p>`, copyBtn(`Accroche : ${s.hook}\n${s.scenes}\nFin : ${s.cta}`, 'Script'))),
    ...(c.locked ? [] : [
      card('Fiche produit à compléter', `<pre>${esc(c.description)}</pre>`, copyBtn(c.description, 'Fiche produit')),
      card('Page À propos', `<pre>${esc(c.about)}</pre>`, copyBtn(c.about, 'Page À propos')),
      card('FAQ', c.faq.map(([q, r]) => `<p><b>${esc(q)}</b><br>${esc(r)}</p>`).join(''), copyBtn(c.faq.map(([q, r]) => `${q}\n${r}`).join('\n\n'), 'FAQ')),
      card('Livraison et retours', `<pre>${esc(c.shipping)}</pre>`, copyBtn(c.shipping, 'Page Livraison et retours')),
      card('Message pour ton agent', `<pre>${esc(c.agent)}</pre><small>En anglais, la langue des agents. Envoie-le sur WhatsApp depuis l’onglet Agents.</small>`, copyBtn(c.agent, 'Message pour l’agent')),
    ]),
    c.locked ? `<div class="sp-card is-locked"><h4>${icon('lock')} Encore ${c.more.length} contenus prêts</h4><ul class="sp-list">${c.more.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></div>${offer('Débloque tous tes contenus prêts à copier')}` : '',
  ].join('');
  const left = p.checklist.filter((t) => t === null).length;
  const panels = {
    today: '<div data-today></div>',
    prog: `<p class="sp-note">${esc(p.pace)} Touche une mission pour l’ouvrir.</p><div class="sp-weeks">${weeks}</div>
      ${ctaLocked('Les jours 1 à 7 sont offerts. Débloque les 23 missions suivantes : boutique, vidéos, lancement et premières ventes.')}
      <h3 class="sp-h">${icon('trend')} Et après les 30 jours ?</h3>
      <div class="sp-road">${p.roadmap.map(([w, t, x]) => `<div class="sp-card${x ? '' : ' is-locked'}"><p class="sp-k">${esc(w)}</p><h4>${esc(t)}</h4>${x ? `<p>${esc(x)}</p>` : `<p class="sp-blur">${icon('lock')} Inclus dans le plan complet</p>`}</div>`).join('')}</div>`,
    track: `<p class="sp-note">Note tes chiffres chaque soir (2 minutes) : tu sauras quoi garder et quoi couper. Tout reste sur ton appareil.</p>
      <form class="sp-card sp-log" data-log><div class="sp-in"><label>Date<input type="date" name="day" required></label><label>Vues vidéos<input type="number" name="views" min="0" inputmode="numeric" placeholder="0"></label>
        <label>Visites boutique<input type="number" name="visits" min="0" inputmode="numeric" placeholder="0"></label><label>Ventes<input type="number" name="sales" min="0" inputmode="numeric" placeholder="0"></label>
        <label>Chiffre d’affaires (€)<input type="number" name="ca" min="0" step="0.01" inputmode="decimal" placeholder="0"></label><label>Dépenses (€)<input type="number" name="spend" min="0" step="0.01" inputmode="decimal" placeholder="0"></label></div>
        <button type="submit" class="btn btn-main">${icon('check')} Enregistrer ma journée</button></form>
      <div data-logout></div>`,
    goal: `<div class="sp-out4">${g.target ? `<div><small>Bénéfice visé</small><b>${eur(g.target)}/mois</b></div><div><small>Ventes nécessaires</small><b>≈ ${g.sales.toLocaleString('fr-FR')}/mois</b></div><div><small>Soit par jour</small><b>≈ ${String(g.perDay).replace('.', ',')}</b></div><div><small>Visites à prévoir</small><b>≈ ${g.visits.toLocaleString('fr-FR')}/mois</b></div>`
      : `<div><small>Objectif</small><b>1re vente</b></div><div><small>Visites à prévoir</small><b>50 à 100</b></div><div><small>Prix conseillé</small><b>≈ ${eur(g.price)}</b></div><div><small>Marge estimée</small><b>≈ ${eur(g.margin)}</b></div>`}</div>
      <p class="sp-note">Estimation sur un prix de vente d’environ ${eur(g.price)} et une marge d’environ ${eur(g.margin)} par vente (35 %), avec 2 visiteurs sur 100 qui achètent. Affine avec le calculateur ci-dessous.</p>
      <h3 class="sp-h">${icon('coins')} Calcule ta marge</h3>
      <div class="sp-card sp-calc" data-calc>
        <div class="sp-in"><label>Coût du produit (€)<input type="number" name="cost" min="0" step="0.01" inputmode="decimal" placeholder="ex : 8"></label>
          <label>Livraison au client (€)<input type="number" name="ship" min="0" step="0.01" inputmode="decimal" placeholder="ex : 4"></label>
          <label>Ton prix de vente (€)<input type="number" name="price" min="0" step="0.01" inputmode="decimal" value="${esc(p.calc.price)}" placeholder="ex : 29"></label>
          <label>Frais de paiement (%)<input type="number" name="fee" min="0" max="20" step="0.1" inputmode="decimal" value="3"></label></div>
        <div class="sp-out" aria-live="polite"><div><small>Marge par vente</small><b data-o="m">–</b></div><div><small>Marge</small><b data-o="pct">–</b></div>
          <div><small>Ventes pour rembourser 100 € de pub</small><b data-o="ads">–</b></div><div><small>Seuil de rentabilité pub (ROAS)</small><b data-o="roas">–</b></div></div>
        <small class="sp-hint" data-o="tip"></small></div>
      <h3 class="sp-h">${icon('euro')} Ton budget</h3>
      <div class="sp-card"><p class="sp-k">Le reste, par exemple avec ${eur(b.ref)}</p>${b.split.map((x) => `<div class="sp-bar"><span>${esc(x.label)}</span><b>${x.pct} % · ${eur(x.amount)}</b><i style="--w:${x.pct}%"></i></div>`).join('')}<small>${esc(b.note)}</small></div>
      <div class="sp-card"><p class="sp-k">Frais de départ</p><table class="sp-tab">${b.fixed.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table></div>
      <h3 class="sp-h">${icon('activity')} Tes repères à suivre</h3>
      <div class="sp-contents">${p.kpis.map(([k, f, t]) => card(esc(k), `<p class="sp-f">${esc(f)}</p><p>${esc(t)}</p>`)).join('')}</div>`,
    prods: `<div class="sp-duo"><div class="sp-card"><p class="sp-k">Ton modèle</p><h4>${esc(p.model.title)}</h4><p>${esc(p.model.text)}</p></div>
        <div class="sp-card"><p class="sp-k">Tes ventes viendront de</p><h4>${esc(p.channel.title)}</h4><p>${esc(p.channel.text)}</p></div></div>
      <p class="sp-note">Vrais produits relevés par le radar Shoplift, choisis pour ton budget et ta façon de vendre.</p>
      <div class="sp-prods">${p.products.map(prod).join('') || '<p class="sp-note">Le radar se recharge : réessaie dans quelques minutes.</p>'}</div>${ctaLocked('Débloque tous les produits sélectionnés pour toi.')}`,
    content: `<div class="sp-contents">${contents}</div>`,
    check: `<p class="sp-note">Coche au fur et à mesure : ta progression est gardée sur cet appareil.</p><ul class="sp-check">${p.checklist.map((t, i) => (t === null ? '' : `<li><label><input type="checkbox" data-check="${i}"><span>${esc(t)}</span></label></li>`)).join('')}
      ${left ? `<li class="is-locked"><span>${icon('lock')} ${left} étapes de plus</span></li>` : ''}</ul>${ctaLocked('Débloque la checklist entière.')}`,
    guide: `<div class="sp-duo"><div class="sp-card"><p class="sp-k">${esc(N.label)} · tes clients</p><p>${esc(N.audience)}</p><p class="sp-k" style="margin-top:12px">Angles qui marchent</p><ul class="sp-list">${N.angles.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div class="sp-card"><p class="sp-k">Idées de vidéos</p><ul class="sp-list">${N.ideas.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><p class="sp-tip">${icon('alert')} ${esc(N.watch)}</p></div></div>
      <h3 class="sp-h">${icon('alert')} Les erreurs de débutant</h3>
      <div class="sp-contents">${p.mistakes.map(([t, x]) => `<div class="sp-card sp-mis"><h4>${icon('x')} ${esc(t)}</h4><p>${icon('check')} ${esc(x)}</p></div>`).join('')}</div>
      <h3 class="sp-h">${icon('file')} Les mots du e-commerce</h3>
      <div class="sp-gloss">${p.glossary.map(([t, x]) => `<details><summary>${esc(t)}</summary><p>${esc(x)}</p></details>`).join('')}</div>`,
  };
  const why = p.why.split(/(?<=\.)\s+/);
  return `<div class="sp" data-sp>
    <div class="sp-hero"><div class="sp-ring" data-ring><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27"/><circle cx="32" cy="32" r="27" data-arc/></svg><b data-pct>0 %</b></div>
      <div class="sp-ht"><p class="sp-k">Plan ${esc(p.id)} · créé le ${new Date(start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
        <h3>${p.answers.name ? `Le plan de ${esc(p.answers.name)}` : 'Ton plan personnalisé'}</h3><small data-prog>0/30 missions terminées</small></div>
      <p class="sp-why">${esc(why.slice(0, 2).join(' '))}${why.length > 2 ? ` <span class="sp-more" hidden>${esc(why.slice(2).join(' '))}</span> <button type="button" class="sp-link" data-more>Lire la suite</button>` : ''}</p>
      <div class="sp-profile">${Object.values(p.profile).map((v) => `<span>${esc(v)}</span>`).join('')}</div></div>
    <nav class="sp-tabs" role="tablist">${TABS.map(([id, ic, l], i) => `<button type="button" role="tab" data-tab-sp="${id}" aria-selected="${i === 0}">${icon(ic)} ${l}</button>`).join('')}</nav>
    ${TABS.map(([id], i) => `<section class="sp-panel" data-panel="${id}"${i ? ' hidden' : ''}>${panels[id]}</section>`).join('')}
  </div>`;
}

// Petite fête en CSS (pas de canvas) : quelques confettis répartis qui partent du bouton, puis disparaissent.
export function burst(el) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = el.getBoundingClientRect(), box = document.createElement('div');
  box.className = 'sp-burst';
  box.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px`;
  const v = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const colors = [v('--green'), v('--green2'), '#f4f1ea', v('--gold')];
  box.innerHTML = Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2, d = 60 + (i % 3) * 30; return `<i style="--x:${Math.round(Math.cos(a) * d)}px;--y:${Math.round(Math.sin(a) * d - 30)}px;--r:${i * 47}deg;background:${colors[i % 4]}"></i>`; }).join('');
  document.body.append(box);
  setTimeout(() => box.remove(), 1100);
}

// Interactions : onglets, mission du jour (étapes à cocher), progression, checklist, calculateur. Tout est gardé sur l'appareil.
export function bindStarter(root, p, { icon = () => '', start = Date.now(), unlock = 'Débloquer mon plan complet' } = {}) {
  const sp = root.querySelector('[data-sp]');
  if (!sp) return;
  const days = mem.get('sl_days'), steps = mem.get('sl_steps'), check = mem.get('sl_check'), cps = mem.get('sl_cp'), log = mem.get('sl_log');
  const firstOpen = () => (p.days.find((d) => !d.locked && !days[d.d]) || p.days.find((d) => d.locked) || p.days[29]).d;
  let cur = firstOpen();
  const tab = (id) => {
    sp.querySelectorAll('[data-tab-sp]').forEach((b) => b.setAttribute('aria-selected', b.dataset.tabSp === id));
    sp.querySelectorAll('[data-panel]').forEach((x) => { x.hidden = x.dataset.panel !== id; });
    top();
    const b = sp.querySelector(`[data-tab-sp="${id}"]`), nav = b.parentNode;
    nav.scrollTo({ left: b.offsetLeft - (nav.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
  };
  // Remonte au début du contenu (juste sous les onglets) si on est plus bas : on voit toujours le haut de ce qu'on ouvre.
  const top = () => {
    const nav = sp.querySelector('.sp-tabs'), stick = parseFloat(getComputedStyle(nav).top) || 0;
    const y = sp.querySelector('.sp-hero').getBoundingClientRect().bottom + scrollY - stick;
    if (scrollY > y) scrollTo({ top: y, behavior: 'instant' });
  };
  const progress = () => {
    const n = p.days.filter((d) => days[d.d]).length, pct = Math.round((n / 30) * 100);
    sp.querySelector('[data-prog]').textContent = `${n}/30 missions terminées`;
    sp.querySelector('[data-pct]').textContent = `${pct} %`;
    sp.querySelector('[data-arc]').style.strokeDashoffset = String(169.6 * (1 - pct / 100));
  };
  const today = () => {
    const d = p.days[cur - 1], out = sp.querySelector('[data-today]');
    const dots = `<div class="sp-dots">${p.days.map((x) => `<button type="button" class="${days[x.d] ? 'done' : ''}${x.d === cur ? ' cur' : ''}${x.locked ? ' lock' : ''}" data-open-day="${x.d}" aria-label="Jour ${x.d}"></button>`).join('')}</div>`;
    if (d.locked) {
      out.innerHTML = `${dots}<div class="sp-today is-locked"><span class="sp-pill">Jour ${d.d} sur 30</span><h3>${esc(d.title)}</h3>
        <p class="sp-why">La suite de ton plan est prête : ${30 - 7} missions détaillées pour monter ta boutique, lancer tes vidéos et faire tes premières ventes.</p></div>
        ${offerHtml(icon, unlock, 'Débloque les 23 missions suivantes')}`;
      return;
    }
    const n = d.steps.filter((_, i) => steps[`${d.d}-${i}`]).length;
    out.innerHTML = `${dots}<div class="sp-today${days[d.d] ? ' is-done' : ''}">
      <div class="sp-ttop"><span class="sp-pill">Jour ${d.d} sur 30</span><span>${when(start, d.d, p.answers.time)} · ${dur(d.min)}</span></div>
      <h3>${esc(d.title)}</h3><p class="sp-why">${esc(d.why)}</p>
      <p class="sp-res">${icon('target')} <span><b>À la fin :</b> ${esc(d.out)}</span></p>
      <div class="sp-sbar"><i style="width:${Math.round((n / d.steps.length) * 100)}%"></i></div><small class="sp-scount">${n}/${d.steps.length} étapes</small>
      <ol class="sp-steps">${d.steps.map((s, i) => `<li><button type="button" data-step="${d.d}-${i}" aria-pressed="${!!steps[`${d.d}-${i}`]}"><span class="sp-cb">${icon('check')}</span><span>${esc(s)}</span></button></li>`).join('')}</ol>
      ${d.tip ? `<p class="sp-tip">${icon('zap')} ${esc(d.tip)}</p>` : ''}
      ${d.tools?.length ? `<p class="sp-tools">${d.tools.map((t) => (TOOLS[t] ? `<a href="${esc(TOOLS[t][1])}"${TOOLS[t][1].startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${icon('link')} ${esc(TOOLS[t][0])}</a>` : '')).join('')}</p>` : ''}
      <div class="sp-tnav"><button type="button" class="btn btn-ghost" data-day-move="-1"${d.d === 1 ? ' disabled' : ''}>←</button>
        <button type="button" class="btn btn-main" data-finish>${days[d.d] ? `${icon('check')} Terminée · voir la suivante` : `Mission terminée ${icon('check')}`}</button>
        <button type="button" class="btn btn-ghost" data-day-move="1"${d.d === 30 ? ' disabled' : ''}>→</button></div></div>`;
  };
  const calc = () => sp.querySelectorAll('[data-calc]').forEach((box) => {
    const v = (n) => Math.max(0, parseFloat(box.querySelector(`[name=${n}]`).value.replace(',', '.')) || 0);
    const price = v('price'), cost = v('cost') + v('ship'), m = price * (1 - v('fee') / 100) - cost;
    const set = (k, t) => { box.querySelector(`[data-o=${k}]`).textContent = t; };
    const ok = price > 0 && cost > 0;
    set('m', ok ? eur(m) : '–');
    set('pct', ok ? `${Math.round((m / price) * 100)} %` : '–');
    set('ads', ok ? (m > 0 ? `${Math.ceil(100 / m)} ventes` : 'impossible') : '–');
    set('roas', ok && m > 0 ? `${(price / m).toFixed(1).replace('.', ',')}` : '–');
    set('tip', !ok ? 'Entre le coût donné par ton agent : tout se calcule tout seul. Vérifie tes vrais frais de paiement dans Shopify.'
      : m <= 0 ? 'Tu perds de l’argent à chaque vente : monte ton prix ou trouve un coût plus bas.'
        : price < cost * 2.5 ? `Marge serrée : vise au moins ${eur(cost * 2.5)} de prix de vente (2,5 fois ton coût).`
          : `Bonne marge. En pub, chaque euro dépensé doit rapporter au moins ${(price / m).toFixed(1).replace('.', ',')} € de ventes pour être rentable.`);
  });
  // Suivi quotidien : vues, visites, ventes, chiffre d'affaires, dépenses (14 derniers jours + totaux).
  const track = () => {
    const out = sp.querySelector('[data-logout]'), rows = Object.entries(log).sort((x, y) => (x[0] < y[0] ? 1 : -1));
    if (!rows.length) { out.innerHTML = '<p class="sp-note">Ta première journée enregistrée apparaîtra ici, avec tes totaux et ton taux de conversion.</p>'; return; }
    const sum = (k) => rows.reduce((s, [, r]) => s + (Number(r[k]) || 0), 0), vis = sum('visits'), sal = sum('sales');
    const max = Math.max(1, ...rows.slice(0, 14).map(([, r]) => Number(r.visits) || 0));
    const fmtD = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    out.innerHTML = `<div class="sp-out4"><div><small>Visites</small><b>${vis.toLocaleString('fr-FR')}</b></div><div><small>Ventes</small><b>${sal}</b></div>
      <div><small>Conversion</small><b>${vis ? `${((sal / vis) * 100).toFixed(1).replace('.', ',')} %` : '–'}</b></div><div><small>CA − dépenses</small><b>${eur(sum('ca') - sum('spend'))}</b></div></div>
      <div class="sp-card"><p class="sp-k">Visites par jour</p><div class="sp-chart">${rows.slice(0, 14).reverse().map(([d, r]) => `<span title="${fmtD(d)}"><i style="height:${Math.max(4, ((Number(r.visits) || 0) / max) * 100)}%"></i><small>${fmtD(d).split(' ')[0]}</small></span>`).join('')}</div></div>
      <div class="sp-card"><table class="sp-tab sp-logtab"><tr><td>Jour</td><td>Vues</td><td>Visites</td><td>Ventes</td><td></td></tr>${rows.slice(0, 14).map(([d, r]) => `<tr><td>${fmtD(d)}</td><td>${Number(r.views) || 0}</td><td>${Number(r.visits) || 0}</td><td>${Number(r.sales) || 0}</td><td><button type="button" class="sp-del" data-del="${esc(d)}" aria-label="Supprimer">${icon('x')}</button></td></tr>`).join('')}</table></div>`;
  };
  const form = sp.querySelector('[data-log]');
  if (form) {
    form.day.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(form));
      log[f.day] = { views: f.views, visits: f.visits, sales: f.sales, ca: f.ca, spend: f.spend };
      mem.set('sl_log', log); track(); burst(form.querySelector('button'));
      ['views', 'visits', 'sales', 'ca', 'spend'].forEach((k) => { form[k].value = ''; });
    });
  }
  sp.querySelectorAll('[data-check]').forEach((x) => { x.checked = !!check[x.dataset.check]; });
  sp.querySelectorAll('[data-cp]').forEach((x) => { x.checked = !!cps[x.dataset.cp]; });
  sp.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab-sp]'); if (t) return tab(t.dataset.tabSp);
    if (e.target.closest('[data-more]')) { sp.querySelector('.sp-more').hidden = false; e.target.closest('[data-more]').remove(); return; }
    const o = e.target.closest('[data-open-day]');
    if (o) { cur = Number(o.dataset.openDay); today(); return tab('today'); }
    const del = e.target.closest('[data-del]');
    if (del) { delete log[del.dataset.del]; mem.set('sl_log', log); return track(); }
    const st = e.target.closest('[data-step]');
    if (st) { steps[st.dataset.step] = !steps[st.dataset.step]; mem.set('sl_steps', steps); return today(); }
    const mv = e.target.closest('[data-day-move]');
    if (mv) { cur = Math.min(30, Math.max(1, cur + Number(mv.dataset.dayMove))); today(); return top(); }
    const fin = e.target.closest('[data-finish]');
    if (fin) {
      const was = days[cur];
      if (!was) { days[cur] = true; mem.set('sl_days', days); burst(fin); progress(); }
      setTimeout(() => { cur = Math.min(30, cur + 1); today(); top(); }, was ? 0 : 450);
    }
  });
  sp.addEventListener('change', (e) => {
    const c = e.target.closest('[data-check]');
    if (c) { check[c.dataset.check] = c.checked; mem.set('sl_check', check); }
    const k = e.target.closest('[data-cp]');
    if (k) { cps[k.dataset.cp] = k.checked; mem.set('sl_cp', cps); if (k.checked && [...k.closest('.sp-cp').querySelectorAll('input')].every((x) => x.checked)) burst(k); }
  });
  sp.addEventListener('input', (e) => { if (e.target.closest('[data-calc]')) calc(); });
  progress(); today(); calc(); track();
}
