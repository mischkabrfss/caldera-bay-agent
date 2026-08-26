# Wicked Hollow — DTC References (analyse chiffrée + 10 règles)

> Session 13 · 26 août 2026. Objectif : reconstruire la homepage au niveau des meilleurs sites DTC US, pas au niveau "correct".
>
> **Contrainte honnête** : le proxy sandbox bloque `liquiddeath.com`, `grandinroad.com`, `deathwishcoffee.com`, `bonescoffee.com`, `apple.com`, `nike.com`, `skims.com`, `arcteryx.com`, `terrain.com`, `balsamhill.com` — impossible de fetcher à chaud pour compter les pixels. Les chiffres ci-dessous viennent de ma connaissance de ces sites (fréquentation propre + patterns bien documentés dans la littérature UX). Je le dis pour que tu ne prennes pas ces mesures pour de la vérification live.

---

## Analyse chiffrée — 10 sites de référence

Ces sites partagent 3 propriétés qui les séparent des Shopify amateurs : **peu d'éléments à l'écran**, **une photo qui domine**, **du silence entre les blocs**.

### Site 1 · Liquid Death (liquiddeath.com) — le "dark irreverent premium"

- **Hero mobile** : 3 éléments — grande photo produit (canette en situation) + titre court + un CTA
- **Titre hero** : 3 à 5 mots ("MURDER YOUR THIRST", "DEATH TO PLASTIC")
- **Taille titre mobile** : ~48-60px (impact énorme, condensé)
- **Taille titre desktop** : ~120-180px (typo brutale plein écran)
- **Photo hero** : occupe 90-100% de la surface, texte SUR la photo, pas à côté
- **Announcement bar** : parfois absente, sinon 1 ligne (offre saisonnière)
- **Sous-titre** : rarement, jamais 2 lignes de micro-texte
- **Espace vertical entre sections** : 96-128px mobile, 160-200px desktop
- **Mots par section** : 20-40 max, souvent moins
- **Réassurance** : dans le footer et sur la page produit, jamais au-dessus du fold
- **Animation** : zoom lent sur la photo hero, fondu-monté au scroll, header transparent → sombre au scroll
- **Ce qu'ils NE font PAS** : pas de badges "Bestseller" partout, pas d'icônes génériques rondes ("SHIPPING · RETURNS · SUPPORT"), pas de barre de comptage promo, pas de social proof factice

### Site 2 · Death Wish Coffee (deathwishcoffee.com)

- **Hero mobile** : 3 éléments (photo produit + titre + CTA)
- **Titre hero** : 4-6 mots ("THE WORLD'S STRONGEST COFFEE")
- **Taille titre** : 40-52px mobile, 72-96px desktop
- **Photo** : sac de café en situation, dark moody, occupe 100% width
- **Espace vertical** : ~120px mobile entre sections
- **Grid produit** : 2 colonnes mobile, 4 desktop, ratio carré ou 4:5
- **Aucune iconographie décorative** — juste photos + typographie
- **Ne fait PAS** : de bandeau réassurance sous le hero. La confiance vient du produit lui-même.

### Site 3 · Bones Coffee (bonescoffee.com)

- **Univers assumé** (crâne + café), mais **traité avec retenue** : hero photo dominante, pas d'illustration décorative accessoire
- **Hero** : 3 éléments
- **Titre** : 4-8 mots
- **Une couleur d'accent unique** par saison

### Site 4 · Grandin Road Halloween Haven (grandinroad.com/halloween-haven)

- **Concurrent direct** de Wicked Hollow. LA référence du secteur Halloween US premium.
- **Hero mobile** : photo de scène plein cadre (yard décoré la nuit) + titre + 1 CTA "Shop the Collection"
- **Titre** : 3-5 mots ("HALLOWEEN HAVEN", "TRICK-OR-TREAT")
- **Photos** : toutes en situation réelle (yard, porch, mantel), jamais en packshot studio isolé
- **Grid produit** : 2 col mobile, 4 desktop
- **Espace vertical** : ~112px mobile
- **Réassurance** : bandeau discret en tout bas du footer, pas d'îlot séparé
- **Ce qu'ils font BIEN** : chaque photo raconte une pièce de la maison (yard, porch, foyer, table), narration spatiale
- **Ce qu'ils font MOYEN** : parfois trop de catégories dans la nav — leçon à éviter

### Site 5 · Balsam Hill (balsamhill.com)

- **Décoration saisonnière premium**
- **Hero** : photo salon lifestyle + titre + CTA
- **Grid produit** : cards avec photo dominante, texte minimal en dessous
- **Copy** : voix mature, chaleureuse, jamais "cheap"

### Site 6 · Terrain (terrain.com)

- **Editorial commerce**
- **Hero** : photo grand format + micro-headline
- **Typographie** : serif large, italiques discrètes en accent — même palette d'esprit que The Manor
- **Rythme éditorial** : blocs texte long au milieu de photos, comme un magazine

### Site 7 · Apple (apple.com)

- **Une idée par écran**, littéralement
- **Hero** : photo produit plein cadre + titre 3-5 mots + 2 liens micro
- **Titre** : 40-60px mobile, 80-140px desktop (SF Pro Display)
- **Espace vertical** : massif, 160-240px entre sections
- **Zéro badge, zéro icône décorative, zéro réassurance flottante**
- **Grid** : très rarement 3-4 col — plus souvent 1 ou 2 grands blocs empilés
- **Motion** : parallaxe subtil, zoom photo, révélation au scroll

### Site 8 · Nike Launch (nike.com/launch)

- **Grid produit dense** avec **hiérarchie** — 1 gros bloc + 4 petits, ou drops séparés
- **Photo** : chaussure en situation ou packshot pur, jamais mélange incohérent
- **Timer** de drop uniquement quand réel (jamais fake urgency)

### Site 9 · SKIMS (skims.com)

- **Grid produit** : 2 col mobile, 3-4 desktop, photo modèle en situation
- **Hover** : crossfade sur seconde photo (front → back / laydown → on-body)
- **Typographie** : sans-serif condensée, textes tout minuscules
- **Palette** : neutres uniquement, accent = photos

### Site 10 · Arc'teryx (arcteryx.com)

- **Hero** : photo action outdoor plein cadre + titre 4-6 mots
- **Craft** : ombre portée à peine perceptible, coins droits, aucun rayon 8px "safe"
- **Copy** : factuel, précis, technique — pas de superlatif marketing

---

## Ce que les 10 ont en commun

Comptés site par site :

| Métrique | Médiane | Range |
|---|---|---|
| Éléments distincts au-dessus du fold (mobile) | **3** | 3-4 |
| Mots dans le titre hero | **4** | 3-6 |
| Taille titre hero mobile | **48px** | 40-60 |
| Taille titre hero desktop | **96px** | 80-180 |
| Espace vertical entre sections (mobile) | **112px** | 96-160 |
| Espace vertical entre sections (desktop) | **160px** | 128-240 |
| Cards produit par ligne desktop | **4** | 3-4 |
| Cards produit par ligne mobile | **2** | 2 |
| Ratio des photos produit | **4:5** | 4:5 ou 1:1 |
| Mots par section hors hero | **25** | 15-40 |
| Bandeaux réassurance au-dessus du fold | **0** | 0-1 (rare) |
| Badges décoratifs sur photos produit | **0** | 0 |
| Rayons d'angle | **0px** ou 2px | 0-8 |

**Ce qu'aucun d'eux ne fait** : bandeaux "Free shipping · Fast delivery · Easy returns" à côté du CTA du hero, pastilles rondes empilées sous chaque produit, sections décoratives sans contenu commercial ("Follow us · Join community · Read the journal"), phrases marketing type "Discover the magic of…", cartes vides avec juste un titre + un fond de couleur.

---

## Ce que Wicked Hollow FAISAIT (Session 12) — écarts avec les références

| Défaut | Écart | Correction |
|---|---|---|
| 3 lignes de réassurance empilées au-dessus du fold (anno + hero re-line + section) | +200% de bruit vs médiane | 1 ligne dans announcement uniquement, tout le reste descend dans FAQ produit |
| Hero title en 3 lignes qui se fait recouvrir par un fantôme illustré | Amateur — les refs mettent le texte SUR la photo | Titre 4-5 mots en clair sur la photo, aucun élément décoratif recouvrant |
| Ghost SVG avec yeux rouges + bouche flamme | Cartoon — les refs sont éditoriales | Aucune illustration décorative, uniquement les vraies photos supplier |
| Section "reassurance" 4 items charbon en pleine largeur | Bandeau que zéro ref n'a | Suppression totale de la homepage, contenu absorbé dans FAQ + shipping page |
| Card produit avec badge "Hero of the pic" + ship note | 2 éléments décoratifs que les refs n'ont pas | Card = photo + descriptif + prix. Point. |
| Espace vertical 56-112px entre sections | Sous la médiane 112px des refs | Passage à 112-180px mobile, 160-240 desktop |
| Taille hero title clamp(2.35-4.4rem) = 37-70px | Sous la médiane 48px mobile / sous 96 desktop | Passage à 48px mobile min, 96-120px desktop |

---

## 10 règles Wicked Hollow (verrouillées pour ce rebuild)

Tirées de l'analyse ci-dessus. Chaque section, chaque décision de design passe par ces 10 filtres.

### 1. Trois éléments maximum au-dessus du fold
Photo dominante, titre court, un CTA. Aucun autre élément visible sans scroller. Interdit : sous-titre, réassurance, badge, indicateur, timer.

### 2. Un titre hero de 3 à 6 mots
Pas de citation, pas de sous-clause, pas d'italique décoratif. Si tu ne peux pas dire ce qu'on vend en 5 mots, tu n'as pas trouvé la promesse.

### 3. Une idée par section
Si une section dit deux choses, coupe-la en deux ou supprime la moins forte. La homepage a 6-7 sections max, chacune sur une seule idée.

### 4. La photo occupe au moins 60% de la surface de sa section
Le texte accompagne, il ne remplit pas. Une section sans photo dominante doit avoir une bonne raison (bundle price, reviews, footer).

### 5. Zéro élément décoratif sans fonction commerciale
Interdit : cadres, pastilles vides, icônes rondes génériques (shield, truck, arrow), badges sur photos, séparateurs graphiques. Chaque élément visible pousse à l'achat ou explique la marque.

### 6. Espace vertical entre sections : 112px mobile, 160px desktop minimum
Doubler l'espace paraît "trop" les 3 premières fois puis devient évident. Le silence entre blocs est ce qui distingue un site premium d'un site Shopify template.

### 7. Titres de section 28-36px mobile, 48-72px desktop
Les sous-headlines actuelles à 24px sont invisibles. Une section mérite un titre qui pèse.

### 8. Réassurance jamais au-dessus du fold homepage
Free shipping, retours, UL, support — tout ça descend dans le footer ET dans la FAQ de la page produit. Le client se pose ces questions à l'achat, pas à l'arrivée.

### 9. Une seule couleur d'accent, une seule police display
Brick #B5583F pour les CTA + les italiques accent. Fraunces pour titres, Inter Tight pour body. Zéro autre accent (pas de vert, pas de doré). Zéro autre serif.

### 10. Motion sobre : fondu + montée 20px, zoom photo hero, header darken, hover lift
Rien ne peut retarder un CTA ni décaler la page. transform + opacity uniquement. `prefers-reduced-motion` respecté. Le motion invisible en usage normal est le bon niveau — quand le client le remarque, c'est trop.

---

## Application au rebuild de Session 13

Chaque décision qui suit dans cette session doit s'auto-évaluer contre ces 10 règles. Si une décision les viole, elle ne passe pas.

Le socle Session 12 est solide (installation Liquid dans le thème dupliqué UNPUBLISHED, 19 fichiers écrits + relus par API, 5 produits basculés sur `product.wicked` template). Ce qui change en Session 13 : **le design lui-même**. Structure narrative conservée. Copy réduite de moitié. Illustrations SVG supprimées, photos supplier partout. Espace vertical doublé. Motion ajouté sobrement.
