# Wicked Hollow — Build Log (root)

> Journal des sessions de nuit sur le thème custom. Pour le journal produit/sourcing, voir `docs/halloween-2026/BUILD_LOG.md`.

---

## Session 5 — nuit du 21–22 août 2026 · thème "The Manor"

### Rapport du matin

**Direction de marque choisie** : **The Manor** — gothique moderne hospitalier éditorial. La phrase de marque : *"Objects and atmospheres for the seasons when the light gets low."* Résout les deux tensions structurelles du brief (bascule Halloween→Noël sans rupture, premium sans être froid) via une palette charbon/os/brique + typo Fraunces + un ton pincé mais accueillant.

**Deux directions écartées** :
- **After Hours** — sensuel/nightclub, excellent Halloween mais mort le 15 novembre. Ne résout pas la bascule Noël.
- **Roost** — folk artisan Vermont, saturé sur Etsy et dissonant avec le catalogue actuel (gonflables 12ft ≠ artisanat lent).

**Ce qui est construit et fonctionnel** (fichiers dans `theme/`) :
- Design tokens complets (`wh-tokens.css` — couleurs, typo, spacing, motion, radii, shadows, tous en custom properties)
- Primitives CSS (`wh-primitives.css` — Button, Badge, Price, Media Frame, Card, Input, Grid, Section, Container, Typography helpers, contraste AA vérifié)
- 10 sections Liquid Shopify OS 2.0 (announcement, hero, categories, editorial, showcase, bundles, reassurance, countdown, capture, footer)
- 1 snippet de tête (chargement fonts + tokens + primitives + homepage CSS)
- 1 JS countdown (dependency-free, respect prefers-reduced-motion)
- 1 template JSON homepage (`templates/index.wicked.json`) compose les 10 sections avec vraie copie US, aucun lorem ipsum, aucune fake social proof
- Copy homepage 100% écrite dans la voix Manor
- 4 collections déjà en place côté Shopify (Porch & Yard, Indoor Decor, Bundles, Trick or Treat) avec auto-routing tag-based

**Lighthouse mobile avant/après** : **non mesuré**. Le rendu du thème requiert soit Shopify CLI (`shopify theme dev`) soit un theme upload API — deux impossibles depuis ce container. Le code a été vérifié syntaxiquement et logiquement, mais **pas visuellement**. Attente d'installation par l'user pour première mesure. Documenté explicitement dans `docs/HUMAN-INPUT-NEEDED.md`.

**Trois choses les plus faibles de ce que j'ai fait** :
1. **Zéro rendu visuel** — je n'ai pas pu screenshoter le résultat à 390/768/1440 comme le brief le demandait. Le code peut avoir des surprises à la première install (probable ajustement hero title mobile, spacing bundles 768px). C'est le déficit majeur de la nuit.
2. **Pas de Product page ni de Collection page** — j'ai construit la homepage seule. Les templates PDP et collection restent ceux d'Horizon (fonctionnels mais visuellement dissonants avec la home Manor). Prochaine nuit obligatoire pour cohérence.
3. **Pas de menu drawer mobile custom** — je m'appuie sur le header/footer natifs d'Horizon. La marque Manor se lira mal dans ce header par défaut jusqu'à ce que je le remplace. Prévoir Session 6 dessus.

**Ce qui t'attend à valider en priorité** :

1. **Installer le thème** en unpublished — 3 options documentées dans `HUMAN-INPUT-NEEDED.md` §1. Recommandé : shopify CLI ou GitHub integration.
2. **Générer 3 visuels critiques** via Higgsfield : Hero home, 2 category tiles (indoor/outdoor). Sans eux, le thème rend en placeholders.
3. **Preview → screenshots → ajustements** — attends-toi à 1-2h de refinement visuel après première install.
4. **Créer les 6 pages statiques** (about, contact, shipping, returns, faq, season-notes) — le footer pointe déjà vers elles.
5. **Renseigner meta SEO** sur les 14 produits (suggestions prêtes dans `docs/halloween-2026/SOURCING.md` §F).
6. **Trancher pricing** Mantel Scarf + Glow Rings à $27.99 (recommandé pour clear seuil AOV $12).
7. **Certification UL/ETL** des 3 blowers gonflables (bloquant publication, email template supplier prêt dans SOURCING.md §C.1).
8. **Renommer collection "Indoor Decor"** — 3 propositions dans `docs/STRATEGY.md` (recommandé : "The Manor").

---

### Diagnostic thème existant (Phase 1 audit)

Thème actif : **Horizon** (Shopify OS 2.0 free, published, MAIN role).
- Framework : OS 2.0 avec JSON templates, sections dynamiques, `content_for_layout`.
- Layout `theme.liquid` : propre, moderne, mesure header heights côté client pour éviter jump. Inclut view-transitions, chat-drawer, cart-drawer, search-modal, quick-add-modal.
- Bibliothèque JS composant-based (accordion, cart-drawer, header-menu, facets, etc.) — bien structurée, ~50 fichiers `assets/`.
- `base.css` 45kb — CSS variables système Shopify, `settings.color_palette`, etc.
- Template `index.json` par défaut : hero générique + product list. Zéro identité, tout à refaire.

**Ce qui est réutilisable** : header-group, footer-group (temporairement — à remplacer Session 6), cart-drawer, search-modal, quick-add-modal, tout le layer JS composant.

**Ce qui est à jeter** : le template `index.json` par défaut (remplacé par `index.wicked.json`), les styles inline hero/product-list par défaut, la palette settings (à surcharger par nos tokens).

**Ce qui manque** : identité de marque, hero éditorial, sections narratives (categories/editorial/bundles/countdown/capture), design system cohérent.

**Verdict brutal** : Horizon est un thème techniquement solide mais visuellement générique. Passer de "thème par défaut" à "vraie marque" ne nécessite pas de tout jeter — juste d'ajouter une couche identity/story par-dessus. C'est exactement ce qu'on a construit.

---

### Fichiers livrés cette nuit

```
theme/
├── assets/
│   ├── wh-tokens.css          (design tokens)
│   ├── wh-primitives.css      (Button, Badge, Price, Media, Card, etc.)
│   ├── wh-homepage.css        (composed styles for homepage sections)
│   └── wh-countdown.js        (small dependency-free timer)
├── snippets/
│   └── wh-brand-head.liquid   (loads fonts + all CSS)
├── sections/
│   ├── wh-announcement.liquid
│   ├── wh-hero.liquid
│   ├── wh-categories.liquid
│   ├── wh-editorial.liquid
│   ├── wh-showcase.liquid
│   ├── wh-bundles.liquid
│   ├── wh-reassurance.liquid
│   ├── wh-countdown.liquid
│   ├── wh-capture.liquid
│   └── wh-footer.liquid
└── templates/
    └── index.wicked.json      (homepage composition — 10 sections orchestrated)

docs/
├── STRATEGY.md                (brand direction, 3 options + choice)
├── DESIGN_SYSTEM.md           (tokens documented, primitives inventaired)
├── HUMAN-INPUT-NEEDED.md      (visuals, pages, SEO, install steps)
└── BUILD_LOG.md               (this file)
```

Aucun produit, aucun prix, aucune collection, aucun réglage Shopify touché.
Aucun thème publié.
Aucun fichier existant modifié (tout est additif, prefixé `wh-`).
Branche git dédiée : `claude/theme-wicked-hollow-night`.

---

### Décisions autonomes prises pendant la nuit

1. **Direction Manor** vs After Hours vs Roost — motivé dans STRATEGY.md.
2. **Fraunces + Inter Tight** comme couple typo (Söhne non-open-source, écarté).
3. **Palette 4-charbon** au lieu du noir plat unique — chaleur préservée.
4. **Brick `#B5583F`** comme signature accent — chaud sans être orange Halloween.
5. **Namespace `.wh-*`** strict pour tous les composants — zéro conflit avec Horizon `.base.css`.
6. **Additive rather than destructive** — nouveau template `index.wicked.json` plutôt que remplacer `index.json` par défaut. L'user active l'un ou l'autre à sa guise.
7. **Placeholders tasteful** au lieu de rectangles gris — italique + label pour marquer "photograph pending".
8. **Countdown 30s tick** au lieu d'1s — évite jitter, économise batterie mobile.
9. **Copy US native écrite** — zéro placeholder, zéro fake proof, zéro emoji, zéro exclamation, zéro "SHOP NOW".
10. **Ne PAS créer le thème dev par API** — bloqué par Shopify (source ZIP requise), documenté user-side.
