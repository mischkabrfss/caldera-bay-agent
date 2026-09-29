// Quiz d'arrivée : combien ta boutique pourrait gagner. Estimation indicative, calculée dans le navigateur.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const fmt = (n) => Math.round(n).toLocaleString('fr-FR');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PLANS = { basic: ['Basique', 19], pro: ['Pro', 49], scale: ['Scale', 99] };
  const BENCH = 2.5; // taux de conversion e-commerce de référence (%)

  const STEPS = [
    { id: 'stage', q: 'Où en est ta boutique ?', type: 'choice', options: [
      ['launch', 'sprout', 'Pas encore lancée'], ['small', 'rocket', 'Moins de 1 000 €/mois'], ['mid', 'trend', '1 000 à 10 000 €/mois'], ['big', 'award', 'Plus de 10 000 €/mois']] },
    { id: 'visitors', q: 'Combien de visiteurs par mois ?', hint: 'Une estimation suffit.', type: 'range', min: 100, max: 200000, unit: 'visiteurs' },
    { id: 'cr', q: 'Ton taux de conversion ?', hint: 'Sur 100 visiteurs, combien achètent ?', type: 'choice', options: [
      ['1.2', 'help', 'Je ne sais pas'], ['0.3', 'gauge', 'Moins de 0,5 %'], ['0.75', 'gauge', '0,5 à 1 %'], ['1.5', 'gauge', '1 à 2 %'], ['2.5', 'gauge', '2 à 3 %'], ['3.5', 'gauge', 'Plus de 3 %']] },
    { id: 'aov', q: 'Ton panier moyen ?', hint: 'Le montant moyen d’une commande.', type: 'range', min: 10, max: 300, unit: '€' },
    { id: 'goal', q: 'Ton objectif ?', type: 'choice', options: [
      ['first', 'target', 'Ma première vente'], ['1k', 'euro', '1 000 €/mois'], ['10k', 'coins', '10 000 €/mois'], ['100k', 'award', '100 000 €/mois']] },
    { id: 'blocker', q: 'Ton plus gros blocage ?', type: 'choice', options: [
      ['traffic', 'eyeoff', 'Pas assez de visiteurs'], ['conversion', 'cart', 'Les visiteurs n’achètent pas'], ['aov', 'coins', 'Panier trop petit'], ['product', 'search', 'Je ne sais pas quoi vendre']] },
  ];
  const DEFAULT_VISITORS = { launch: 1000, small: 3000, mid: 15000, big: 60000 };
  const ACTIONS = {
    traffic: ['Publie 1 vidéo courte par jour sur TikTok/Reels autour de ton produit phare', 'Optimise titres et méta-descriptions pour ressortir sur Google', 'Espionne les best-sellers de 3 concurrents pour copier leurs angles'],
    conversion: ['Ajoute des avis clients visibles sur chaque fiche produit', 'Passe à 5 photos minimum par produit, dont une en situation', 'Affiche paiement sécurisé + retours 30 jours sous le bouton d’achat'],
    aov: ['Crée un « Pack x2 -15 % » sur tes 3 best-sellers', 'Ajoute un seuil de livraison offerte à +20 % de ton panier moyen', 'Active les recommandations « souvent achetés ensemble »'],
    product: ['Lance le radar sur ta niche pour repérer les produits qui explosent', 'Choisis un produit entre 15 et 90 € avec un bénéfice visible en vidéo', 'Teste 3 produits en parallèle avant d’investir en pub'],
  };

  // Curseur logarithmique pour les visiteurs (100 → 200 000)
  const toVal = (s, pos) => (s.id === 'visitors' ? Math.round(10 ** (Math.log10(s.min) + (pos / 1000) * (Math.log10(s.max) - Math.log10(s.min))) / 50) * 50 || s.min : Math.round(s.min + (pos / 1000) * (s.max - s.min)));
  const toPos = (s, v) => (s.id === 'visitors' ? ((Math.log10(v) - Math.log10(s.min)) / (Math.log10(s.max) - Math.log10(s.min))) * 1000 : ((v - s.min) / (s.max - s.min)) * 1000);

  const answers = { visitors: 3000, aov: 40 };
  let step = 0;
  let root;

  function build() {
    root = document.getElementById('quiz'); // coque déjà présente dans la page (affichée dès la 1re image)
    if (!root) {
      root = document.createElement('div');
      root.id = 'quiz';
      root.className = 'quiz';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.innerHTML = `<div class="quiz-bg"><i></i><i></i><i></i></div><canvas class="quiz-confetti"></canvas>
        <div class="quiz-top"><span class="logo"><span class="logo-mark"></span><span>Shop<b>lift</b></span></span><button class="quiz-x" type="button" aria-label="Fermer le quiz">${window.icon('x')}</button></div>
        <div class="quiz-bar"><i></i></div><div class="quiz-stage"></div>`;
      document.body.append(root);
    }
    root.querySelector('.quiz-x').onclick = close;
    addEventListener('keydown', (e) => e.key === 'Escape' && root.classList.contains('open') && close());
  }

  function open(first = false) {
    if (!root) build();
    step = 0;
    root.classList.add('open');
    const ready = first && root.querySelector('.quiz-start');
    if (ready) bindIntro(root.querySelector('.quiz-stage')); else intro();
  }

  function close() {
    root.classList.remove('open');
    scrollTo(0, 0);
  }

  function swap(html) {
    const stage = root.querySelector('.quiz-stage');
    stage.classList.remove('in');
    stage.innerHTML = html;
    void stage.offsetWidth;
    stage.classList.add('in');
    return stage;
  }

  function intro() {
    root.querySelector('.quiz-bar i').style.width = '0%';
    const stage = swap(`<div class="quiz-intro"><div class="slot" aria-hidden="true"><span>+</span><b></b><b></b><b></b><b></b><span>€</span></div><span class="eyebrow">Quiz · 30 secondes</span>
      <h2>Combien ta boutique <span class="grad-text">pourrait te rapporter</span> ?</h2>
      <p class="muted">6 questions rapides. Ton résultat personnalisé s’affiche à la fin.</p>
      <button class="btn btn-main quiz-start" type="button">C’est parti <span class="arrow">→</span></button>
      <button class="quiz-skip" type="button">Pas maintenant</button></div>`);
    spinSlot(stage.querySelector('.slot'));
    bindIntro(stage);
  }

  function bindIntro(stage) {
    stage.querySelector('.quiz-start').onclick = () => question();
    stage.querySelector('.quiz-skip').onclick = close;
  }

  function spinSlot(slot) {
    const cells = [...slot.querySelectorAll('b')];
    cells.forEach((c, i) => {
      c.innerHTML = `<i>${Array.from({ length: 12 }, (_, k) => (k + i * 3) % 10).join('<br>')}</i>`;
      c.style.setProperty('--d', `${i * 0.18}s`);
    });
  }

  function question() {
    const s = STEPS[step];
    root.querySelector('.quiz-bar i').style.width = `${(step / STEPS.length) * 100}%`;
    if (s.id === 'visitors' && answers.stage) answers.visitors = DEFAULT_VISITORS[answers.stage];
    const head = `<span class="quiz-count">${step + 1} / ${STEPS.length}</span><h2>${s.q}</h2>${s.hint ? `<p class="muted">${s.hint}</p>` : ''}`;
    if (s.type === 'choice') {
      const stage = swap(`${head}<div class="quiz-choices">${s.options.map(([v, e, l], i) => `<button type="button" class="quiz-choice${answers[s.id] === v ? ' on' : ''}" data-v="${v}" style="--d:${i * 0.06}s"><span>${window.icon(e)}</span>${l}</button>`).join('')}</div>${nav(false)}`);
      stage.querySelectorAll('.quiz-choice').forEach((b) => (b.onclick = () => {
        answers[s.id] = b.dataset.v;
        stage.querySelectorAll('.quiz-choice').forEach((x) => x.classList.toggle('on', x === b));
        setTimeout(next, 260);
      }));
      bindNav(stage);
    } else {
      const v = answers[s.id];
      const stage = swap(`${head}<div class="quiz-range"><output><b>${fmt(v)}</b> ${s.unit}</output>
        <input type="range" min="0" max="1000" value="${toPos(s, v)}" aria-label="${s.q}"></div>${nav(true)}`);
      const input = stage.querySelector('input');
      input.oninput = () => {
        answers[s.id] = toVal(s, Number(input.value));
        stage.querySelector('output b').textContent = fmt(answers[s.id]);
      };
      bindNav(stage);
    }
  }

  const nav = (withNext) => `<div class="quiz-nav">${step ? '<button type="button" class="quiz-back">← Retour</button>' : '<span></span>'}${withNext ? '<button type="button" class="btn btn-main quiz-next">Suivant <span class="arrow">→</span></button>' : ''}</div>`;
  function bindNav(stage) {
    stage.querySelector('.quiz-back')?.addEventListener('click', () => { step--; question(); });
    stage.querySelector('.quiz-next')?.addEventListener('click', next);
  }
  function next() {
    step++;
    if (step < STEPS.length) question(); else analyzing();
  }

  function compute() {
    const V = answers.visitors;
    const cr = answers.stage === 'launch' && answers.cr === '1.2' ? 0 : Number(answers.cr || 1.2);
    const aov = answers.aov;
    const current = (V * cr * aov) / 100;
    const boost = answers.blocker === 'conversion' ? 1.2 : cr >= 3 ? 0.4 : 0.8;
    const newCr = Math.min(Math.max(cr, 0.5) + boost, 4.5);
    const newAov = aov * (answers.blocker === 'aov' ? 1.3 : 1.15);
    const newV = V * (answers.blocker === 'traffic' ? 1.3 : 1);
    const potential = (newV * newCr * newAov) / 100;
    const gain = Math.max(0, potential - current);
    const plan = answers.blocker === 'product' ? 'pro' : answers.stage === 'big' || answers.goal === '100k' ? 'scale' : answers.stage === 'mid' ? 'pro' : 'basic';
    const days = gain > 0 ? Math.max(1, Math.ceil(PLANS[plan][1] / (gain / 30))) : null;
    return { V, cr, aov, current, potential, gain, newCr, plan, days };
  }

  function analyzing() {
    root.querySelector('.quiz-bar i').style.width = '100%';
    const lines = ['Calcul de ton chiffre d’affaires actuel', 'Comparaison avec les boutiques qui convertissent', 'Estimation de ton potentiel', 'Préparation de ton plan d’action'];
    const stage = swap(`<div class="quiz-analyzing"><div class="radar"><i style="top:24%;left:62%"></i><i style="top:60%;left:30%;animation-delay:.7s"></i></div>
      <div class="loader-lines">${lines.map((l) => `<p>${l}</p>`).join('')}</div></div>`);
    const ps = stage.querySelectorAll('.loader-lines p');
    ps.forEach((p, i) => setTimeout(() => p.classList.add('on'), 450 * i));
    setTimeout(result, reduced ? 300 : 2300);
  }

  function result() {
    const r = compute();
    const [planName, planPrice] = PLANS[r.plan];
    const stage = swap(`<div class="quiz-result">
      <div class="boom"><span></span><span></span><span></span></div>
      <span class="eyebrow">Ton potentiel estimé</span>
      <div class="quiz-big">+<b data-to="${Math.round(r.gain)}">0</b> €<small>/mois</small></div>
      <p class="quiz-year">soit <b>+${fmt(r.gain * 12)} €</b> par an</p>
      <div class="quiz-bars">
        <div><span>Aujourd’hui</span><div class="bar"><i style="--w:${Math.max(4, (r.current / Math.max(r.potential, 1)) * 100)}%"></i></div><b>${fmt(r.current)} €</b></div>
        <div><span>Potentiel</span><div class="bar hot"><i style="--w:100%"></i></div><b>${fmt(r.potential)} €</b></div>
      </div>
      <div class="quiz-kpis">
        <div><b>${String(r.cr).replace('.', ',')} %</b><span>ta conversion</span></div>
        <div><b>${BENCH.toString().replace('.', ',')} %</b><span>moyenne marché</span></div>
        <div><b>${r.newCr.toFixed(1).replace('.', ',')} %</b><span>ton objectif</span></div>
      </div>
      <div class="quiz-actions"><h3>Tes 3 actions prioritaires</h3><ol>${ACTIONS[answers.blocker || 'conversion'].map((a) => `<li>${a}</li>`).join('')}</ol></div>
      <div class="quiz-plan"><span class="badge-hot">RECOMMANDÉ POUR TOI</span><b>Shoplift ${planName} · ${planPrice} €/mois</b>
        ${r.days ? `<p>Rentabilisé en <b>${r.days} jour${r.days > 1 ? 's' : ''}</b> si tu atteins ce potentiel.</p>` : ''}</div>
      <button class="btn btn-main quiz-go" type="button">Analyser ma boutique gratuitement <span class="arrow">→</span></button>
      <button class="quiz-skip quiz-plans" type="button">Voir l’offre ${planName}</button>
      <button class="btn btn-ghost quiz-redo" type="button">${window.icon('refresh')} Refaire le quiz</button>
      <p class="quiz-legal">Estimation indicative basée sur des moyennes e-commerce, pas une promesse de résultat.</p>
    </div>`);
    const big = stage.querySelector('[data-to]');
    const target = Number(big.dataset.to);
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 1800);
      big.textContent = fmt(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    confetti();
    stage.querySelector('.quiz-redo').onclick = () => { step = 0; Object.assign(answers, { visitors: 3000, aov: 40 }); ['stage', 'cr', 'goal', 'blocker'].forEach((k) => delete answers[k]); question(); };
    stage.querySelector('.quiz-go').onclick = () => {
      close();
      const input = document.querySelector('.hero input[name=store]');
      document.querySelector('#analyser')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => input?.focus(), 500);
    };
    stage.querySelector('.quiz-plans').onclick = () => {
      close();
      document.querySelector('#tarifs')?.scrollIntoView({ behavior: 'smooth' });
      const card = document.querySelector(`[data-plan="${r.plan}"]`)?.closest('.plan');
      card?.classList.add('spot-plan');
      setTimeout(() => card?.classList.remove('spot-plan'), 4000);
    };
  }

  function confetti() {
    if (reduced) return;
    const c = root.querySelector('.quiz-confetti');
    const ctx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    const colors = ['#00f5a0', '#00c2ff', '#8b5cff', '#ff4fd8', '#ffd166'];
    const parts = Array.from({ length: 180 }, () => ({ x: innerWidth / 2, y: innerHeight * 0.3, vx: (Math.random() - 0.5) * 18, vy: Math.random() * -16 - 4, s: 4 + Math.random() * 7, c: colors[Math.floor(Math.random() * 5)], r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3 }));
    let f = 0;
    (function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      for (const p of parts) { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
      if (f++ < 200) requestAnimationFrame(draw); else ctx.clearRect(0, 0, c.width, c.height);
    })();
  }

  document.addEventListener('click', (e) => { if (e.target.closest('[data-quiz]')) { e.preventDefault(); open(); } });
  let paid = false;
  try { paid = !!localStorage.getItem('sl_paid'); } catch { /* stockage indisponible */ }
  if (paid) build(); else open(true); // abonné : pas de quiz ; sinon déjà affiché par la page, on branche les boutons
  window.shopliftQuiz = { open, compute: () => compute() };
})();
