// Quiz d'arrivée : combien ta boutique laisse sur la table. Estimation indicative, calculée dans le navigateur.
// Affiché une seule fois : fait → plus jamais (résultat gardé dans un bandeau), fermé → pas avant 7 jours.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const fmt = (n) => Math.round(n).toLocaleString('fr-FR').replace(/ /g, ' '); // espace insécable visible en gros caractères
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PLANS = { basic: ['Basique', 19], pro: ['Pro', 49], scale: ['Scale', 99] };
  const KEY = 'sl_quiz';
  const WEEK = 7 * 86_400_000;
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* stockage indisponible */ } },
  };

  const STEPS = [
    { id: 'stage', q: 'Où en est <mark>ta boutique</mark> ?', type: 'choice', options: [
      ['launch', 'sprout', 'Pas encore lancée'], ['small', 'rocket', 'Moins de 1 000 €/mois'], ['mid', 'trend', '1 000 à 10 000 €/mois'], ['big', 'award', 'Plus de 10 000 €/mois']] },
    { id: 'visitors', q: 'Combien de <mark>visiteurs</mark> par mois ?', hint: 'Une estimation suffit.', type: 'range', min: 100, max: 200000, unit: 'visiteurs', presets: [500, 2000, 10000, 50000] },
    { id: 'cr', q: 'Sur 100 visiteurs, combien <mark>achètent</mark> ?', hint: 'Ton taux de conversion.', type: 'choice', options: [
      ['1.2', 'help', 'Je ne sais pas'], ['0.3', 'gauge', 'Moins de 0,5'], ['0.75', 'gauge', '0,5 à 1'], ['1.5', 'gauge', '1 à 2'], ['2.5', 'gauge', '2 à 3'], ['3.5', 'gauge', 'Plus de 3']] },
    { id: 'aov', q: 'Ton <mark>panier moyen</mark> ?', hint: 'Le montant moyen d’une commande.', type: 'range', min: 10, max: 300, unit: '€', presets: [20, 40, 70, 120] },
    { id: 'goal', q: 'Ton <mark>objectif</mark> ?', type: 'choice', options: [
      ['first', 'target', 'Ma première vente'], ['1k', 'euro', '1 000 €/mois'], ['10k', 'coins', '10 000 €/mois'], ['100k', 'award', '100 000 €/mois']] },
    { id: 'blocker', q: 'Qu’est-ce qui te <mark>bloque</mark> le plus ?', type: 'choice', options: [
      ['traffic', 'eyeoff', 'Pas assez de visiteurs'], ['conversion', 'cart', 'Les visiteurs n’achètent pas'], ['aov', 'coins', 'Panier trop petit'], ['product', 'search', 'Je ne sais pas quoi vendre']] },
  ];
  const DEFAULT_VISITORS = { launch: 1000, small: 3000, mid: 15000, big: 60000 };
  const BLOCKER = { traffic: 'Pas assez de visiteurs', conversion: 'Tes visiteurs n’achètent pas', aov: 'Ton panier est trop petit', product: 'Tu ne sais pas quoi vendre' };
  const ACTIONS = {
    traffic: ['Publie 1 vidéo courte par jour sur TikTok/Reels autour de ton produit phare', 'Optimise titres et méta-descriptions pour ressortir sur Google', 'Espionne les best-sellers de 3 concurrents pour copier leurs angles'],
    conversion: ['Ajoute des avis clients visibles sur chaque fiche produit', 'Passe à 5 photos minimum par produit, dont une en situation', 'Affiche paiement sécurisé + retours 30 jours sous le bouton d’achat'],
    aov: ['Crée un « Pack x2 -15 % » sur tes 3 best-sellers', 'Ajoute un seuil de livraison offerte à +20 % de ton panier moyen', 'Active les recommandations « souvent achetés ensemble »'],
    product: ['Lance le radar sur ta niche pour repérer les produits qui explosent', 'Choisis un produit entre 15 et 90 € avec un bénéfice visible en vidéo', 'Teste 3 produits en parallèle avant d’investir en pub'],
  };

  // Curseur logarithmique pour les visiteurs (100 → 200 000)
  const toVal = (s, pos) => (s.id === 'visitors' ? Math.round(10 ** (Math.log10(s.min) + (pos / 1000) * (Math.log10(s.max) - Math.log10(s.min))) / 50) * 50 || s.min : Math.round(s.min + (pos / 1000) * (s.max - s.min)));
  const toPos = (s, v) => (s.id === 'visitors' ? ((Math.log10(v) - Math.log10(s.min)) / (Math.log10(s.max) - Math.log10(s.min))) * 1000 : ((v - s.min) / (s.max - s.min)) * 1000);

  let answers = { visitors: 3000, aov: 40 };
  let touched = {}; // curseurs déjà réglés à la main : on ne les écrase plus
  let step = 0;
  let busy = false; // anti double-clic : une seule réponse par question
  let moving = false; // transition en cours : ni double « Valider » ni double « Retour »
  let root;

  function compute(a = answers) {
    const V = a.visitors;
    const cr = a.stage === 'launch' && a.cr === '1.2' ? 0 : Number(a.cr || 1.2);
    const aov = a.aov;
    const current = (V * cr * aov) / 100;
    const boost = a.blocker === 'conversion' ? 1.2 : cr >= 3 ? 0.4 : 0.8;
    const newCr = Math.min(Math.max(cr, 0.5) + boost, 4.5);
    const newAov = aov * (a.blocker === 'aov' ? 1.3 : 1.15);
    const newV = V * (a.blocker === 'traffic' ? 1.3 : 1);
    const potential = (newV * newCr * newAov) / 100;
    const gain = Math.max(0, potential - current);
    const plan = a.blocker === 'product' ? 'pro' : a.stage === 'big' || a.goal === '100k' ? 'scale' : a.stage === 'mid' ? 'pro' : 'basic';
    const days = gain > 0 ? Math.max(1, Math.ceil(PLANS[plan][1] / (gain / 30))) : null;
    return { V, cr, aov, current, potential, gain, newCr, plan, days };
  }

  function build() {
    root = document.getElementById('quiz');
    if (!root) {
      root = document.createElement('div');
      root.id = 'quiz';
      root.className = 'quiz';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      document.body.prepend(root);
    }
    const floaters = ['€', '%', '↑', '€', '+', '€', '%', '↑', '€', '+'].map((c, i) => `<em style="--x:${(i * 97) % 100}%;--s:${0.7 + ((i * 37) % 10) / 10};--t:${14 + ((i * 53) % 10)}s;--d:-${(i * 41) % 14}s">${c}</em>`).join('');
    root.innerHTML = `<div class="quiz-bg"><i></i><i></i>${floaters}</div>
      <div class="quiz-top"><span class="logo"><span class="logo-mark"></span><span>Shop<b>lift</b></span></span>
        <div class="quiz-tease" aria-hidden="true"><small>Ton potentiel</small><b>+<span>••••</span> €</b></div>
        <button class="quiz-x" type="button" aria-label="Fermer le quiz">${window.icon('x')}</button></div>
      <div class="quiz-steps">${STEPS.map(() => '<i></i>').join('')}</div>
      <div class="quiz-stage"></div>`;
    root.querySelector('.quiz-x').onclick = skip;
    // Lumière qui suit la souris (ordinateur)
    root.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { root.style.setProperty('--px', `${e.clientX}px`); root.style.setProperty('--py', `${e.clientY}px`); } });
  }

  // Retour en haut instantané : le défilement fluide du site (scroll-behavior) faisait glisser toute la page sur mobile.
  function top0() {
    const h = document.documentElement, prev = h.style.scrollBehavior;
    h.style.scrollBehavior = 'auto'; scrollTo({ top: 0, left: 0, behavior: 'instant' });
    requestAnimationFrame(() => requestAnimationFrame(() => { h.style.scrollBehavior = prev; }));
  }
  function open() {
    build();
    answers = { visitors: 3000, aov: 40 }; touched = {}; step = 0; busy = false; moving = false; lastTease = null;
    root.classList.remove('done', 'bam');
    root.classList.add('open');
    document.documentElement.classList.add('quiz-on');
    top0();
    question();
  }
  function close() {
    root.classList.remove('open');
    document.documentElement.classList.remove('quiz-on');
    top0();
    const site = document.getElementById('site');
    if (site && !reduced) { site.classList.remove('site-in'); void site.offsetWidth; site.classList.add('site-in'); }
    dispatchEvent(new Event('quiz:closed'));
  }
  function skip() {
    const prev = store.get();
    if (prev?.state !== 'done') store.set({ state: 'skipped', at: Date.now() });
    close();
    if (prev?.state === 'done') banner(prev.answers);
  }

  addEventListener('keydown', (e) => {
    if (!root?.classList.contains('open')) return;
    if (e.key === 'Escape') return skip();
    if (e.target.closest?.('input[type=text], input[type=url], input:not([type])')) return;
    const s = STEPS[step];
    if (!s || root.classList.contains('done')) return;
    if (s.type === 'choice') {
      const i = 'abcdef'.indexOf(e.key.toLowerCase()) >= 0 ? 'abcdef'.indexOf(e.key.toLowerCase()) : '123456'.indexOf(e.key);
      const btn = root.querySelectorAll('.quiz-choice')[i];
      if (i >= 0 && btn) { e.preventDefault(); btn.click(); }
    } else if (e.key === 'Enter') { e.preventDefault(); next(); }
  });

  function swap(html) {
    const stage = root.querySelector('.quiz-stage');
    stage.classList.remove('in', 'out');
    stage.innerHTML = html;
    words(stage.querySelector('h2'));
    void stage.offsetWidth;
    stage.classList.add('in');
    return stage;
  }
  // Titre révélé mot par mot (le mot surligné compte pour un mot).
  function words(h) {
    if (!h || reduced) return;
    let i = 0;
    const wrap = (node) => { const w = document.createElement('span'); w.className = 'w'; const inner = document.createElement('span'); inner.style.setProperty('--i', i++); inner.append(node); w.append(inner); return w; };
    for (const n of [...h.childNodes]) {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/).filter(Boolean);
        n.replaceWith(...parts.map((p) => (/^\s+$/.test(p) ? document.createTextNode(p) : wrap(document.createTextNode(p)))));
      } else n.replaceWith(wrap(n.cloneNode(true)));
    }
    h.style.setProperty('--n', i);
  }
  // Sortie de la question : glisse + flou, puis la suivante arrive.
  function leave(then) {
    const stage = root.querySelector('.quiz-stage');
    if (reduced) return then();
    stage.classList.remove('in');
    stage.classList.add('out');
    setTimeout(then, 200);
  }

  function progress() {
    root.querySelectorAll('.quiz-steps i').forEach((b, i) => { b.className = i < step ? 'on' : i === step ? 'now' : ''; });
    // Teaser : un montant flou qui bouge à chaque réponse, dévoilé seulement à la fin.
    const tease = root.querySelector('.quiz-tease');
    tease.classList.toggle('show', step >= 1);
    if (step < 1) { tease.querySelector('span').textContent = '••••'; return; }
    const val = Math.round(compute({ ...answers, blocker: answers.blocker || 'conversion', cr: answers.cr || '1.2' }).gain);
    scramble(tease, val);
  }
  let lastTease = null; let scrambleTimer = 0;
  function scramble(tease, val) {
    const span = tease.querySelector('span');
    if (val === lastTease) return;
    const up = lastTease !== null && val > lastTease;
    lastTease = val;
    clearInterval(scrambleTimer);
    tease.classList.remove('bump'); void tease.offsetWidth; tease.classList.add('bump');
    if (up && !reduced) { const a = document.createElement('i'); a.className = 'tease-up'; a.textContent = '↑'; tease.append(a); setTimeout(() => a.remove(), 1100); }
    if (reduced) { span.textContent = fmt(val); return; }
    const len = fmt(val).length; let n = 0;
    scrambleTimer = setInterval(() => {
      span.textContent = n++ < 9 ? Array.from({ length: len }, (_, k) => (fmt(val)[k] === '\u00a0' ? '\u00a0' : Math.floor(Math.random() * 10))).join('') : fmt(val);
      if (n > 9) clearInterval(scrambleTimer);
    }, 45);
  }

  function question() {
    busy = false; moving = false;
    const s = STEPS[step];
    if (s.id === 'visitors' && answers.stage && !touched.visitors) answers.visitors = DEFAULT_VISITORS[answers.stage];
    progress();
    const left = STEPS.length - step;
    const head = `<p class="quiz-kicker"><b>${step + 1}/${STEPS.length}</b>${step === 0 ? 'Ton chiffre en 30 secondes' : left === 1 ? 'Dernière question' : `Plus que ${left} questions`}</p><h2>${s.q}</h2>${s.hint ? `<p class="quiz-hint">${s.hint}</p>` : ''}`;
    if (s.type === 'choice') {
      const stage = swap(`${head}<div class="quiz-choices${s.options.length > 4 ? ' six' : ''}">${s.options.map(([v, ic, l], i) => `<button type="button" class="quiz-choice${answers[s.id] === v ? ' on' : ''}" data-v="${v}" style="--d:${i * 0.05}s"><kbd>${'ABCDEF'[i]}</kbd><span class="qi">${window.icon(ic)}</span><span class="ql">${l}</span><span class="qc">${window.icon('check')}</span></button>`).join('')}</div>${nav(false)}`);
      stage.querySelectorAll('.quiz-choice').forEach((b) => (b.onclick = (e) => {
        if (busy) return;
        busy = true;
        answers[s.id] = b.dataset.v;
        stage.querySelectorAll('.quiz-choice').forEach((x) => { x.classList.toggle('on', x === b); x.classList.toggle('dim', x !== b); });
        if (!reduced) {
          const r = b.getBoundingClientRect(); const rip = document.createElement('span'); rip.className = 'rip';
          rip.style.left = `${(e.clientX || r.left + r.width / 2) - r.left}px`; rip.style.top = `${(e.clientY || r.top + r.height / 2) - r.top}px`;
          b.append(rip);
        }
        progress();
        setTimeout(next, reduced ? 80 : 380);
      }));
      bindNav(stage);
    } else {
      const v = answers[s.id];
      const stage = swap(`${head}<div class="quiz-range"><output><b>${fmt(v)}</b><span>${s.unit}</span></output>
        <input type="range" min="0" max="1000" value="${toPos(s, v)}" aria-label="${s.q.replace(/<[^>]+>/g, '')}">
        <div class="quiz-presets">${s.presets.map((p) => `<button type="button" data-p="${p}">${fmt(p)}${s.unit === '€' ? ' €' : ''}</button>`).join('')}</div></div>${nav(true)}`);
      const input = stage.querySelector('input');
      const out = stage.querySelector('output b');
      const setVal = (val) => {
        answers[s.id] = val; touched[s.id] = true;
        out.textContent = fmt(val);
        out.classList.remove('bump'); void out.offsetWidth; out.classList.add('bump');
        stage.querySelectorAll('[data-p]').forEach((b) => b.classList.toggle('on', Number(b.dataset.p) === val));
        progress();
      };
      input.oninput = () => setVal(toVal(s, Number(input.value)));
      stage.querySelectorAll('[data-p]').forEach((b) => (b.onclick = () => { input.value = toPos(s, Number(b.dataset.p)); setVal(Number(b.dataset.p)); }));
      bindNav(stage);
    }
  }

  const nav = (withNext) => `<div class="quiz-nav">${step ? '<button type="button" class="quiz-back">← Retour</button>' : '<button type="button" class="quiz-back quiz-pass">Passer le quiz</button>'}${withNext ? '<button type="button" class="btn btn-main quiz-next">Valider <span class="arrow">→</span></button>' : '<span class="quiz-keys">Touche A, B, C…</span>'}</div>`;
  function bindNav(stage) {
    stage.querySelector('.quiz-pass')?.addEventListener('click', skip);
    stage.querySelector('.quiz-back:not(.quiz-pass)')?.addEventListener('click', () => { if (step > 0 && !moving) { moving = true; busy = true; step--; leave(question); } });
    stage.querySelector('.quiz-next')?.addEventListener('click', next);
  }
  function next() {
    if (moving || step >= STEPS.length) return;
    moving = true; busy = true;
    step++;
    leave(() => (step < STEPS.length ? question() : analyzing()));
  }

  function analyzing() {
    progress();
    root.querySelector('.quiz-tease').classList.remove('show');
    const lines = ['Ton chiffre d’affaires actuel', 'Comparaison avec les boutiques qui convertissent', 'Ton potentiel caché', 'Ton plan d’action'];
    const stage = swap(`<div class="quiz-analyzing"><div class="qa-num"><span class="qa-ring"></span><b>0</b>%</div><div class="qa-bar"><i></i></div>
      <ul>${lines.map((l) => `<li>${window.icon('check')}${l}</li>`).join('')}</ul></div>`);
    const total = reduced ? 300 : 2200; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / total);
      stage.querySelector('.qa-num b').textContent = Math.round(p * 100);
      stage.querySelector('.qa-bar i').style.width = `${p * 100}%`;
      stage.querySelectorAll('li').forEach((li, i) => li.classList.toggle('on', p > (i + 0.7) / lines.length));
      if (p < 1) requestAnimationFrame(tick); else result();
    };
    requestAnimationFrame(tick);
  }

  // Écran de résultat plein écran : le chiffre, la comparaison, les priorités et l'essai gratuit sur SA boutique.
  function result() {
    const r = compute();
    store.set({ state: 'done', at: Date.now(), answers });
    root.classList.add('done');
    const [planName, planPrice] = PLANS[r.plan];
    const launch = r.current < 1;
    const stage = swap(`<div class="qr">
      <p class="quiz-kicker"><b>Résultat</b>Estimation sur tes réponses</p>
      <h2 class="qr-title">${launch ? 'Ta boutique peut viser' : 'Tu laisses environ'}</h2>
      <div class="qr-big">+<b>0</b> €<small>/mois</small></div>
      <p class="qr-sub">${launch ? 'dès les premiers mois avec les bons réglages' : 'sur la table chaque mois'}, soit <b>+${fmt(r.gain * 12)} € par an</b>.</p>
      <div class="qr-bars">
        <div><span>Aujourd’hui</span><i style="--w:${Math.max(3, (r.current / r.potential) * 100)}%"></i><b>${fmt(r.current)} €</b></div>
        <div class="pot"><span>Ton potentiel</span><i style="--w:100%"></i><b>${fmt(r.potential)} €</b></div>
      </div>
      <div class="qr-try">
        <span class="qr-stamp">Gratuit</span>
        <h3>Vérifie sur <mark>ta</mark> boutique.</h3>
        <p>On analyse ta vraie boutique Shopify et on te montre exactement quoi corriger pour aller chercher ces euros.</p>
        <form class="qr-form" data-store-form><input name="store" placeholder="maboutique.com" autocomplete="url" inputmode="url" aria-label="Adresse de ta boutique Shopify" required><button class="btn btn-main" type="submit">Analyser gratuitement <span class="arrow">→</span></button></form>
        <small>1 analyse offerte · sans carte bancaire · résultat en 30 secondes</small>
      </div>
      <div class="qr-plan">
        <div class="qr-prio"><p class="quiz-kicker"><b>Priorité</b>${BLOCKER[answers.blocker] || BLOCKER.conversion}</p>
          <ol>${ACTIONS[answers.blocker || 'conversion'].map((a) => `<li>${a}</li>`).join('')}</ol></div>
        <div class="qr-offer"><span>Offre conseillée</span><b>${planName} · ${planPrice} €/mois</b>${r.days ? `<small>Rentabilisée en ${r.days} jour${r.days > 1 ? 's' : ''} au potentiel estimé</small>` : ''}<button type="button" class="btn btn-ghost qr-see">Voir l’offre</button></div>
      </div>
      <div class="qr-links"><button type="button" class="qr-site">Découvrir Shoplift ↓</button><button type="button" class="qr-redo">${window.icon('refresh')} Refaire le quiz</button></div>
      <p class="quiz-legal">Estimation indicative basée sur des moyennes e-commerce, pas une promesse de résultat.</p></div>`);
    const big = stage.querySelector('.qr-big b');
    // Le montant final doit tenir dans la colonne (gros gains à 6 chiffres) : taille réduite si besoin.
    const line = stage.querySelector('.qr-big');
    big.textContent = fmt(r.gain);
    for (let size = parseFloat(getComputedStyle(line).fontSize); line.scrollWidth > line.clientWidth + 1 && size > 30; size -= 4) line.style.fontSize = `${size}px`;
    big.textContent = '0';
    const t0 = performance.now();
    const tick = (t) => {
      const p = reduced ? 1 : Math.min(1, (t - t0) / 1600);
      big.textContent = fmt(r.gain * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    confetti();
    stage.querySelector('.qr-redo').onclick = open;
    stage.querySelector('.qr-site').onclick = () => { close(); banner(answers); };
    stage.querySelector('.qr-see').onclick = () => {
      close(); banner(answers);
      const plan = document.querySelector(`[data-plan="${r.plan}"]`)?.closest('.plan');
      document.querySelector('#tarifs')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      plan?.classList.add('spot-plan');
      setTimeout(() => plan?.classList.remove('spot-plan'), 4000);
    };
  }

  // Bandeau discret en haut du site, gardé d'une visite à l'autre une fois le quiz fait.
  function banner(a) {
    document.querySelector('.quiz-banner')?.remove();
    if (!a) return;
    const r = compute(a);
    const site = document.getElementById('site');
    if (!site || !r.gain) return;
    site.insertAdjacentHTML('afterbegin', `<div class="quiz-banner"><div class="wrap"><span>${window.icon('trend')}<b>Ton potentiel : +${fmt(r.gain)} €/mois</b></span><a href="#analyser" class="qb-go">Vérifier sur ma boutique →</a><button type="button" class="qb-redo" aria-label="Refaire le quiz">${window.icon('refresh')}</button></div></div>`);
    site.querySelector('.qb-redo').onclick = open;
    site.querySelector('.qb-go').onclick = (e) => { e.preventDefault(); const f = document.querySelector('#analyser [data-store-form]'); f?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); setTimeout(() => f?.querySelector('input')?.focus({ preventScroll: true }), 500); };
  }

  function confetti() {
    if (reduced) return;
    const c = document.createElement('canvas');
    c.className = 'quiz-confetti';
    document.body.append(c);
    const ctx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    const colors = ['#ffd23f', '#ffb020', '#f4f1ea', '#ffe68a'];
    const parts = Array.from({ length: innerWidth < 700 ? 70 : 140 }, () => ({ x: innerWidth / 2, y: innerHeight * 0.3, vx: (Math.random() - 0.5) * 18, vy: Math.random() * -16 - 4, s: 4 + Math.random() * 7, c: colors[Math.floor(Math.random() * colors.length)], r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3 }));
    let f = 0;
    (function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      for (const p of parts) { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
      if (f++ < 180) requestAnimationFrame(draw); else c.remove();
    })();
  }

  document.addEventListener('click', (e) => { if (e.target.closest('[data-quiz]')) { e.preventDefault(); open(); } });
  let paid = false;
  try { paid = !!localStorage.getItem('sl_member'); } catch { /* stockage indisponible */ }
  const saved = store.get();
  const recentlySkipped = saved?.state === 'skipped' && Date.now() - saved.at < WEEK;
  if (location.hash === '#quiz') open(); // lien direct (pub, e-mail) : le quiz s'ouvre toujours
  else if (paid || saved?.state === 'done' || recentlySkipped) {
    build();
    close();
    if (saved?.state === 'done') banner(saved.answers);
  } else open();
  addEventListener('hashchange', () => { if (location.hash === '#quiz') open(); });
  window.shopliftQuiz = { open, compute: () => compute() };
})();
