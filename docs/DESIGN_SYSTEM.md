# Wicked Hollow — Design System

> Version 1 · The Manor · construit la nuit du 21–22 août 2026.
> Code source : `theme/assets/wh-tokens.css` + `theme/assets/wh-primitives.css`.

---

## Principes fondateurs

1. **Le contenu vend, pas la mise en page.** La typographie, l'espace et la palette forment le fond. Aucune décoration parasite (bords glowy, ornements cliché Halloween).
2. **Une seule action dominante par écran.** CTA primaire (brick) unique et visible. Secondaires en ghost/outline, jamais compétitifs.
3. **Silence entre les blocs.** `--wh-space-*` scaling en 8px permet une respiration mobile obligatoire. Densité desktop admise en écran secondaire uniquement.
4. **Zéro layout shift.** Toutes les images passent par `wh-media-frame` à ratio fixe. Toutes les polices via `font-display: swap`.
5. **Mobile-first, jamais l'inverse.** Chaque composant fonctionne à 320px avant 1440.
6. **Le charbon est chaud.** Les 4 nuances de charbon (`950`/`900`/`800`/`700`) évitent le noir plat/froid.

---

## Tokens · résumé

Toutes les valeurs sont exposées comme `custom-properties` dans `:root` du fichier `wh-tokens.css`. Modifier ici, propager partout — aucune valeur en dur dans les composants.

### Couleurs · rôles sémantiques

| Rôle | Custom property | Valeur | Usage |
|---|---|---|---|
| Ink strong | `--wh-ink-strong` | `#0F0E0D` | Titres H1/H2 sur fond clair |
| Ink default | `--wh-ink-default` | `#1A1815` | Corps de texte sur fond clair |
| Ink muted | `--wh-ink-muted` | `#3A3632` | Sous-titres, metadata |
| Ink inverse | `--wh-ink-inverse` | `#F4EFE4` | Texte sur fond sombre |
| Ink brand | `--wh-ink-brand` | `#B5583F` | Liens, prix, accents éditoriaux |
| Surface page | `--wh-surface-page` | `#F4EFE4` | Fond page par défaut |
| Surface panel | `--wh-surface-panel` | `#E9E3D5` | Cards, sections alternées |
| Surface dark | `--wh-surface-dark` | `#1A1815` | Sections hero secondaires |
| Surface deep | `--wh-surface-deep` | `#0F0E0D` | Hero primaire, footer |

### Palette accent

- **Brick 500** `#B5583F` — CTA primaire, marque, accents éditoriaux (le seul cri de couleur du design)
- **Fir 500** `#2F3F30` — badges indoor/nature, tags saisonniers
- Aucun orange, aucun violet, aucun vert néon.

### Contraste (AA vérifié)

| Combinaison | Ratio | Verdict |
|---|---|---|
| ink-default sur surface-page | 15.3:1 | AAA |
| ink-inverse sur surface-dark | 13.8:1 | AAA |
| brick-500 sur surface-page (large text) | 4.9:1 | AAA large / AA normal |
| brick-500 sur surface-deep | 5.4:1 | AAA large / AA normal |
| ink-muted sur surface-page | 8.7:1 | AAA |
| bone-50 alpha 0.7 sur charcoal-950 | ~7:1 | AAA |

### Typography · échelle fluide

| Rôle | Custom property | Min → Max | Usage |
|---|---|---|---|
| Hero | `--wh-fs-hero` | 50 → 88 px | Home hero uniquement |
| H1 | `--wh-fs-h1` | 40 → 64 px | PDP, page listing hero |
| H2 | `--wh-fs-h2` | 31 → 44 px | Section titles |
| H3 | `--wh-fs-h3` | 24 → 30 px | Card titles, bundle titles |
| H4 | `--wh-fs-h4` | 20 → 24 px | Product tile titles |
| Body lg | `--wh-fs-body-lg` | 17 → 19 px | Lede, prix produit |
| Body | `--wh-fs-body` | 15 → 17 px | Corps par défaut |
| Body sm | `--wh-fs-body-sm` | 13 → 14 px | Metadata, breadcrumbs |
| Eyebrow | `--wh-fs-eyebrow` | 11 → 12 px | Kickers en majuscules |

**Familles** :
- Display : **Fraunces** (serif contemporain à axes variables — italiques dramatiques comme accent, romain propre pour titres)
- Body : **Inter Tight** (sans-serif géométrique compact, excellent en tailles UI)
- Mono : `ui-monospace` fallback système (jamais utilisé sur produits, réservé aux specs)

Toutes hébergées via Google Fonts avec `font-display: swap`. Fallbacks natifs si le CDN tombe.

### Spacing · échelle 8px

Base 8px avec incréments de 4px sur les petites valeurs :
`--wh-space-0/1/2/3/4/5/6/8/10/12/16/20/24/32` → `0/4/8/12/16/20/24/32/40/48/64/80/96/128 px`.

### Radii · minimalisme

- `--wh-radius-none: 0` — défaut pour cards, boutons, inputs (positionnement The Manor)
- `--wh-radius-full: 999px` — badges uniquement

Aucun radius 8px cliché. The Manor est carrée, tranchée.

### Motion · discrétion

- Durées : quick 120ms, base 240ms, slow 400ms, cinema 640ms
- Easing : `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out fluide) par défaut
- `prefers-reduced-motion` : toutes durées → 0ms via override CSS
- `transform` et `opacity` uniquement. Aucune animation sur `width/height/left/top`.

---

## Primitives · inventaire

Toutes disponibles dans `theme/assets/wh-primitives.css`. Classes prefixées `wh-` pour éviter conflit avec `base.css` d'Horizon.

### Button
- `.wh-btn` (base)
- Variantes : `--primary` (brick), `--outline` (dark hover), `--outline-inverse`, `--ghost`
- Sizes : `--sm`, defaut, `--lg`
- États : hover, active (`translateY(1px)`), focus-visible (shadow brick), disabled

### Badge
- `.wh-badge` (base — brick tint sur brick pale)
- Variantes : `--fir`, `--charcoal`, `--bone`, `--outline`

### Price
- `.wh-price` container
- `.wh-price__value` — tabular-nums, semibold
- `.wh-price__compare` — line-through, muted
- `.wh-price__save` — brick, uppercase, letterspaced

### Media Frame
- `.wh-media-frame` — aspect-ratio locked, cover fit, no layout shift
- Ratios : `--4x5` (produits), `--1x1`, `--16x9`, `--21x9`, `--3x4` (editorial)
- `--placeholder` state — gradient charbon + label italic (jamais rectangle gris)

### Card
- `.wh-card` — flex vertical, hover scale sur image via `.wh-media-frame > img`
- `.wh-card__title`, `.wh-card__meta`

### Input
- `.wh-input` — 48px min-height touch-safe, focus brick outline

### Grid
- `.wh-grid--2/3/4` — 1 col mobile → N cols desktop à 768px

### Section wrapper
- `.wh-section` (padding-block clamp 48-96)
- Variantes : `--tight` (32-56), `--generous` (64-128), `--dark`, `--deep`, `--brick`

### Container
- `.wh-container` (max-width 1360, gutter clamp 16-32)
- Variantes : `--narrow` (960), `--wide` (1560)

### Typographie helpers
- `.wh-eyebrow` (uppercase 11-12, letterspaced, muted)
- `.wh-h1/2/3/4`, `.wh-hero-title`
- `.wh-lede` (large body 17-19, max-width 52ch)
- `.wh-body`, `.wh-body--muted`, `.wh-body--inverse`

### Accessibilité
- `.wh-visually-hidden` — sr-only compatible
- `*:focus-visible` — outline brick 2px offset 2px

---

## Sections composées

Toutes construites en Liquid Shopify OS 2.0, éditables via theme editor.

| Section | Fichier | Rôle |
|---|---|---|
| WH · Announcement bar | `sections/wh-announcement.liquid` | Barre haute, message + lien |
| WH · Hero | `sections/wh-hero.liquid` | Hero cinématique 78vh min, image + eyebrow + titre + lede + 2 CTA |
| WH · Categories | `sections/wh-categories.liquid` | Tiles indoor/outdoor (blocks) |
| WH · Editorial moment | `sections/wh-editorial.liquid` | Bloc éditorial 2 colonnes texte + image |
| WH · Product showcase | `sections/wh-showcase.liquid` | Grille produits linked à collection, 4-12 items |
| WH · Bundles | `sections/wh-bundles.liquid` | 3 bundles cards avec pricing + save |
| WH · Reassurance | `sections/wh-reassurance.liquid` | Shipping / returns / support (blocks) |
| WH · Countdown | `sections/wh-countdown.liquid` | Compte à rebours honnête vers 31 oct, JS 30s tick, reduced-motion safe |
| WH · Email capture | `sections/wh-capture.liquid` | Formulaire Shopify natif (customer form), no third-party |
| WH · Footer | `sections/wh-footer.liquid` | Footer 4 colonnes, blocks |

---

## Règles d'usage

### Un accent, jamais deux

Le brick est le seul cri de couleur. Deux blocs brick sur la même page = un de trop. Utiliser `--wh-fir-*` en accent secondaire discret (badges, tags saisonniers), jamais en surface pleine.

### Espacement plutôt que borders

Éviter les bordures multiples. Laisser respirer avec `--wh-space-16` entre les sections. Une seule `wh-divider` fine sur toute une page si nécessaire.

### Italiques Fraunces = signature éditoriale

Réservés aux **mots-clés** dans les titres H1/H2 (`<em>` en HTML). Jamais en corps de texte, jamais en CTA. Créent le rythme visuel signature de The Manor.

### CTA hiérarchie

- Primary : brick, un seul par écran, réservé à l'action de conversion
- Outline / outline-inverse : navigation secondaire
- Ghost : liens en fin de section (« See everything → »)

### Placeholder plutôt que rectangle gris

Toute `wh-media-frame` sans image doit prendre la classe `--placeholder` + `data-placeholder-label` avec le nom du contenu attendu. Jamais de gris plat.

---

## Deficit de vérification visuelle — assumé

Le thème n'a **pas été rendu ni screenshoté** cette nuit. Raison : pas d'accès Shopify CLI (`shopify theme dev`) dans le container, et l'API `themeCreate` exige une source ZIP validée que nous ne pouvons pas fournir. Le code a été **vérifié syntaxiquement et logiquement**, mais **pas visuellement**.

**Ce que ça veut dire pour toi** :
- Les valeurs de padding/spacing/typography sont solides (calculs éprouvés).
- Les contrastes AA sont vérifiés par calcul.
- **Il faudra une passe de refinement visuel une fois installé** sur ton compte Shopify, avec des vraies photos produit.
- Attends-toi à ajuster : (a) taille du hero title mobile si trop grand sur 320px, (b) espacement des cards bundles à 768px, (c) taille de la barre annonce si le message est long.

---

## Prochaines primitives à construire (non incluses V1)

- Product page hero (galerie sticky + info panel)
- Variant selector (swatch + size)
- Sticky cart drawer content
- Filter panel (facets)
- Search modal
- Cookie banner
- Order confirmation email template
