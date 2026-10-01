// Exports pro aux couleurs Shoplift : rapport PDF (jsPDF) et classeur Excel (ExcelJS).
// Bibliothèques chargées à la demande, seulement quand le client exporte.
import { supplierLinks } from './suppliers.js';
import { STACK_LABELS } from './analyze.js';

const C = { ink: '#0a0a0a', ink2: '#123a2b', cream: '#f7f2e3', paper: '#fffdf7', gold: '#ffd23f', amber: '#ffb020', good: '#1f9d63', mid: '#e39a12', bad: '#e0523f', text: '#16241d', muted: '#5f7466', line: '#e6dfcc', soft: '#f5f0e2', link: '#1f5fd6' };
const scoreColor = (s) => (s >= 75 ? C.good : s >= 55 ? C.mid : C.bad);
const IMPACT = { élevé: ['ÉLEVÉ', C.bad], moyen: ['MOYEN', C.mid], faible: ['FAIBLE', C.muted] };
const today = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const clean = (v) => String(v ?? '').replace(/[  ]/g, ' ').replace(/[→✓•]/g, '-');
const num = (n) => (typeof n === 'number' && !Number.isInteger(n) ? n.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) : n);
const tools = (list) => (list || []).map((k) => STACK_LABELS[k] || k);
const money = (n, cur = 'EUR') => { try { return clean(Number(n).toLocaleString('fr-FR', { style: 'currency', currency: cur, maximumFractionDigits: 2 })); } catch { return `${n} €`; } };
const slug = (s) => String(s || 'export').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- Chargement des bibliothèques, polices et images ----------
const loaded = {};
function script(url, global) {
  loaded[url] ??= new Promise((ok, ko) => {
    if (window[global]) return ok(window[global]);
    const s = Object.assign(document.createElement('script'), { src: url, async: true });
    s.onload = () => (window[global] ? ok(window[global]) : ko(new Error('Bibliothèque introuvable')));
    s.onerror = () => { delete loaded[url]; ko(new Error('Connexion requise pour générer le fichier.')); };
    document.head.append(s);
  });
  return loaded[url];
}
const jsPDF = () => script('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf').then((m) => m.jsPDF);
const ExcelJS = () => script('https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js', 'ExcelJS');

const b64 = (buf) => { let s = ''; const a = new Uint8Array(buf); for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode(...a.subarray(i, i + 0x8000)); return btoa(s); };
let fonts;
const loadFonts = () => (fonts ??= Promise.all(['500', '800'].map((w) => fetch(`fonts/Manrope-${w}.ttf`).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject())).then(b64))).catch(() => null));

// Photo recadrée proprement (format 4:5 sur fond clair), en JPEG léger pour le PDF et l'Excel.
const imgCache = new Map();
function photo(src, w = 320, h = 400) {
  if (!src) return Promise.resolve(null);
  const key = `${src}|${w}x${h}`;
  if (!imgCache.has(key)) {
    imgCache.set(key, (async () => {
      let url = src;
      try { const u = new URL(src, location.href); if (u.hostname === 'cdn.shopify.com') u.searchParams.set('width', String(w * 2)); url = u.href; } catch { /* chemin local */ }
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error('image');
      const bmp = await createImageBitmap(await res.blob());
      const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
      const g = c.getContext('2d');
      g.fillStyle = C.soft; g.fillRect(0, 0, w, h);
      const k = Math.max(w / bmp.width, h / bmp.height);
      g.drawImage(bmp, (w - bmp.width * k) / 2, (h - bmp.height * k) / 2, bmp.width * k, bmp.height * k);
      return c.toDataURL('image/jpeg', 0.86);
    })().catch(() => null));
  }
  return imgCache.get(key);
}

function canvasPng(w, h, draw) {
  const c = Object.assign(document.createElement('canvas'), { width: w * 2, height: h * 2 });
  const g = c.getContext('2d'); g.scale(2, 2); draw(g);
  return c.toDataURL('image/png');
}
// Logo : étiquette de prix + flèche montante.
const logoPng = () => canvasPng(64, 64, (g) => {
  g.fillStyle = C.gold;
  g.beginPath(); g.moveTo(7, 32); g.lineTo(22, 13); g.lineTo(54, 13); g.quadraticCurveTo(59, 13, 59, 18); g.lineTo(59, 46); g.quadraticCurveTo(59, 51, 54, 51); g.lineTo(22, 51); g.closePath(); g.fill();
  g.fillStyle = C.ink; g.beginPath(); g.arc(21, 32, 4, 0, 7); g.fill();
  g.strokeStyle = C.ink; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(31, 42); g.lineTo(44, 25); g.moveTo(34, 25); g.lineTo(44, 25); g.lineTo(44, 35); g.stroke();
});
// Jauge de score (anneau dégradé).
const gaugePng = (score) => canvasPng(160, 160, (g) => {
  g.lineWidth = 14; g.lineCap = 'round';
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(80, 80, 62, 0, Math.PI * 2); g.stroke();
  const grad = g.createLinearGradient(0, 0, 160, 160); grad.addColorStop(0, C.gold); grad.addColorStop(1, scoreColor(score) === C.good ? '#6fe3a5' : C.amber);
  g.strokeStyle = grad; g.beginPath(); g.arc(80, 80, 62, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * Math.max(2, score)) / 100); g.stroke();
});

// ---------- Enregistrement ----------
async function save(name, blob) {
  const downloads = document.body.classList.contains('is-demo') && window.claude?.use ? await window.claude.use('downloads').catch(() => null) : null;
  if (downloads) {
    await downloads.save({ filename: name, data: blob });
    return;
  }
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

// =====================================================================
// PDF
// =====================================================================
async function newPdf(landscape = false) {
  const [PDF, f] = await Promise.all([jsPDF(), loadFonts()]);
  const doc = new PDF({ unit: 'pt', format: 'a4', orientation: landscape ? 'landscape' : 'portrait', compress: true });
  let family = 'helvetica';
  if (f) { doc.addFileToVFS('M5.ttf', f[0]); doc.addFont('M5.ttf', 'Manrope', 'normal'); doc.addFileToVFS('M8.ttf', f[1]); doc.addFont('M8.ttf', 'Manrope', 'bold'); family = 'Manrope'; }
  const W = doc.internal.pageSize.getWidth(); const H = doc.internal.pageSize.getHeight(); const M = 40;
  const logo = logoPng();
  const P = {
    doc, W, H, M, y: M,
    font(size, bold = false, color = C.text) { doc.setFont(family, bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(color); },
    text(t, x, y, opt) { doc.text(Array.isArray(t) ? t.map(clean) : clean(t), x, y, opt); },
    lines(t, width) { return doc.splitTextToSize(clean(t), width); },
    fill(color) { doc.setFillColor(color); },
    pill(label, x, y, bg, fg = '#ffffff', size = 7.5) {
      P.font(size, true, fg);
      const w = doc.getTextWidth(clean(label)) + 12;
      P.fill(bg); doc.roundedRect(x, y - size - 3, w, size + 8, 4, 4, 'F');
      P.text(label, x + 6, y + 1.5);
      return w;
    },
    link(label, x, y, url, size = 8.5) { P.font(size, true, C.link); doc.textWithLink(clean(label), x, y, { url }); return doc.getTextWidth(clean(label)); },
    band(title) { // en-tête des pages intérieures
      P.fill(C.ink); doc.rect(0, 0, W, 54, 'F');
      doc.addImage(logo, 'PNG', M, 15, 24, 24);
      P.font(14, true, C.cream); P.text('Shoplift', M + 32, 32);
      P.font(9, false, '#a8a39a'); P.text(title, W - M, 32, { align: 'right' });
      P.fill(C.gold); doc.rect(0, 54, W, 2.5, 'F');
      P.y = 84;
    },
    page(title) { doc.addPage(); P.fill(C.paper); doc.rect(0, 0, W, H, 'F'); P.band(title); },
    need(h, title) { if (P.y + h > H - 56) P.page(title); },
    // Titre de section : jamais seul en bas de page (assez de place pour la suite).
    h2(t, title, after = 60) { P.need(after + 30, title); P.font(17, true, C.ink); P.text(t, M, P.y); P.fill(C.gold); doc.rect(M, P.y + 7, 36, 3, 'F'); P.y += 28; },
    cover({ kicker, title, sub, meta }) {
      P.fill(C.ink); doc.rect(0, 0, W, H, 'F');
      P.fill(C.ink2); doc.circle(W - 60, 90, 190, 'F');
      P.fill(C.gold); doc.rect(0, H - 8, W, 8, 'F');
      doc.addImage(logo, 'PNG', M, M, 34, 34);
      P.font(20, true, C.cream); P.text('Shoplift', M + 44, M + 24);
      P.font(9, true, C.gold); P.text(kicker.toUpperCase(), M, 150, { charSpace: 1.2 });
      P.font(32, true, C.cream); const tl = P.lines(title, W - 2 * M); P.text(tl, M, 186); let y = 186 + tl.length * 36;
      if (sub) { P.font(12, false, '#a8a39a'); const sl = P.lines(sub, W - 2 * M); P.text(sl, M, y); y += sl.length * 16; }
      P.font(9, false, '#a8a39a'); P.text(meta || `Rapport généré le ${today()}`, M, y + 8);
      return y + 40;
    },
    tiles(list, y, dark = true) { // chiffres clés
      const n = list.length; const gap = 8; const w = (W - 2 * M - gap * (n - 1)) / n;
      list.forEach(([v, l], i) => {
        const x = M + i * (w + gap);
        P.fill(dark ? C.ink2 : C.soft); doc.roundedRect(x, y, w, 52, 8, 8, 'F');
        P.font(15, true, dark ? C.cream : C.ink); P.text(String(num(v)), x + w / 2, y + 24, { align: 'center' });
        P.font(7.5, false, dark ? '#a8a39a' : C.muted); P.text(l, x + w / 2, y + 40, { align: 'center' });
      });
      return y + 64;
    },
    finish(label) { // pied de page sur chaque page
      const n = doc.getNumberOfPages();
      for (let i = 1; i <= n; i++) {
        doc.setPage(i);
        P.font(7.5, false, i === 1 ? '#a8a39a' : C.muted);
        P.text(`Shoplift · ${label} · ${today()}`, M, H - 22);
        P.text(`${i} / ${n}`, W - M, H - 22, { align: 'right' });
      }
      return doc.output('blob');
    },
  };
  return P;
}

// Carte produit pleine largeur (radar, espion) : photo · infos · score et liens produit + fournisseurs.
async function productCard(P, p, x, y, w, h, cur) {
  const { doc } = P;
  const c = p.currency || cur;
  P.fill('#ffffff'); doc.setDrawColor(C.line); doc.setLineWidth(0.8); doc.roundedRect(x, y, w, h, 10, 10, 'FD');
  const iw = 104; const ih = h - 20;
  const img = await photo(p.image);
  if (img) doc.addImage(img, 'JPEG', x + 10, y + 10, iw, ih, undefined, 'FAST');
  else { P.fill(C.soft); doc.roundedRect(x + 10, y + 10, iw, ih, 6, 6, 'F'); P.font(8, false, C.muted); P.text('Photo', x + 10 + iw / 2, y + 10 + ih / 2, { align: 'center' }); }
  if (p.discount) P.pill(`-${p.discount}%`, x + 16, y + 26, C.bad);
  // infos
  const tx = x + iw + 24; const rx = x + w - 124; const tw = rx - tx - 14;
  let ty = y + 26;
  P.font(11, true, C.ink); const tl = P.lines(p.title, tw).slice(0, 2); P.text(tl, tx, ty); ty += tl.length * 13 + 10;
  P.font(17, true, C.ink); P.text(money(p.price, c), tx, ty); ty += 16;
  if (p.resale) { P.font(8, true, C.good); P.text(`Revente conseillée : ${money(p.resale.low, c)} – ${money(p.resale.high, c)}`, tx, ty); ty += 13; }
  const why = (p.reasons || (p.verdict ? [p.verdict] : [])).slice(0, 4).join(' · ');
  if (why) { P.font(8, false, C.text); const rl = P.lines(why, tw).slice(0, 2); P.text(rl, tx, ty); ty += rl.length * 10.5 + 3; }
  if (p.store) { P.font(8, false, C.muted); P.text(`chez ${p.store}`, tx, ty); }
  // colonne droite
  P.fill(C.soft); doc.roundedRect(rx, y + 10, 114, h - 20, 8, 8, 'F');
  P.fill(scoreColor(p.score)); doc.roundedRect(rx + 10, y + 20, 40, 22, 6, 6, 'F');
  P.font(12, true, '#ffffff'); P.text(String(p.score), rx + 30, y + 35.5, { align: 'center' });
  P.font(7, false, C.muted); P.text('score\nproduit', rx + 56, y + 29);
  let ly = y + 60;
  if (p.url) { P.link('Voir le produit ›', rx + 10, ly, p.url, 8.5); ly += 16; }
  P.font(7, true, C.muted); P.text('FOURNISSEURS', rx + 10, ly, { charSpace: 0.6 }); ly += 12;
  for (const s of supplierLinks(p).filter((s) => ['aliexpress', 'cj', 'spocket', 'alibaba'].includes(s.id))) {
    if (ly > y + h - 14) break;
    P.link(`${s.name} ›`, rx + 10, ly, s.url, 8); ly += 11.5;
  }
}

const preload = (list, w, h) => Promise.all(list.map((p) => photo(p.image, w, h))); // toutes les photos en parallèle

async function productGrid(P, list, cur, title) {
  await preload(list);
  const h = 150; const gap = 10;
  for (const p of list) {
    P.need(h + gap, title);
    await productCard(P, p, P.M, P.y, P.W - 2 * P.M, h, cur);
    P.y += h + gap;
  }
}

function fixCard(P, f, title) {
  const { doc, M, W } = P;
  const tw = W - 2 * M - 30;
  if (f.locked) {
    P.need(34, title);
    P.fill(C.soft); doc.roundedRect(M, P.y, W - 2 * M, 28, 8, 8, 'F');
    P.pill(IMPACT[f.impact]?.[0] || 'POINT', M + 12, P.y + 17, C.muted);
    P.font(9, true, C.muted); P.text(`${f.title} — détail inclus dans l’offre Basique`, M + 70, P.y + 17.5);
    P.y += 34; return;
  }
  P.font(8.5, false); const why = P.lines(f.why, tw); const fix = P.lines(f.fix, tw);
  const h = 44 + why.length * 11 + fix.length * 11;
  P.need(h + 8, title);
  const [label, color] = IMPACT[f.impact] || ['POINT', C.muted];
  P.fill('#ffffff'); doc.setDrawColor(C.line); doc.setLineWidth(0.8); doc.roundedRect(M, P.y, W - 2 * M, h, 8, 8, 'FD');
  P.fill(color); doc.rect(M, P.y + 8, 3, h - 16, 'F');
  const pw = P.pill(label, M + 16, P.y + 18, color);
  P.font(11, true, C.ink); P.text(f.title, M + 22 + pw, P.y + 19);
  let y = P.y + 36;
  P.font(8.5, false, C.text); P.text(why, M + 16, y); y += why.length * 11 + 2;
  P.font(8.5, true, C.good); P.text(fix, M + 16, y);
  P.y += h + 8;
}

async function productRows(P, products, cur, title) {
  const { doc, M, W } = P;
  await preload(products, 160, 200);
  for (const p of products) {
    if (p.locked) continue;
    const cons = (p.cons || []).slice(0, 3);
    P.font(8, false); const lines = cons.map((c) => P.lines(`${c.t} — ${c.fix}`, W - 2 * M - 130));
    P.font(10, true); const tlen = Math.min(2, P.lines(p.title, W - 2 * M - 130).length);
    const h = Math.max(92, 46 + tlen * 12 + lines.reduce((n, l) => n + l.length * 10 + 3, 0));
    P.need(h + 8, title);
    P.fill('#ffffff'); doc.setDrawColor(C.line); doc.roundedRect(M, P.y, W - 2 * M, h, 8, 8, 'FD');
    const img = await photo(p.image, 160, 200);
    if (img) doc.addImage(img, 'JPEG', M + 10, P.y + 10, 58, 72, undefined, 'FAST'); else { P.fill(C.soft); doc.roundedRect(M + 10, P.y + 10, 58, 72, 6, 6, 'F'); }
    const tx = M + 80; const tw = W - 2 * M - 130;
    P.font(10, true, C.ink); const tl = P.lines(p.title, tw).slice(0, 2); P.text(tl, tx, P.y + 20);
    P.font(8, false, C.muted); P.text(`${money(p.price, cur)} · ${p.verdict}`, tx, P.y + 22 + tl.length * 12);
    // note
    P.fill(scoreColor(p.score)); doc.circle(W - M - 26, P.y + 26, 16, 'F');
    P.font(11, true, '#ffffff'); P.text(String(p.score), W - M - 26, P.y + 30, { align: 'center' });
    let y = P.y + 36 + tl.length * 12;
    lines.forEach((l) => { P.font(8, false, C.text); P.fill(C.bad); doc.circle(tx + 2, y - 3, 1.6, 'F'); P.text(l, tx + 8, y); y += l.length * 10 + 3; });
    P.y += h + 8;
  }
}

async function auditPdf(a, { productsOnly = false } = {}) {
  const P = await newPdf();
  const { doc, M, W } = P;
  const label = productsOnly ? 'Fiches produit' : 'Audit de boutique';
  let y = P.cover({ kicker: label, title: a.name, sub: a.host + (a.theme ? ` · thème ${a.theme}` : ''), meta: `${a.source === 'shopify' ? 'Analyse réelle via la connexion Shopify' : 'Analyse des données publiques'} · ${today()}` });
  // score
  doc.addImage(gaugePng(a.score), 'PNG', M, y, 120, 120);
  P.font(34, true, C.cream); P.text(String(a.score), M + 60, y + 66, { align: 'center' });
  P.font(9, false, '#a8a39a'); P.text('/ 100', M + 60, y + 82, { align: 'center' });
  P.font(20, true, scoreColor(a.score) === C.good ? '#6fe3a5' : scoreColor(a.score) === C.mid ? C.amber : '#ff8a78'); P.text(a.grade, M + 145, y + 48);
  P.font(9.5, false, '#cfdcd2'); P.text(P.lines(`${a.fixes.length} points à améliorer, classés du plus rentable au moins urgent. Chaque point explique pourquoi il te coûte des ventes et comment le corriger.`, W - 2 * M - 150), M + 145, y + 68);
  y += 140;
  y = P.tiles([[a.stats.products, 'produits'], [a.fixes.length, 'corrections'], [a.stats.avgImages, 'photos / fiche'], [a.stats.avgWords, 'mots / fiche'], [a.stats.soldOut, 'ruptures'], [money(a.stats.avgPrice, a.currency), 'prix moyen']], y);
  // catégories
  P.font(9, true, C.gold); P.text('SCORE PAR CATÉGORIE', M, y + 10, { charSpace: 1 }); y += 24;
  for (const c of a.categories) {
    P.font(9.5, true, C.cream); P.text(c.label, M, y + 9);
    P.fill('#262626'); doc.roundedRect(M + 150, y, W - 2 * M - 190, 11, 5, 5, 'F');
    P.fill(scoreColor(c.score) === C.good ? '#6fe3a5' : scoreColor(c.score) === C.mid ? C.amber : '#ff8a78'); doc.roundedRect(M + 150, y, Math.max(8, ((W - 2 * M - 190) * c.score) / 100), 11, 5, 5, 'F');
    P.font(9.5, true, C.cream); P.text(String(c.score), W - M, y + 9, { align: 'right' });
    y += 20;
  }
  if (a.stack?.length) { P.font(8.5, false, '#a8a39a'); P.text(P.lines(`Outils détectés : ${tools(a.stack).join(' · ')}`, W - 2 * M), M, y + 12); }

  if (!productsOnly) {
    P.page(label);
    P.h2('Ton plan d’action', label);
    a.fixes.forEach((f) => fixCard(P, f, label));
    if (a.strengths?.length) {
      P.h2('Ce qui est déjà bien', label);
      const col = (W - 2 * M - 12) / 2;
      a.strengths.forEach((s, i) => {
        if (i % 2 === 0) P.need(22, label);
        const x = M + (i % 2) * (col + 12);
        P.fill(C.good); doc.circle(x + 5, P.y - 3, 4, 'F');
        P.font(9, false, C.text); P.text(P.lines(s.title || s, col - 16)[0], x + 15, P.y);
        if (i % 2 === 1 || i === a.strengths.length - 1) P.y += 18;
      });
      P.y += 16;
    }
  }
  const prods = a.products.filter((p) => !p.locked);
  if (prods.length) { if (productsOnly) P.page(label); P.h2(`Tes fiches produit (${prods.length})`, label); await productRows(P, prods.slice(0, 60), a.currency, label); }
  return P.finish(`${label} · ${a.host}`);
}

// Podium : les 3 premiers produits en grand, sur la couverture.
async function podium(P, items, y, cur) {
  const top = items.slice(0, 3); const w = (P.W - 2 * P.M - 24) / 3;
  if (y + w * 1.25 + 60 > P.H - 40) return;
  await preload(top, 320, 400);
  for (const [i, p] of top.entries()) {
    const x = P.M + i * (w + 12);
    const img = await photo(p.image, 320, 400);
    if (img) P.doc.addImage(img, 'JPEG', x, y, w, w * 1.25, undefined, 'FAST');
    P.fill(C.gold); P.doc.roundedRect(x + 8, y + 8, 34, 18, 5, 5, 'F'); P.font(9, true, C.ink); P.text(`#${i + 1}`, x + 25, y + 21, { align: 'center' });
    P.font(9, true, C.cream); P.text(P.lines(p.title, w).slice(0, 2), x, y + w * 1.25 + 16);
    P.font(9, false, C.gold); P.text(`${money(p.price, p.currency || cur)} · score ${p.score}`, x, y + w * 1.25 + 42);
  }
}

async function radarPdf(items, { niche, date }) {
  const P = await newPdf();
  const label = `Radar ${niche}`;
  let y = P.cover({ kicker: 'Radar produits gagnants', title: `${items.length} produits qui se vendent en ${niche}`, sub: 'Classés par rang de vente, fraîcheur, prix et promotion dans des boutiques Shopify de référence. Chaque produit renvoie vers sa page et vers des fournisseurs connectables à Shopify.', meta: `Relevé du ${date}` });
  await podium(P, items, y);
  P.page(label); P.h2('Le classement complet', label, 160);
  await productGrid(P, items, 'EUR', label);
  P.h2('Fournisseurs connectables à Shopify', label);
  supplierLinks({ title: '' }).forEach((s) => { P.need(18, label); P.font(9, true, C.ink); P.text(s.name, P.M, P.y); P.font(8.5, false, C.muted); P.text(`${s.tag} · livraison ${s.delay} · via ${s.via}`, P.M + 110, P.y); P.link('Installer ›', P.W - P.M - 44, P.y, s.app, 8.5); P.y += 16; });
  return P.finish(label);
}

async function spyPdf(s) {
  const P = await newPdf();
  const label = `Espion · ${s.host}`;
  let y = P.cover({ kicker: 'Espion concurrent', title: s.name, sub: s.host });
  y = P.tiles([[s.stats.products, 'produits'], [money(s.stats.avgPrice, s.currency), 'prix moyen'], [s.stats.launches30 ?? '—', 'lancés / 30 j'], [money(s.stats.minPrice, s.currency), 'prix min'], [money(s.stats.maxPrice, s.currency), 'prix max'], [`${s.stats.discounted}%`, 'en promo']], y);
  if (s.topTypes?.length) { P.font(9, true, C.gold); P.text('CATÉGORIES PRINCIPALES', P.M, y + 10, { charSpace: 1 }); P.font(10, false, C.cream); P.text(P.lines(s.topTypes.map((t) => `${t.name} (${t.count})`).join(' · '), P.W - 2 * P.M), P.M, y + 28); y += 50; }
  if (s.stack) { P.font(9, true, C.gold); P.text('OUTILS MARKETING DÉTECTÉS', P.M, y + 10, { charSpace: 1 }); P.font(10, false, C.cream); P.text(P.lines(s.stack.length ? s.stack.join(' · ') : 'Aucun outil repéré sur la page d’accueil', P.W - 2 * P.M), P.M, y + 28); y += 50; }
  const hits = s.bestsellers.filter((p) => !p.locked).length ? s.bestsellers : s.launches;
  if (hits.filter((p) => !p.locked).length) { P.font(9, true, C.gold); P.text(s.bestsellers.length ? (s.bestSource === 'home' ? 'SES 3 PRODUITS MIS EN AVANT' : 'SES 3 MEILLEURES VENTES') : 'SES 3 DERNIERS LANCEMENTS', P.M, y + 14, { charSpace: 1 }); await podium(P, hits.filter((p) => !p.locked), y + 26, s.currency); }
  const best = s.bestsellers.filter((p) => !p.locked); const launch = s.launches.filter((p) => !p.locked);
  const tips = (s.insights || []).filter((x) => !x.locked);
  if (tips.length || s.charts) {
    P.page(label);
    if (tips.length) {
      P.h2('Ce qu’il faut retenir', label, 70);
      for (const t of tips) {
        P.font(9, false); const lines = P.lines(t.text, P.W - 2 * P.M - 34); const h = 42 + lines.length * 11.5;
        P.need(h + 8, label);
        P.fill('#ffffff'); P.doc.setDrawColor(C.line); P.doc.roundedRect(P.M, P.y, P.W - 2 * P.M, h, 8, 8, 'FD');
        P.fill(t.tone === 'good' ? C.good : C.amber); P.doc.circle(P.M + 16, P.y + 16, 5, 'F');
        P.font(11, true, C.ink); P.text(t.title, P.M + 30, P.y + 19);
        P.font(9, false, C.text); P.text(lines, P.M + 30, P.y + 34);
        P.y += h + 8;
      }
    }
    if (s.charts) {
      const chart = (title, list) => {
        const w = P.W - 2 * P.M; const h = 120; P.need(h + 60, label);
        P.font(11, true, C.ink); P.text(title, P.M, P.y + 4); P.y += 30; // place pour les valeurs au-dessus des barres
        const max = Math.max(1, ...list.map((x) => x.count || 0)); const bw = (w - 10 * (list.length - 1)) / list.length;
        list.forEach((x, i) => {
          const bh = Math.max(3, ((x.count || 0) / max) * (h - 30)); const bx = P.M + i * (bw + 10);
          P.fill(C.soft); P.doc.roundedRect(bx, P.y, bw, h - 30, 5, 5, 'F');
          P.fill(C.amber); P.doc.roundedRect(bx, P.y + (h - 30) - bh, bw, bh, 5, 5, 'F');
          P.font(9, true, C.ink); P.text(String(x.count ?? '—'), bx + bw / 2, P.y + (h - 30) - bh - 4, { align: 'center' });
          P.font(8, false, C.muted); P.text(x.label, bx + bw / 2, P.y + h - 16, { align: 'center' });
        });
        P.y += h + 14;
      };
      P.y += 10; P.h2('Sa stratégie en chiffres', label, 180);
      chart(`Répartition de ses prix (${s.currency})`, s.charts.priceBuckets);
      if (s.charts.launchesByMonth.some((m) => m.count)) chart('Ses lancements par mois', s.charts.launchesByMonth);
      if (s.topTypes?.length) chart('Ses catégories principales', s.topTypes.slice(0, 6).map((t) => ({ label: P.lines(t.name, 70)[0], count: t.count })));
    }
  }
  const bestTitle = s.bestSource === 'home' ? 'Mis en avant sur son accueil' : 'Ses best-sellers';
  if (best.length) { P.page(label); P.h2(bestTitle, label); await productGrid(P, best, s.currency, label); }
  if (launch.length) { if (!best.length) P.page(label); P.h2('Ses derniers lancements', label); await productGrid(P, launch, s.currency, label); }
  return P.finish(label);
}

async function comparePdf(rows, cols) {
  const P = await newPdf(true);
  const { doc, M, W } = P;
  const label = 'Comparatif de boutiques';
  let y = P.cover({ kicker: 'Comparateur', title: rows.map((r) => r.name).join(' · '), sub: `${rows.length} boutiques comparées côte à côte` });
  const colW = (W - 2 * M - 170) / (cols.length + 1);
  const best = (k) => Math.max(...rows.map((r) => Number(r[k]) || 0));
  P.fill(C.gold); doc.roundedRect(M, y, W - 2 * M, 26, 6, 6, 'F');
  P.font(8.5, true, C.ink); P.text('Boutique', M + 10, y + 17);
  cols.forEach(([, l], i) => P.text(l, M + 170 + i * colW + colW / 2, y + 17, { align: 'center' }));
  P.text('Best-seller n°1', M + 170 + cols.length * colW + 6, y + 17);
  y += 32;
  rows.forEach((r, n) => {
    P.fill(n % 2 ? C.ink : C.ink2); doc.roundedRect(M, y, W - 2 * M, 38, 6, 6, 'F');
    P.font(10, true, C.cream); P.text(P.lines(r.name, 150)[0], M + 10, y + 16); P.font(7.5, false, '#a8a39a'); P.text(r.host, M + 10, y + 29);
    cols.forEach(([k], i) => {
      const v = k === 'avgPrice' ? money(r[k], r.currency) : k === 'discounted' ? `${r[k]}%` : String(r[k] ?? '—');
      const win = Number(r[k]) === best(k);
      P.font(11, true, win ? '#6fe3a5' : C.cream); P.text(v, M + 170 + i * colW + colW / 2, y + 23, { align: 'center' });
    });
    if (r.top) { doc.setFont(doc.getFont().fontName, 'bold'); P.font(8, true, C.gold); doc.textWithLink(clean(P.lines(r.top.title, colW - 10)[0]), M + 170 + cols.length * colW + 6, y + 23, { url: r.top.url }); }
    y += 44;
  });
  P.font(8, false, '#a8a39a'); P.text('En vert : la meilleure valeur de chaque colonne.', M, y + 10);
  return P.finish(label);
}

// =====================================================================
// EXCEL
// =====================================================================
const argb = (hex) => `FF${hex.replace('#', '').toUpperCase()}`;
const tint = (s) => (s >= 75 ? 'FFDDF3E7' : s >= 55 ? 'FFFBEBCB' : 'FFF9DCD6');

async function newBook() {
  const X = await ExcelJS();
  const wb = new X.Workbook();
  wb.creator = 'Shoplift'; wb.created = new Date();
  return wb;
}

// Feuille avec bandeau de titre, en-têtes stylés, lignes alternées, filtres et volets figés.
function sheet(wb, name, { title, subtitle, columns }) {
  const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 4, showGridLines: false }], properties: { defaultRowHeight: 20 } });
  ws.columns = columns.map((c) => ({ key: c.key, width: c.width || 16 }));
  const last = columns.length;
  ws.mergeCells(1, 1, 1, last); ws.mergeCells(2, 1, 2, last);
  const t = ws.getCell(1, 1); t.value = `Shoplift  ·  ${title}`; t.font = { name: 'Calibri', size: 16, bold: true, color: { argb: argb(C.cream) } }; t.alignment = { vertical: 'middle', indent: 1 };
  const s = ws.getCell(2, 1); s.value = subtitle || `Généré le ${today()}`; s.font = { size: 10, italic: true, color: { argb: 'FFA8BFAE' } }; s.alignment = { vertical: 'middle', indent: 1 };
  for (const r of [1, 2]) for (let c = 1; c <= last; c++) ws.getCell(r, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(C.ink) } };
  ws.getRow(1).height = 34; ws.getRow(2).height = 20; ws.getRow(3).height = 6;
  const head = ws.getRow(4);
  columns.forEach((c, i) => { const cell = head.getCell(i + 1); cell.value = c.header; cell.font = { bold: true, color: { argb: argb(C.ink) } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(C.gold) } }; cell.alignment = { vertical: 'middle', horizontal: c.center ? 'center' : 'left', wrapText: true }; cell.border = { bottom: { style: 'medium', color: { argb: argb(C.amber) } } }; });
  head.height = 26;
  ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: last } };
  return ws;
}

function addRow(ws, columns, values, n, height) {
  const row = ws.addRow(values);
  row.height = height || 22;
  columns.forEach((c, i) => {
    const cell = row.getCell(i + 1);
    cell.alignment = { vertical: 'middle', horizontal: c.center ? 'center' : 'left', wrapText: !!c.wrap, indent: c.center ? 0 : 1 };
    cell.border = { bottom: { style: 'thin', color: { argb: argb(C.line) } } };
    if (n % 2) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAF7EE' } };
    if (c.money) cell.numFmt = `#,##0.00 "${c.money}"`;
    if (c.score && typeof cell.value === 'number') { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tint(cell.value) } }; cell.font = { bold: true, color: { argb: argb(scoreColor(cell.value)) } }; }
    if (c.bold) cell.font = { bold: true, color: { argb: argb(C.ink) } };
    if (cell.value && typeof cell.value === 'object' && cell.value.hyperlink) cell.font = { color: { argb: argb(C.link) }, underline: true, bold: !!c.bold };
  });
  return row;
}
const link = (text, url) => (url ? { text, hyperlink: url } : '');
const sym = (cur) => ({ EUR: '€', USD: '$', GBP: '£', CAD: 'CA$', AUD: 'A$', CHF: 'CHF' }[cur] || cur || '€');

async function addPhoto(wb, ws, src, rowNumber) {
  const data = await photo(src, 144, 180);
  if (!data) return;
  const id = wb.addImage({ base64: data, extension: 'jpeg' });
  ws.addImage(id, { tl: { col: 0.12, row: rowNumber - 1 + 0.08 }, ext: { width: 58, height: 72 }, editAs: 'oneCell' });
}

async function productSheet(wb, name, title, subtitle, list, cur) {
  const columns = [
    { key: 'photo', header: 'Photo', width: 11 }, { key: 'title', header: 'Produit', width: 38, wrap: true, bold: true }, { key: 'price', header: 'Prix', width: 11, money: sym(cur), center: true },
    { key: 'disc', header: 'Promo', width: 9, center: true }, { key: 'score', header: 'Score', width: 9, center: true, score: true }, { key: 'lo', header: 'Revente min', width: 12, money: sym(cur), center: true },
    { key: 'hi', header: 'Revente max', width: 12, money: sym(cur), center: true }, { key: 'why', header: 'Pourquoi ça marche', width: 34, wrap: true }, { key: 'store', header: 'Boutique', width: 16 },
    { key: 'url', header: 'Page produit', width: 13 }, { key: 'q', header: 'Recherche fournisseur', width: 22, wrap: true },
    { key: 'ali', header: 'AliExpress', width: 12 }, { key: 'cj', header: 'CJ', width: 9 }, { key: 'spo', header: 'Spocket', width: 10 }, { key: 'alb', header: 'Alibaba', width: 10 },
  ];
  const ws = sheet(wb, name, { title, subtitle, columns });
  await preload(list, 144, 180);
  for (const [n, p] of list.filter((x) => !x.locked).entries()) {
    const sup = Object.fromEntries(supplierLinks(p).map((s) => [s.id, s.url]));
    const row = addRow(ws, columns, [null, p.title, p.price, p.discount ? `-${p.discount}%` : '', p.score, p.resale?.low ?? '', p.resale?.high ?? '', (p.reasons || []).join(' · ') || p.verdict || '', p.store || '', link('Voir', p.url), supplierLinks(p)[0].query, link('Chercher', sup.aliexpress), link('Chercher', sup.cj), link('Chercher', sup.spocket), link('Chercher', sup.alibaba)], n, 62);
    await addPhoto(wb, ws, p.image, row.number);
  }
  return ws;
}

async function auditXlsx(a, { productsOnly = false } = {}) {
  const wb = await newBook();
  const sub = `${a.host} · ${a.source === 'shopify' ? 'analyse réelle via Shopify' : 'données publiques'} · ${today()}`;
  if (!productsOnly) {
    const cols = [{ key: 'k', header: 'Indicateur', width: 34, bold: true }, { key: 'v', header: 'Valeur', width: 18, center: true, score: true }, { key: 'd', header: 'Détail', width: 60, wrap: true }];
    const ws = sheet(wb, 'Synthèse', { title: `Audit · ${a.name}`, subtitle: sub, columns: cols });
    let n = 0;
    addRow(ws, cols, ['Score global', a.score, a.grade], n++, 26);
    for (const c of a.categories) addRow(ws, cols, [c.label, c.score, `Poids ${c.weight}`], n++);
    for (const [k, v] of [['Produits analysés', a.stats.products], ['Corrections proposées', a.fixes.length], ['Photos par fiche', num(a.stats.avgImages)], ['Mots par fiche', a.stats.avgWords], ['Produits en rupture', a.stats.soldOut], ['Prix moyen', money(a.stats.avgPrice, a.currency)]]) addRow(ws, [cols[0], { ...cols[1], score: false }, cols[2]], [k, v, ''], n++);
    if (a.stack?.length) addRow(ws, cols, ['Outils détectés', '', tools(a.stack).join(' · ')], n++);
    ws.addConditionalFormatting({ ref: `B6:B${5 + a.categories.length}`, rules: [{ type: 'dataBar', cfvo: [{ type: 'num', value: 0 }, { type: 'num', value: 100 }], color: { argb: argb(C.amber) }, gradient: true }] });

    const fc = [{ key: 'n', header: '#', width: 5, center: true }, { key: 'i', header: 'Impact', width: 10, center: true }, { key: 't', header: 'Point à corriger', width: 32, wrap: true, bold: true }, { key: 'w', header: 'Pourquoi c’est important', width: 50, wrap: true }, { key: 'f', header: 'Comment corriger', width: 56, wrap: true }];
    const fs = sheet(wb, 'Plan d’action', { title: `Plan d’action · ${a.name}`, subtitle: 'Du plus rentable au moins urgent', columns: fc });
    a.fixes.forEach((f, i) => {
      const row = addRow(fs, fc, [i + 1, (IMPACT[f.impact] || [f.impact])[0], f.title, f.locked ? 'Détail inclus dans l’offre Basique' : f.why, f.locked ? '' : f.fix], i, f.locked ? 22 : 48);
      const cell = row.getCell(2); const col = (IMPACT[f.impact] || [])[1] || C.muted;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(col) } };
      row.getCell(5).font = { color: { argb: argb(C.good) }, bold: true };
    });
  }
  const pc = [{ key: 'photo', header: 'Photo', width: 11 }, { key: 't', header: 'Produit', width: 36, wrap: true, bold: true }, { key: 'p', header: 'Prix', width: 11, money: sym(a.currency), center: true }, { key: 's', header: 'Note', width: 8, center: true, score: true }, { key: 'v', header: 'Verdict', width: 11, center: true }, { key: 'c', header: 'À corriger', width: 60, wrap: true }, { key: 'o', header: 'Points forts', width: 40, wrap: true }, { key: 'u', header: 'Lien', width: 10 }];
  const ps = sheet(wb, 'Fiches produit', { title: `Fiches produit · ${a.name}`, subtitle: 'Des fiches les plus faibles aux meilleures', columns: pc });
  await preload(a.products.filter((x) => !x.locked), 144, 180);
  for (const [n, p] of a.products.filter((x) => !x.locked).entries()) {
    const row = addRow(ps, pc, [null, p.title, p.price, p.score, p.verdict, (p.cons || []).map((c) => `• ${c.t} : ${c.fix}`).join('\n'), (p.pros || []).map((x) => `• ${x}`).join('\n'), link('Voir', p.url)], n, 76);
    await addPhoto(wb, ps, p.image, row.number);
  }
  return new Blob([await wb.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

async function radarXlsx(items, { niche, date }) {
  const wb = await newBook();
  await productSheet(wb, `Radar ${niche}`.slice(0, 31), `Radar produits gagnants · ${niche}`, `Relevé du ${date} · score = rang de vente, fraîcheur, prix et promo`, items, items[0]?.currency || 'EUR');
  supplierSheet(wb);
  return new Blob([await wb.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

async function spyXlsx(s) {
  const wb = await newBook();
  const cols = [{ key: 'k', header: 'Indicateur', width: 30, bold: true }, { key: 'v', header: 'Valeur', width: 40 }];
  const ws = sheet(wb, 'Synthèse', { title: `Espion · ${s.name}`, subtitle: `${s.host} · ${today()}`, columns: cols });
  [['Produits', s.stats.products], ['Prix moyen', money(s.stats.avgPrice, s.currency)], ['Prix min', money(s.stats.minPrice, s.currency)], ['Prix max', money(s.stats.maxPrice, s.currency)], ['En promo', `${s.stats.discounted}%${s.stats.avgDiscount ? ` (remise moyenne -${s.stats.avgDiscount}%)` : ''}`], ['Prix en ,90–,99', `${s.stats.psychological ?? 0}%`], ['Lancés sur 30 jours', s.stats.launches30 ?? 'dates non fiables (catalogue réimporté)'], ['Thème', s.theme || '—'], ['Catégories principales', (s.topTypes || []).map((t) => `${t.name} (${t.count})`).join(' · ')], ['Outils marketing', s.stack ? s.stack.join(' · ') || 'Aucun repéré' : '—']].forEach((r, n) => addRow(ws, cols, r, n));
  const tips = (s.insights || []).filter((x) => !x.locked);
  if (tips.length) {
    const tc = [{ key: 't', header: 'À retenir', width: 34, bold: true }, { key: 'x', header: 'Détail et conseil', width: 90, wrap: true }, { key: 'k', header: 'Type', width: 14, center: true }];
    const ts = sheet(wb, 'Conseils', { title: `Ce qu’il faut retenir · ${s.name}`, subtitle: 'Sa stratégie et tes opportunités face à lui', columns: tc });
    tips.forEach((t, n) => { const row = addRow(ts, tc, [t.title, t.text, t.tone === 'good' ? 'Opportunité' : 'Stratégie'], n, 34); if (t.tone === 'good') { row.getCell(3).font = { bold: true, color: { argb: argb(C.good) } }; } });
  }
  if (s.bestsellers.length) await productSheet(wb, s.bestSource === 'home' ? 'Mis en avant' : 'Best-sellers', `Best-sellers · ${s.name}`, 'Dans l’ordre du classement des ventes', s.bestsellers, s.currency);
  await productSheet(wb, 'Nouveautés', `Derniers lancements · ${s.name}`, 'Du plus récent au plus ancien', s.launches, s.currency);
  supplierSheet(wb);
  return new Blob([await wb.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

async function compareXlsx(rows, cols) {
  const wb = await newBook();
  const columns = [{ key: 'n', header: 'Boutique', width: 26, bold: true }, { key: 'h', header: 'Adresse', width: 26 }, ...cols.map(([k, l]) => ({ key: k, header: l, width: 14, center: true, money: k === 'avgPrice' ? sym(rows[0]?.currency) : undefined })), { key: 't', header: 'Best-seller n°1', width: 40, wrap: true }];
  const ws = sheet(wb, 'Comparatif', { title: 'Comparatif de boutiques', subtitle: `${rows.length} boutiques · ${today()} · en vert : la meilleure valeur`, columns });
  rows.forEach((r, n) => addRow(ws, columns, [r.name, r.host, ...cols.map(([k]) => r[k]), r.top ? link(r.top.title, r.top.url) : '—'], n, 26));
  cols.forEach(([k], i) => {
    const best = Math.max(...rows.map((r) => Number(r[k]) || 0));
    rows.forEach((r, n) => { if (Number(r[k]) === best) { const c = ws.getRow(5 + n).getCell(3 + i); c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDF3E7' } }; c.font = { bold: true, color: { argb: argb(C.good) } }; } });
  });
  return new Blob([await wb.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function supplierSheet(wb) {
  const cols = [{ key: 'n', header: 'Fournisseur', width: 20, bold: true }, { key: 't', header: 'Point fort', width: 36, wrap: true }, { key: 'd', header: 'Livraison', width: 16, center: true }, { key: 'a', header: 'Connexion à Shopify', width: 24 }];
  const ws = sheet(wb, 'Fournisseurs', { title: 'Fournisseurs connectables à Shopify', subtitle: 'Commande un échantillon avant de lancer la pub', columns: cols });
  supplierLinks({ title: '' }).forEach((s, n) => addRow(ws, cols, [s.name, s.tag, s.delay, link(`Installer ${s.via}`, s.app)], n, 24));
}

// =====================================================================
export async function exportReport(kind, format, data) {
  const pdf = format === 'pdf';
  const date = data.date || today();
  const jobs = {
    audit: () => [pdf ? auditPdf(data.audit) : auditXlsx(data.audit), `shoplift-audit-${slug(data.audit.host)}`],
    products: () => [pdf ? auditPdf(data.audit, { productsOnly: true }) : auditXlsx(data.audit, { productsOnly: true }), `shoplift-fiches-${slug(data.audit.host)}`],
    radar: () => [pdf ? radarPdf(data.items, { niche: data.niche, date }) : radarXlsx(data.items, { niche: data.niche, date }), `shoplift-radar-${slug(data.niche)}`],
    spy: () => [pdf ? spyPdf(data.spy) : spyXlsx(data.spy), `shoplift-espion-${slug(data.spy.host)}`],
    compare: () => [pdf ? comparePdf(data.rows, data.cols) : compareXlsx(data.rows, data.cols), 'shoplift-comparatif'],
  };
  const [build, name] = jobs[kind]();
  await save(`${name}.${pdf ? 'pdf' : 'xlsx'}`, await build);
}
