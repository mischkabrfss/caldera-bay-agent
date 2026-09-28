// Page de vente : animations + redirections.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (n) => Math.round(n).toLocaleString('fr-FR');

// Apparition au scroll
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  e.target.querySelectorAll('[data-count]').forEach(countUp);
  if (e.target.matches('[data-count]')) countUp(e.target);
  io.unobserve(e.target);
}), { threshold: 0.15 });
$$('.reveal, .stat b').forEach((el) => io.observe(el));

function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = 1;
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - start) / 1400);
    el.textContent = fmt(target * (1 - Math.pow(1 - p, 3))) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Nav + CTA collant
const nav = $('#nav');
const sticky = $('#stickyCta');
const hero = $('.hero');
addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 10);
  const past = hero.getBoundingClientRect().bottom < 0;
  const nearEnd = innerHeight + scrollY > document.body.scrollHeight - 500;
  sticky.classList.toggle('show', past && !nearEnd);
}, { passive: true });

// Téléphone de démo : score qui grimpe, barres, argent, notifications
const gauge = $('#demoGauge');
const score = $('#demoScore');
const money = $('#demoMoney');
const toasts = $$('.toast');
function demoLoop() {
  const target = 72 + Math.floor(Math.random() * 22);
  gauge.style.strokeDashoffset = 326.7;
  $$('.ph-bar i').forEach((b) => (b.style.width = '0'));
  setTimeout(() => {
    gauge.style.strokeDashoffset = 326.7 * (1 - target / 100);
    $$('.ph-bar i').forEach((b, i) => setTimeout(() => (b.style.width = `${b.dataset.w - 10 + Math.random() * 18}%`), 150 * i));
    const cash = 2400 + Math.random() * 6000;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 1600);
      const e = 1 - Math.pow(1 - p, 3);
      score.textContent = Math.round(target * e);
      money.textContent = `+${fmt(cash * e)} €/mois`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, 350);
  toasts.forEach((t, i) => {
    t.classList.remove('show');
    setTimeout(() => t.classList.add('show'), 1400 + i * 900);
  });
}
demoLoop();
if (!reduced) setInterval(demoLoop, 7000);

// Inclinaison 3D du téléphone
const phone = $('#phone');
if (!reduced && matchMedia('(pointer: fine)').matches) {
  addEventListener('pointermove', (e) => {
    const x = e.clientX / innerWidth - 0.5;
    const y = e.clientY / innerHeight - 0.5;
    phone.style.transform = `rotateY(${-14 + x * 18}deg) rotateX(${6 - y * 12}deg)`;
  });
}

// Pluie de pièces et de billets (canvas léger)
const canvas = $('#coins');
if (canvas && !reduced) {
  const ctx = canvas.getContext('2d');
  const glyphs = ['€', '💸', '✦', '€', '💰', '✦'];
  let w, h, items;
  const reset = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    const count = innerWidth < 700 ? 14 : 26;
    items = Array.from({ length: count }, () => spawn(true, dpr));
  };
  const spawn = (anywhere, dpr = Math.min(devicePixelRatio || 1, 2)) => ({
    x: Math.random() * w, y: anywhere ? Math.random() * h : -40, s: (10 + Math.random() * 16) * dpr,
    v: (0.25 + Math.random() * 0.7) * dpr, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.02,
    g: glyphs[Math.floor(Math.random() * glyphs.length)], a: 0.12 + Math.random() * 0.3,
  });
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const c of items) {
      c.y += c.v; c.r += c.vr;
      if (c.y > h + 40) Object.assign(c, spawn(false));
      ctx.save(); ctx.globalAlpha = c.a; ctx.translate(c.x, c.y); ctx.rotate(c.r);
      ctx.font = `800 ${c.s}px Sora, sans-serif`; ctx.fillStyle = '#00f5a0'; ctx.fillText(c.g, 0, 0); ctx.restore();
    }
    requestAnimationFrame(draw);
  };
  reset(); addEventListener('resize', reset); draw();
}

// Simulateur
const sV = $('#sV'), sB = $('#sB'), sC = $('#sC');
let shown = 0;
function sim() {
  $('#oV').textContent = fmt(sV.value);
  $('#oB').textContent = `${sB.value} €`;
  $('#oC').textContent = `+${Number(sC.value).toFixed(1).replace('.', ',')} pt`;
  const target = sV.value * (sC.value / 100) * sB.value;
  const from = shown;
  const start = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - start) / 500);
    shown = from + (target - from) * p;
    $('#simOut').textContent = `+${fmt(shown)} €`;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
[sV, sB, sC].forEach((el) => el.addEventListener('input', sim));
sim();

// Formulaire boutique → app
$$('[data-store-form]').forEach((form) => form.addEventListener('submit', (e) => {
  e.preventDefault();
  const store = new FormData(form).get('store').trim();
  if (!store) return;
  try { sessionStorage.setItem('pr_store', store); } catch { /* stockage indisponible */ }
  location.href = `app.html?store=${encodeURIComponent(store)}`;
}));

// Achat d'une offre
$$('[data-plan]').forEach((button) => button.addEventListener('click', async () => {
  const label = button.innerHTML;
  button.disabled = true;
  button.textContent = 'Ouverture du paiement…';
  try {
    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: button.dataset.plan }) });
    const data = await res.json();
    if (data.url) return location.assign(data.url);
    note(button, data.error || 'Paiement indisponible pour le moment.');
  } catch {
    location.href = 'app.html#compte'; // aperçu sans serveur : on ouvre la démo
    return;
  }
  button.disabled = false;
  button.innerHTML = label;
}));

function note(button, text) {
  let el = button.parentElement.querySelector('.plan-msg');
  if (!el) {
    el = Object.assign(document.createElement('small'), { className: 'plan-msg' });
    el.style.cssText = 'color:var(--gold);font-weight:700;text-align:center';
    button.after(el);
  }
  el.textContent = text;
}
