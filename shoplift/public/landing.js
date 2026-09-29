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
  const glyphs = ['€', '€', '$', '€', '%', '€'];
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

// Titre révélé mot par mot (garde le dégradé sur « de l’argent »)
(() => {
  const h1 = $('.hero h1');
  if (!h1 || reduced) return;
  let i = 0;
  const wrap = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(part);
          const w = Object.assign(document.createElement('span'), { className: 'w', textContent: part });
          w.style.setProperty('--i', i++);
          frag.append(w);
        });
        child.replaceWith(frag);
      } else if (child.classList?.contains('grad-text')) {
        child.classList.add('w');
        child.style.setProperty('--i', i++);
      } else wrap(child);
    }
  };
  wrap(h1);
})();

// Champ boutique : exemples qui s'écrivent tout seuls
(() => {
  const input = $('.hero input[name=store]');
  if (!input || reduced) return;
  const examples = ['maboutique.com', 'lampe-design.fr', 'urban-sneakers.com', 'cosy-home.myshopify.com', 'bijoux-lina.fr'];
  let e = 0, c = 0, del = false;
  input.classList.add('typing');
  const tick = () => {
    if (document.activeElement === input || input.value) { input.placeholder = 'maboutique.com'; return setTimeout(tick, 1200); }
    const word = examples[e];
    c += del ? -1 : 1;
    input.placeholder = word.slice(0, c) + (c % 2 ? '▍' : '');
    if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
    if (del && c === 0) { del = false; e = (e + 1) % examples.length; }
    setTimeout(tick, del ? 35 : 80);
  };
  setTimeout(tick, 1200);
})();

// Barre de progression + parallaxe des halos
(() => {
  const bar = $('#progress');
  const blobs = $$('.blob');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      if (!reduced) blobs.forEach((b, i) => (b.style.translate = `0 ${scrollY * (0.12 + i * 0.08)}px`));
      ticking = false;
    });
  }, { passive: true });
})();

// Client abonné : les boutons mènent à son espace
if (document.documentElement.classList.contains('is-paid')) {
  document.querySelectorAll('.nav-links .btn-main, #stickyCta .btn').forEach((b) => {
    b.href = 'app.html';
    b.innerHTML = 'Mon espace <span class="arrow">→</span>';
  });
}
