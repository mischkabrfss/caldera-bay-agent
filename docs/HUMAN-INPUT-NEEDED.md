# Wicked Hollow — Human input needed

> Sortie de nuit du 21–22 août 2026. Ce qui doit venir de toi avant que la boutique puisse aller vivre.

---

## Bloquants absolus (avant publication)

### 1. Installation du thème dans Shopify

Le thème custom est construit en git dans `theme/`. **Il n'a pas pu être uploadé automatiquement** — l'API `themeCreate` exige une source ZIP validée par Shopify, non fournissable depuis ce container. Trois options pour installer :

**Option A — Shopify CLI (recommandé)**
```bash
# Sur ta machine locale, dans le repo
cd theme/
shopify theme dev --store wicked-hollow.myshopify.com
# Puis quand ça marche, uploader en unpublished :
shopify theme push --unpublished --theme "Wicked Hollow · The Manor [DEV]"
```

**Option B — ZIP upload admin**
1. Dupliquer manuellement le thème Horizon actuel dans l'admin (Online Store → Themes → Actions → Duplicate)
2. Sur le duplicata, ouvrir Edit Code
3. Copier-coller chaque fichier de `theme/` dans le dossier correspondant
4. Preview et ajuster

**Option C — GitHub integration**
1. Push cette branche vers GitHub (fait)
2. Dans admin Shopify → Themes → Add theme → Connect from GitHub
3. Cibler la branche `claude/theme-wicked-hollow-night`, dossier `theme/`
4. Preview

Après installation, activer le template custom pour la home : Online Store → Themes → Customize → Homepage → Template dropdown → sélectionner `index.wicked`.

### 2. Visuels marketing

Le thème est fonctionnel avec placeholders (fond charbon + label italique). Il devient vraiment pertinent avec ces visuels :

| Emplacement | Format | Cadrage | Priorité |
|---|---|---|---|
| Hero home | 2400×1350 (16:9 desktop) + 1080×1920 (9:16 mobile fallback) | Fantôme 12ft déployé de nuit devant maison US suburb, LED yeux + flammes actives, crépuscule bleuté | 🔴 CRITIQUE |
| Category Outdoor tile | 1200×1500 (4:5 mobile) / 1200×1600 (3:4 desktop) | Yard scene : gonflables ensemble sur pelouse crépuscule | 🔴 |
| Category Indoor tile | idem | Salon lit tungstène + Disco Ghost pillow + blanket sur canapé | 🔴 |
| Editorial image | 1200×1600 (3:4) | Détail atmosphérique : bougies, textures, main tenant une bougie noire | 🟠 |
| Product hero images | 1600×2000 (4:5) minimum | Voir `docs/halloween-2026/MEDIA-SHOTLIST.md` V4 pour la shotlist complète | 🔴 |

**Priorité de génération Higgsfield** : Hero home + 2 category tiles = 3 shots critiques. Sans eux, le thème rend acceptable mais pas commercial.

### 3. Copie SEO + meta title par produit + pages

Le thème n'inclut pas de générateur SEO. Renseigner manuellement dans admin Shopify → Product → Search engine listing preview :
- Voir suggestions par produit dans `docs/halloween-2026/SOURCING.md` §F (14 produits couverts)
- Ajouter meta title + description pour la home elle-même :
  - Meta title : "Wicked Hollow · Halloween & Seasonal Decor · Ships Free from US"
  - Meta description : "Objects and atmospheres for the seasons when the light gets low. Giant inflatables, coir doormats, gothic textiles. Ships from US warehouses in 2-8 days."

### 4. Pages statiques à créer

Le footer et les CTAs pointent vers des pages qui n'existent pas encore. Créer dans admin Shopify → Online Store → Pages :

- `/pages/about` — "About The Manor" — 1 paragraphe qui reprend le ton STRATEGY.md
- `/pages/contact` — formulaire Shopify natif
- `/pages/shipping` — copier les règles du fichier `SOURCING.md` : Free ≥$65, Flat $6.95, 2-8 days US, no international
- `/pages/returns` — 30 days, no notes, refund to card
- `/pages/faq` — 8-10 questions/réponses : UL/ETL cert, refunds, custom orders, wholesale, gift cards, etc.
- `/pages/season-notes` — placeholder pour contenu éditorial saisonnier futur

---

## Bloquants légers (avant campagnes ad)

### 5. Certification UL/ETL des 3 gonflables

Toujours en attente supplier — cf `docs/halloween-2026/SOURCING.md` §C.1 pour l'email template.

### 6. Décision pricing

Cf `docs/halloween-2026/BUILD_LOG.md` — décision à trancher :
- Cobweb Lace Mantel Scarf : $24.99 → $27.99 (recommandé, clear seuil AOV $12)
- Glow Rings 50-pack : $24.99 → $27.99 (idem)

### 7. Password protection

Dans admin Shopify → Online Store → Preferences → Password page. Activer + choisir mot de passe temporaire jusqu'au go-live.

### 8. Renommage de la collection "Indoor Decor"

3 options dans STRATEGY.md et BUILD_LOG.md — pick "The Manor" (recommandé), "Home Haunt", ou "Indoor Rites". Renommage 1 clic dans admin.

---

## Ajustements attendus après première preview

Le code n'a pas été rendu visuellement (voir `DESIGN_SYSTEM.md` § Deficit de vérification). Attends-toi à devoir ajuster :

- Hero title : peut-être trop grand à 320px (baisser `--wh-fs-hero` min à 2.6rem si nécessaire)
- Espacement bundle cards à 768px (peut être trop serré, monter à `--wh-space-8`)
- Countdown : la fenêtre peut être trop haute selon la police finale — capper à `padding-block: 64px` si besoin
- Barre annonce : si le message est long, wrapping possible sur mobile — tester avec message max
- Couleurs : le brick `#B5583F` peut sembler trop chaud selon les hero images finales. Alternative testée : `#A64C34` (plus foncé, plus stable en fond photo). Un seul edit dans `wh-tokens.css`.

---

## Ce que je n'ai PAS pu vérifier

- Lighthouse mobile / desktop (pas de rendu)
- Add-to-cart flow (pas de rendu)
- Menu drawer sur mobile (Horizon a le sien, mon thème s'appuie dessus par défaut si `header-group` reste natif)
- Compatibilité Shopify Markets (mais devise USD + zone US = OK)
- Panier drawer (natif Horizon, non modifié)
- Checkout (Shopify managed, non touché)

Aucun risque de casse identifié — j'ai zéro touché au layout Horizon (`layout/theme.liquid`), aux templates cart/product/collection existants, ni au header-group / footer-group natifs. Mon `templates/index.wicked.json` est un template **additif** activable au choix.

---

## Ordre suggéré de tes actions

1. **Installer le thème** en unpublished (Option A ou C recommandé)
2. **Preview la home** avec le template `index.wicked` → screenshot mobile+desktop, m'envoyer les captures pour ajustements
3. **Générer les 3 visuels critiques** via Higgsfield (Hero, 2 category tiles)
4. **Créer les 6 pages statiques** (about, contact, shipping, returns, faq, season-notes)
5. **Renseigner meta SEO** sur les 14 produits (suggestions prêtes dans SOURCING.md §F)
6. **Trancher pricing** Mantel/Rings à $27.99
7. **Activer password protection**
8. **Chaser CJ** sur UL/ETL des blowers
9. **Preview finale** → si OK, publier
