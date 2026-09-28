// Tableau de bord Shoplift.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const safeImg = (src) => {
  if (/^data:image\/svg\+xml,/.test(src || '')) return esc(src);
  if (!/^https?:\/\//.test(src || '')) return '';
  try { const u = new URL(src); if (u.hostname === 'cdn.shopify.com') u.searchParams.set('width', '400'); return esc(u.href); } catch { return ''; }
};
const money = (n, cur = 'EUR') => { try { return Number(n).toLocaleString('fr-FR', { style: 'currency', currency: cur, maximumFractionDigits: 2 }); } catch { return `${n} €`; } };
const store = { get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage indisponible */ } } };

const PLAN_INFO = {
  basic: { name: 'Basique', price: '19 €', pitch: 'Audit complet illimité + toutes les fiches notées' },
  pro: { name: 'Pro', price: '49 €', pitch: 'Radar produits gagnants + espion concurrents', feat: true },
  scale: { name: 'Scale', price: '99 €', pitch: 'Comparateur 4 boutiques + export CSV' },
};
const RANK = { test: 0, basic: 1, pro: 2, scale: 3 };
const state = { me: { plan: 'test', trialLeft: 3 }, config: null, audit: store.get('pr_audit'), sort: 'asc', niche: 'mode', spy: null };

// Images bloquées ou cassées : on les masque proprement au lieu d'une icône cassée.
document.addEventListener('error', (e) => { if (e.target.tagName === 'IMG') e.target.classList.add('noimg'); }, true);

let demoApi = null; // Mode démo : chargé seulement si le serveur est absent (aperçu statique).

async function api(path, body) {
  if (demoApi) return demoApi(path, body);
  try {
    const res = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: 'Connexion impossible. Vérifie ton réseau.' } };
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
      confetti();
      return toast(`C’est fait : tu es maintenant en ${PLAN_INFO[r.data.plan].name} ✦`, 'ok');
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
  $('#trialInfo').textContent = plan === 'test' ? `🎁 ${trialLeft} analyse${trialLeft > 1 ? 's' : ''} gratuite${trialLeft > 1 ? 's' : ''} restante${trialLeft > 1 ? 's' : ''}` : 'Analyses illimitées ✦';
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
    if (r.status === 402) { out.innerHTML = ''; openUpgrade(state.me.demo ? `${r.data.error} (Démo : choisis une offre ou réinitialise dans Compte.)` : r.data.error); } else out.innerHTML = `<div class="card empty"><b>😕</b>${esc(r.data.error || 'Analyse impossible.')}</div>`;
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
const colorOf = (s) => (s >= 75 ? 'var(--green)' : s >= 55 ? 'var(--orange)' : 'var(--red)');
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
  if (!a) { out.innerHTML = '<div class="card empty"><b>🛰️</b>Entre l’adresse de ta boutique Shopify pour lancer ton premier audit.</div>'; return; }
  const locked = a.fixes.filter((f) => f.locked).length;
  out.innerHTML = `
  <div class="result-grid">
    <div>
      <div class="card result-hero">
        ${gaugeSvg('scoreG')}
        <span class="grade ${gradeClass(a.score)}">${esc(a.grade)}</span>
        ${a.source === 'shopify' ? '<p class="src-badge real">✓ Analyse réelle · via ta connexion Shopify</p>' : ''}
        <h2>${esc(a.name)}</h2><p class="muted" style="font-size:13px">${esc(a.host)}${a.theme ? ` · thème ${esc(a.theme)}` : ''}</p>
        <div class="stats">
          <div><b data-n="${a.stats.products}">0</b><span>produits</span></div><div><b data-n="${a.fixes.length}">0</b><span>corrections</span></div><div><b>${a.stats.avgImages}</b><span>photos/fiche</span></div>
          <div><b data-n="${a.stats.avgWords}">0</b><span>mots/fiche</span></div><div><b data-n="${a.stats.soldOut}">0</b><span>ruptures</span></div><div><b>${money(a.stats.avgPrice, a.currency)}</b><span>prix moyen</span></div>
        </div>
        ${a.stack.length ? `<div class="stack">${a.stack.map((s) => `<span>✓ ${esc(STACK[s] || s)}</span>`).join('')}</div>` : ''}
      </div>
      <div class="card cats">${a.categories.map((c) => `<div class="cat-row"><span>${esc(c.label)}</span><span style="color:${colorOf(c.score)}">${c.score}</span><div class="bar"><i data-w="${c.score}" style="background:${colorOf(c.score)}"></i></div></div>`).join('')}</div>
    </div>
    <div>
      <div class="h3">🎯 Ton plan d’action <span class="muted" style="font-size:13px">${a.fixes.length} points</span></div>
      <div class="list">${a.fixes.map((f, i) => f.locked ? `
        <div class="card fix locked" style="--d:${i * 0.05}s"><div class="fix-top blur"><span class="pill ${impactPill[f.impact]}">${esc(f.impact.toUpperCase())}</span><span class="t">${esc(f.title)}</span></div>
        <div class="lock-over" style="background:none;place-content:center end;padding-right:14px">🔒</div></div>` : `
        <div class="card fix ${i === 0 ? 'open' : ''}" style="--d:${i * 0.05}s"><div class="fix-top"><span class="pill ${impactPill[f.impact]}">${esc(f.impact.toUpperCase())}</span><span class="t">${esc(f.title)}</span><span class="chev">⌄</span></div>
        <div class="fix-body"><div><p><b>Pourquoi c’est important</b>${esc(f.why)}</p><p class="how"><b>Comment corriger</b>${esc(f.fix)}</p></div></div></div>`).join('')}</div>
      ${locked ? `<div class="card unlock-banner"><h3>🔓 ${locked} corrections cachées</h3><p>Débloque le plan d’action complet et l’analyse de toutes tes fiches produit.</p><button class="btn btn-main" data-open-upgrade>Tout débloquer <span class="arrow">→</span></button></div>` : ''}
      ${a.strengths.length ? `<div class="h3">💪 Ce qui est déjà top</div><div class="strengths">${a.strengths.map((s) => `<span>✓ ${esc(s)}</span>`).join('')}</div>` : ''}
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
    out.innerHTML = `<div class="card empty"><b>🔌</b>${esc(error.message)}</div>`;
  }
}

async function offerConnect() {
  if (!state.me.demo) return;
  const { shopifyAvailable } = await import('./connect.js');
  if (!(await shopifyAvailable())) return;
  $('#auditForm').insertAdjacentHTML('beforebegin', '<button class="btn btn-main magnet connect-btn" id="connectBtn" type="button">🔗 Analyser ma vraie boutique <span class="arrow">→</span></button><p class="muted connect-note">Analyse réelle, en lecture seule, via ta connexion Shopify claude.ai.</p>');
  $('#connectBtn').addEventListener('click', runConnected);
}

$('#auditForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = new FormData(e.target).get('store').trim();
  if (v) runAudit(v);
});

// ---------- Produits ----------
function productCard(p, i, cur) {
  if (p.locked) return `<div class="card prod locked" style="--d:${i * 0.04}s"><div class="blur" style="display:contents"><img class="prod-img" src="${safeImg(p.image)}" alt="" loading="lazy"><div><h3>${esc(p.title)}</h3><div class="prod-meta"><span class="ring" style="--p:${p.score};--c:${colorOf(p.score)}">${p.score}</span></div></div></div><div class="lock-over"><span>🔒 Analyse détaillée</span><button class="btn btn-main" data-open-upgrade>Débloquer</button></div></div>`;
  return `<div class="card prod" style="--d:${i * 0.04}s">
    <img class="prod-img" src="${safeImg(p.image)}" alt="" loading="lazy">
    <div><div class="prod-head"><h3>${esc(p.title)}</h3><span class="ring" style="--p:${p.score};--c:${colorOf(p.score)}">${p.score}</span></div>
      <div class="prod-meta"><span class="pill ${p.verdict === 'Produit fort' ? 'ok' : p.verdict === 'Faible' ? 'hi' : 'md'}">${esc(p.verdict.toUpperCase())}</span><span>${money(p.price, cur)}</span>${p.discount ? `<span>-${p.discount}%</span>` : ''}${p.available ? '' : '<span style="color:var(--red)">Rupture</span>'}</div></div>
    <details class="prod-details" ${i === 0 ? 'open' : ''}><summary>${p.cons.length} à corriger · ${p.pros.length} points forts</summary>
      ${p.cons.map((c) => `<div class="con-line"><b>✗ ${esc(c.t)}</b><span>${esc(c.why)}</span><em>→ ${esc(c.fix)}</em></div>`).join('')}
      ${p.pros.map((t) => `<div class="pro-line">✓ ${esc(t)}</div>`).join('')}
    </details></div>`;
}

function renderProducts() {
  const out = $('#productsOut');
  const a = state.audit;
  if (!a) { out.innerHTML = '<div class="card empty"><b>🧠</b>Lance d’abord un audit de ta boutique dans l’onglet Audit.<br><br><a class="btn btn-main" href="#audit">Lancer un audit</a></div>'; return; }
  const list = [...a.products].sort((x, y) => (state.sort === 'asc' ? x.score - y.score : y.score - x.score));
  const hidden = a.products.filter((p) => p.locked).length;
  out.innerHTML = `<div class="list">${list.slice(0, 120).map((p, i) => productCard(p, i, a.currency)).join('')}</div>${hidden ? `<div class="card unlock-banner"><h3>🔓 ${hidden} fiches à débloquer</h3><p>Vois pour chaque produit ce qui cloche, pourquoi, et comment le corriger.</p><button class="btn btn-main" data-open-upgrade>Débloquer toutes les fiches</button></div>` : ''}`;
}
$$('[data-sort]').forEach((b) => b.addEventListener('click', () => {
  state.sort = b.dataset.sort;
  $$('[data-sort]').forEach((x) => x.classList.toggle('on', x === b));
  renderProducts();
}));

// ---------- Cartes produit (radar / espion) ----------
function pCard(p, i, cur) {
  const locked = p.locked;
  const inner = `<div class="img">${p.image ? `<img src="${safeImg(p.image)}" alt="" loading="lazy">` : ''}<span class="score-badge ${p.score >= 80 ? 'hot' : ''}">${p.score >= 80 ? '🔥 ' : ''}${p.score}</span></div>
    <div class="body"><h3>${esc(locked ? 'Produit gagnant caché' : p.title)}</h3>
    <div class="price">${locked ? '••,•• €' : money(p.price, p.currency || cur)}${!locked && p.discount ? `<s>-${p.discount}%</s>` : ''}</div>
    ${p.reasons?.length ? `<div class="reasons">${p.reasons.slice(0, 3).map((r) => `<span>${esc(r)}</span>`).join('')}</div>` : ''}
    ${!locked && p.store ? `<span class="src">chez ${esc(p.store)}</span>` : ''}
    ${!locked && p.verdict ? `<span class="src">${esc(p.verdict)}${p.age !== null && p.age !== undefined ? ` · il y a ${p.age} j` : ''}</span>` : ''}</div>`;
  if (locked) return `<div class="card pcard is-locked" style="--d:${i * 0.05}s">${inner}<div class="lock-over"><span>🔒</span><button class="btn btn-main" data-open-upgrade data-reason="Le radar et l’espion sont inclus dans l’offre Pro.">Pro</button></div></div>`;
  if (p.example) return `<div class="card pcard tilt" style="--d:${i * 0.05}s">${inner}</div>`;
  return `<a class="card pcard tilt" style="--d:${i * 0.05}s" href="${esc(p.url)}" target="_blank" rel="noopener nofollow">${inner}</a>`;
}

// ---------- Radar ----------
async function loadRadar(niche) {
  state.niche = niche;
  $$('#niches .seg').forEach((b) => b.classList.toggle('on', b.dataset.niche === niche));
  const out = $('#radarOut');
  out.dataset.loaded = '1';
  const done = loader(out, ['Scan des boutiques de référence', 'Lecture des best-sellers', 'Calcul du score produit gagnant']);
  const [r] = await Promise.all([api(`/api/radar?niche=${encodeURIComponent(niche)}`), wait(1500)]);
  done();
  if (!r.ok) { out.innerHTML = `<div class="card empty"><b>😕</b>${esc(r.data.error)}</div>`; return; }
  if (!r.data.items.length) { out.innerHTML = '<div class="card empty"><b>📡</b>Le radar se recharge pour cette niche. Réessaie dans quelques minutes.</div>'; return; }
  const note = r.data.items[0]?.example ? '<p class="src-badge" style="margin:0 0 12px">Aperçu : produits d’exemple. Le vrai radar scanne des boutiques réelles chaque nuit sur le site en ligne.</p>' : '';
  out.innerHTML = `${note}<div class="pgrid">${r.data.items.map((p, i) => pCard(p, i)).join('')}</div>${r.data.locked ? '<div class="card unlock-banner"><h3>🛰️ Débloque le radar complet</h3><p>24 produits gagnants par niche, avec leurs raisons et le lien direct.</p><button class="btn btn-main" data-open-upgrade>Passer Pro</button></div>' : ''}`;
}

// ---------- Espion & comparateur ----------
$$('[data-spy-tab]').forEach((b) => b.addEventListener('click', () => {
  $$('[data-spy-tab]').forEach((x) => x.classList.toggle('on', x === b));
  $('#spyPane').classList.toggle('hidden', b.dataset.spyTab !== 'spy');
  $('#comparePane').classList.toggle('hidden', b.dataset.spyTab !== 'compare');
  if (b.dataset.spyTab === 'compare' && RANK[state.me.plan] < 3) openUpgrade('Le comparateur multi-boutiques et l’export CSV sont inclus dans l’offre Scale.');
}));

$('#spyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const out = $('#spyOut');
  const done = loader(out, ['Connexion à la boutique', 'Lecture des best-sellers', 'Détection des nouveautés', 'Analyse des prix']);
  const [r] = await Promise.all([api('/api/spy', { store: new FormData(e.target).get('store') }), wait(1800)]);
  done();
  if (!r.ok) { out.innerHTML = `<div class="card empty"><b>😕</b>${esc(r.data.error)}</div>`; return; }
  const s = r.data.report;
  state.spy = s;
  out.innerHTML = `
    <div class="h3">${esc(s.name)} <span class="muted" style="font-size:13px">${esc(s.host)}</span></div>
    <div class="spy-stats"><div class="card"><b>${s.stats.products}</b><span>produits</span></div><div class="card"><b>${money(s.stats.avgPrice, s.currency)}</b><span>prix moyen</span></div><div class="card"><b>${s.stats.launches30}</b><span>lancés /30 j</span></div>
    <div class="card"><b>${money(s.stats.minPrice, s.currency)}</b><span>prix min</span></div><div class="card"><b>${money(s.stats.maxPrice, s.currency)}</b><span>prix max</span></div><div class="card"><b>${s.stats.discounted}%</b><span>en promo</span></div></div>
    ${s.topTypes.length ? `<div class="strengths">${s.topTypes.map((t) => `<span>${esc(t.name)} · ${t.count}</span>`).join('')}</div>` : ''}
    <div class="h3">🏆 Best-sellers</div>${s.bestsellers.length ? `<div class="pgrid">${s.bestsellers.map((p, i) => pCard(p, i, s.currency)).join('')}</div>` : '<p class="muted">Classement des ventes non disponible sur cette boutique.</p>'}
    <div class="h3">🚀 Derniers lancements</div><div class="pgrid">${s.launches.map((p, i) => pCard(p, i, s.currency)).join('')}</div>
    ${s.locked ? '<div class="card unlock-banner"><h3>🕵️ Vois tout chez tes concurrents</h3><p>Best-sellers, nouveautés et liens directs avec l’offre Pro.</p><button class="btn btn-main" data-open-upgrade>Passer Pro</button></div>' : ''}`;
});

$('#compareForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (RANK[state.me.plan] < 3) return openUpgrade('Le comparateur est inclus dans l’offre Scale.');
  const out = $('#compareOut');
  const stores = new FormData(e.target).getAll('s').map((v) => v.trim()).filter(Boolean);
  const done = loader(out, ['Scan des boutiques', 'Lecture des catalogues', 'Comparaison']);
  const [r] = await Promise.all([api('/api/compare', { stores }), wait(1500)]);
  done();
  if (!r.ok) { out.innerHTML = `<div class="card empty"><b>😕</b>${esc(r.data.error)}</div>`; return; }
  const rows = r.data.rows;
  const best = (k, max = true) => rows.reduce((b, x) => ((max ? x[k] > b : x[k] < b) ? x[k] : b), max ? -Infinity : Infinity);
  const cols = [['products', 'Produits', true], ['avgPrice', 'Prix moyen', true], ['launches30', 'Lancés /30 j', true], ['discounted', '% en promo', true], ['avgScore', 'Score fiches', true]];
  out.innerHTML = `<div class="card table-wrap"><table><thead><tr><th>Boutique</th>${cols.map((c) => `<th>${c[1]}</th>`).join('')}<th>Best-seller n°1</th></tr></thead><tbody>
    ${rows.map((x) => `<tr><td><b>${esc(x.name)}</b><br><small class="muted">${esc(x.host)}</small></td>${cols.map(([k, , m]) => `<td class="${x[k] === best(k, m) ? 'win' : ''}">${k === 'avgPrice' ? money(x[k], x.currency) : k === 'discounted' ? `${x[k]}%` : x[k]}</td>`).join('')}<td>${x.top ? `<a href="${esc(x.top.url)}" target="_blank" rel="noopener nofollow">${esc(x.top.title)}</a>` : '—'}</td></tr>`).join('')}
  </tbody></table></div>${r.data.failed.length ? `<p class="muted" style="margin-top:8px">Non analysées : ${r.data.failed.map(esc).join(', ')}</p>` : ''}
  <button class="btn btn-ghost" style="margin-top:12px" id="csvBtn">⬇️ Exporter en CSV</button>`;
  $('#csvBtn').onclick = () => downloadCsv('comparatif.csv', [['Boutique', 'Adresse', ...cols.map((c) => c[1]), 'Best-seller'], ...rows.map((x) => [x.name, x.host, ...cols.map(([k]) => x[k]), x.top?.title || ''])]);
});

function downloadCsv(name, rows) {
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })), download: name });
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------- Compte ----------
function renderAccount() {
  const { plan, email, portal } = state.me;
  const isScale = RANK[plan] >= 3;
  $('#accountCard').innerHTML = `
    <span class="eyebrow">Offre actuelle</span><div class="big">${plan === 'test' ? 'Test gratuit' : `${esc(PLAN_INFO[plan].name)} <span class="grad-text">${PLAN_INFO[plan].price}/mois</span>`}</div>
    ${email ? `<p class="muted">${esc(email)}</p>` : ''}
    <div class="account-actions">
      ${portal ? '<button class="btn btn-ghost" id="portalBtn">Gérer mon abonnement / factures</button>' : ''}
      ${!portal && state.me.portalLogin ? `<a class="btn btn-ghost" href="${esc(state.me.portalLogin)}" target="_blank" rel="noopener">Gérer mon abonnement (lien par e-mail)</a>` : ''}
      ${plan !== 'test' && !state.me.demo ? '<button class="btn btn-ghost" id="logoutBtn">Se déconnecter</button>' : ''}
      ${state.me.demo ? '<button class="btn btn-ghost" id="resetDemo">↺ Réinitialiser la démo</button>' : ''}
      ${state.audit && isScale ? '<button class="btn btn-ghost" id="exportAudit">⬇️ Exporter mon dernier audit (CSV)</button>' : ''}
    </div>`;
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
    toast('Démo réinitialisée : 3 analyses gratuites à nouveau ✦', 'ok');
  });
  $('#logoutBtn')?.addEventListener('click', async () => { await api('/api/logout', {}); location.reload(); });
  $('#exportAudit')?.addEventListener('click', () => {
    const a = state.audit;
    downloadCsv(`audit-${a.host}.csv`, [['Type', 'Titre', 'Impact / Score', 'Pourquoi', 'Correction'],
      ...a.fixes.map((f) => ['Boutique', f.title, f.impact, f.why, f.fix]),
      ...a.products.flatMap((p) => p.cons.map((c) => [`Produit : ${p.title}`, c.t, p.score, c.why, c.fix]))]);
  });
}

$('#restoreForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const r = await api('/api/restore', { email: f.get('email'), last4: f.get('last4') });
  if (!r.ok) return toast(r.data.error || 'Introuvable.', 'err');
  toast('Accès récupéré ✦', 'ok');
  await loadMe();
  renderAccount();
});

// ---------- Confettis ----------
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#confetti');
  const ctx = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const colors = ['#00f5a0', '#00c2ff', '#8b5cff', '#ff4fd8', '#ffd166'];
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
  const r = await api('/api/me');
  if (r.ok) state.me = r.data;
  paintPlan();
  if (state.me.expired) toast('Ton abonnement a pris fin : retour à l’offre Test.', 'err');
}

async function detectBackend() {
  const r = await api('/api/config');
  if (r.ok && r.data.plans) return r;
  ({ demoApi } = await import('./demo.js'));
  document.body.classList.add('is-demo');
  $('.app-top').insertAdjacentHTML('afterend', '<div class="demo-bar">✦ Démo · boutiques d’exemple</div>');
  return demoApi('/api/config');
}

(async function init() {
  const params = new URLSearchParams(location.search);
  const cfg = await detectBackend();
  await loadMe();
  state.config = cfg.data;
  $('#niches').innerHTML = Object.entries(cfg.data?.niches || {}).map(([id, n]) => `<button class="seg ${id === state.niche ? 'on' : ''}" data-niche="${id}">${n.emoji} ${esc(n.label)}</button>`).join('');
  $$('#niches .seg').forEach((b) => b.addEventListener('click', () => loadRadar(b.dataset.niche)));
  show(location.hash.slice(1) || 'audit');
  offerConnect();
  renderAudit();
  if (params.get('bienvenue')) { confetti(); toast(`Bienvenue dans l’offre ${PLAN_INFO[params.get('bienvenue')]?.name || ''} ✦ Tout est débloqué !`, 'ok'); }
  if (params.get('paiement') === 'attente') toast('Paiement en cours de validation… rafraîchis dans quelques secondes.');
  if (params.get('paiement') === 'erreur') toast('Le paiement n’a pas pu être vérifié.', 'err');
  let handoff = null;
  try { handoff = sessionStorage.getItem('pr_store'); sessionStorage.removeItem('pr_store'); } catch { /* stockage indisponible */ }
  const s = params.get('store') || handoff;
  if (s) { $('#auditForm input').value = s; show('audit'); runAudit(s); }
  if ([...params.keys()].length) history.replaceState(null, '', location.pathname + location.hash);
})();
