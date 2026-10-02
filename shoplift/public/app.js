// Tableau de bord Shoplift.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const safeImg = (src) => {
  if (/^data:image\/(svg\+xml,|(webp|jpeg|png|gif);base64,)/.test(src || '') || /^(radar|spy)-img\/[\w.-]+$/.test(src || '')) return esc(src); // miniatures locales de l'aperçu
  if (!/^https?:\/\//.test(src || '')) return '';
  try { const u = new URL(src); if (u.hostname === 'cdn.shopify.com') u.searchParams.set('width', '400'); return esc(u.href); } catch { return ''; }
};
// Photo illisible (supprimée, ou bloquée par la page d'aperçu) : visuel neutre au lieu d'une image cassée.
const NO_PHOTO = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#1a1a1a"/><path d="M130 250l50-60 40 45 30-30 50 45z" fill="#4a4a4a"/><circle cx="250" cy="160" r="22" fill="#4a4a4a"/></svg>')}`;
document.addEventListener('error', (e) => { const img = e.target; if (img.tagName === 'IMG' && !img.src.startsWith('data:')) img.src = NO_PHOTO; }, true);
const money = (n, cur = 'EUR') => { try { return Number(n).toLocaleString('fr-FR', { style: 'currency', currency: cur, maximumFractionDigits: 2 }); } catch { return `${n} €`; } };
const store = { get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage indisponible */ } } };

const PLAN_INFO = {
  basic: { name: 'Basique', price: '19 €', pitch: 'Audit complet illimité + toutes les fiches notées' },
  pro: { name: 'Pro', price: '49 €', pitch: 'Radar produits gagnants + espion concurrents', feat: true },
  scale: { name: 'Scale', price: '99 €', pitch: 'Comparateur 4 boutiques + rapports PDF & Excel' },
};
const RANK = { test: 0, basic: 1, pro: 2, scale: 3 };
// Ce que chaque offre inclut, dit simplement.
const INCLUDED = {
  test: ['1 analyse gratuite de ta boutique', 'Ton score et tes 3 corrections les plus importantes', 'Un aperçu de l’espion sur n’importe quel concurrent'],
  basic: ['Analyses illimitées de ta boutique', 'Le plan d’action complet, du plus important au moins important', 'La note de chacun de tes produits, avec quoi corriger', 'L’espion : stratégie, conseils et graphiques de tes concurrents', '1 agent de sourcing vérifié et connectable à Shopify (WhatsApp + e-mail)', 'Ton compte accessible sur tous tes appareils'],
  pro: ['Tout ce qu’il y a dans Basique', 'Le radar des produits qui se vendent le mieux, mis à jour toutes les 6 h', 'Pour chaque produit : 7 fournisseurs connectables à Shopify', 'L’espion complet : 12 best-sellers et 12 nouveautés par concurrent', 'Le suivi de 5 concurrents : leurs nouveautés signalées à chaque visite', '3 agents de sourcing vérifiés (WhatsApp + e-mail)'],
  scale: ['Tout ce qu’il y a dans Pro', 'Les 10 meilleurs agents de sourcing, coordonnées vérifiées', 'Le suivi de 20 concurrents', 'Le comparateur de 4 boutiques côte à côte', 'Tes analyses en rapport PDF pro et en fichier Excel avec photos'],
};
const FIRST_STEPS = {
  basic: [['audit', 'Analyse ta boutique', 'Tu obtiens ton score et la liste de ce qu’il faut corriger.'], ['produits', 'Corrige tes produits', 'Commence par les produits notés en rouge.']],
  pro: [['audit', 'Analyse ta boutique', 'Ton score et la liste complète des corrections.'], ['radar', 'Trouve des produits gagnants', 'Choisis ta niche : les produits qui se vendent le mieux s’affichent.'], ['espion', 'Espionne un concurrent', 'Colle son adresse : tu vois ce qu’il vend le plus.']],
  scale: [['audit', 'Analyse ta boutique', 'Ton score et la liste complète des corrections.'], ['radar', 'Trouve des produits gagnants', 'Les produits qui se vendent le mieux, par niche.'], ['espion', 'Compare jusqu’à 4 boutiques', 'Onglet Espion, puis « Comparer ».']],
};
const list = (items) => `<ul class="incl">${items.map((t) => `<li>${icon('check')}<span>${t}</span></li>`).join('')}</ul>`;

function welcome(plan) {
  if (!PLAN_INFO[plan]) return;
  $('#welcomeBody').innerHTML = `
    <span class="eyebrow">Paiement confirmé</span>
    <h2 id="welTitle">Ton offre <span class="grad-text">${PLAN_INFO[plan].name}</span> est active</h2>
    <p class="muted">Tout est débloqué, tu peux commencer tout de suite.</p>
    <h3 class="sub-title">Par où commencer</h3>
    <ol class="steps-list">${FIRST_STEPS[plan].map(([tab, t, d], i) => `<li><button type="button" data-go="${tab}"><b>${i + 1}</b><span><strong>${t}</strong><small>${d}</small></span>${icon('arrow')}</button></li>`).join('')}</ol>
    ${state.me.canSetPw && !state.me.pw ? pwForm('pwFormWelcome', !state.me.email) : ''}
    <h3 class="sub-title">Ce qui est inclus</h3>${list(INCLUDED[plan])}
    <button class="btn btn-main" type="button" data-go="audit" style="width:100%;margin-top:18px">Commencer <span class="arrow">→</span></button>
    <p class="plan-note">Factures, carte bancaire, changement d’offre ou résiliation : onglet Compte.</p>`;
  $('#welcomeModal').classList.remove('hidden');
  confetti();
}
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (go) { $('#welcomeModal').classList.add('hidden'); location.hash = go.dataset.go; show(go.dataset.go); }
  if (e.target.id === 'welcomeModal') $('#welcomeModal').classList.add('hidden');
});
const state = { me: { plan: 'test', trialLeft: 3 }, config: null, audit: store.get('pr_audit'), sort: 'asc', niche: 'mode', spy: null };

// Images bloquées ou cassées : on les masque proprement au lieu d'une icône cassée.
document.addEventListener('error', (e) => { if (e.target.tagName === 'IMG') e.target.classList.add('noimg'); }, true);

let demoApi = null; // Mode démo : chargé seulement si le serveur est absent (aperçu statique).

// Pic de trafic ou réseau instable : nouvelle tentative automatique (2 max) sur les routes sans effet de bord.
const RETRY = /^\/api\/(me|config|audit|spy|radar|compare|agents)\b/;
async function api(path, body) {
  if (demoApi) return demoApi(path, body);
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
      if ([500, 502, 503, 504].includes(res.status) && attempt < 2 && RETRY.test(path)) throw new Error('retry');
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    } catch {
      if (attempt >= 2 || !RETRY.test(path)) return { ok: false, status: 0, data: { error: 'Connexion impossible. Vérifie ton réseau puis réessaie.' } };
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1) + Math.random() * 500));
    }
  }
}

function toast(text, type = '') {
  const el = document.createElement('div');
  el.className = `toast-msg ${type}`;
  el.textContent = text;
  $('#toasts').append(el);
  setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = 0; }, 4200);
  setTimeout(() => el.remove(), 4700);
}

// ---------- Navigation ----------
function show(tab) {
  if (!$(`#v-${tab}`)) tab = 'audit';
  $$('.view').forEach((v) => v.classList.toggle('on', v.id === `v-${tab}`));
  $$('.tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
  scrollTo({ top: 0, behavior: 'smooth' });
  if (tab === 'radar' && !$('#radarOut').dataset.loaded) loadRadar(state.niche);
  if (tab === 'produits') renderProducts();
  if (tab === 'compte') renderAccount();
  if (tab === 'agents') loadAgents();
}
addEventListener('hashchange', () => show(location.hash.slice(1)));

// ---------- Offres ----------
function planCards(target, current) {
  target.innerHTML = Object.entries(PLAN_INFO).map(([id, p]) => `
    <div class="card pm ${p.feat ? 'feat' : ''} ${id === current ? 'current' : ''}">
      <div class="info"><b>${p.name}</b> <span class="muted">· ${p.price}/mois</span><p>${p.pitch}</p></div>
      ${id === current ? '<span class="pill ok">ACTUEL</span>' : `<button class="btn ${p.feat ? 'btn-main' : 'btn-ghost'}" data-buy="${id}">${RANK[id] > RANK[current] ? 'Choisir' : 'Passer'}</button>`}
    </div>`).join('');
}

function openUpgrade(reason = '') {
  $('#upReason').textContent = reason || 'Débloque toutes les analyses, le radar de produits gagnants et l’espion concurrents.';
  planCards($('#plansModal'), state.me.plan);
  $('#upgradeModal').classList.remove('hidden');
}
document.addEventListener('click', async (e) => {
  const buy = e.target.closest('[data-buy]');
  if (buy) {
    buy.disabled = true;
    buy.textContent = '…';
    const r = await api('/api/checkout', { plan: buy.dataset.buy, email: state.me.email || undefined });
    if (r.data.url) return location.assign(r.data.url);
    if (r.data.changed) {
      $('#upgradeModal').classList.add('hidden');
      await loadMe();
      renderAccount();
      return welcome(r.data.plan);
    }
    toast(r.data.error || 'Paiement indisponible.', 'err');
    buy.disabled = false;
    buy.textContent = 'Choisir';
    return;
  }
  if (e.target.closest('[data-open-upgrade]')) return openUpgrade(e.target.closest('[data-open-upgrade]').dataset.reason);
  if (e.target.closest('[data-close]') || e.target.id === 'upgradeModal') $('#upgradeModal').classList.add('hidden');
  const fix = e.target.closest('.fix:not(.locked)');
  if (fix) fix.classList.toggle('open');
});

function paintPlan() {
  const { plan, trialLeft } = state.me;
  const chip = $('#planChip');
  chip.textContent = plan === 'test' ? 'Test' : PLAN_INFO[plan].name;
  chip.classList.toggle('paid', plan !== 'test');
  $('#upBtn').classList.toggle('hidden', plan === 'scale');
  $('#trialInfo').innerHTML = plan !== 'test' ? `${icon('check')} Offre ${PLAN_INFO[plan].name} active · analyses illimitées` : trialLeft > 0 ? `${icon('gift')} Ton analyse gratuite est disponible` : `${icon('lock')} Analyse gratuite utilisée · choisis une offre pour continuer`;
}

// ---------- Audit ----------
const STEPS = ['Connexion à la boutique', 'Lecture du catalogue produits', 'Analyse SEO & visibilité', 'Détection pixels, avis & apps', 'Notation de chaque fiche produit', 'Calcul du score final'];

function loader(target, steps = STEPS) {
  target.innerHTML = `<div class="skeleton" aria-hidden="true"><div></div></div><div class="card loader"><div class="radar"><i style="top:24%;left:62%"></i><i style="top:60%;left:30%;animation-delay:.7s"></i><i style="top:40%;left:80%;animation-delay:1.3s"></i></div><div class="loader-steps">${steps.map((s) => `<div>${s}</div>`).join('')}</div></div><div class="skeleton" aria-hidden="true"><div></div><div></div><div></div></div>`;
  const rows = $$('.loader-steps div', target);
  let i = 0;
  rows[0].classList.add('on');
  const timer = setInterval(() => {
    if (i < rows.length - 1) { rows[i].classList.add('done'); rows[++i].classList.add('on'); }
  }, 650);
  return () => { clearInterval(timer); rows.forEach((r) => r.classList.add('on', 'done')); };
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function runAudit(input, connected = null) {
  const out = $('#auditOut');
  const done = loader(out);
  const [r] = await Promise.all([api('/api/audit', { store: input, connected }), wait(2600)]);
  done();
  if (!r.ok) {
    if (r.status === 402) { out.innerHTML = ''; openUpgrade(r.data.error); } else out.innerHTML = `<div class="card empty"><b>${icon('alert')}</b>${esc(r.data.error || 'Analyse impossible.')}${r.data.examples ? `<div class="chips" style="justify-content:center;margin-top:12px">${r.data.examples.map((h) => `<button class="chip-btn" type="button" data-try="${esc(h)}">${esc(h)}</button>`).join('')}</div>` : ''}</div>`;
    out.querySelectorAll('[data-try]').forEach((b) => { b.onclick = () => { const i = $('#auditForm input[name=store]'); if (i) i.value = b.dataset.try; runAudit(b.dataset.try); }; });
    return;
  }
  state.audit = r.data.report;
  store.set('pr_audit', state.audit);
  if (r.data.trialLeft !== null && r.data.trialLeft !== undefined) state.me.trialLeft = r.data.trialLeft;
  paintPlan();
  await wait(300);
  renderAudit();
  if (state.audit.score >= 80) confetti();
}

const gradeClass = (s) => (s >= 80 ? 'g-a' : s >= 65 ? 'g-b' : s >= 45 ? 'g-c' : 'g-d');
const colorOf = (s) => (s >= 75 ? 'var(--good)' : s >= 55 ? 'var(--orange)' : 'var(--red)');
const impactPill = { élevé: 'hi', moyen: 'md', faible: 'lo' };
const STACK = { metaPixel: 'Pixel Meta', tiktokPixel: 'Pixel TikTok', google: 'Google Analytics', pinterest: 'Pinterest', snapchat: 'Snapchat', klaviyo: 'Klaviyo', newsletter: 'Newsletter', reviews: 'Avis clients', trustText: 'Réassurance', freeShipping: 'Livraison offerte', upsell: 'Upsell', chat: 'Chat', social: 'Réseaux sociaux', currencyConverter: 'Multi-devises' };

function gaugeSvg(id) {
  return `<div class="gauge"><svg viewBox="0 0 120 120"><circle class="track" cx="60" cy="60" r="52" fill="none" stroke-width="10"/><circle class="val" id="${id}" cx="60" cy="60" r="52" fill="none" stroke-width="10" stroke-dasharray="326.7" stroke-dashoffset="326.7"/></svg><div class="gauge-num"><b id="${id}N">0</b><small>/ 100</small></div></div>`;
}
function animateGauge(id, value) {
  const ring = $(`#${id}`);
  const num = $(`#${id}N`);
  if (!ring || !num) return;
  requestAnimationFrame(() => { ring.style.strokeDashoffset = 326.7 * (1 - value / 100); });
  const start = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - start) / 1600);
    num.textContent = Math.round(value * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function renderAudit() {
  const a = state.audit;
  const out = $('#auditOut');
  if (!a) { out.innerHTML = '<div class="card empty"><b>' + icon('radar') + '</b>Entre l’adresse de ta boutique Shopify pour lancer ton premier audit.</div>'; return; }
  const locked = a.fixes.filter((f) => f.locked).length;
  out.innerHTML = `${exportButton('audit-top')}
  <div class="result-grid">
    <div>
      <div class="card result-hero">
        ${gaugeSvg('scoreG')}
        <span class="grade ${gradeClass(a.score)}">${esc(a.grade)}</span>
        ${a.source === 'shopify' ? '<p class="src-badge real">' + icon('check') + ' Analyse réelle · via ta connexion Shopify</p>' : ''}
        <h2>${esc(a.name)}</h2><p class="muted" style="font-size:13px">${esc(a.host)}${a.theme ? ` · thème ${esc(a.theme)}` : ''}</p>
        <div class="stats">
          <div><b data-n="${a.stats.products}">0</b><span>produits</span></div><div><b data-n="${a.fixes.length}">0</b><span>corrections</span></div><div><b>${String(Math.round(a.stats.avgImages * 10) / 10).replace(".", ",")}</b><span>photos/fiche</span></div>
          <div><b data-n="${a.stats.avgWords}">0</b><span>mots/fiche</span></div><div><b data-n="${a.stats.soldOut}">0</b><span>ruptures</span></div><div><b>${money(a.stats.avgPrice, a.currency)}</b><span>prix moyen</span></div>
        </div>
        ${a.stack.length ? `<div class="stack">${a.stack.map((s) => `<span>${icon('check')} ${esc(STACK[s] || s)}</span>`).join('')}</div>` : ''}
      </div>
      <div class="card cats">${a.categories.map((c) => `<div class="cat-row"><span>${esc(c.label)}</span><span style="color:${colorOf(c.score)}">${c.score}</span><div class="bar"><i data-w="${c.score}" style="background:${colorOf(c.score)}"></i></div></div>`).join('')}</div>
    </div>
    <div>
      <div class="h3">${icon('target')} Ton plan d’action <span class="muted" style="font-size:13px">${a.fixes.length} points</span></div>
      <div class="list">${a.fixes.map((f, i) => f.locked ? `
        <div class="card fix locked" style="--d:${i * 0.05}s"><div class="fix-top"><span class="pill ${impactPill[f.impact]}">${esc(f.impact.toUpperCase())}</span><span class="t">${esc(f.title)}</span>${icon('lock')}</div>
        <div class="fix-teaser"><p aria-hidden="true">Pourquoi ce point te fait perdre des ventes, et la correction exacte à faire en quelques minutes dans ton admin Shopify.</p><button class="pc-btn main" data-open-upgrade data-reason="Débloque la correction « ${esc(f.title)} » et tout ton plan d’action avec l’offre Basique.">${icon('unlock')} Voir comment corriger</button></div></div>` : `
        <div class="card fix ${i === 0 ? 'open' : ''}" style="--d:${i * 0.05}s"><div class="fix-top"><span class="pill ${impactPill[f.impact]}">${esc(f.impact.toUpperCase())}</span><span class="t">${esc(f.title)}</span><span class="chev">⌄</span></div>
        <div class="fix-body"><div><p><b>Pourquoi c’est important</b>${esc(f.why)}</p><p class="how"><b>Comment corriger</b>${esc(f.fix)}</p></div></div></div>`).join('')}</div>
      ${locked ? `<div class="card unlock-banner"><h3>${icon('unlock')} ${locked} corrections cachées${(() => { const hi = a.fixes.filter((f) => f.locked && f.impact === 'élevé').length; return hi ? ` dont ${hi} à fort impact` : ''; })()}</h3><p>Chaque correction te dit pourquoi elle te coûte des ventes et comment la faire. Débloque aussi la note de toutes tes fiches produit et ton agent de sourcing.</p><button class="btn btn-main" data-open-upgrade>Tout débloquer <span class="arrow">→</span></button></div>` : ''}
      ${a.strengths.length ? `<div class="h3">${icon('star')} Ce qui est déjà top</div><div class="strengths">${a.strengths.map((s) => `<span>${icon('check')} ${esc(s)}</span>`).join('')}</div>` : ''}
      <a class="btn btn-ghost" style="width:100%;margin-top:18px" href="#produits">Voir l’analyse produit par produit →</a>
    </div>
  </div>`;
  animateGauge('scoreG', a.score);
  setTimeout(() => $('.result-hero .gauge', out)?.insertAdjacentHTML('beforeend', '<span class="pulse-ring"></span><span class="pulse-ring r2"></span>'), 1600);
  $$('[data-n]', out).forEach((el, i) => {
    const target = Number(el.dataset.n);
    const start = performance.now() + i * 120;
    const tick = (t) => {
      const p = Math.max(0, Math.min(1, (t - start) / 1100));
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick); else el.classList.add('count-pop');
    };
    requestAnimationFrame(tick);
  });
  setTimeout(() => $$('.cat-row .bar i', out).forEach((b, i) => setTimeout(() => (b.style.width = `${b.dataset.w}%`), i * 120)), 200);
  bindExport('audit-top', 'audit', () => ({ audit: state.audit })); // Scale : rapport de l'audit exportable directement ici
}

async function runConnected() {
  const out = $('#auditOut');
  const done = loader(out, ['Connexion à ta boutique Shopify', 'Lecture de tes produits', 'Vérification des politiques et pages', 'Notation de chaque fiche produit', 'Calcul du score final']);
  try {
    const { readConnectedStore } = await import('./connect.js');
    const storeData = await readConnectedStore();
    done();
    runAudit(storeData.host, storeData);
  } catch (error) {
    done();
    out.innerHTML = `<div class="card empty"><b>${icon('plug')}</b>${esc(error.message)}</div>`;
  }
}

async function offerConnect() {
  if (!state.me.demo) return;
  const { shopifyAvailable } = await import('./connect.js');
  if (!(await shopifyAvailable())) return;
  state.connectable = true;
  $('#auditForm').classList.add('hidden'); // sur l'aperçu, seule la boutique connectée est lisible : pas de champ trompeur
  $('#auditForm').insertAdjacentHTML('beforebegin', '<button class="btn btn-main magnet connect-btn" id="connectBtn" type="button">' + icon('refresh') + ' Relancer l’analyse <span class="arrow">→</span></button><p class="muted connect-note">Ta boutique Shopify connectée, analysée en lecture seule.</p>');
  $('#connectBtn').addEventListener('click', runConnected);
  $('#spyShortcuts').insertAdjacentHTML('afterend', '<button class="pc-btn spy-mine" id="spyConnected" type="button">' + icon('plug') + ' Analyser ma boutique connectée comme un concurrent</button>');
  $('#spyConnected').addEventListener('click', async () => {
    try {
      const { readConnectedStore } = await import('./connect.js');
      const connected = await readConnectedStore();
      runSpy(connected.host, connected);
    } catch (error) {
      $('#spyOut').innerHTML = `<div class="card empty"><b>${icon('plug')}</b>${esc(error.message)}</div>`;
    }
  });
  // Analyse directe de la vraie boutique si aucune n'est affichée et que l'offre le permet
  const hasReal = state.audit?.source === 'shopify';
  if (!hasReal && (state.me.plan !== 'test' || state.me.trialLeft > 0)) runConnected();
}

$('#auditForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = new FormData(e.target).get('store').trim();
  if (v) runAudit(v);
});

// ---------- Produits ----------
function productCard(p, i, cur) {
  if (p.locked) return `<div class="card prod locked" style="--d:${i * 0.04}s"><div class="blur" style="display:contents"><img class="prod-img" src="${safeImg(p.image)}" alt="" loading="lazy"><div><h3>${esc(p.title)}</h3><div class="prod-meta"><span class="ring" style="--p:${p.score};--c:${colorOf(p.score)}">${p.score}</span></div></div></div><div class="lock-over"><span>${icon('lock')} Analyse détaillée</span><button class="btn btn-main" data-open-upgrade>Débloquer</button></div></div>`;
  return `<div class="card prod" style="--d:${i * 0.04}s">
    <img class="prod-img" src="${safeImg(p.image)}" alt="" loading="lazy">
    <div><div class="prod-head"><h3>${esc(p.title)}</h3><span class="ring" style="--p:${p.score};--c:${colorOf(p.score)}">${p.score}</span></div>
      <div class="prod-meta"><span class="pill ${p.verdict === 'Produit fort' ? 'ok' : p.verdict === 'Faible' ? 'hi' : 'md'}">${esc(p.verdict.toUpperCase())}</span><span>${money(p.price, cur)}</span>${p.discount ? `<span>-${p.discount}%</span>` : ''}${p.available ? '' : '<span style="color:var(--red)">Rupture</span>'}</div></div>
    <details class="prod-details" ${i === 0 ? 'open' : ''}><summary>${p.cons.length} à corriger · ${p.pros.length} points forts</summary>
      ${p.cons.map((c) => `<div class="con-line"><b>${icon('x')} ${esc(c.t)}</b><span>${esc(c.why)}</span><em>→ ${esc(c.fix)}</em></div>`).join('')}
      ${p.pros.map((t) => `<div class="pro-line">${icon('check')} ${esc(t)}</div>`).join('')}
    </details></div>`;
}

function renderProducts() {
  const out = $('#productsOut');
  const a = state.audit;
  if (!a) { out.innerHTML = '<div class="card empty"><b>' + icon('box') + '</b>Lance d’abord un audit de ta boutique dans l’onglet Audit.<br><br><a class="btn btn-main" href="#audit">Lancer un audit</a></div>'; return; }
  const list = [...a.products].sort((x, y) => (state.sort === 'asc' ? x.score - y.score : y.score - x.score));
  const hidden = a.products.filter((p) => p.locked).length;
  const sample = a.stats?.analyzed && a.stats.analyzed < a.stats.products ? `<p class="muted" style="margin:0 0 12px">Les ${a.stats.analyzed} fiches les plus récentes sont notées en détail, sur ${a.stats.products} produits en ligne.</p>` : '';
  out.innerHTML = `${exportButton('products')}${sample}<div class="list">${list.slice(0, 120).map((p, i) => productCard(p, i, a.currency)).join('')}</div>${hidden ? `<div class="card unlock-banner"><h3>${icon('unlock')} ${hidden} fiches à débloquer</h3><p>Vois pour chaque produit ce qui cloche, pourquoi, et comment le corriger.</p><button class="btn btn-main" data-open-upgrade>Débloquer toutes les fiches</button></div>` : ''}`;
  bindExport('products', 'products', () => ({ audit: a }));
}
$$('[data-sort]').forEach((b) => b.addEventListener('click', () => {
  state.sort = b.dataset.sort;
  $$('[data-sort]').forEach((x) => x.classList.toggle('on', x === b));
  renderProducts();
}));

// ---------- Cartes produit (radar / espion) ----------
// Photo produit nette sur tous les écrans : versions 400/800 px servies par le CDN Shopify.
function photo(src, cls = 'ph') {
  const url = safeImg(src);
  if (!url) return '';
  let srcset = '';
  try { const u = new URL(src); if (u.hostname === 'cdn.shopify.com') srcset = [400, 800].map((w) => { u.searchParams.set('width', w); return `${esc(u.href)} ${w}w`; }).join(', '); } catch { /* image locale */ }
  return `<img class="${cls}" src="${url}"${srcset ? ` srcset="${srcset}" sizes="(max-width: 720px) 50vw, 25vw"` : ''} alt="" loading="lazy" decoding="async">`;
}
const cards = []; // produits affichés, pour la fenêtre fournisseurs

function pCard(p, i, cur) {
  const locked = p.locked;
  const media = `${p.image ? photo(p.image) : ''}${!locked && p.image2 ? photo(p.image2, 'ph ph2') : ''}<span class="score-badge ${p.score >= 80 ? 'hot' : ''}">${p.score >= 80 ? '' + icon('trend') + ' ' : ''}${p.score}</span>${!locked && p.discount ? `<span class="deal">-${p.discount}%</span>` : ''}${p.isNew ? '<span class="new-badge">NOUVEAU</span>' : ''}`;
  const body = `${!locked && p.kind ? `<span class="kind">${esc(p.kind)}${p.sellers > 1 ? ` · ${p.sellers} boutiques` : ''}</span>` : ''}<h3>${esc(locked ? 'Produit gagnant caché' : p.title)}</h3>
    <div class="price">${locked ? '••,•• €' : money(p.price, p.currency || cur)}</div>
    ${p.reasons?.length ? `<div class="reasons">${p.reasons.slice(0, 3).map((r) => `<span>${esc(r)}</span>`).join('')}</div>` : ''}
    ${!locked && p.resale ? `<span class="resale">Revente conseillée : ${money(p.resale.low, p.currency)} – ${money(p.resale.high, p.currency)}</span>` : ''}
    ${!locked && p.store ? `<span class="src">chez ${esc(p.store)}</span>` : ''}
    ${!locked && p.verdict ? `<span class="src">${esc(p.verdict)}${p.age !== null && p.age !== undefined ? ` · il y a ${p.age} j` : ''}</span>` : ''}`;
  if (locked) return `<div class="card pcard is-locked" style="--d:${i * 0.05}s"><div class="img">${media}</div><div class="body">${body}</div><div class="lock-over"><span>${icon('lock')}</span><p class="lock-tease">${p.kind ? `<b>${esc(p.kind)}</b>` : '<b>Produit gagnant</b>'}${p.sellers > 1 ? `<small>Vendu par ${p.sellers} boutiques</small>` : ''}<small>Score ${p.score}/100${p.discount ? ` · promo -${p.discount}%` : ''}</small></p><button class="btn btn-main" data-open-upgrade data-reason="Vois le nom, le prix, le lien et les fournisseurs de chaque produit gagnant avec l’offre Pro.">Débloquer</button></div></div>`;
  const id = cards.push(p) - 1;
  const link = (inner, cls) => (p.url ? `<a class="${cls}" href="${esc(p.url)}" target="_blank" rel="noopener nofollow">${inner}</a>` : `<div class="${cls}">${inner}</div>`);
  return `<div class="card pcard tilt" style="--d:${i * 0.05}s">${link(media, 'img')}<div class="body">${body}
    <div class="pc-actions">${p.url ? `<a class="pc-btn" href="${esc(p.url)}" target="_blank" rel="noopener nofollow">${icon('eye')} Voir</a>` : ''}<button class="pc-btn main" type="button" data-suppliers="${id}">${icon('truck')} Fournisseurs</button></div></div></div>`;
}

// Fenêtre fournisseurs : recherche du produit chez chaque fournisseur + app pour le connecter à Shopify.
async function openSuppliers(p) {
  const { supplierLinks } = await import('./suppliers.js');
  const list = supplierLinks(p);
  let m = $('#supplierModal');
  if (!m) {
    document.body.insertAdjacentHTML('beforeend', '<div class="modal hidden" id="supplierModal" role="dialog" aria-modal="true" aria-labelledby="supTitle"><div class="modal-box card sup-box"></div></div>');
    m = $('#supplierModal');
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) m.classList.add('hidden'); });
  }
  $('.sup-box', m).innerHTML = `<button class="modal-x" data-close aria-label="Fermer">${icon('x')}</button>
    <div class="sup-head">${p.image ? photo(p.image, 'sup-img') : ''}<div><span class="eyebrow">Fournisseurs connectables à Shopify</span><h2 id="supTitle">${esc(p.title)}</h2>
    <p class="muted">Vendu ${money(p.price, p.currency)}${p.resale ? ` · revente conseillée ${money(p.resale.low, p.currency)} – ${money(p.resale.high, p.currency)}` : ''}</p></div></div>
    <p class="sup-query">Recherche : <b>« ${esc(list[0].query)} »</b></p>
    <div class="sup-list">${list.map((s, k) => `<div class="sup-row" style="--d:${k * 0.04}s"><span class="sup-logo sup-${s.id}">${esc(s.name[0])}</span>
      <div class="sup-info"><b>${esc(s.name)}</b><span>${esc(s.tag)} · livraison ${esc(s.delay)}</span></div>
      <div class="sup-go"><a class="pc-btn main" href="${esc(s.url)}" target="_blank" rel="noopener nofollow">${s.open ? `${icon('eye')} Ouvrir` : `${icon('search')} Chercher`}</a><a class="pc-btn" href="${esc(s.app)}" target="_blank" rel="noopener nofollow">${icon('plug')} ${esc(s.via)}</a></div></div>`).join('')}</div>
    <button type="button" class="btn btn-main sup-agent" data-to-agent="${cards.indexOf(p)}">${icon('truck')} Demander un devis à un agent de sourcing</button>
    <p class="sup-tip">${icon('check')} Commande toujours un échantillon avant de lancer la pub : tu vérifies la qualité, le délai et tu fais tes propres photos.</p>`;
  m.classList.remove('hidden');
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-suppliers]');
  if (b) openSuppliers(cards[Number(b.dataset.suppliers)]);
});
// Photos : apparition en fondu une fois chargées.
document.addEventListener('load', (e) => { if (e.target.classList?.contains('ph') || e.target.classList?.contains('sup-img')) e.target.classList.add('loaded'); }, true);

// ---------- Radar ----------
async function loadRadar(niche) {
  state.niche = niche;
  $$('#niches .seg').forEach((b) => b.classList.toggle('on', b.dataset.niche === niche));
  const out = $('#radarOut');
  out.dataset.loaded = '1';
  const done = loader(out, ['Scan des boutiques de référence', 'Lecture des best-sellers', 'Calcul du score produit gagnant']);
  const [r] = await Promise.all([api(`/api/radar?niche=${encodeURIComponent(niche)}`), wait(1500)]);
  done();
  if (!r.ok) { out.innerHTML = `<div class="card empty"><b>${icon('alert')}</b>${esc(r.data.error)}</div>`; return; }
  if (!r.data.items.length) { out.innerHTML = '<div class="card empty"><b>' + icon('radar') + '</b>Le radar se recharge pour cette niche. Réessaie dans quelques minutes.</div>'; return; }
  const snap = r.data.items[0]?.snapshot;
  const at = r.data.updatedAt ? new Date(r.data.updatedAt) : null;
  const ago = at ? Math.max(0, Math.round((Date.now() - at) / 3_600_000)) : null;
  const note = at ? `<p class="src-badge live" style="margin:0 0 12px"><span class="dot"></span>Relevé en direct ${ago < 1 ? 'il y a moins d’une heure' : `il y a ${ago} h`} · actualisé toutes les 6 h</p>`
    : snap ? `<p class="src-badge" style="margin:0 0 12px">Vrais produits relevés le ${new Date(snap).toLocaleDateString('fr-FR')} · le relevé automatique (toutes les 6 h environ) prend le relais.</p>` : '';
  out.innerHTML = `${note}${exportButton('radar')}<div class="pgrid">${r.data.items.map((p, i) => pCard(p, i)).join('')}</div>${r.data.locked ? '<div class="card unlock-banner"><h3>' + icon('radar') + ' Débloque le radar complet</h3><p>24 produits gagnants par niche, avec leurs raisons et le lien direct.</p><button class="btn btn-main" data-open-upgrade>Passer Pro</button></div>' : ''}`;
  bindExport('radar', 'radar', () => ({ items: r.data.items.filter((p) => !p.locked), niche: state.config?.niches?.[niche]?.label || niche, date: r.data.updatedAt || r.data.items[0]?.snapshot ? new Date(r.data.updatedAt || r.data.items[0].snapshot).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined }));
}

// ---------- Espion & comparateur ----------
$$('[data-spy-tab]').forEach((b) => b.addEventListener('click', () => {
  $$('[data-spy-tab]').forEach((x) => x.classList.toggle('on', x === b));
  $('#spyPane').classList.toggle('hidden', b.dataset.spyTab !== 'spy');
  $('#comparePane').classList.toggle('hidden', b.dataset.spyTab !== 'compare');
  if (b.dataset.spyTab === 'compare' && RANK[state.me.plan] < 3) openUpgrade('Le comparateur multi-boutiques et les rapports PDF & Excel sont inclus dans l’offre Scale.');
}));

$('#spyForm').addEventListener('submit', (e) => {
  e.preventDefault();
  runSpy(new FormData(e.target).get('store'));
});

// ---------- Suivi des concurrents (sur cet appareil) ----------
const WATCH_MAX = { test: 0, basic: 0, pro: 5, scale: 20 };
const watchList = () => store.get('sl_watch') || {};
function renderWatch() {
  const w = watchList(); const hosts = Object.keys(w);
  const ex = (state.config?.spyExamples || []).filter((h) => !w[h]);
  $('#spyShortcuts').innerHTML = `${hosts.length ? `<div class="chips"><span>${icon('bell')} Suivies</span>${hosts.map((h) => `<button type="button" class="chip-btn on" data-spy-go="${esc(h)}">${esc(w[h].name || h)}</button>`).join('')}</div>` : ''}
    ${ex.length ? `<div class="chips"><span>${icon('eye')} Essaie avec</span>${ex.map((h) => `<button type="button" class="chip-btn" data-spy-go="${esc(h)}">${esc(h.replace(/^www\./, ''))}</button>`).join('')}</div>` : ''}`;
}
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-spy-go]');
  if (go) { $('#spyForm input').value = go.dataset.spyGo; runSpy(go.dataset.spyGo); }
  const f = e.target.closest('[data-watch]');
  if (f && state.spy) {
    const w = watchList(); const h = state.spy.host;
    if (w[h]) { delete w[h]; store.set('sl_watch', w); toast('Boutique retirée de ton suivi.'); }
    else {
      const max = WATCH_MAX[state.me.plan] || 0;
      if (!max) return openUpgrade('Le suivi des concurrents est inclus dans l’offre Pro : tu vois leurs nouveautés à chaque visite.');
      if (Object.keys(w).length >= max) return openUpgrade(`Tu suis déjà ${max} boutiques. L’offre Scale en suit jusqu’à 20.`);
      w[h] = { name: state.spy.name, at: Date.now(), seen: [...state.spy.bestsellers, ...state.spy.launches].map((p) => p.handle).filter(Boolean) };
      store.set('sl_watch', w); toast('Boutique suivie : ses nouveautés seront signalées à ta prochaine visite.', 'ok');
    }
    f.outerHTML = watchButton(h); renderWatch();
  }
});
const watchButton = (h) => `<button type="button" class="pc-btn ${watchList()[h] ? '' : 'main'}" data-watch>${icon('bell')} ${watchList()[h] ? 'Suivie' : 'Suivre cette boutique'}</button>`;

// Barres simples (graphiques de l'espion).
function bars(list, { unit = '', horizontal = false } = {}) {
  const max = Math.max(1, ...list.map((x) => x.count || 0));
  if (horizontal) return `<div class="hbars">${list.map((x, i) => `<div><span>${esc(x.label)}</span><i style="--w:${Math.max(3, (x.count / max) * 100)}%;--d:${i * 0.07}s"></i><b>${x.count}</b></div>`).join('')}</div>`;
  return `<div class="vbars">${list.map((x, i) => `<div><b>${x.count}</b><i style="--h:${Math.max(4, (x.count / max) * 100)}%;--d:${i * 0.07}s"></i><span>${esc(x.label)}${unit}</span></div>`).join('')}</div>`;
}

async function runSpy(storeInput, connected = null) {
  const out = $('#spyOut');
  const done = loader(out, ['Connexion à la boutique', 'Lecture du catalogue et des best-sellers', 'Détection des nouveautés et des outils', 'Analyse de sa stratégie']);
  const [r] = await Promise.all([api('/api/spy', { store: storeInput, connected }), wait(1800)]);
  done();
  if (!r.ok) { out.innerHTML = `<div class="card empty"><b>${icon('alert')}</b>${esc(r.data.error)}</div>`; return; }
  const s = r.data.report;
  state.spy = s;
  // Nouveautés depuis la dernière visite (boutique suivie).
  const w = watchList(); const watched = w[s.host];
  let fresh = 0;
  if (watched) {
    const seen = new Set(watched.seen || []);
    for (const p of [...s.bestsellers, ...s.launches]) if (p.handle && !p.locked && !seen.has(p.handle)) { p.isNew = true; fresh++; }
    const since = new Date(watched.at).toLocaleDateString('fr-FR');
    w[s.host] = { ...watched, name: s.name, at: Date.now(), seen: [...new Set([...(watched.seen || []), ...[...s.bestsellers, ...s.launches].map((p) => p.handle).filter(Boolean)])] };
    store.set('sl_watch', w);
    s.freshNote = fresh ? `${fresh} nouveau${fresh > 1 ? 'x' : ''} produit${fresh > 1 ? 's' : ''} depuis ta dernière visite (${since})` : `Rien de nouveau depuis ta dernière visite (${since})`;
  }
  const cur = s.currency; const st = s.stats;
  const bestTitle = { sales: 'Ses best-sellers', collection: 'Ses best-sellers', home: 'Mis en avant sur son accueil' }[s.bestSource || 'sales'];
  const insight = (x, i) => (x.locked
    ? `<div class="card insight locked" style="--d:${i * 0.05}s"><span class="ins-ic">${icon(x.icon)}</span><div><b>${esc(x.title)}</b><p>Conseil inclus dès l’offre Basique.</p></div></div>`
    : `<div class="card insight ${x.tone}" style="--d:${i * 0.05}s"><span class="ins-ic">${icon(x.icon)}</span><div><b>${esc(x.title)}</b><p>${esc(x.text)}</p></div></div>`);
  const upsell = s.level === 'teaser'
    ? `<div class="card unlock-banner"><h3>${icon('eye')} Vois toute sa stratégie</h3><p>Basique : tous les conseils, les graphiques et son top 3. Pro : ses 12 best-sellers, ses nouveautés, les fournisseurs et le suivi de 5 concurrents.</p><button class="btn btn-main" data-open-upgrade>Voir les offres</button></div>`
    : s.level === 'insights' ? `<div class="card unlock-banner"><h3>${icon('eye')} Tous ses produits gagnants</h3><p>Pro : ses 12 best-sellers et 12 nouveautés avec les fournisseurs, et le suivi de ses nouveautés à chaque visite.</p><button class="btn btn-main" data-open-upgrade>Passer Pro</button></div>` : '';
  out.innerHTML = `
    <div class="card spy-head">
      <div><span class="eyebrow">Concurrent analysé</span><h2>${esc(s.name)}</h2><p class="muted">${esc(s.host)}${s.theme ? ` · thème ${esc(s.theme)}` : ''}</p></div>
      <div class="spy-actions">${watchButton(s.host)}</div>
      ${s.freshNote ? `<p class="fresh ${fresh ? 'on' : ''}">${icon('bell')} ${esc(s.freshNote)}</p>` : ''}
    </div>
    <div class="spy-stats">
      <div class="card"><b>${st.products}</b><span>produits</span></div>
      <div class="card"><b>${money(st.avgPrice, cur)}</b><span>prix moyen</span></div>
      <div class="card"><b>${st.launches30 ?? '—'}</b><span>lancés /30 j</span></div>
      <div class="card"><b>${money(st.minPrice, cur)} – ${money(st.maxPrice, cur)}</b><span>gamme de prix</span></div>
      <div class="card"><b>${st.discounted}%</b><span>en promo${st.avgDiscount ? ` (-${st.avgDiscount}%)` : ''}</span></div>
      <div class="card"><b>${st.psychological ?? 0}%</b><span>prix en ,99</span></div>
    </div>
    ${s.insights?.length ? `<div class="h3">${icon('zap')} Ce qu’il faut retenir</div><div class="insights">${s.insights.map(insight).join('')}</div>` : ''}
    ${s.charts ? `<div class="spy-charts">
      <div class="card chart"><h4>Répartition de ses prix <small>(${esc(cur)})</small></h4>${bars(s.charts.priceBuckets)}</div>
      ${s.charts.launchesByMonth.some((m) => m.count) ? `<div class="card chart"><h4>Ses lancements par mois</h4>${bars(s.charts.launchesByMonth)}</div>` : ''}
      ${s.topTypes?.length ? `<div class="card chart"><h4>Ses catégories</h4>${bars(s.topTypes.map((t) => ({ label: t.name, count: t.count })), { horizontal: true })}</div>` : ''}
    </div>` : `<div class="card chart-lock"><span>${icon('lock')}</span><div><b>Graphiques de sa stratégie</b><p>Prix, lancements par mois et catégories : inclus dès l’offre Basique.</p></div><button class="btn btn-ghost" data-open-upgrade>Débloquer</button></div>`}
    ${s.stack ? `<div class="h3">${icon('zap')} Outils marketing détectés</div>${s.stack.length ? `<div class="stack left">${s.stack.map((t) => `<span>${icon('check')} ${esc(t)}</span>`).join('')}</div>` : '<p class="muted">Aucun outil marketing repéré sur sa page d’accueil.</p>'}` : ''}
    <div class="h3">${icon('award')} ${bestTitle}</div>${s.bestsellers.length ? `<div class="pgrid">${s.bestsellers.map((p, i) => pCard(p, i, cur)).join('')}</div>` : '<p class="muted">Classement des ventes non disponible sur cette boutique.</p>'}
    <div class="h3">${icon('rocket')} ${st.launches30 === null ? 'Ses derniers ajouts' : 'Ses derniers lancements'}</div><div class="pgrid">${s.launches.map((p, i) => pCard(p, i, cur)).join('')}</div>
    ${upsell}
    ${exportButton('spy')}`;
  bindExport('spy', 'spy', () => ({ spy: s }));
}

$('#compareForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (RANK[state.me.plan] < 3) return openUpgrade('Le comparateur est inclus dans l’offre Scale.');
  const out = $('#compareOut');
  const stores = new FormData(e.target).getAll('s').map((v) => v.trim()).filter(Boolean);
  const done = loader(out, ['Scan des boutiques', 'Lecture des catalogues', 'Comparaison']);
  const [r] = await Promise.all([api('/api/compare', { stores }), wait(1500)]);
  done();
  if (!r.ok) { out.innerHTML = `<div class="card empty"><b>${icon('alert')}</b>${esc(r.data.error)}</div>`; return; }
  const rows = r.data.rows;
  const best = (k, max = true) => rows.reduce((b, x) => ((max ? x[k] > b : x[k] < b) ? x[k] : b), max ? -Infinity : Infinity);
  const cols = [['products', 'Produits', true], ['avgPrice', 'Prix moyen', true], ['launches30', 'Lancés /30 j', true], ['discounted', '% en promo', true], ['avgScore', 'Score fiches', true]];
  out.innerHTML = `<div class="card table-wrap"><table><thead><tr><th>Boutique</th>${cols.map((c) => `<th>${c[1]}</th>`).join('')}<th>Best-seller n°1</th></tr></thead><tbody>
    ${rows.map((x) => `<tr><td><b>${esc(x.name)}</b><br><small class="muted">${esc(x.host)}</small></td>${cols.map(([k, , m]) => `<td class="${x[k] === best(k, m) ? 'win' : ''}">${k === 'avgPrice' ? money(x[k], x.currency) : k === 'discounted' ? `${x[k]}%` : x[k] ?? '—'}</td>`).join('')}<td>${x.top ? `<a href="${esc(x.top.url)}" target="_blank" rel="noopener nofollow">${esc(x.top.title)}</a>` : '—'}</td></tr>`).join('')}
  </tbody></table></div>${r.data.failed.length ? `<p class="muted" style="margin-top:8px">Non analysées : ${r.data.failed.map(esc).join(', ')}</p>` : ''}
  <div style="margin-top:12px">${exportButton('compare')}</div>`;
  bindExport('compare', 'compare', () => ({ rows, cols }));
});

// Exports pro (offre Scale) : rapport PDF ou classeur Excel, aux couleurs Shoplift.
const exportButton = (id) => (RANK[state.me.plan] >= 3 ? `<div class="export-bar" id="export-${id}"><span>${icon('download')} Exporter</span><button type="button" class="pc-btn main" data-fmt="pdf">${icon('file')} Rapport PDF</button><button type="button" class="pc-btn" data-fmt="xlsx">${icon('columns')} Excel</button></div>` : '');
function bindExport(id, kind, data) {
  $(`#export-${id}`)?.addEventListener('click', (e) => { const b = e.target.closest('[data-fmt]'); if (b) runExport(b, kind, data()); });
}
async function runExport(btn, kind, data) {
  if (btn.classList.contains('busy')) return;
  const fmt = btn.dataset.fmt;
  btn.classList.add('busy');
  const label = btn.innerHTML;
  btn.innerHTML = `<span class="spin"></span> ${fmt === 'pdf' ? 'Création du PDF…' : 'Création du fichier…'}`;
  try {
    const { exportReport } = await import('./export.js');
    await exportReport(kind, fmt, data);
    toast(fmt === 'pdf' ? 'Rapport PDF prêt.' : 'Fichier Excel prêt.', 'ok');
  } catch (error) {
    if (error?.code !== 'declined') toast(error?.message && !error.code ? error.message : 'Export impossible pour le moment. Réessaie dans quelques secondes.', 'err');
  } finally {
    btn.classList.remove('busy');
    btn.innerHTML = label;
  }
}

// ---------- Agents de sourcing ----------
const PLAN_NAME = { basic: 'Basique', pro: 'Pro', scale: 'Scale' };
const digits = (v) => String(v || '').replace(/\D/g, '');
function quoteText() {
  const prod = ($('#qProduct')?.value || '').trim() || '[product name / link]';
  return `Hello! I run a Shopify store and I am looking for a reliable supplier for this product:\n${prod}\n\nCould you please send me:\n- your best price per unit\n- shipping cost and delivery time to ${$('#qCountry').value}\n- the minimum order quantity\n\nExpected volume: ${$('#qVolume').value} orders per month.\nI can connect your app to my Shopify store. Thank you!`;
}
function refreshQuote() { const m = $('#qMessage'); if (m && !m.dataset.edited) m.value = quoteText(); }
['#qProduct', '#qCountry', '#qVolume'].forEach((id) => $(id)?.addEventListener('input', refreshQuote));
$('#qMessage')?.addEventListener('input', (e) => { e.target.dataset.edited = '1'; });
async function copy(text, label) {
  try { await navigator.clipboard.writeText(text); toast(`${label} copié.`, 'ok'); } catch { toast(`${label} : ${text}`); }
}
function agentCard(a, i) {
  const contact = (ic, label, value, action) => `<div class="ag-row"><span class="ag-ic">${icon(ic)}</span><div><small>${label}</small><b>${esc(value)}</b></div>${action || ''}</div>`;
  const head = `<div class="ag-head"><span class="ag-rank">#${i + 1}</span><div><h3>${esc(a.name)}</h3><p class="muted">${'★'.repeat(Math.round(a.rating))} ${a.rating.toFixed(1).replace('.', ',')} · ${a.reviews.toLocaleString('fr-FR')} avis Shopify · ${esc(a.hq)}</p></div></div>
    <p class="ag-pitch">${esc(a.pitch)}</p>
    <div class="ag-tags">${a.strengths.map((t) => `<span>${esc(t)}</span>`).join('')}<span class="delay">${icon('truck')} ${esc(a.delay)}</span></div>`;
  if (!a.open) {
    return `<div class="card agent locked" style="--d:${i * 0.05}s">${head}
      <div class="ag-contacts blurred">${a.whatsapp ? contact('phone', 'WhatsApp', a.whatsapp) : ''}${contact('mail', 'E-mail', a.email)}</div>
      <div class="ag-lock"><span>${icon('lock')} Coordonnées vérifiées de ${esc(a.name)}</span><button class="btn btn-main" data-open-upgrade data-reason="${esc(`Débloque ${a.name} et ses coordonnées vérifiées avec l’offre ${PLAN_NAME[a.unlock]}.`)}">Débloquer avec ${PLAN_NAME[a.unlock]}</button></div></div>`;
  }
  const wa = a.whatsapp ? `https://wa.me/${digits(a.whatsapp)}?text=${encodeURIComponent($('#qMessage')?.value || quoteText())}` : '';
  return `<div class="card agent" style="--d:${i * 0.05}s">${head}
    <div class="ag-contacts">
      ${a.whatsapp ? contact('phone', 'WhatsApp', a.whatsapp, `<button class="pc-btn" data-copy="${esc(a.whatsapp)}" data-copy-label="Numéro">${icon('copy')}</button>`) : ''}
      ${a.whatsapp2 ? contact('phone', 'WhatsApp (2ᵉ ligne)', a.whatsapp2, `<button class="pc-btn" data-copy="${esc(a.whatsapp2)}" data-copy-label="Numéro">${icon('copy')}</button>`) : ''}
      ${a.phone && a.phone !== a.whatsapp ? contact('phone', 'Téléphone', a.phone, `<button class="pc-btn" data-copy="${esc(a.phone)}" data-copy-label="Numéro">${icon('copy')}</button>`) : ''}
      ${contact('mail', 'E-mail', a.email, `<button class="pc-btn" data-copy="${esc(a.email)}" data-copy-label="E-mail">${icon('copy')}</button>`)}
      ${a.email2 ? contact('mail', 'E-mail commercial', a.email2, `<button class="pc-btn" data-copy="${esc(a.email2)}" data-copy-label="E-mail">${icon('copy')}</button>`) : ''}
      ${!a.whatsapp ? '<p class="ag-note">Pas de numéro public : contact par e-mail ou par le chat de son app (réponse sous 24 h).</p>' : ''}
      <p class="ag-note">${icon('clock')} ${esc(a.hours)}</p>
    </div>
    <div class="ag-actions">
      ${wa ? `<a class="pc-btn main" data-wa="${esc(digits(a.whatsapp))}" href="${esc(wa)}" target="_blank" rel="noopener">${icon('phone')} Demander un devis sur WhatsApp</a>` : `<button class="pc-btn main" data-copy-msg="${esc(a.email)}">${icon('mail')} Copier le message et l’e-mail</button>`}
      <a class="pc-btn" href="${esc(a.app)}" target="_blank" rel="noopener">${icon('plug')} Connecter à Shopify</a>
      <a class="pc-btn" href="${esc(a.site)}" target="_blank" rel="noopener">${icon('eye')} Site officiel</a>
    </div>
    <p class="ag-source">${icon('check')} Vérifié le ${new Date(state.agentsChecked).toLocaleDateString('fr-FR')} · ${esc(a.source)}</p></div>`;
}
async function loadAgents() {
  refreshQuote();
  const out = $('#agentsOut');
  const r = await api('/api/agents');
  if (!r.ok) { out.innerHTML = `<div class="card empty"><b>${icon('alert')}</b>${esc(r.data.error || 'Agents indisponibles.')}</div>`; return; }
  state.agentsChecked = r.data.checked;
  const open = r.data.agents.filter((a) => a.open).length;
  const next = { test: ['basic', 1], basic: ['pro', 3], pro: ['scale', 10] }[state.me.plan];
  out.innerHTML = `<p class="src-badge real" style="margin:14px 0">${icon('check')} ${open ? `${open} agent${open > 1 ? 's' : ''} débloqué${open > 1 ? 's' : ''} avec ton offre` : 'Les agents sont inclus dès l’offre Basique'}${next ? ` · ${next[1]} avec l’offre ${PLAN_NAME[next[0]]}` : ''}</p>
    <div class="agents">${r.data.agents.map(agentCard).join('')}</div>`;
}
document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-copy]'); if (c) copy(c.dataset.copy, c.dataset.copyLabel || 'Texte');
  const m = e.target.closest('[data-copy-msg]'); if (m) copy(`${m.dataset.copyMsg}\n\n${$('#qMessage').value}`, 'Message et e-mail');
  const w = e.target.closest('[data-wa]'); if (w) w.href = `https://wa.me/${w.dataset.wa}?text=${encodeURIComponent($('#qMessage').value)}`;
  const s = e.target.closest('[data-to-agent]');
  if (s) { const p = cards[Number(s.dataset.toAgent)]; $('#qProduct').value = p.url ? `${p.title} - ${p.url}` : p.title; delete $('#qMessage').dataset.edited; $('#quoteBox').open = true; $('#supplierModal')?.classList.add('hidden'); location.hash = 'agents'; }
});

// ---------- Compte ----------
// Connexion sur tous les appareils : e-mail + mot de passe (créé après le paiement).
function pwForm(id, needEmail) {
  return `<form class="card login-card" id="${id}">
    <h3>${icon('lock')} Crée ton mot de passe</h3>
    <p class="muted">Tu pourras te connecter sur ton téléphone, ta tablette ou n’importe quel ordinateur avec ${needEmail ? 'ton e-mail' : `<b>${esc(state.me.email)}</b>`} et ce mot de passe.</p>
    ${needEmail ? '<input name="email" type="email" placeholder="Ton e-mail" autocomplete="email" required>' : ''}
    <input name="password" type="password" placeholder="Mot de passe (8 caractères minimum)" autocomplete="new-password" minlength="8" required>
    <input name="confirm" type="password" placeholder="Confirme le mot de passe" autocomplete="new-password" minlength="8" required>
    <button class="btn btn-main" type="submit">Enregistrer mon mot de passe</button></form>`;
}
function renderLogin() {
  const { plan, pw, canSetPw, email } = state.me;
  const box = $('#loginBox');
  if (plan === 'test') {
    box.innerHTML = `<form class="card login-card" id="loginForm">
      <h3>${icon('user')} Déjà client ? Connecte-toi</h3>
      <input name="email" type="email" placeholder="E-mail utilisé au paiement" autocomplete="email" required>
      <input name="password" type="password" placeholder="Mot de passe" autocomplete="current-password" required>
      <button class="btn btn-main" type="submit">Me connecter <span class="arrow">→</span></button>
      <p class="muted login-links"><a href="#forgot" data-scroll="forgot">Mot de passe oublié ?</a> · Pas encore client ? Ton compte est créé au paiement.</p></form>`;
  } else if (!pw && canSetPw) box.innerHTML = pwForm('pwForm', !email);
  else box.innerHTML = pw ? `<div class="card login-card on"><p>${icon('check')} Connecté${email ? ` : <b>${esc(email)}</b>` : ''} · accès sur tous tes appareils</p></div>` : '';
}
document.addEventListener('submit', async (e) => {
  const f = e.target;
  if (f.id === 'loginForm') {
    e.preventDefault();
    const d = new FormData(f);
    const r = await api('/api/login', { email: d.get('email'), password: d.get('password') });
    if (!r.ok) return toast(r.data.error || 'Connexion impossible.', 'err');
    toast('Connecté : ton offre est active sur cet appareil.', 'ok');
    await loadMe(); renderAccount(); renderAudit(); $('#radarOut').dataset.loaded = '';
  }
  if (f.id === 'pwForm' || f.id === 'pwFormWelcome') {
    e.preventDefault();
    const d = new FormData(f);
    if (d.get('password') !== d.get('confirm')) return toast('Les deux mots de passe ne sont pas identiques.', 'err');
    const r = await api('/api/password', { password: d.get('password'), email: d.get('email') || state.me.email });
    if (!r.ok) return toast(r.data.error || 'Enregistrement impossible.', 'err');
    toast('Mot de passe enregistré : connecte-toi où tu veux avec ton e-mail.', 'ok');
    await loadMe(); renderAccount();
    if (f.isConnected) f.outerHTML = `<p class="src-badge real">${icon('check')} Mot de passe enregistré</p>`; // le formulaire du Compte est déjà redessiné
  }
});
document.addEventListener('click', (e) => { const a = e.target.closest('[data-scroll]'); if (a) { e.preventDefault(); $(`#${a.dataset.scroll}`)?.scrollIntoView({ behavior: 'smooth' }); } });

function renderAccount() {
  renderLogin();
  const { plan, email, portal } = state.me;
  const isScale = RANK[plan] >= 3;
  const paid = plan !== 'test';
  $('#accountCard').innerHTML = `
    <div class="acc-head"><span class="eyebrow">Ton offre</span>${paid ? '<span class="pill ok">ACTIVE</span>' : ''}</div>
    <div class="big">${paid ? `${esc(PLAN_INFO[plan].name)} <span class="grad-text">${PLAN_INFO[plan].price}/mois</span>` : 'Gratuite'}</div>
    ${email ? `<p class="muted">${esc(email)}</p>` : ''}
    ${list(INCLUDED[plan])}
    <div class="account-actions">
      ${portal ? `<button class="btn btn-main" id="portalBtn">Gérer mon abonnement</button>` : ''}
      ${!portal && state.me.portalLogin ? `<a class="btn btn-ghost" href="${esc(state.me.portalLogin)}" target="_blank" rel="noopener">Gérer mon abonnement</a>` : ''}
      ${!paid ? '<button class="btn btn-main" data-open-upgrade>Choisir une offre</button>' : ''}
      ${state.audit && isScale ? `<div class="export-audit"><p class="muted">Ton dernier audit (${esc(state.audit.name)}) en rapport pro :</p>${exportButton('audit')}</div>` : ''}
      ${paid ? '<button class="btn btn-ghost" id="logoutBtn">Se déconnecter</button>' : ''}
      ${state.me.demo ? `<button class="btn btn-ghost" id="resetDemo">${icon('refresh')} Réinitialiser l’aperçu</button>` : ''}
    </div>
    ${portal ? '<p class="plan-note" style="text-align:left;margin:0">Factures, carte bancaire, changement d’offre ou résiliation en 1 clic. Tu gardes l’accès jusqu’à la fin du mois payé.</p>' : ''}`;
  planCards($('#plansMini'), plan);
  $('#portalBtn')?.addEventListener('click', async () => {
    const r = await api('/api/portal', {});
    if (r.data.url) location.assign(r.data.url); else toast(r.data.error || 'Portail indisponible.', 'err');
  });
  $('#resetDemo')?.addEventListener('click', async () => {
    await api('/api/demo-reset', {});
    state.audit = null;
    store.set('pr_audit', null);
    await loadMe();
    renderAccount();
    renderAudit();
    toast('Démo réinitialisée : ton analyse gratuite est disponible.', 'ok');
  });
  $('#logoutBtn')?.addEventListener('click', async () => { await api('/api/logout', {}); location.reload(); });
  bindExport('audit', 'audit', () => ({ audit: state.audit }));
}

$('#restoreForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const r = await api('/api/restore', { email: f.get('email'), last4: f.get('last4') });
  if (!r.ok) return toast(r.data.error || 'Introuvable.', 'err');
  toast('Accès récupéré : choisis maintenant ton nouveau mot de passe.', 'ok');
  await loadMe();
  state.me.pw = false; // « mot de passe oublié » : on propose toujours d'en créer un nouveau
  renderAccount();
  $('#loginBox').scrollIntoView({ behavior: 'smooth' });
});

// ---------- Confettis ----------
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#confetti');
  const ctx = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const colors = ['#ffd23f', '#ffb020', '#3fae82', '#ff7a59', '#ffe68a'];
  const parts = Array.from({ length: 160 }, () => ({ x: innerWidth / 2, y: innerHeight / 3, vx: (Math.random() - 0.5) * 16, vy: Math.random() * -14 - 4, s: 4 + Math.random() * 6, c: colors[Math.floor(Math.random() * 5)], r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3 }));
  let frames = 0;
  (function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of parts) { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
    if (frames++ < 180) requestAnimationFrame(draw); else ctx.clearRect(0, 0, c.width, c.height);
  })();
}

// ---------- Démarrage ----------
async function loadMe() {
  const r = firstMe || await api('/api/me');
  firstMe = null;
  if (r.ok) state.me = r.data;
  // Client abonné : pas de quiz sur l'accueil. L'aperçu (offres simulées) ne compte pas : le quiz y reste toujours visible.
  try { if (state.me.plan && state.me.plan !== 'test' && !state.me.demo) localStorage.setItem('sl_member', state.me.plan); else localStorage.removeItem('sl_member'); } catch { /* stockage indisponible */ }
  paintPlan();
  if (state.me.expired) toast('Ton abonnement a pris fin : retour à l’offre Test.', 'err');
}

// Un seul appel au démarrage : /api/me renvoie aussi la configuration (économise le quota gratuit de Cloudflare).
let firstMe = null;
async function detectBackend() {
  const r = await api('/api/me');
  if (r.ok && r.data.config) { firstMe = r; return { ok: true, data: r.data.config }; }
  ({ demoApi } = await import('./demo.js'));
  document.body.classList.add('is-demo');
  $('.app-top').insertAdjacentHTML('afterend', '<div class="demo-bar">Aperçu du site</div>');
  return demoApi('/api/config');
}

(async function init() {
  const params = new URLSearchParams(location.search);
  const cfg = await detectBackend();
  await loadMe();
  state.config = cfg.data;
  renderWatch();
  $('#niches').innerHTML = Object.entries(cfg.data?.niches || {}).map(([id, n]) => `<button class="seg ${id === state.niche ? 'on' : ''}" data-niche="${id}">${esc(n.label)}</button>`).join('');
  $$('#niches .seg').forEach((b) => b.addEventListener('click', () => loadRadar(b.dataset.niche)));
  show(location.hash.slice(1) || 'audit');
  await offerConnect();
  renderAudit();
  if (params.get('bienvenue')) welcome(params.get('bienvenue'));
  if (params.get('paiement') === 'attente') toast('Ton paiement est en cours de validation. Rafraîchis la page dans quelques secondes.');
  if (params.get('paiement') === 'erreur') toast('Le paiement n’a pas abouti : aucun montant n’a été prélevé. Tu peux réessayer depuis l’onglet Compte.', 'err');
  let handoff = null;
  try { handoff = sessionStorage.getItem('pr_store'); sessionStorage.removeItem('pr_store'); } catch { /* stockage indisponible */ }
  const s = params.get('store') || handoff;
  if (s && !state.connectable) { $('#auditForm input').value = s; show('audit'); runAudit(s); }
  if ([...params.keys()].length) history.replaceState(null, '', location.pathname + location.hash);
})();
