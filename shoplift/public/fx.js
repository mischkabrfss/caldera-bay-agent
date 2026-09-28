// Effets visuels partagés (page de vente + app). Désactivés si l'utilisateur réduit les animations.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fine = matchMedia('(pointer: fine)').matches;

  // Onde au clic sur les boutons
  document.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.btn, .seg, .tabbar a');
    if (!el) return;
    const r = el.getBoundingClientRect();
    const s = Math.max(r.width, r.height) * 2;
    const dot = document.createElement('span');
    dot.className = 'ripple';
    dot.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    el.append(dot);
    setTimeout(() => dot.remove(), 650);
  });

  if (!fine) return;

  // Halo lumineux qui suit la souris sur les cartes + inclinaison 3D
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
    if (card.matches('.tilt')) card.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 8}deg) rotateX(${(0.5 - y) * 8}deg) translateY(-4px)`;
  });
  document.addEventListener('pointerout', (e) => {
    const card = e.target.closest('.tilt');
    if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
  });

  // Boutons principaux « aimantés »
  document.addEventListener('pointermove', (e) => {
    for (const b of document.querySelectorAll('.btn-main.magnet')) {
      const r = b.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < 140;
      b.style.transform = near ? `translate(${dx * 0.15}px, ${dy * 0.25}px)` : '';
    }
  });
})();
