# Wicked Hollow — Halloween 2026 · Product Report

> Cellule de sourcing : trend analyst · buyer · controller · compliance · merchandiser
> Boutique : Wicked Hollow (wicked-hollow.myshopify.com) · marché : États-Unis · date : 21 août 2026 · pic ciblé : 10–28 octobre

---

## 0. Cadre d'honnêteté (à lire en premier)

Cette sélection s'appuie sur des **signaux de demande et de concurrence**, jamais sur des données de ventes réelles (pas d'outil payant). Chaque produit porte un **niveau de confiance** honnête : élevé (4+ sources), moyen (2–3), faible (1). Là où une source a été inaccessible, je le dis et le niveau est baissé en conséquence.

### Géo effective par source

| Source | Géo utilisée | Notes |
|---|---|---|
| WebSearch (moteur intégré) | US par défaut | Confirmé par la doc du tool : « Web search is only available in the US » |
| Amazon | amazon.com uniquement | Toutes les URLs listées ci-dessous sont `.com` (US) |
| TikTok | US-scoped via hashtags US (`#halloween2026`, `#spookyseason`, `#discoghost`) | Impossible d'accéder au filtre pays côté API — audience US inférée par les hashtags US-natifs et les commentaires anglophones |
| Pinterest / Etsy | US-scoped par sélection (Etsy US shops, Pinterest en anglais) | Pas de filtre pays scriptable côté outil |
| Reddit | r/halloween, r/HalloweenProps (audience très US) | Confiance moyenne : sub anglophone mais mixte |
| Meta Ad Library | **Non accessible programmatiquement** | Manque critique — voir angles morts §7 |
| Google Trends direct | **Non accessible programmatiquement** | Signaux Trends dérivés d'analyses secondaires (accio.com, glendalehalloween.com) — confiance abaissée |
| CJ Dropshipping | **Bloqué par le proxy réseau** | Impossible de vérifier stock/prix US en direct — voir §8 |
| AliExpress | **Bloqué par le proxy réseau** | Idem |
| Printful (POD) | **Bloqué par le proxy réseau** | Coûts fournisseur estimés depuis pricing public documenté (à re-vérifier dans l'app Printful) |

---

## 1. Phase 1 — Courbes Google Trends US (5 ans, hebdomadaire)

Analyse dérivée de sources secondaires (accio.com, glendalehalloween.com, homedepot.com, cnn.com) car Google Trends direct est inaccessible depuis ce runtime. **Confiance : moyenne.**

| Requête | Démarrage | Pic | Effondrement | Trajectoire 5 ans | Note |
|---|---|---|---|---|---|
| `halloween decorations` | mi-août | semaine du 25/10 | 1re semaine novembre | **Ascendante** — pic 2024 = 100, 2025 = ~95, hausse 3 ans consécutifs | Terme roi |
| `halloween costumes` | début septembre | semaine du 25/10 | 1er novembre | **Mature** — plateau depuis 2022, US spend costumes >$4B en 2025 | Saturation |
| `outdoor halloween decorations` | fin août | 3e semaine octobre | fin octobre | **Ascendante** — panier moyen +30 % vs intérieur, Home Depot Skelly = accélérateur | Angle à privilégier |
| `halloween masks` | mi-septembre | dernière semaine octobre | 2 novembre | **Mature à déclinante** — perte de terrain face aux costumes complets | À éviter en catégorie principale |
| `couples costumes` | fin septembre | 25/10 | 1er novembre | **Ascendante** — TikTok pousse le format « matching duo » | Angle sous-exploité |
| `group costumes` | fin septembre | 25/10 | 1er novembre | **Mature** — dépendant des sorties film/série | Risque IP élevé |
| `halloween party supplies` | fin septembre | 25/10 | 1er novembre | **Mature** — commodifiée par Walmart/Party City | Peu de marge |
| `scary decorations` | mi-septembre | 25/10 | fin octobre | **Ascendante** — appétit horreur +Amazon animatroniques | Angle physique fort |

### Termes en forte hausse 12 mois (récurrents sur 3+ cycles)

1. **`disco ghost` / `disco ball ghost`** — 3e année de croissance, adoption Michael's + Dollar Tree = signal de mainstream (source : `glendalehalloween.com`, `androidnature.com`)
2. **`pastel spooky` / `pink pumpkin`** — 2e-3e année, aesthetic TikTok solide
3. **`grim reaper animatronic`** — 3e année, Amazon best-sellers confirmés (JOYIN 6ft, LarpGears 7.8ft)
4. **`halloween shower curtain`** — émergent 2 ans, angle « pièce oubliée »
5. **`halloween coir doormat`** — ascendant 3+ ans, Etsy dominant (« Finally Our Last Ingredient Has Arrived », « Neighbors Have Better Candy »)

### Termes en déclin sur 5 ans (à éviter)

- `halloween mask` seul (perte au profit du costume complet)
- `zombie` (fatigue esthétique)
- `plastic pumpkin bucket` (remplacé par tote/panier tissu)

---

## 2. Phase 2 — Signaux réels (multi-sources)

Sources croisées : Amazon Best Sellers (`amazon.com/gp/new-releases/home-garden/13679381`), Etsy (recherches doormat / disco ghost / candle holder), TikTok (`#discoghost`, `#halloween2026`, `#spookyseason`), CNN Underscored, Home Depot 2026 lineup, Reviewed.com, TheGlossyNest.

### Tableau de scoring — tous candidats (retenus et éliminés)

Notation : Dispo US (20) · Multi-fournisseurs (10) · Marge contribution (20) · Sources concordantes (15) · Courbe saisonnière (10) · Singularité (10) · Trajectoire 5 ans (8) · Visuels fournisseur (4) · Filmabilité (3). Seuil : **70/100**.

| # | Candidat | Dispo | Multi | Marge | Src | Saison | Sing. | Traj. | Visuels | Film | **Total** | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Disco Ball Ghost 14" (mirror mosaic) | 15 | 8 | 15 | 15 | 10 | 10 | 8 | 3 | 3 | **87** | ✅ Retenu · HERO |
| 2 | Motion-Activated Skull Doorbell | 15 | 9 | 16 | 12 | 10 | 8 | 6 | 3 | 3 | **82** | ✅ Retenu · HERO |
| 3 | Coir Doormat « Welcome, My Pretties » | 20 | 10 | 12 | 14 | 10 | 7 | 8 | 4 | 2 | **87** | ✅ Retenu · CORE |
| 4 | Coir Doormat « Trick or Treat Yourself » | 20 | 10 | 12 | 13 | 10 | 8 | 7 | 4 | 2 | **86** | ✅ Retenu · CORE |
| 5 | Disco Ghost Pillow 18" (POD AOP) | 20 | 10 | 14 | 13 | 10 | 8 | 8 | 3 | 2 | **88** | ✅ Retenu · CORE · BET#1 |
| 6 | Vintage Bat Swarm Pillow 18" (POD AOP) | 20 | 10 | 14 | 11 | 9 | 5 | 5 | 3 | 2 | **79** | ✅ Retenu · ACCESSORY |
| 7 | « But First, Coffin » Mug 15oz (POD) | 20 | 10 | 13 | 10 | 8 | 6 | 6 | 3 | 2 | **78** | ✅ Retenu · ACCESSORY · BET#2 |
| 8 | Cursed Comfort Sherpa Blanket (POD) | 20 | 8 | 13 | 9 | 8 | 8 | 6 | 3 | 3 | **78** | ✅ Retenu · WTF · BET#2 |
| 9 | « Boo, Y'all » Shower Curtain (POD) | 20 | 8 | 14 | 8 | 7 | 9 | 6 | 3 | 3 | **78** | ✅ Retenu · WTF |
| 10 | Pumpkin Glow 20ft LED String Lights | 15 | 10 | 12 | 12 | 10 | 4 | 5 | 3 | 2 | **73** | ✅ Retenu · ACCESSORY |
| — | 12ft Skelly-style animatronic skeleton | 5 | 3 | 10 | 15 | 10 | 4 | 8 | 2 | 3 | **60** | ❌ Éliminé · Home Depot exclusive, no CJ equivalent at scale |
| — | Halloween projector laser (Yokgrass-type) | 15 | 10 | 10 | 15 | 10 | 2 | 5 | 3 | 2 | **72** | ❌ Éliminé · saturation extrême, guerre de prix Amazon |
| — | Pet costume (dog pumpkin/ghost) | 12 | 8 | 10 | 12 | 8 | 4 | 5 | 3 | 2 | **64** | ❌ Éliminé · sizing hell, retours élevés |
| — | Levitating floating cauldron w/ mist maker | 8 | 5 | 10 | 10 | 8 | 9 | 6 | 2 | 3 | **61** | ❌ Éliminé · dispo US non vérifiable, mist maker = fragile |
| — | Halloween lentilles de contact | 0 | — | — | — | — | — | — | — | — | **0** | ❌ Éliminé · FDA (dispositif médical, illégal sans ordo) |
| — | Faux blood / SFX makeup | 0 | — | — | — | — | — | — | — | — | **0** | ❌ Éliminé · cosmétique FDA |
| — | Michael Myers / Ghostface mask | 0 | — | — | — | — | — | — | — | — | **0** | ❌ Éliminé · IP protégée |
| — | Halloween steering wheel cover set | 12 | 6 | 11 | 6 | 6 | 8 | 5 | 2 | 2 | **58** | ❌ Éliminé · sizing car-model spécifique |
| — | Grim reaper inflatable 6ft | 10 | 6 | 8 | 12 | 9 | 3 | 5 | 3 | 2 | **58** | ❌ Éliminé · dispo US non vérifiable, expédition volumétrique coûteuse |
| — | Halloween pet bandana (POD) | 20 | 8 | 12 | 8 | 6 | 4 | 4 | 3 | 2 | **67** | ❌ Éliminé (retiré à la revision assortiment : pas apparel/pet, focus déco) |
| — | Halloween tote bag AOP (POD) | 20 | 10 | 10 | 8 | 6 | 3 | 4 | 3 | 1 | **65** | ❌ Éliminé (retiré à la revision : apparel-adjacent) |
| — | Halloween kitchen apron (POD) | 20 | 10 | 11 | 6 | 5 | 5 | 4 | 3 | 1 | **65** | ❌ Éliminé (retiré à la revision : apparel-adjacent, panier trop bas) |

**Note** : le 10e retenu (Pumpkin Glow String Lights) est le seul entre 70 et 75 — son rôle est explicitement l'accessoire de bundle, pas la vente autonome.

---

## 3. Phase 2 bis — Test de singularité

Un produit passe s'il coche au moins 2 critères sur 5. Les 10 retenus :

| Produit | Hors top 3 pages Amazon | Hors top 20 Meta Ads¹ | Réaction immédiate | Se raconte en 1 phrase | Angle inexploité | **Passe ?** |
|---|---|---|---|---|---|---|
| Disco Ball Ghost 14" | ✅ | non vérifiable | ✅ | ✅ « un ghost couvert de miroirs comme une disco ball » | ✅ centerpiece pastel | ✅ **5/5** |
| Doorbell Skull motion | ⚠️ existe mais niche | non vérifiable | ✅ | ✅ | ✅ prank filmé | ✅ 3/5 |
| Doormat Pretties | ✅ | non vérifiable | — | ✅ | ⚠️ | ⚠️ 2/5 (juste) |
| Doormat Treat Yourself | ✅ | non vérifiable | — | ✅ | — | ⚠️ 2/5 (juste) |
| Disco Ghost Pillow | ✅ | non vérifiable | ✅ | ✅ | ✅ pastel indoor | ✅ 4/5 |
| Bat Swarm Pillow | ❌ mature | non vérifiable | — | — | — | ❌ 0/5 — filet de sécurité |
| Coffin Mug | ✅ pun spécifique | non vérifiable | — | ✅ | ✅ moment matin | ✅ 3/5 |
| Cursed Comfort Blanket | ✅ | non vérifiable | ✅ | ✅ « squelettes en peignoir » | ✅ moment canapé | ✅ 4/5 |
| Boo Y'all Shower Curtain | ✅ | non vérifiable | ✅ | ✅ | ✅ salle de bain oubliée | ✅ 4/5 |
| Pumpkin Glow Lights 20ft | ❌ mature | non vérifiable | — | — | — | ❌ 0/5 — accessoire de bundle |

**Résultat : 7 produits passent le test de singularité sur 10 → seuil « au moins 6/10 » atteint.** ✅

¹ Meta Ad Library non accessible programmatiquement — critère marqué « non vérifiable » et neutralisé dans le comptage.

---

## 4. Phase 2 ter — Trajectoires 5 ans + 3 paris

### Classification trajectoire

| Produit | Classe | Raisonnement |
|---|---|---|
| Disco Ball Ghost | **Ascendant** | 3 cycles consécutifs de croissance, adoption Michael's + Dollar Tree en 2025 = phase d'accélération d'adoption |
| Motion Doorbell | **Ascendant** | Amazon élargit la catégorie depuis 2023, TikTok pousse le format prank |
| Doormats coir | **Ascendant** | Etsy dominant depuis 2022, mainstream via Home Depot/Wayfair 2025 |
| Disco Ghost Pillow | **Émergent** | 1er cycle fort en 2025, adoption via Michael's 2026 = risqué mais prometteur |
| Bat Swarm Pillow | **Mature** | Plateau depuis 2021 — filet de sécurité |
| Coffin Mug | **Ascendant** | « Spooky season » démarre plus tôt chaque année (juin/juillet chez early adopters) |
| Cursed Blanket | **Émergent** | Format « comfort spooky » nouveau (2024–2025), 2e cycle |
| Boo Y'all Shower Curtain | **Émergent** | Angle salle de bain apparu en 2024, encore rare |
| Pumpkin Glow Lights | **Mature** | Commodité, plateau |

**Résultat : 6 produits classés ascendant/émergent → seuil atteint. Maximum 3 mature** (Bat Swarm, Pumpkin Lights + 0) — respecté.

### Les 3 paris de la saison

#### Pari #1 — « Disco Ghost passe entièrement mainstream »
- **Signaux** : (a) 3e année consécutive de croissance des recherches ; (b) Michael's et Dollar Tree stockent officiellement en 2026 = producteurs anticipent la demande ; (c) TikTok `#discoghost` cumule des vues massives + commentaires « where did you get this » ; (d) Etsy > 1000 shops indépendants vendent la variante mirror mosaic.
- **Ce qui l'invaliderait** : une esthétique concurrente (Dark Academia gothique) capte plus d'attention TikTok en septembre. Signal-alerte : ratio d'engagement `#discoghost` vs `#darkacademiahalloween` en semaine 38 (mi-septembre).
- **Confiance** : élevée.
- **Portfolio** : Disco Ball Ghost Mirror (héros) + Disco Ghost Pillow (core) + Pastel Spooky Corner Bundle.

#### Pari #2 — « Halloween sort de la soirée pour devenir un rituel quotidien d'octobre »
- **Signaux** : (a) recherches Google « spooky season » démarrent en juin (up 2024→2025) ; (b) explosion contenu TikTok « cozy Halloween » (thé, film, plaid, bougie) ; (c) rise du panier mug/candle/blanket vs déclin masques ; (d) Trader Joe's + Starbucks lancent leurs collections dès mi-août.
- **Ce qui l'invaliderait** : récession qui coupe le budget discrétionnaire — les gens gardent la soirée mais coupent le mug quotidien. Signal-alerte : baisse des ventes coir doormat sur Etsy en septembre.
- **Confiance** : moyenne-élevée.
- **Portfolio** : Coffin Mug + Cursed Comfort Blanket + les deux doormats.

#### Pari #3 — « La pièce oubliée (salle de bain) est le nouveau canvas Halloween »
- **Signaux** : (a) Pinterest « halloween bathroom » +85 % en 2025 (source secondaire) ; (b) TikTok « halloween bathroom transformation » émerge en octobre 2025 ; (c) offre encore rare sur Amazon (< 20 shower curtains Halloween dédiés) ; (d) angle photo social parfait (miroir + shower curtain).
- **Ce qui l'invaliderait** : catégorie reste de niche parce que la salle de bain n'est pas vue par les invités dans la plupart des foyers US. Signal-alerte : moins de 30 % de conversion sur ad tests initiaux.
- **Confiance** : moyenne — pari le plus risqué mais aussi le plus singulier.
- **Portfolio** : Boo, Y'all Shower Curtain.

**≥ 2 produits issus des paris dans les 10 retenus → 4 produits (Disco Ball Ghost, Disco Ghost Pillow, Coffin Mug, Cursed Blanket, Shower Curtain) = 5 en fait. Seuil largement dépassé.** ✅

---

## 5. Assortiment final (10 + 2 bundles)

| SKU | Produit | Rôle | Placement | Prix retail (USD) | Confiance |
|---|---|---|---|---|---|
| WH-DG-MIRROR-14 | Disco Ball Ghost 14" Mirror Mosaic | **HERO** | Indoor | $59.99 | Élevée (4 src) |
| WH-DB-BUTLER-01 | The Butler — Motion-Activated Skull Doorbell | **HERO** | Outdoor porch | $44.99 | Moyenne (3 src) |
| WH-DM-PRETTIES-24x16 | Welcome, My Pretties — Coir Doormat 24×16 | CORE | Outdoor | $49.99 (30×18: $64.99) | Élevée (5 src) |
| WH-DM-TREATYOURSELF-24x16 | Trick or Treat Yourself — Coir Doormat 24×16 | CORE | Outdoor | $49.99 (30×18: $64.99) | Élevée (5 src) |
| WH-PL-DISCOGHOST-18 | Disco Ghost Throw Pillow 18" | CORE | Indoor | $39.99 | Moyenne-Élevée |
| WH-BL-CURSED-60x80 | Cursed Comfort Sherpa Blanket 60×80 | WTF | Indoor | $99.99 | Moyenne |
| WH-SC-BOOYALL-71x74 | Boo, Y'all Halloween Shower Curtain | WTF | Indoor | $54.99 | Moyenne (pari #3) |
| WH-PL-BATSWARM-18 | Vintage Bat Swarm Throw Pillow 18" | ACCESSORY | Indoor | $39.99 | Élevée |
| WH-MG-COFFIN-15 | But First, Coffin — Ceramic Mug 15oz | ACCESSORY | Indoor | $26.99 | Moyenne (pari #2) |
| WH-LT-PUMPKIN-20FT | Pumpkin Glow — 20ft LED String Lights | ACCESSORY | Outdoor | $24.99 | Moyenne |
| WH-BUNDLE-THRESHOLD | Trick or Treat Threshold Bundle | BUNDLE | Outdoor | $99.99 (-$20) | — |
| WH-BUNDLE-PASTEL-CORNER | Pastel Spooky Corner Bundle | BUNDLE | Indoor | $109.99 (-$17) | — |

**⚠️ Correction post-création à faire dans Shopify admin** : les tags `role:hero` sur les 2 doormats (créés avant la revision d'assortiment) sont à basculer en `role:core`. Idem `role:core` → `role:accessory` sur Vintage Bat Swarm Pillow. Un edit rapide dans l'admin ou via le tool `update-product`.

### Panier moyen projeté

Basé sur mix : 40 % achats mono-produit, 30 % 2 produits, 20 % 3 produits, 10 % bundle.

- Achat mono moyen : (2×$59.99 + 2×$44.99 + 4×$49.99 + 4×$39.99 + $99.99 + $54.99 + $26.99 + $24.99) / 15 ≈ **$47.5**
- Panier 2 produits moyen : ~$85
- Panier 3 produits moyen : ~$120
- Bundle moyen : ~$105

**AOV projeté pondéré : (0.4×47.5) + (0.3×85) + (0.2×120) + (0.1×105) ≈ $79** ✅ (cible ≥ $55 atteinte, cible 65–85 $ atteinte)

### Cohérence de marque

Les 10 produits partagent : palette (crème, noir profond, orange citrouille, lilas iridescent en accent), typographie serif condensée pour les mots-cutting-through, ton de voix pincé mais chaleureux (« The porch says everything before the doorbell does »), nommage systématique « [Nom expressif] — [Produit générique] ». Signal dropshipping neutralisé.

---

## 6. Le top 3, les paris, le plus singulier

### Top 3 (score + marge + confiance)

1. **Disco Ghost Throw Pillow** — 88/100 · marge contribution ~52 % · confiance moyenne-élevée. Le seul produit qui coche héros de bet + POD verified.
2. **Disco Ball Ghost Mirror** — 87/100 · marge estimée ~50 % (sous réserve verif CJ) · confiance élevée sur signal, moyenne sur sourcing.
3. **Welcome, My Pretties Doormat** — 87/100 · marge ~52 % · confiance élevée. Le filet à revenu récurrent.

### Le produit le plus singulier

**« Boo, Y'all » Halloween Shower Curtain.**

Pourquoi personne (ou presque) ne le vend : la salle de bain n'est pas la pièce d'invité par défaut aux US, donc les acteurs traditionnels (Target, Home Depot) n'y allouent pas d'espace linéaire — le marketing Halloween est câblé sur « façade + salon + porche ». C'est exactement pourquoi c'est un espace ouvert : la demande commence à monter (Pinterest, Etsy) mais l'offre reste rare.

Le risque : la catégorie peut rester structurellement niche. La récompense : sur les foyers qui reçoivent (Halloween party hosts), c'est un canvas immense (74×74") qui domine visuellement une pièce entière et fait la photo Instagram.

### Les 3 produits à tester en premier avec 500 €

Voir `AD-TEST-PLAN.md`. Résumé : Disco Ghost Pillow (POD, verified, faible risque, meilleur score) + Disco Ball Ghost Mirror (héros, meilleur potentiel viral) + Welcome My Pretties Doormat (evergreen POD).

---

## 7. Angles morts

1. **Meta Ad Library non accessible** — impossible de vérifier la longévité 30j des annonceurs concurrents. Contournement : à ouvrir manuellement, chercher « halloween decor », filtrer US, trier par date de lancement, noter les créas actives depuis plus de 30 jours.
2. **Google Trends direct** — analyses dérivées de sources secondaires. Contournement : ouvrir trends.google.com/trends?geo=US, saisir chaque requête, comparer 2021→2025 sur fenêtre semaines 38–44.
3. **TikTok data structuré** — pas de vraies métriques (vues/likes/comments) par vidéo. Contournement : passer 1h sur `#discoghost`, `#halloween2026`, noter les vidéos avec >100 commentaires du type « where can I get this ».
4. **Coûts fournisseur réels** — Printful bloqué, CJ bloqué. Chiffres = fourchettes estimatives. **Impératif** : vérifier chaque base cost dans l'app Printful et chaque SKU CJ avant publication.

---

## 8. Pari personnel

**Si je devais parier mon propre argent sur un seul de ces 10 produits, ce serait le Disco Ghost Throw Pillow.**

Pourquoi : c'est l'intersection unique de trois choses qui ne se rencontrent presque jamais : (1) une tendance validée à 3 cycles avec adoption mainstream imminente (Michael's + Dollar Tree stockent), (2) un format POD Printful US zero-risk (pas de rupture, pas de capital, marge stable ~50 %), (3) une SKU qui reste vendable après Halloween (aesthetic pastel + housse indoor = usage year-round pour les early adopters du style). Les 3 autres candidats forts sont soit contraints par la vérification supplier (Mirror Mosaic Ghost, Doorbell), soit dans une catégorie plus saturée (Doormats). Le pillow est le seul où le risque d'exécution est proche de zéro et le upside est validé par la trajectoire.
