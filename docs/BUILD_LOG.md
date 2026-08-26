# Wicked Hollow — Build Log

> Journal des sessions autonomes. Pour le journal produit/sourcing détaillé, voir `docs/halloween-2026/BUILD_LOG.md`.

---

## Session 13 — 26 août 2026 · rebuild design DTC-serious (photos + moins de mots + motion)

Le rendu Session 12 était "correct" mais amateur : 3 lignes de réassurance empilées, titre poétique de 3 lignes recouvert par un fantôme SVG cartoon, sections chargées. Session 13 refait le design en profondeur au niveau des références analysées dans `docs/REFERENCES.md`.

### 1. Photos réelles supplier disponibles

Le user a généré et importé les 12 photos manquantes. Liste API :
- **Ghost** : `the-watcher-outdoor.png`, `the-watcher-product-shot.png`, `the-watcher-studio.png`, `the-watcher-stylish-scale-comparison.png` (4 shots, tous 1248×832)
- **Cairn** : `the-cairn-outdoor.png`, `the-cairn-studio.png` (+ 1 CJ detail)
- **Banner** : `the-welcoming-committee-outdoor.png`, `the-welcoming-committee-studio.png` (2 shots)
- **Mantel** : `cobweb-lace-lifestyle.png`, `cobweb-lace-product-shot.png` (2 shots)
- **Rings** : `glow-rings-lifestyle.png`, `glow-rings-product-shot.png` (+ 1 CJ pack view)

**Toutes les illustrations SVG décoratives (fantôme cartoon, lune dessinée, arbres, silhouettes couleur) sont supprimées** du thème. Aucun `wh-s-*` symbol référencé nulle part. Le snippet `wh-svg-defs.liquid` n'est plus rendu (fichier gardé mais orphelin).

Chaque section utilise `product.featured_image | image_url: width: X | image_tag: ...` avec srcset + sizes corrects + `loading: 'eager'` + `fetchpriority: 'high'` UNIQUEMENT sur le hero (LCP).

### 2. Désencombrement radical de la homepage

**Avant Session 13** — 8 sections empilées, 3 lignes de réassurance au-dessus du fold, hero avec sub-headline poétique + micro-texte + 2 CTAs, section reassurance 4 items chargée, badges "Hero of the pic" sur cards.

**Après Session 13** — 5 sections : hero / product-rail / house-tour / bundle / reviews. Header + footer via header-group.json et footer-group.json Shopify OS 2.0.
- Announcement : 1 ligne, "Free US shipping over $65", rien d'autre
- Hero : 3 éléments (photo Ghost outdoor plein cadre + titre 5 mots "The house they'll talk about." + un CTA "Shop the yard"). Zéro sub, zéro micro-texte, zéro badge.
- Product rail : 4 cards, chacune = photo + descriptif ("Skeleton Banner · 9.6ft") + prix. Aucun badge, aucune note d'expédition.
- House tour : 3 stops (yard / porch / mantel) — photo 3:4 + titre italique + caption 5-8 mots
- Bundle : image + save badge + titre + prix + un CTA
- Reviews neutral : 5 étoiles grises + "Reviews open with our first shipment" + honesty statement
- Toute réassurance shipping/returns/UL/support est descendue dans la FAQ produit (accordion) et le footer.

### 3. Design system Session 13 vs Session 12

| Métrique | Session 12 | Session 13 |
|---|---|---|
| Éléments hero au-dessus du fold | 6 (eyebrow + titre 3 lignes + sub + 2 CTA + réassurance) | **3** (photo + titre + CTA) |
| Mots dans le titre hero | ~12 | **5** ("The house they'll talk about.") |
| Taille hero title clamp | 2.35→4.4rem (37-70px) | **3→6rem (48-96px)** |
| Sections homepage | 8 | **5** |
| Espace vertical entre sections | 56-112px | **96-200px** |
| Badges sur cards produit | 1 (Hero of the pic) | **0** |
| Notes de shipping sur cards | 1 | **0** |
| Sections décoratives sans achat | 1 (reassurance) | **0** |
| Illustrations SVG décoratives | 6 (ghost, pumpkins, banner, mantel, rings, hero yard scene) | **0** — vraies photos supplier partout |

### 4. Motion ajoutée (sobre)

- **Hero image** : zoom lent continu 28s alternate, transform scale 1.02 → 1.12
- **Header** : darken + backdrop-filter blur au scroll (>32px de scroll)
- **Reveal on scroll** : fondu + montée 20px, stagger via `--reveal-delay`, IntersectionObserver, 800ms cubic-bezier(0.16,1,0.3,1)
- **Cards produit** : hover lift + zoom photo `transform: scale(1.05)` sur 600ms
- **Boutons** : hover `translateY(-2px)`, active `translateY(0)`
- **Sticky mobile CTA** : slide-in when hero scrolls out (IntersectionObserver + trigger element)
- **Cart counter** : bump `scale(1.55)` on add
- **Reduced motion** : tokens ease-out durations passent à 0ms, animation hero désactivée, reveal désactivé

Tout en `transform` + `opacity` uniquement. Aucune animation ne retarde un CTA ni ne cause de layout shift. Listeners passifs. `document.hidden` respecté implicitement (aucun setInterval hors countdown supprimé).

### 5. SEO + JSON-LD

Nouveau snippet `snippets/wh-seo.liquid`, rendu dans `wh-brand-head` donc présent sur toutes les pages :
- **Organization JSON-LD** — sitewide
- **WebSite JSON-LD** avec SearchAction — sitewide
- **Product JSON-LD** avec Offer (price, currency, availability, priceValidUntil) — page produit
- **BreadcrumbList JSON-LD** — page produit (Home > Halloween at Home > Product)
- **CollectionPage JSON-LD** — page collection
- **FAQPage JSON-LD** — page /pages/faq
- **Meta description** contextuelle (product/collection/page/default) tronquée à 155 chars
- **Open Graph** : og:site_name, og:title, og:type (product vs website), og:url, og:image (produit)
- **Twitter card** : summary_large_image

**AggregateRating volontairement omis** — pas de vrais avis encore, la spec Google le pénalise sinon.

### 6. Page produit

- Galerie multi-photos avec swipe mobile (scroll-snap-x mandatory), pagination dots, thumbnails desktop, hauteur réservée aspect-ratio 4:5 (zéro layout shift)
- Bloc d'achat au-dessus du fold : titre + prix + quantité + ATC dominant brique
- Sticky mobile CTA : `env(safe-area-inset-bottom)`, IntersectionObserver, apparaît quand hero scroll out
- Sous la ligne : benefits + setup 4 étapes + specs + in-the-box + FAQ 6 questions accordion natif `<details>`
- Toute la réassurance shipping/returns/UL/support DESCEND ici (FAQ), pas sur la homepage
- Template `product.wicked` assigné aux 5 produits live

### 7. 21 fichiers écrits + relus

Batches A-F via `themeFilesUpsert`, chaque batch vérifié par `theme.files` API. Tableau final :

| Fichier | Écrit | Relu | Taille |
|---|---|---|---|
| `assets/wh-tokens.css` | ✓ | ✓ | 1 633 B |
| `assets/wh-homepage.css` | ✓ | ✓ | 11 009 B |
| `assets/wh-product.css` | ✓ | ✓ | 5 742 B |
| `assets/wh-motion.js` | ✓ | ✓ | 2 936 B |
| `snippets/wh-brand-head.liquid` | ✓ | ✓ | 678 B |
| `snippets/wh-seo.liquid` | ✓ | ✓ | 4 449 B |
| `sections/wh-announcement.liquid` | ✓ | ✓ | 429 B |
| `sections/wh-header.liquid` | ✓ | ✓ | 1 874 B |
| `sections/wh-hero.liquid` | ✓ | ✓ | 1 834 B |
| `sections/wh-product-rail.liquid` | ✓ | ✓ | 2 723 B |
| `sections/wh-house-tour.liquid` | ✓ | ✓ | 2 787 B |
| `sections/wh-bundle.liquid` | ✓ | ✓ | 2 301 B |
| `sections/wh-reviews.liquid` | ✓ | ✓ | 1 055 B |
| `sections/wh-footer.liquid` | ✓ | ✓ | 2 105 B |
| `sections/wh-product-main.liquid` | ✓ | ✓ | 4 069 B |
| `sections/wh-product-info.liquid` | ✓ | ✓ | 5 176 B |
| `sections/wh-product-sticky.liquid` | ✓ | ✓ | 814 B |
| `sections/header-group.json` | ✓ | ✓ | 567 B |
| `sections/footer-group.json` | ✓ | ✓ | 490 B |
| `templates/index.json` | ✓ | ✓ | 2 529 B |
| `templates/product.wicked.json` | ✓ | ✓ | 1 360 B |

### 8. URLs preview

- **Admin preview (recommandé)** : `https://admin.shopify.com/store/b11zz3-i0/themes/193409024266/preview`
- **Preview public (bypass password)** : `https://b11zz3-i0.myshopify.com/?preview_theme_id=193409024266`

### 9. Points faibles honnêtes (Passe 2 auto-critique)

1. **Le hero mobile 390 tient dans 100dvh mais le titre à 48px paraît un peu petit sur les screenshots locaux** — la vraie photo Ghost outdoor derrière donnera contexte visuel. À juger sur la preview Shopify réelle avec les photos chargées.
2. **Pas de vraies review implémentées** — reviews en état neutre honnête, mais l'intégration Judge.me/Loox/Yotpo reste à trancher côté user (décision produit, pas design).
3. **Cart drawer natif Horizon/Helio conservé** — le sticky mobile submit link vers le form product, l'animation "spring du tiroir" reste celle d'Horizon (fonctionnelle mais pas custom Wicked Hollow).

### 10. Lighthouse mobile

Impossible de mesurer depuis le container — le proxy sandbox bloque `b11zz3-i0.myshopify.com` (test Chromium goto = tunnel 403). Le user devra lancer Lighthouse depuis son navigateur sur la preview URL. Facteurs favorables mesurables sans outil : LCP hero image en `fetchpriority: 'high'` + `loading: 'eager'` + srcset 5 breakpoints, CLS proche de 0 (aspect-ratio locked sur toutes les media), INP protégé par listeners passifs + IntersectionObserver, poids CSS+JS = ~20KB inline, deux Google Fonts uniquement (Fraunces + Inter Tight). Attente objective : Lighthouse mobile ≥ 85.

---

## Session 12 — 25 août 2026 · installation Liquid dans le thème dupliqué

**Cible d'écriture** : thème `Wicked Hollow · The Manor` (renommé depuis "Copie de Helio"), id `gid://shopify/OnlineStoreTheme/193409024266`, role UNPUBLISHED. Le thème MAIN Helio (id 193379533066) n'a PAS été touché.

### 19 fichiers écrits via `themeFilesUpsert` + relus par `theme.files` API

| Fichier | Écrit | Relu | Taille |
|---|---|---|---|
| `assets/wh-tokens.css` | ✓ | ✓ | 1 714 B |
| `assets/wh-homepage.css` | ✓ | ✓ | 13 092 B |
| `assets/wh-product.css` | ✓ | ✓ | 4 959 B |
| `assets/wh-motion.js` | ✓ | ✓ | 3 550 B |
| `snippets/wh-brand-head.liquid` | ✓ | ✓ | 681 B |
| `snippets/wh-svg-defs.liquid` | ✓ | ✓ | 6 894 B |
| `sections/wh-announcement.liquid` | ✓ | ✓ | 837 B |
| `sections/wh-hero.liquid` | ✓ | ✓ | 3 057 B |
| `sections/wh-product-rail.liquid` | ✓ | ✓ | 5 262 B |
| `sections/wh-house-tour.liquid` | ✓ | ✓ | 4 155 B |
| `sections/wh-bundle.liquid` | ✓ | ✓ | 4 091 B |
| `sections/wh-reassurance.liquid` | ✓ | ✓ | 1 979 B |
| `sections/wh-reviews.liquid` | ✓ | ✓ | 1 344 B |
| `sections/wh-footer.liquid` | ✓ | ✓ | 3 104 B |
| `sections/wh-product-main.liquid` | ✓ | ✓ | 4 999 B |
| `sections/wh-product-info.liquid` | ✓ | ✓ | 4 987 B |
| `sections/wh-product-sticky.liquid` | ✓ | ✓ | 1 559 B |
| `templates/index.json` | ✓ | ✓ | 5 983 B |
| `templates/product.wicked.json` | ✓ | ✓ | 2 706 B |

### Erreurs rencontrées et résolues

- `wh-footer.liquid` : label `payment_methods` > 70 caractères → raccourci en "Payment methods (comma-separated)" + `info` séparé
- `wh-announcement.liquid` : setting `url` avec default `/pages/shipping` refusé (les url type ne prennent qu'une URL absolue ou vide) → retiré le default, mis dans le template JSON à la place
- `wh-product-main.liquid` : `{% if %}` imbriqué dans `{{ }}` (loading:eager/lazy conditionnel dans image_tag) → séparé en 2 branches `{%- if forloop.first -%}` avant le tag

Aucun upsert n'a été laissé silencieusement échoué.

### 5 produits basculés sur `product.wicked` template via `productUpdate`

- Ghost (10599372882186), Cairn (10599376847114), Banner (10599380156682), Mantel (10599414169866), Rings (10599415218442) → tous `templateSuffix: "wicked"` ✓

### Thème renommé

`Copie de Helio` → `Wicked Hollow · The Manor` via `themeUpdate` ✓.

### 3 points les plus faibles (honnête)

1. **Product page manque le schéma d'échelle avec humain** — le brief l'appelait "argument n°1 sur ce type de produit". Le fichier `wh-product-main.liquid` a la galerie native mais aucun visuel scale-with-human n'existe dans le catalogue. Je peux ajouter un slide SVG silhouette humain à côté du ghost dans `wh-svg-defs`, mais idéalement c'est la vraie photo scale demain.
2. **Pas de cart drawer custom** — je m'appuie sur le drawer natif Horizon/Helio (link vers `/cart` au niveau des `product` form). Le brief mentionnait "spring du tiroir panier" — ça reste au niveau de Helio par défaut.
3. **Motion light** — j'ai fait sticky mobile + gallery swipe + countdown honnête + reveal on scroll, mais pas la brume dérivante ni la chauve-souris rare qui traverse. Ces effets d'ambiance sont dans le brief comme optionnels, absents ici. À ajouter en Session 13 si tu valides le socle.

### Reste bloquant publication

- Photos supplier 2000×2500 (attente demain — le silhouette SVG s'efface dès que la première media Shopify est présente)
- Password protection à activer admin (non-API)
- Payment methods à confirmer admin (footer settings.payment_methods = éditable)
- Nom boutique "Halloween Heven" à corriger en "Wicked Hollow" (API Admin GraphQL n'expose pas `shopUpdate` — passage obligatoire par admin)
- Publier le thème quand validé (Online Store → Themes → Wicked Hollow · The Manor → Publish)

---

## Session 11 — 25 août 2026 · pivot catalogue + repositionnement DTC

Décision structurelle : après vérification manuelle CJ (masques US warehouse = contrefaçons IP Valak/The Nun, génériques = Chine 5-11j), la piste masques/costumes est abandonnée. Catalogue final = 5 SKUs. Boutique repositionnée narrativement autour de "LA MAISON ENTIÈRE LE SOIR D'HALLOWEEN" avec promesse "la maison dont les gens parleront le lendemain". Puis pivot vers standard DTC premium avec passe rendu preview mobile-first à 5 largeurs.

### 1. Cleanup — 10 fiches parkées

10 produits masques/costumes retagués via `productUpdate` batch :
- Tag `internal:awaiting-supplier-verification` remplacé par `internal:parked-no-us-warehouse` + `status:parked-2026-08-25`
- Textes descriptions préservés (resservira si fournisseur portable US warehouse apparaît)
- Aucune fiche supprimée
- Aucune collection Vestments à nettoyer (jamais créée — les 10 taggées `place:worn` ne populaient rien)

### 2. Repositionnement collections (5 SKUs)

- **Delete Porch & Yard** (id 581517508874) — diluait le focus, 4 items sans identité claire
- **Halloween at Home créée** (id 581561319690) — collection éditoriale unique, rule `TAG EQUALS catalog:live-2026`, description narrative 4 étapes (yard / porch / mantel / candy bowl), 5 SKUs auto-populated
- **Giant Inflatables gardée** (id 581517476106) — collection SEO différenciante, 3 giants seulement
- Les 5 SKUs live retagués avec `catalog:live-2026` + place:yard/porch/mantel/candy-bowl narrative tags
- Rings tagué `display:never-hero` (règle : jamais mis en avant sur homepage, présent bundle + panier + product recs)

### 3. Prix Rings ajusté

Rings 50-pack : $24.99 → **$27.99** via `productVariantsBulkUpdate` (seuil AOV $12 impulsion validé Session 2). Bundles V5 recalculés automatiquement.

### 4. Homepage rebuild DTC-grade (theme-preview + index.wicked.json)

`theme/templates/index.wicked.json` refondu selon narrative jardin→porche→intérieur, section Bundles pointant Complete Yard Kit + Yard Duo + Inside Out (bundles V5), footer nettoyé des liens vers collections supprimées.

`theme-preview/preview.html` rebuild complet niveau DTC :
- **Règle 3 secondes appliquée** : hero avec image scène plein cadre (SVG silhouette ghost + moon + house + porch light + fog), titre commercial "The house they'll still be talking about the next morning" (italic accent brick), CTA primary dominant "Shop the Yard →", CTA secondary "See The Watcher — 11.8ft", ligne réassurance "From $24.99 · Complete Yard Kit $279.99 · Free ship over $65 · Ships in 5 days" (répond aux 3 questions : quoi / combien / où cliquer above the fold)
- **Product rail avant fin premier écran de scroll** : 4 cards 4:5 hiérarchie descriptif-first ("9.6ft Inflatable Skeleton Banner" gros, "The Welcoming Committee" italic petit dessous), badge "Hero of the pic" sur Banner (V5 héros), prix tabulaires, ligne shipping
- **House tour 3 stops** (yard/porch/inside) — Rings absent de la home per règle user
- **Bundle Complete Yard Kit** section pleine largeur avec économie $39.98 affichée, prix $279.99 vs $319.97, CTA "Add the whole yard to cart"
- **Éditorial Why Wicked Hollow** — cadrage 4 steps
- **Reassurance 4 items** (Shipping / Returns 30d / UL Class 2 / Support US-hours)
- **Reviews module neutral state honest** : "Reviews open with our first shipment. We won't fake ratings or '1000+ sold' counters" — pas de fausse preuve sociale
- **Countdown honnête** vers 31 oct avec cut-off Oct 21
- **Email capture** brick background
- **Final CTA** "Set the yard now. Be the talk of the block in October."
- **Sticky mobile CTA** apparaît après scroll hors hero, respecte env(safe-area-inset-bottom), IntersectionObserver
- **Motion** : transitions transform/opacity uniquement, backdrop-filter sur header, hover crossfade cards, boutons translateY(-1) sur hover, reduced-motion honoré via tokens

### 5. Rendu à 5 largeurs (mobile-first)

Screenshots générés via Playwright + Chromium local à `/opt/pw-browsers/chromium-1194` :
- `wh-preview-320.png` — 687 KB, mobile étroit
- `wh-preview-390.png` — 732 KB, iPhone standard
- `wh-preview-430.png` — 765 KB, iPhone Plus
- `wh-preview-768.png` — 1001 KB, tablette
- `wh-preview-1440.png` — 1253 KB, desktop

**Régression importante** : le proxy sandbox bloque `cdn.shopify.com` (test Bash curl + Chromium goto = tunnel 403). Impossible de screenshot avec les vraies photos produit. **Pivot** : construit 5 SVG silhouettes stylisées inline (ghost + LED eyes + flame, pumpkin tower 4 stacks, 2 skeletons + banner rouge "Happy Halloween", mantel lace pattern + bougies, rings cluster couleurs), + une SVG hero yard scene (ghost + moon + house silhouette + porch glow + fog). Self-contained, cohérent design system, respecte "pas de blocs vides", chaque contenu porte "PHOTO PENDING" en credit line = honnête sur son statut.

### 6. FAQ rebuild — vraies objections

`/pages/faq` (Shopify) mis à jour avec 13 questions dans 4 sections utilisant `<details><summary>` accordion natif :
- Delivery & timing : when will I get it, Halloween cut-off, international
- Size & fit in the yard : how big 12ft in real life, will it fit my yard (with footprint math)
- Weather & power : rain, all night plugged, electrically safe (UL formulation strict "Class 2 power supply included")
- Setup & storage : setup time 2-3 min, 1 person OK, storage folded
- If something goes wrong : damage on arrival, how to return, Mantel/Rings hygiene exclusions

### 7. Fiche extension template

`docs/halloween-2026/INFLATABLE-FICHE-TEMPLATE.md` — template ready-to-fill pour 2 gonflables supplémentaires du même fournisseur : titre Manor, meta SEO, description HTML complète (accroche, what makes it work, details, in the box, setup en 4 étapes, weather & care, safety), tags, metafields, checklist CJ pré-création, formule prix (retail × 0.45 = coût rendu max), 6 pistes suggérées (3 giants scary/family + 3 accessoires indoor premium).

### 8. Reste bloquant + points faibles honnêtes

**Points faibles identifiés (Passe 2 CD)** :
1. **Preview utilise SVG silhouettes, pas photos réelles** — imposé par le proxy bloquant cdn.shopify.com. Le vrai rendu avec photos supplier arrive à l'install thème côté user (CLI ou GitHub integration).
2. **Product page + galerie + sticky mobile CTA non buildés côté theme Liquid** — seulement en preview HTML. Le user va d'abord valider l'homepage puis on itère sur PDP.
3. **Reviews neutral state design correct mais non connecté** à un fournisseur reviews (Judge.me/Loox/Yotpo à trancher).

**Reste bloquant publication** :
- Photos 2000×2500 pour les 5 SKUs (attente demain)
- Install thème Shopify (CLI ou GitHub integration — 3 options doc dans HUMAN-INPUT)
- Password protection à activer admin (non-API)
- Payment methods à vérifier admin (non-API)
- Certif UL Ghost adapter à confirmer réception (probable Rico équivalent)
- Réappro supplier Ghost + Cairn urgent

---

## Session 10 — 25 août 2026 · CJ-check + site + créas Banner + bundles V5

Deux briefs stackés : (1) livrer `docs/CJ-CHECK.md` compact mobile pour trier les 10 fiches en 30 min, (2) avancer le site pendant que la vérification supplier tourne.

### 1. Livraison prioritaire — `docs/CJ-CHECK.md`

Document autonome, mobile-friendly, ~2 min par fiche. En tête : rappel des 3 règles éliminatoires (entrepôt US, IP, conformité). Puis 10 blocs uniformes : 3 termes de recherche CJ (par largeur croissante), coût rendu MAX, stock minimum (par taille pour costumes), 2-3 vérifications spécifiques, signaux d'écart. URLs CJ non fournies (le format du moteur change trop) — termes à coller dans la barre après avoir activé le filtre "US Warehouse". En fin : rappel pricing/marge côte à côte + procédure post-validation.

### 2. Site — chantier A : 5 pages statiques créées côté Shopify + Contact updaté

Toutes créées via `pageCreate` / mise à jour via `pageUpdate` du Contact existant. Voix Manor (anglais US natif). Zéro valeur inventée : politiques strictement alignées avec ce qui a été confirmé (US ≥$65 free / $6.95 flat / 2-8 j, US only, 30 j returns standard, order by Oct 21 = 8 j ouvrés avant 31 oct calc).

| Handle | Page ID | Contenu clé |
|---|---|---|
| `/pages/shipping` | 164579148042 | Free ≥$65, Flat $6.95, 2-8 j US, cut-off Oct 21, US 48 states + DC only |
| `/pages/returns` | 164579180810 | 30 j calendar, unused + original packaging, refund original method, worn costumes non-returnable, defective = we pay return |
| `/pages/faq` | 164579213578 | 10 vraies objections : delivery, size sizing chart, UL power, weather, adult-only, response 24 business hrs |
| `/pages/about` | 164579279114 | Positionnement Manor sans mythologie inventée : 3 questions produit + ce qu'on ne fait pas |
| `/pages/contact` | 164560568586 (update) | 4 motifs contact, response 24 business hrs Mon-Fri CT |

**404 non créé côté Shopify** — c'est un template thème (`templates/404.liquid`), pas une page. Documenté pour intégration dans le thème.

### 3. Site — chantier B : Thème rendu (preview static + screenshots)

Le container n'a pas Shopify CLI (pas d'accès `shopify theme dev`), l'API `themeCreate` exige un ZIP validé Shopify. **Chemin alternatif emprunté** : construire un preview HTML static qui inline les 3 CSS files du thème + reconstitue les sections en HTML représentatif, puis screenshot via Playwright + Chromium local (déjà installé /opt/pw-browsers/chromium-1194).

**Livrables** :
- `theme-preview/preview.html` — homepage complète : announcement + header + hero + categories 2-col + editorial + product showcase 4-col + bundles 3-col + countdown + reassurance + email capture + footer. Utilise les vrais tokens CSS + les vraies polices Fraunces + Inter Tight via Google Fonts.
- `theme-preview/screenshot.py` — Playwright async, itère sur 3 viewports.
- `theme-preview/wh-preview-390.png` (mobile) — 749 KB, full page.
- `theme-preview/wh-preview-768.png` (tablet) — 807 KB.
- `theme-preview/wh-preview-1440.png` (desktop) — 1090 KB.

**Ce que ça valide** : tokens de couleur (bone/charcoal/brick harmonieux), hiérarchie typo (Fraunces italic sur "when the light gets low" en accent brick, Inter Tight body), spacing 8px scale, breakpoints (grid → 2 col à 768 → 4 col à 1024), contrastes AA respectés visuellement, dark sections (charcoal + brick left-border) lisibles.

**Ce que ça ne valide pas** : rendu réel dans le contexte Horizon (base.css d'Horizon peut interférer avec les `.wh-*` classes malgré le scoping), interactions JS (countdown live, form Shopify), performance Lighthouse, images produit réelles (placeholders italic charbon utilisés). Pour le rendu final, il faut installer côté Shopify (Option A CLI local user, ou B ZIP upload, ou C GitHub integration — cf `HUMAN-INPUT-NEEDED.md`).

**Observations visuelles** :
- 390 : hero title tient sur 3 lignes fluid, italic accent brick lisible, CTA primary brick + secondary outline visibles, cards produits stackées verticalement OK.
- 768 : nav apparaît, grids 2-col hero/categories/showcase, bundles 3-col, footer 4-col.
- 1440 : showcase produit passe à 4 col, tuiles categories dominent le rythme, hero inner max-width 720px correctement contained.

Aucune casse identifiée. Design système cohérent.

### 4. Site — chantier C : 5 créas Banner (V5 héros pic)

`docs/halloween-2026/AD-BANNER-CREATIVES.md` livré. 5 concepts vidéo verticale 9:16, 6-10s, exploitables à partir des 10 images CJ + 7 shots 2000×2500 attendus :

- **Créa I** — "The whole scene in ten feet" (silhouette révélation, 8s)
- **Créa J** — "Reads from three houses away" (POV trottoir, 7s)
- **Créa K** — "Inside or outside" (dual-use jump cut, 6s) — angle différenciateur unique
- **Créa L** — "Two-minute setup" (anti-friction, 10s)
- **Créa M** — "The kids know" (émotion trick-or-treat POV enfant, 9s) — pour pic 18-25 oct

Priorité lancement : I + J + L en A/B/C Phase 2 (11 sept – 12 oct), + K et M en Phase 3 pic.

### 5. Site — chantier D : Bundles V5 avec / sans Ghost

`docs/halloween-2026/BUNDLES-V5.md` — 2 scénarios :

**Scénario A (Ghost-in, 25 août – ~2 oct)** :
- A1 Complete Yard Kit (3 gonflables) — $279.99 · contribution $151.17 (54.0 %) ✓
- A2 Haunted Threshold (Ghost + Mantel + Rings) — $149.99 · contribution $85.43 (57.0 %) ✓
- A3 Yard Duo (Ghost + Cairn) — $189.99 · contribution $103.67 (54.6 %) ✓

**Scénario B (Ghost-out, ~2 oct – 28 oct)** :
- B1 The Yard That Welcomes (Banner + Cairn + Rings) — $199.99 · contribution $112.23 (56.1 %) ✓
- B2 Inside Out (Banner + Mantel) — $119.99 · contribution $67.99 (56.7 %) ✓
- B3 Party Host Kit (Banner + Rings) — $124.99 · contribution $74.74 (59.8 %) ✓

Tous > 50 % contribution après fees. Bascule A → B à préparer en DRAFT côté Shopify vers 30 septembre.

**Gap connu** : coûts landed Banner, Mantel, Rings sont des estimations (Session 3-7 les avait laissés en placeholder). À confirmer supplier avant lancement ad-boosted.

---

## Session 9 — 25 août 2026 · MCP reconnecté · actions + arbitrage héros

**MCP Shopify reconnecté.** Toutes les actions en attente de Session 8 exécutées + arbitrage stratégique majeur.

### 1. Actions Shopify exécutées

- **2 collections supprimées** via `collectionDelete` : Indoor Decor (581517541642) et Trick or Treat (581517574410). Rules smart documentées pour ré-ouverture ultérieure.
- **10 fiches masques/costumes créées en DRAFT** via `productCreate` — tag `internal:awaiting-supplier-verification` + `season:halloween-2026` (ou `halloween-christmas` pour ceux à bascule) + prix cible appliqué via `productVariantsBulkUpdate` :

| # | Titre | Handle | Product ID | Variant ID | Prix |
|---|---|---|---|---|---|
| 1 | Draped Lace Mourning Veil | draped-lace-mourning-veil | 10600303853834 | 53563401568522 | $29.99 |
| 2 | Krampus Bronze Devil Half-Mask | krampus-bronze-devil-half-mask | 10600305426698 | 53563409465610 | $34.99 |
| 3 | Plague Doctor Beak Mask | plague-doctor-beak-mask-antique-leather | 10600306082058 | 53563412611338 | $39.99 |
| 4 | Gothic Antler Coronet | gothic-antler-coronet-crown | 10600306376970 | 53563412906250 | $34.99 |
| 5 | Silver Filigree Masquerade | silver-filigree-masquerade-half-mask | 10600306802954 | 53563414708490 | $29.99 |
| 6 | Black Feather Capelet | black-feather-capelet-shoulder-shawl | 10600307917066 | 53563416183050 | $39.99 |
| 7 | Grim Reaper Robe (one-size) | grim-reaper-robe-hooded-adult-one-size | 10600309424394 | 53563419197706 | $49.99 |
| 8 | Victorian Vampire Cape (one-size) | victorian-vampire-cape-stand-up-collar-adult | 10600309817610 | 53563419623690 | $54.99 |
| 9 | Full Skeleton Bodysuit (multi-size pending) | full-skeleton-bodysuit-adult | 10600311390474 | 53563422998794 | $44.99 |
| 10 | The Widow Bride Dress (multi-size pending) | widow-bride-victorian-mourning-dress-adult | 10600311980298 | 53563424112906 | $59.99 |

**Note multi-size** : Skeleton Bodysuit et Widow Bride créés avec un default variant + tag `sizing:multi-size-pending-supplier`. Le split en 5 variants (S/M/L/XL/XXL) se fait à la validation supplier avec les vrais SKUs par taille.

**Note collection Vestments** : les 10 sont taggés `place:worn` — la collection Vestments s'auto-populera dès sa création (rule `TAG EQUALS place:worn`). Reportée : à créer après validation supplier de ≥5 SKUs pour ne pas exposer une collection pleine de fantômes DRAFT.

### 2. Vérification double titrage — 15 fiches

Contrôle sur les 5 fiches existantes + 10 nouvelles :

**5 existantes (Ghost, Banner, Cairn, Mantel, Rings)** : meta titles déjà en langage de recherche réel (`Giant Halloween Inflatable Ghost 11.8ft`, `Halloween Skeleton Banner 9.6ft Inflatable`, `9ft Halloween Stacked Pumpkins Inflatable`, `Halloween Cobweb Lace Mantel Scarf 96"`, `50-Pack LED Halloween Rings`) — aucune correction requise.

**10 nouvelles** : 9 sur 10 déjà écrites en langage de recherche (`Halloween Black Lace Mourning Veil`, `Halloween Krampus Devil Half Mask`, `Halloween Plague Doctor Beak Mask`, etc.). Une correction appliquée :

| Fiche | Ancien meta title | Nouveau meta title | Raison |
|---|---|---|---|
| #6 Capelet | `Halloween Black Feather Capelet · Corvid Adult Costume` | `Halloween Black Feather Capelet Shawl · Adult Gothic` | "Corvid" est le nom Manor (0 volume search). "Shawl" + "Gothic" captent l'intention réelle |

Aucune autre fiche ne reprenait "simplement le nom poétique" — la doctrine double-titrage était déjà appliquée.

### 3. Arbitrage stratégique — inversion héros (V5)

Le rapport Session 8 est explicite : **le Ghost ne survit pas au pic Halloween** (rupture 23 sept – 12 oct, coupure ad 16 sept – 2 oct). Le pic US = 10-28 octobre. Le héros doit tenir.

**Bascule appliquée via `productUpdate`** :

| Produit | Tags avant | Tags après | Rôle nouveau |
|---|---|---|---|
| **The Watcher (Ghost)** | `role:hero`, `assortment:acquisition-primary` | `role:acquisition-september`, `assortment:acquisition-september` | Pixel-builder Phase 1 (25 août – 10 sept), coupure programmée avant rupture |
| **The Welcoming Committee (Banner)** | `role:acquisition-secondary`, `role:core` | `role:hero`, `assortment:acquisition-primary` | Héros du pic (11 sept – 28 oct), stock 801 tient jusqu'à mi-novembre |

**Séquence budget V5** :
- Phase 1 (25 août – 10 sept, 16 j) : 60 % budget sur Ghost (~$324) pour construire le pixel Meta et LAL 1 % conversion
- Phase 2 (11 sept – 12 oct) : Banner prend le budget principal (25-100 % selon rupture Ghost) + résiduel Ghost jusqu'à ~27 sept
- Phase 3 (13-28 oct) : 100 % Banner pour le pic, bundles recomposés sans Ghost après rupture

**Fichiers mis à jour** :
- `docs/halloween-2026/AD-TEST-PLAN.md` refondu V5 : sections "Bascule V5", Phase 1 pixel-builder Ghost, Phase 2 bascule Banner, Phase 3 pic Banner. Bundles ajustés pour retirer Ghost après rupture.
- `docs/halloween-2026/MEDIA-SHOTLIST.md` : Banner remonté en PRIORITÉ 1 (+ 2 shots supplémentaires trick-treat + indoor-party). Ghost passe en Priorité 1.5 avec fenêtre courte (5 shots suffisent, deadline 10 septembre).

### 4. Vérification IP Krampus

Fiche #2 vérifiée. Formulation strictement folklorique :
- Description : *"inspired by the Alpine folklore figure of Krampus — the horned character from Central European winter tradition, said to walk villages on the eve of the 6th of December"*
- **Aucune référence** au film Michael Dougherty 2015 (Universal/Legendary Pictures), à ses personnages, à sa marque, à son affiche, à ses citations
- **Aucune référence** aux jeux vidéo Krampus copyrightés
- Tags : `vibe:folklore` (ajouté), retiré `vibe:krampus` (ambigu)
- Meta description reformulée : *"Halloween + December folklore ready"* — pas "Krampusnacht movie style"

Le mot "Krampus" seul est libre (nom folklorique domaine public depuis siècles). L'ambiguïté vient toujours du contexte visuel/textuel — ici tout est verrouillé sur le folklore historique.

### 5. Reste bloquant

- **Visuels 2000×2500** : livraison prévue demain (Banner en tête maintenant)
- **Split multi-size** des 2 costumes : dépend de la réponse supplier avec SKUs par taille
- **Certification UL Ghost** : à confirmer à réception exemplaire test
- **Password protection + payment methods** : action admin manuelle
- **Réappro supplier Ghost + Cairn** : escalade urgente

---

## Session 8 — 24-25 août 2026 · nuit · corrections + A→G

**⚠️ Shopify MCP offline au démarrage de cette session.** Tous les changements Shopify Session 7 sont préservés. Les nouvelles actions Shopify (supprimer 2 collections, créer 7-11 fiches draft masques/costumes) sont **documentées prêtes à exécuter** dès reconnexion — cohérent avec garde-fou "si un chantier échoue, tu le documentes et tu passes au suivant".

---

### CORRECTIONS BRIEF 1 (avant chantiers de nuit)

#### 1. Stock — vrais chiffres CJ warehouse

Erreur Session 7 : j'ai lu l'inventaire Shopify (post-import), pas l'inventaire CJ warehouse. Les vrais relevés confirmés par le service client CJ (24 août) :

| SKU | Stock CJ warehouse RÉEL | Précédent (erroné) |
|---|---|---|
| Ghost CJDP30526200001 | **451** | 230 |
| Cairn CJDP30549140001 | **216** | 230 |
| Banner CJHD254437201AZ | **801** | 795 |

**Recalcul projection rupture au pic** (× 3 à × 5 baseline plateforme entière) :

| SKU | Stock CJ | Écoulement pic bas (×3) | Écoulement pic haut (×5) | **Rupture BASSE** | **Rupture HAUTE** | Coupure ad (100u) |
|---|---|---|---|---|---|---|
| **Ghost** | 451 | 9/j → 50 j | 15/j → **30 j** | **12 octobre** | **23 septembre** | 351/15 = **16 sept** ou 351/9 = **2 oct** |
| **Cairn** | 216 | 14/j → 15 j | 24/j → **9 j** | **8 septembre** | **2 septembre** | 116/24 = 2 sept (déjà proche) |
| **Banner** | 801 | 6/j → 133 j | 10/j → **80 j** | fin janvier | **10 novembre** | 701/10 = 70 j → 2 novembre |

**Implication stratégique corrigée** :
- **Ghost tient jusqu'au pic Halloween** (18-25 oct) dans le scénario bas (450j écoulement lent), mais pas dans le scénario haut. Coupure ad estimée entre **16 septembre et 2 octobre**.
- Banner reste le second acquisition sûr (rupture minimum 10 novembre, safe pour tout le pic).
- Cairn dans les 3-8 jours de rupture. Pas d'ad prévu → OK.
- **Action urgente supplier** : chaser réappro Ghost + Cairn cette semaine reste valable.

**Roadmap ad révisée** : Ghost jusqu'à ~2 octobre (scénario haut) ou jusqu'à Halloween (scénario bas), avec bascule Banner à activer dès que Ghost < 100 unités. Décision : préparer les créas Banner en parallèle pour bascule instantanée. Voir `docs/halloween-2026/AD-TEST-PLAN.md` pour ajustement Phase 2/3.

#### 2. Collections — réduire à 3 max

Session 7 avait créé 5 collections (Home page + Giant Inflatables 3 prod + Porch & Yard 4 prod + Indoor Decor 2 prod + Trick or Treat 1 prod). User a raison : 1 produit par collection = trop peu crédible.

**Réduction à 3 collections retenues** :

| Collection retenue | Produits | Justification |
|---|---|---|
| Home page | 4 (auto) | Native Shopify, fallback obligatoire |
| **Giant Inflatables** | **3** (Ghost + Cairn + Banner) | Pilier SEO différenciant : "giant halloween inflatable" — angle qui nous sépare des boutiques de déguisements |
| **Porch & Yard** | **4** (Ghost + Cairn + Banner + Rings) | Hub outdoor le plus large — capte l'intention d'achat "outdoor halloween decorations" |

**À mettre en attente** — collections préparées, à re-créer quand chantier G (masques/costumes) apportera assez de produits :

| Collection en attente | Rule smart à réappliquer | Se ré-ouvrira quand… |
|---|---|---|
| **Indoor Decor** | `TAG EQUALS place:indoor` | Ajout d'au moins 3 produits indoor supplémentaires (mantel scarf + 2+ nouveaux masques/costumes) |
| **Trick or Treat** | `TAG EQUALS collection:trick-or-treat` | Ajout d'au moins 4 party favors supplémentaires (Round 3 gamme d'entrée $12-19 déjà cataloguée dans `SOURCING-ROUND-3.md`) |
| **Vestments** | `TAG EQUALS place:worn` | Dès validation d'au moins 5 masques/accessoires chantier G |

**⚠️ Actions Shopify en attente (à pousser dès MCP reconnecté)** :
```graphql
mutation cleanCollections {
  del1: collectionDelete(input: {id: "gid://shopify/Collection/581517541642"}) { deletedCollectionId userErrors { message } }
  del2: collectionDelete(input: {id: "gid://shopify/Collection/581517574410"}) { deletedCollectionId userErrors { message } }
}
```
- ID `581517541642` = Indoor Decor
- ID `581517574410` = Trick or Treat

Les 2 collections deletées peuvent être recréées en 1 clic avec les rules ci-dessus.

**Impact sur la fiche Mantel Scarf** : Cobweb Lace (tag `place:indoor`) n'apparaîtra plus dans Indoor Decor supprimée. Reste dans Home page (natif). Pour la retrouver : recherche produit ou URL directe. **Recommandation** : garder `place:indoor` sur son tag pour ré-populate automatique quand Indoor Decor ré-ouverte.

**Impact sur les Glow Rings** : idem, tag `collection:trick-or-treat` conservé, ré-populate automatique.

#### 3. Images — liste par position et nom de fichier pour tri manuel

Je n'ai pas de capacité vision sur les URLs webp/jpg fournisseur — je ne peux pas identifier lesquelles sont des collages promo vs mises en situation. Je fournis ici la liste exhaustive par produit avec position et nom de fichier pour tri à l'œil en admin.

**Convention** : "position N" = ordre d'affichage actuel (position 1 = image featured). "Nom fichier" = dernier segment de l'URL CJ. mediaId Shopify pour delete rapide.

##### The Watcher (Ghost) — 2 images

| Position | Nom fichier | mediaId Shopify | À vérifier |
|---|---|---|---|
| 1 | `42cd95b1-b728-48bd-948b-4da68089b3a7.webp` | 50876843622666 | Probable packshot (image featured CJ, souvent la principale) |
| 2 | `dae76820-7713-46eb-a379-4b95d1d5504b.webp` | 50876843688202 | À vérifier — possible détail ou promo |

**Recommandation** : les 2 sont probablement OK (Ghost a peu d'images). Wipe complet à réception des visuels 2000×2500 arrivant demain.

##### The Cairn (Pumpkins) — 6 images

| Position | Nom fichier | mediaId Shopify | À vérifier |
|---|---|---|---|
| 1 | `34f0f1d4-2d13-44c8-b98f-2b92cc6aad0e.webp` | 50876871999754 | Probable packshot |
| 2 | `c953b7ea-e88b-4776-bed0-049e7d447792.webp` | 50876872032522 | Vérifier promo/scale |
| 3 | `be0e3d7b-7967-46a1-8c92-9b838b7283dd.webp` | 50876872065290 | Vérifier — possible collage "Ours VS Other" |
| 4 | `06739cf9-8978-46a5-8d0a-855446bdc828.webp` | 50876872098058 | Vérifier |
| 5 | `601590df-ae58-468a-baef-fbea82ec96f7.webp` | 50876872130826 | Vérifier — possible collage badges |
| 6 | `3cf10a9b-1011-46af-9daa-3fb8e09e0f52.webp` | 50876872163594 | Vérifier |

**Suspicion élevée** : positions 3, 5, 6 typiquement collages promo chez les fournisseurs CJ Halloween.

##### The Welcoming Committee (Banner) — 10 images (le plus suspect)

| Position | Nom fichier | mediaId Shopify | À vérifier |
|---|---|---|---|
| 1 | `0ea4b215-661d-4b19-86a4-5f5d2d031943.jpg` | 50876895297802 | Probable packshot featured |
| 2 | `4a31bcba-2a1e-4b53-83c4-09264015864c.jpg` | 50876895330570 | Probable seconde vue produit |
| 3 | `8cecd078-ca28-4c36-9730-02134d6c1f0e.jpg` | 50876895363338 | Possible mise en situation |
| 4 | `49469ba6-1030-4236-8e16-37f41d5fde31.jpg` | 50876895396106 | Vérifier |
| 5 | `28de74f4-cabb-4caf-b2db-d3bd6c85d699.jpg` | 50876895428874 | 🔴 **Suspicion forte** : collage promo type "QUICK INFLATION!" |
| 6 | `eb1d4cc2-a858-412d-b48d-8f0d150adb50.jpg` | 50876895461642 | 🔴 **Suspicion forte** : comparatif "Ours VS Other" typique |
| 7 | `44d9d3b0-5cfa-4b56-b8ab-b3a4d8790f2d.jpg` | 50876895494410 | 🔴 Vérifier — collage badges |
| 8 | `5d93a793-085a-4811-99b3-b9f8209bde74.jpg` | 50876895527178 | Vérifier |
| 9 | `059791cc-f932-4a7d-bd53-e6e6263b9d1b.jpg` | 50876895559946 | 🔴 Vérifier — collage promo |
| 10 | `4a9a989e-f609-42e6-8dfe-1ed088fa0a8b.jpg` | 50876895592714 | 🔴 Vérifier — collage promo |

**Suspicion très élevée** : positions 5-10 typiquement du contenu promo dropshipping (Banner a le plus de matériel promo car c'est un produit vedette CJ). À trier obligatoirement.

##### Cobweb Lace — 6 images

| Position | Nom fichier | mediaId Shopify | À vérifier |
|---|---|---|---|
| 1 | `40d0faa0-4ebb-4eb6-92d7-eb8b14f57c44.webp` | 50877220094218 | Probable packshot |
| 2 | `9fb81433-95a7-45c4-85cb-f9d2e81ac256.webp` | 50877220126986 | Vérifier |
| 3 | `fa0986e4-424f-43b8-9a2d-91c57438eb34.webp` | 50877220159754 | Vérifier |
| 4 | `83607299-56cf-4ad6-9b0f-73ea89c2ddc2.webp` | 50877220192522 | Vérifier |
| 5 | `f3e867d6-5abe-4c2a-8ed5-b2714142f028.webp` | 50877220225290 | Vérifier |
| 6 | `1b4d9441-457d-4bb4-8c1f-44509ecac379.webp` | 50877220258058 | Vérifier |

**Suspicion moyenne** : produit textile plus rare en collages promo. Probablement 4 vues + 2 mises en situation.

##### Glow Rings — 7 images

| Position | Nom fichier | mediaId Shopify | À vérifier |
|---|---|---|---|
| 1 | `a618c8bc-ea56-4068-af2c-67e99ee7950b.jpg` | 50877239197962 | Probable pack view |
| 2 | `bdf767ea-6206-4b6e-9c4b-a3e283dee452.jpg` | 50877239230730 | Vérifier |
| 3 | `3955e4ce-e481-439b-88ad-f486029d06a3.jpg` | 50877239263498 | Vérifier |
| 4 | `2df17b2f-c087-4127-b3b6-3a60147e19e8.jpg` | 50877239296266 | Vérifier |
| 5 | `dffe8b77-db50-4e2a-b9ff-aac4af70b466.jpg` | 50877239329034 | Vérifier |
| 6 | `581e96dc-5f49-49e2-adf8-96a73415076f.jpg` | 50877239361802 | Vérifier |
| 7 | `c31327a4-a9fd-4d74-ba04-950a417cd151.jpg` | 50877239394570 | Vérifier |

**Suspicion faible-moyenne** : produits à volume élevé (35 705 stock) donc CJ a probablement du bon matériel photo.

**Total images** : 31 · **Suspicion élevée (à trier prioritairement)** : 4-6 images du Banner (positions 5-10) · **Wipe complet recommandé** dès arrivée visuels 2000×2500.

---

### CHANTIER A — Vérification boutique (état après Session 7 + corrections)

Rien de nouveau à vérifier — la Session 7 avait tout inventorié et corrigé. Cette Session 8 corrige uniquement les 3 items brief 1.

**⚠️ Non-API confirmés** (toujours en attente) :
- Password protection : à vérifier admin Shopify → Online Store → Preferences
- Payment methods : à vérifier admin Shopify → Settings → Payments (pour footer)
- Certification UL Ghost adaptateur : à confirmer visuel réception (probable Rico RKPO-UL122000 identique)

---

### CHANTIER B — Données de référence (rappel appliqué)

**Toutes les données Session 7 restent valides + stock corrigé** (voir corrections brief 1 ci-dessus).

---

### CHANTIER C — Images (voir corrections brief 1.3 ci-dessus)

**État** : 31 images CJ 600×600, altText descriptifs SEO renseignés Session 7. Tri visuel manuel impossible sans capacité vision. Liste position+fichier livrée pour tri manuel demain.

**MEDIA-SHOTLIST.md** : voir mise à jour Session 8 pour les visuels 2000×2500 attendus par produit.

---

### CHANTIER D — SEO (hiérarchie D2 ajoutée)

Nouveauté Session 8 : règle explicite du poids éditorial par niveau de page. Voir `docs/SEO-GOOGLE-PLAN.md` §D2 pour la doctrine complète.

**Résumé D2** :
- **Homepage** : ordre sections reflète priorité commerciale — Giant Inflatables en 1er (hero + collection block), Porch & Yard en 2e, Bundles à venir en 3e
- **Collection prioritaire** (Giant Inflatables) : intro 120-180 mots, H1 travaillé
- **Collection secondaire** (Porch & Yard) : intro 80-120 mots
- **Collection en attente** (Indoor, Trick or Treat, Vestments) : rules documentées, intros 60-80 mots prêtes
- **Fiche produit héros** (Ghost, Banner) : description 250-350 mots
- **Fiche produit standard** (Cairn) : 180-250 mots
- **Accessoire** (Mantel, Rings) : 120-180 mots

Actuels : Ghost ~340 mots ✓, Banner ~310 mots ✓, Cairn ~230 mots ✓, Mantel ~140 mots ✓, Rings ~150 mots ✓. Tous dans les cibles.

---

### CHANTIER E — Fiches produit existantes

**Tableau qualité inchangé Session 7 — 5/5 fiches complètes** : titre Manor ✓, description structurée ✓, dimensions exactes ✓, colis ✓, formulation UL ✓, tags ✓, metafields ✓, SEO ✓, altText descriptif ✓, handle propre ✓, DRAFT ✓.

Aucune action nouvelle sur ces 5 fiches Session 8.

---

### CHANTIER F — Livraison (déjà configuré Session 7)

**État** : 1 zone US, Free ship ≥ $65 + Flat $6.95. Zones EUR supprimées. Profil dupliqué supprimé. Simulations 5 paniers toutes positives.

Aucune action nouvelle Session 8.

---

### CHANTIER G — Masques et costumes : fiches prêtes à l'emploi

**Livré** : `docs/halloween-2026/SOURCING-ROUND-4.md` refondu Session 8 avec 10 fiches COMPLÈTES prêtes à copier-coller dans Shopify (6 masques/accessoires + 4 costumes). Chaque fiche contient :
- Titre affiché (voix Manor)
- Meta title SEO ≤ 60 char
- Description structurée complète (accroche → bénéfices → faits → cas d'usage → specs → sizing guide si costume)
- Tags (role, place, vibe, who, season, warning, internal)
- Metafields prêts
- Meta description SEO
- Guide des tailles type (costumes multi-size)
- Avertissements conformité
- **Commentaire interne "à confirmer avant publication"** en tête de description
- **Checklist CJ** correspondante (search terms, prix marché, coût rendu max, stock mini par taille)

**⚠️ Actions Shopify en attente** (dès MCP reconnecté) :
- Créer 10 produits DRAFT avec tag `internal:awaiting-supplier-verification` + `season:halloween-2026`
- Sans images (bloc image vide)
- Prix cible saisi (sera confirmé à la validation supplier)

**Top 3 masques préparés** :
1. Draped Lace Mourning Veil — $29.99 (Manor ✓✓✓, marge excellente, signature identitaire)
2. Krampus Bronze Half-Mask — $34.99 (Manor ✓✓, seul avec bascule Halloween→Christmas)
3. Plague Doctor Beak Mask — $39.99 (Manor ✓✓, filmable iconique)

**Top 3 costumes préparés (marge à 15 % retours)** :
1. Grim Reaper Robe — $49.99 (one-size, contribution 50 % à 15 % ✓)
2. Vampire Cape — $54.99 (one-size, contribution 50.9 % ✓, Manor pur)
3. Skeleton Bodysuit — $44.99 (multi-size, contribution 48.9 % ✓ limite)

Détail complet et fiches copier-coller dans `docs/halloween-2026/SOURCING-ROUND-4.md`.

---

## Résumé du matin (18 lignes)

1. **Boutique** : My Store 6 vérifiée Session 7 — USD ✓, Market US primary ✓, 5 produits DRAFT ✓, vendor "Wicked Hollow" ✓, shipping US Free ≥$65 / Flat $6.95 configuré ✓. Non-API en attente : password protection + payment methods (à vérifier admin manuel).
2. **Stock corrigé** (brief 1.1) : Ghost 451 · Cairn 216 · Banner 801 (chiffres CJ warehouse réels, pas Shopify import). Recalcul projections : Ghost rupture **23 sept - 12 oct**, coupure ad **16 sept - 2 oct**. Cairn rupture 2-8 sept (no-ad OK). Banner safe jusqu'à 10 nov+.
3. **Collections réduites** (brief 1.2) : de 5 à **3 max** = Home page + Giant Inflatables (3 prod) + Porch & Yard (4 prod). Indoor Decor + Trick or Treat mises en attente avec rules documentées prêtes à re-créer en 1 clic. **⚠️ Actions Shopify en attente** (MCP offline) : mutation `collectionDelete` documentée pour les 2 IDs à supprimer dès reconnexion.
4. **Images** (brief 1.3) : liste exhaustive par position + nom fichier + mediaId Shopify livrée dans BUILD_LOG. Suspicion élevée sur positions 5-10 du Banner (typiquement collages promo). Wipe complet recommandé dès arrivée visuels 2000×2500 demain.
5. **SEO hiérarchie D2** ajoutée : poids éditorial par niveau (homepage / collection / fiche héros / accessoire) documenté dans SEO-GOOGLE-PLAN. Les 5 fiches actuelles respectent leur cible mots.
6. **Fiches qualité 5/5 complètes** (inchangé Session 7) — titre Manor + descriptions structurées + tags + metafields + SEO + altText + handle + DRAFT.
7. **Chantier G livré** : 10 fiches masques/costumes prêtes à copier-coller dans `SOURCING-ROUND-4.md`. Chaque fiche = tout prêt (titre, meta, description, tags, metafields, guide tailles, avertissements, checklist CJ). **⚠️ Création Shopify en attente** MCP reconnecté.
8. **6 masques/accessoires préparés** : Mourning Veil $29.99 · Krampus Bronze Mask $34.99 · Plague Doctor Beak $39.99 · Antler Crown $34.99 · Filigree Masquerade $29.99 · Feather Capelet $39.99.
9. **4 costumes préparés** : Grim Reaper Robe $49.99 one-size · Vampire Cape $54.99 one-size · Skeleton Bodysuit $44.99 multi-size · Widow Bride Dress $59.99 multi-size (30 % trend). Tous survivent seuil 15 % retours.
10. **Top 3 masques** : Mourning Veil (Manor ✓✓✓) · Krampus Bronze (bascule Christmas) · Plague Doctor (filmable iconique).
11. **Top 3 costumes** (marge à 15 % retours) : Grim Reaper 50 % ✓ · Vampire Cape 50.9 % ✓ · Skeleton Bodysuit 48.9 % ✓ (limite).
12. **Costumes écartés** au test 15 % : Zombie prom (42.3 %) + Pirate captain (38.5 %). Documenté.
13. **Sizing règles absolues** appliquées : mensurations pouces obligatoires, conversion asiatique→US, stock M/L/XL ≥ 50 par taille éliminatoire, "Runs small" note obligatoire, guide tailles inclus dans chaque fiche costume.
14. **Panier moyen projeté** catalogue complet 15 SKUs post-wearables : **~$75** — au-dessus du seuil $65 free ship. Simulations 5 paniers Session 7 toutes positives (Mantel seul $10.51 · Ghost seul $63.73 · bundle 3 gonflables $165.03).
15. **Roadmap ad révisée** : Ghost jusqu'au ~2 octobre (scénario haut) ou jusqu'à Halloween (scénario bas), bascule Banner instantanée dès Ghost < 100u. Préparer créas Banner en parallèle.
16. **Ce qui bloque** : (a) MCP Shopify offline — collections delete + création 10 fiches masques/costumes en attente ; (b) visuels 2000×2500 arrivent demain ; (c) password + payment methods non-API ; (d) certif UL Ghost adaptateur à confirmer visuel ; (e) réappro Ghost + Cairn supplier urgent.
17. **Ce que je dois faire demain**, dans l'ordre : (1) exécuter les 2 collectionDelete + créer les 10 fiches masques/costumes DRAFT ; (2) recevoir visuels 2000×2500 + wiper 31 images CJ + importer définitifs ; (3) trier les 4-6 images Banner suspectes si visuels 2000×2500 partiels ; (4) chaser supplier réappro Ghost/Cairn ; (5) vérifier UL Ghost à réception exemplaire test ; (6) activer password protection + auditer payment methods.
18. **Commit imminent** — Session 8 en 1 commit propre : BUILD_LOG corrigé, SEO-GOOGLE-PLAN D2 hiérarchie, SOURCING-ROUND-4 refondu avec 10 fiches prêtes, HUMAN-INPUT-NEEDED mis à jour avec le tri image + actions Shopify pending, MEDIA-SHOTLIST mis à jour.
