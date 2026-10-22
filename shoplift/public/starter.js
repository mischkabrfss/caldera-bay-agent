// Parcours « je pars de zéro » : plan de lancement assemblé à partir des réponses du quiz (règles fixes : aucun coût
// par client, rien à maintenir) et de vrais produits relevés par le radar. Utilisé par le serveur, l'aperçu et l'affichage.
import { NICHE_INFO, planDays, readyContent, TOOLS } from './starter-days.js';
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
  };
}

// Affichage commun (quiz de l'accueil et onglet « Plan » du tableau de bord).
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
  return new Date(start + k * 86_400_000).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
};

export function starterHtml(p, { icon = () => '', done = {}, days = {}, start = Date.now(), unlock = 'Débloquer mon plan complet' } = {}) {
  const lockBtn = (txt) => `<button type="button" class="btn btn-main sp-unlock" data-start-unlock>${icon('unlock')} ${txt}</button>`;
  const copyBtn = (text, label) => `<button type="button" class="sp-copy" data-copy="${esc(text)}" data-copy-label="${esc(label)}">${icon('copy')} Copier</button>`;
  const card = (title, body, copy) => `<div class="sp-card"><h4>${title}${copy || ''}</h4>${body}</div>`;
  const prod = (x) => (x.locked
    ? `<div class="sp-prod is-locked"><span class="sp-img">${img(x.image) ? `<img src="${img(x.image)}" alt="" loading="lazy" decoding="async">` : ''}</span><b>${icon('lock')} ${esc(x.kind || 'Produit')}</b><small>Score ${x.score}/100</small></div>`
    : `<div class="sp-prod"><span class="sp-img">${img(x.image) ? `<img src="${img(x.image)}" alt="" loading="lazy" decoding="async">` : ''}<em>${x.score}/100</em></span><b>${esc(x.title)}</b>
      ${x.resale ? `<small>Revente conseillée : ${eur(x.resale.low, x.currency)} à ${eur(x.resale.high, x.currency)}</small>` : ''}<ul>${x.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      ${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener nofollow">Voir chez le vendeur →</a>` : ''}</div>`);
  const day = (d) => (d.locked
    ? `<div class="sp-day is-locked"><span class="sp-dn">${d.d}</span><b>${esc(d.title)}<i>${when(start, d.d, p.answers.time)}</i></b><small>${icon('lock')} ${dur(d.min)}</small></div>`
    : `<details class="sp-day${days[d.d] ? ' is-done' : ''}"${d.d === 1 && !days[1] ? ' open' : ''}><summary><span class="sp-dn">${days[d.d] ? icon('check') : d.d}</span><b>${esc(d.title)}<i>${when(start, d.d, p.answers.time)}</i></b><small>${dur(d.min)}</small></summary>
      <div class="sp-dbody"><p class="sp-res">${icon('target')} <span><b>À la fin :</b> ${esc(d.out)}</span></p><ol>${d.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>${d.tip ? `<p class="sp-tip">${icon('zap')} ${esc(d.tip)}</p>` : ''}
      ${d.tools?.length ? `<p class="sp-tools">${d.tools.map((t) => TOOLS[t] ? `<a href="${esc(TOOLS[t][1])}"${TOOLS[t][1].startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${icon('link')} ${esc(TOOLS[t][0])}</a>` : '').join('')}</p>` : ''}
      <label class="sp-done"><input type="checkbox" data-day="${d.d}"${days[d.d] ? ' checked' : ''}> Mission terminée</label></div></details>`);
  const weeks = [1, 2, 3, 4].map((w) => {
    const list = p.days.filter((d) => d.week === w);
    return `<div class="sp-wk"><p class="sp-k">Semaine ${w} · ${dur(list.reduce((s, d) => s + d.min, 0))}</p><h4>${esc(list[0].weekTitle)}</h4>${list.map(day).join('')}</div>`;
  }).join('');
  const c = p.content;
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
    c.locked ? `<div class="sp-card is-locked"><h4>${icon('lock')} Encore ${c.more.length} contenus prêts</h4><ul class="sp-list">${c.more.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>${lockBtn(unlock)}</div>` : '',
  ].join('');
  const b = p.budget;
  const left = p.checklist.filter((t) => t === null).length;
  const doneN = Object.values(days).filter(Boolean).length, g = p.goal, N = p.niche;
  return `<div class="sp">
    <div class="sp-hero"><p class="sp-k">Plan ${esc(p.id)} · créé le ${new Date(start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
      <h3>${p.answers.name ? `Le plan de ${esc(p.answers.name)}` : 'Ton plan de lancement personnalisé'}</h3><p>${esc(p.why)}</p>
      <div class="sp-prog" aria-label="Progression"><i style="width:${Math.round((doneN / 30) * 100)}%"></i></div><small data-prog>${doneN}/30 missions terminées</small></div>
    <div class="sp-profile">${Object.values(p.profile).map((v) => `<span>${esc(v)}</span>`).join('')}</div>
    <h3 class="sp-h">${icon('award')} Ton objectif en chiffres</h3>
    <div class="sp-out4">${g.target ? `<div><small>Bénéfice visé</small><b>${eur(g.target)}/mois</b></div><div><small>Ventes nécessaires</small><b>≈ ${g.sales}/mois</b></div><div><small>Soit par jour</small><b>≈ ${String(g.perDay).replace('.', ',')}</b></div><div><small>Visites à prévoir</small><b>≈ ${g.visits}/mois</b></div>`
      : `<div><small>Objectif</small><b>1re vente</b></div><div><small>Visites à prévoir</small><b>50 à 100</b></div><div><small>Prix conseillé</small><b>≈ ${eur(g.price)}</b></div><div><small>Marge estimée</small><b>≈ ${eur(g.margin)}</b></div>`}</div>
    <p class="sp-note">Estimation sur un prix de vente d’environ ${eur(g.price)} et une marge d’environ ${eur(g.margin)} par vente (35 %), avec 2 visiteurs sur 100 qui achètent. Affine avec le calculateur plus bas.</p>
    <h3 class="sp-h">${icon('sprout')} ${esc(N.label)} : ce qu’il faut savoir</h3>
    <div class="sp-duo"><div class="sp-card"><p class="sp-k">Tes clients</p><p>${esc(N.audience)}</p><p class="sp-k" style="margin-top:12px">Angles qui marchent</p><ul class="sp-list">${N.angles.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="sp-card"><p class="sp-k">Idées de vidéos</p><ul class="sp-list">${N.ideas.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><p class="sp-tip">${icon('alert')} ${esc(N.watch)}</p></div></div>
    <div class="sp-duo"><div class="sp-card"><p class="sp-k">Ton modèle</p><h4>${esc(p.model.title)}</h4><p>${esc(p.model.text)}</p></div>
      <div class="sp-card"><p class="sp-k">Tes ventes viendront de</p><h4>${esc(p.channel.title)}</h4><p>${esc(p.channel.text)}</p></div></div>

    <h3 class="sp-h">${icon('target')} Ton plan jour par jour</h3>
    <p class="sp-note">30 missions expliquées pas à pas. ${esc(p.pace)}</p>
    <div class="sp-weeks">${weeks}</div>
    ${p.locked ? `<div class="sp-cta"><p>Les jours 1 à 7 sont offerts. Débloque les 23 missions suivantes : boutique, vidéos, lancement et premières ventes.</p>${lockBtn(unlock)}</div>` : ''}

    <h3 class="sp-h">${icon('euro')} Ton budget</h3>
    <div class="sp-duo"><div class="sp-card"><p class="sp-k">Frais de départ</p><table class="sp-tab">${b.fixed.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table></div>
      <div class="sp-card"><p class="sp-k">Le reste, par exemple avec ${eur(b.ref)}</p><table class="sp-tab">${b.split.map((x) => `<tr><td>${esc(x.label)}</td><td><b>${x.pct} %</b> · ${eur(x.amount)}</td></tr>`).join('')}</table><small>${esc(b.note)}</small></div></div>

    <h3 class="sp-h">${icon('coins')} Calcule ta marge</h3>
    <div class="sp-card sp-calc" data-calc>
      <div class="sp-in"><label>Coût du produit (€)<input type="number" name="cost" min="0" step="0.01" inputmode="decimal" placeholder="ex : 8"></label>
        <label>Livraison au client (€)<input type="number" name="ship" min="0" step="0.01" inputmode="decimal" placeholder="ex : 4"></label>
        <label>Ton prix de vente (€)<input type="number" name="price" min="0" step="0.01" inputmode="decimal" value="${esc(p.calc.price)}" placeholder="ex : 29"></label>
        <label>Frais de paiement (%)<input type="number" name="fee" min="0" max="20" step="0.1" inputmode="decimal" value="3"></label></div>
      <div class="sp-out" aria-live="polite"><div><small>Marge par vente</small><b data-o="m">–</b></div><div><small>Marge</small><b data-o="pct">–</b></div>
        <div><small>Ventes pour rembourser 100 € de pub</small><b data-o="ads">–</b></div><div><small>Seuil de rentabilité pub (ROAS)</small><b data-o="roas">–</b></div></div>
      <small class="sp-hint" data-o="tip">Entre le coût donné par ton agent : tout se calcule tout seul. Vérifie tes vrais frais de paiement dans Shopify.</small></div>

    <h3 class="sp-h">${icon('activity')} Tes repères à suivre</h3>
    <div class="sp-contents">${p.kpis.map(([k, f, t]) => card(esc(k), `<p class="sp-f">${esc(f)}</p><p>${esc(t)}</p>`)).join('')}</div>

    <h3 class="sp-h">${icon('radar')} Produits qui se vendent en ce moment</h3>
    <p class="sp-note">Vrais produits relevés par le radar Shoplift, choisis pour ton budget et ta façon de vendre.</p>
    <div class="sp-prods">${p.products.map(prod).join('') || '<p class="sp-note">Le radar se recharge : réessaie dans quelques minutes.</p>'}</div>

    <h3 class="sp-h">${icon('pen')} Contenus prêts à copier</h3><div class="sp-contents">${contents}</div>

    <h3 class="sp-h">${icon('store')} Checklist Shopify</h3>
    <ul class="sp-check">${p.checklist.map((t, i) => (t === null ? '' : `<li><label><input type="checkbox" data-check="${i}"${done[i] ? ' checked' : ''}><span>${esc(t)}</span></label></li>`)).join('')}
      ${left ? `<li class="is-locked"><span>${icon('lock')} ${left} étapes de plus</span></li>` : ''}</ul>
    ${p.locked ? `<div class="sp-cta"><p>Le plan complet : les 30 missions, tous les produits, tous les contenus prêts à copier et la checklist entière.</p>${lockBtn(unlock)}</div>` : ''}
  </div>`;
}

// Calculateur de marge (sur la page qui affiche le plan).
export function bindStarter(root, onDay) {
  const calc = () => root.querySelectorAll('[data-calc]').forEach((box) => {
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
  root.addEventListener('input', (e) => { if (e.target.closest('[data-calc]')) calc(); });
  root.addEventListener('change', (e) => {
    const box = e.target.closest('[data-day]');
    if (!box) return;
    const d = box.closest('.sp-day');
    d.classList.toggle('is-done', box.checked);
    d.querySelector('.sp-dn').innerHTML = box.checked ? (globalThis.icon ? globalThis.icon('check') : '✓') : box.dataset.day;
    onDay?.(box.dataset.day, box.checked);
    const n = root.querySelectorAll('[data-day]:checked').length + root.querySelectorAll('.sp-day.is-done:not(details)').length;
    const prog = root.querySelector('[data-prog]');
    if (prog) { prog.textContent = `${n}/30 missions terminées`; root.querySelector('.sp-prog i').style.width = `${Math.round((n / 30) * 100)}%`; }
  });
  calc();
}
