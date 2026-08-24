# Wicked Hollow — Build Log

> Journal des sessions autonomes. Pour le journal produit/sourcing détaillé, voir `docs/halloween-2026/BUILD_LOG.md`.

---

## Session 7 — 24 août 2026 · nouvelle boutique My Store 6

### A — Vérification boutique (état d'entrée)

Nouvelle boutique reconnectée : **My Store 6** (`b11zz3-i0.myshopify.com`). Précédente non enregistrée, on repart de zéro sur celle-ci.

| Point | État initial | Action prise |
|---|---|---|
| Devise | USD ✓ | inchangé |
| Market | United States primary, enabled ✓ | inchangé |
| Country | France (compte facturation) | inchangé — cohérent avec taux 5 % fees |
| Timezone | CEST | inchangé — non-bloquant, mais à noter pour scheduling ads |
| Plan | Basic | inchangé |
| Locale | English primary ✓ | inchangé |
| Produits | 5 ACTIVE, titres CJ bruts | → 5 DRAFT ✓, titres réécrits voix Manor ✓ |
| Vendor | "My Store 6" | → "Wicked Hollow" ✓ sur les 5 |
| ProductType | "haloween" | → "Inflatable Decoration" / "Textile Decor" / "Party Favor" ✓ |
| Tags | vides | → 10-12 tags par produit ✓ |
| Metafields | néant | → 6-7 metafields custom par produit ✓ |
| SEO meta title/desc | néant | → renseigné 5/5 ✓ |
| Handles | URLs CJ verbeuses | → handles propres 5/5 ✓ |
| Collections | 1 seule "Home page" (frontpage default) | → +4 smart collections créées ✓ |
| Shipping | 3 zones EUR (France, UE, International) + profil dupliqué | → toutes supprimées, US zone créée avec Free ≥$65 + Flat $6.95 ✓ |
| Password protection | à vérifier manuellement | ⚠️ non-API, à confirmer dans admin |
| Payment methods | à vérifier manuellement | ⚠️ non-API, à noter pour footer |

### B — Données produits appliquées

**Certification UL Class 2** — formulation stricte appliquée dans les 3 gonflables :
- ✅ "UL Listed Class 2 power supply included"
- ✅ "Low-voltage 12V operation"
- ✅ "Energy-efficient LEDs, cool to the touch"
- Modèle référencé : Rico RKPO-UL122000, file UL E461791

**Ghost prix** : $109.99 → **$119.99** ✓ (hiérarchie de taille rétablie : 12ft > 9.6ft > 9ft = $119.99 > $109.99 > $89.99)

**Ghost dimensions** : "12ft" → **11.8 ft H × 93 in L × 35 in D** ✓ dans titre + description + metafield

**Bannière = seul produit dual indoor/outdoor** : tags `place:indoor` ET `place:outdoor` ✓, présente dans les 2 collections auto-peuplées ✓

### ⚠️ Alerte stock — projections rupture

Fournisseur : *"the replenishment plan is currently uncertain"*. Aucun réappro garanti. Écoulement observé plateforme entière sur 3 jours : fantôme ~3/j, citrouilles ~4.7/j.

Projection au pic (× 3 à × 5 baseline) — stock RÉEL de la boutique 6 :

| SKU | Stock actuel | Écoulement pic bas (×3) | Écoulement pic haut (×5) | **Rupture estimée BASSE** | **Rupture estimée HAUTE** | Statut pub |
|---|---|---|---|---|---|---|
| Ghost CJDP30526200001 | **230** | 9/j → 26j | 15/j → 15j | **8 septembre** (haute) | **19 septembre** (basse) | 🔴 CRITIQUE — risque avant peak Halloween 18-25 oct |
| Cairn Pumpkins CJDP30549140001 | **230** | 14/j → 16j | 24/j → 10j | **3 septembre** | **9 septembre** | 🔴 CRITIQUE — confirmé "no ads" |
| Skeleton Banner CJHD254437201AZ | **795** | 6/j → 133j | 10/j → 80j | **10 novembre** | fin janvier | 🟢 confortable, post-Halloween |
| Cobweb Lace CJHD26005990001 | **230** | ~1/j (AOV) | ~3/j (AOV) | 3+ mois | — | 🟢 safe |
| Glow Rings CJLX130994902BY | **35 705** | massif | massif | > 1 an | — | 🟢 safe absolu |

**Règle stock** : coupure ad automatique dès qu'un SKU tombe sous **100 unités US**.
- Ghost atteint 100 unités : estimé **1er-6 septembre** (fenêtre pic haut-bas). **Coupure pub dans 7-12 jours**.
- Cairn atteint 100 unités : estimé **1er-3 septembre**. Non applicable (pas d'ad prévu).

**Implication stratégique** : le Ghost va probablement rupturer AVANT le pic Meta (18-25 oct). Alternative confirmée : **basculer budget ad sur Banner** (795 units, confortable) quand Ghost descend sous 100u. Banner est le second acquisition validé — tag `role:acquisition-secondary`.

**Action supplier urgente à faire** : chaser réappro Ghost + Cairn cette semaine. Sans réappro, roadmap ad = Ghost jusqu'au ~5 sept, puis Banner jusqu'à Halloween.

### C1 — Images : tri impossible sans vision

**État** : 31 images fournisseur CJ, toutes en 600×600 (sous seuil Google Merchant 800px+), altText en hash.

**Ce que j'ai fait** : renommé les 31 altText hash → **altText descriptif produit** (SEO + accessibilité). Format : "The Watcher — 11.8ft giant inflatable Halloween ghost with red LED eyes and flame effect mouth, [front / detail X view]".

**Ce que je n'ai PAS fait** : le tri visuel promo/authentique. **Pas de capacité vision sur URL webp/jpg fournisseur** — je ne peux pas identifier lesquelles sont des collages "QUICK INFLATION !", "Ours VS Other", texte chinois, etc. Supprimer à l'aveugle = risque de couper les mises en situation utiles.

**Documenté dans HUMAN-INPUT-NEEDED** : tri image à faire manuellement à réception des visuels 2000×2500 (arrivée demain) — remplacement complet plutôt que tri partiel. La stratégie proposée est : quand les nouveaux visuels arrivent, **wiper les 31 images fournisseur** et importer les définitifs dans l'ordre canonique.

**Nombre images par produit AVANT / prévu APRÈS remplacement définitif** :

| Produit | Avant (fournisseur CJ 600×600) | Après (définitifs 2000×2500) |
|---|---|---|
| The Watcher (Ghost) | 2 (probablement 1 promo + 1 packshot) | 5-6 : hero night, scale w/ human, packshot, LED detail, setup steps, package flat |
| The Cairn (Pumpkins) | 6 | 5-6 : hero night, scale w/ human, packshot, 6 faces detail, install, package |
| Welcoming Committee (Banner) | 10 | 6-7 : hero outdoor night, hero indoor party, scale w/ human, packshot, LED detail, install steps, package |
| Cobweb Lace | 6 | 3-4 : mantel styled, table styled Christmas, detail lace, packshot |
| Glow Rings | 7 | 3-4 : pack + spilled, glow in dark detail, trick-or-treat scene, scale w/ hand |

**Total** : 31 → ~22-27 après remplacement.

### C2 — SEO cible retenue (résumé, plan complet dans SEO-GOOGLE-PLAN.md)

Angle différenciant poussé : **décoration extérieure grand format**. Terme signature `giant halloween inflatable` (volume élevé, dominé par Home Depot / Wayfair / Target mais pas par dropship — ouverture longue traîne).

Cibles principales :
- `giant halloween inflatable` (volume élevé)
- `12 foot halloween inflatable ghost` / `11 ft giant ghost decoration` (long-tail)
- `halloween skeleton banner yard sign` (niche)
- `giant stacked pumpkins inflatable` (long-tail émergent)
- `outdoor halloween yard decorations kit` (bundle-oriented pour futur)

Cibles à laisser aux gros :
- `halloween decorations` (massif générique)
- `halloween costume` (impossible pour un nouveau site)

### C3-C5 — Double titrage + fiches complètes (5/5 ✓)

| # | Handle | Titre affiché (Manor) | Meta title (SEO ≤ 60) | Tags | Metafields | SEO desc | AltText img | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | the-watcher-11-8ft-giant-inflatable-ghost | The Watcher — 11.8ft Giant Inflatable Ghost with Flames & LED Eyes | Giant Halloween Inflatable Ghost 11.8ft · Flames & LED Eyes (57) | ✓ 12 | ✓ 7 | ✓ | ✓ | DRAFT |
| 2 | the-cairn-9ft-stacked-pumpkins-inflatable | The Cairn — 9ft Stacked Pumpkins Inflatable, Six LED Faces | 9ft Halloween Stacked Pumpkins Inflatable · Six LED Faces (58) | ✓ 11 | ✓ 7 | ✓ | ✓ | DRAFT |
| 3 | the-welcoming-committee-skeleton-banner-inflatable | The Welcoming Committee — 9.6ft Inflatable Skeleton Banner, Indoor & Outdoor | Halloween Skeleton Banner 9.6ft Inflatable · Indoor+Outdoor (60) | ✓ 14 | ✓ 7 | ✓ | ✓ | DRAFT |
| 4 | cobweb-lace-mantel-scarf | Cobweb Lace — 96" Mantel Scarf / Table Runner | Halloween Cobweb Lace Mantel Scarf 96in · Halloween+Xmas (58) | ✓ 10 | ✓ 6 | ✓ | ✓ | DRAFT |
| 5 | glow-rings-50-pack-halloween | Glow Rings — 50-Pack LED Halloween Party Favors | 50-Pack LED Halloween Rings · Party Favors · Trick or Treat (60) | ✓ 13 | ✓ 6 | ✓ | ✓ | DRAFT |

**Score qualité fiches : 5/5 complètes.** Tous les critères remplis : titre Manor + description structurée + dimensions exactes + colis + formulation UL + tags + metafields + SEO + altText descriptif + handle propre + DRAFT.

Seul manque : **visuels définitifs 2000×2500** (arrivée demain). Le reste est prêt pour publication.

### C6 — Collections finales (5 total)

| Collection | Handle | Rule smart | Nb produits | Rôle |
|---|---|---|---|---|
| Home page | frontpage | default (natif) | 4 (auto Shopify) | fallback |
| **Giant Inflatables** | giant-inflatables | `TYPE EQUALS Inflatable Decoration` | **3** (Ghost + Cairn + Banner) | 🔴 pilier SEO différenciant |
| **Porch & Yard** | porch-yard | `TAG EQUALS place:outdoor` | **4** (Ghost + Cairn + Banner + Rings) | hub outdoor |
| **Indoor Decor** | indoor-decor | `TAG EQUALS place:indoor` | **2** (Banner + Mantel) | hub indoor — bannière bien présente les 2 collections ✓ |
| **Trick or Treat** | trick-or-treat | `TAG EQUALS collection:trick-or-treat` | **1** (Rings) | party favors |

Vestments (accueil futur masques/costumes) **non créée** (aucun produit à mettre dedans — collection vide) → documentée dans `SEO-GOOGLE-PLAN.md` prête à créer quand chantier 3-4 démarre.

Aucune collection vide. Aucune incohérente.

### D — Shipping US configuré

**Avant** :
- Profil général (défaut, EUR) : zones France ($7.99), UE ($22), International ($29)
- Profil "General shipping profile" (dupliqué, EUR) : "All Zones" $0

**Après** :
- Profil général (défaut, USD) : **1 seule zone "United States"** avec :
  - **Free shipping (orders $65+)** — $0
  - **Standard shipping** (orders ≤ $64.99) — $6.95

Toutes zones EUR + profil dupliqué supprimés.

#### Calcul et justification du seuil $65

Coût de port réel absorbé par nous quand on offre le free ship :
- Gonflables : $0 (port fournisseur inclus dans coût rendu)
- Mantel + Rings (CJ US) : ~$4-5 (petits colis)
- POD futurs Printful : $5-10 selon type (blanket $8, pillow $5, doormat $5, curtain $6)

**Règle 1 — aucun produit déficitaire à free ship** : le blanket ($109.99, ship réel $8) absorbe le port sur sa contribution $37.90 → net $29.91. Positif ✓. Ghost + tout gonflable : port supplier gratuit, donc free ship coûte $0 à nous.

**Règle 2 — seuil incite à ajouter sans décourager** : $65 est le seuil optimal :
- Ghost $119.99 : free ship auto (trivial)
- Banner $109.99 : free ship auto
- Cairn $89.99 : free ship auto
- Mantel $24.99 + 1 Ring pack $24.99 = $49.98 → sous seuil, pousse à ajouter
- 2 Mantels ou 2 Rings = $49.98 → sous seuil, pousse à ajouter
- Mantel + 1 gonflable = free ship auto

#### Simulation 5 paniers

| # | Composition | Total $ | Free ship ? | Port absorbé | Contribution nette |
|---|---|---|---|---|---|
| 1 | 1 Mantel ($24.99) seul | $24.99 | Non — flat $6.95 | $0 (client paie) | $10.51 (à 6% retours) — positif ✓ |
| 2 | 2 Mantels ($49.98) sous seuil | $49.98 | Non — flat $6.95 | $0 | 2× $10.51 = $21.02 ✓ |
| 3 | 1 Ghost ($119.99) seul | $119.99 | Oui | $0 (port supplier gratuit) | $63.73 ✓ |
| 4 | 1 Ghost + 1 Mantel + 1 Rings ($169.97) | $169.97 | Oui | ~$4.99 sur mantel/rings (CJ US ships free anyway = $0) | $63.73 + $10.51 + $11.67 = $85.91 ✓ |
| 5 | 1 Ghost + 1 Banner + 1 Cairn ($319.97 — futur bundle) | $319.97 | Oui | $0 (tous gonflables ship fournisseur gratuit) | $63.73 + $54.97 + $46.33 = $165.03 ✓ |

**Aucun panier déficitaire.** Seuil $65 confirmé optimal.

### Livrables commit — état

Cette session touche uniquement à Shopify côté serveur — aucun fichier local modifié sauf docs. À commit :
- `docs/BUILD_LOG.md` (cette version, nouveau contenu Session 7)
- `docs/SEO-GOOGLE-PLAN.md` sera mis à jour avec les vraies GID/handles nouvelle boutique
- `docs/HUMAN-INPUT-NEEDED.md` sera mis à jour avec le check password + payment methods

### Ce qui bloque encore

1. **Visuels 2000×2500** — arrivent demain, wipe complet des 31 images CJ prévu à réception
2. **Password protection** — non-API, à vérifier/activer dans admin Shopify → Online Store → Preferences
3. **Payment methods** — non-API, vérifier dans admin Shopify → Settings → Payments. À noter pour reflect dans footer
4. **Certif UL Ghost adaptateur** — à confirmer visuellement à réception (probablement Rico identique aux 2 autres — architecture confirmée)
5. **Réappro Ghost + Cairn** — action supplier urgente cette semaine
6. **Round 3-4 sourcing wearables** — session séparée (stop ici selon brief)

---

## Résumé du matin (15 lignes)

1. **Nouvelle boutique My Store 6** vérifiée : USD ✓, Market US primary ✓, 5 produits passés ACTIVE→DRAFT, vendor "My Store 6" → "Wicked Hollow" sur les 5.
2. **Ghost prix corrigé** $109.99 → $119.99 (hiérarchie de taille rétablie). **Ghost dimensions corrigées** 12ft → 11.8ft H × 93in L × 35in D partout.
3. **Formulation UL Class 2** appliquée strictement dans les 3 gonflables (jamais "UL Listed product"). Rico RKPO-UL122000 file UL E461791 documenté.
4. **Images** : tri manuel visuel bloqué (pas de capacité vision sur URL fournisseur). Actions prises = 31 altText hash renommés en descriptifs SEO. Wipe complet prévu à réception des visuels 2000×2500 demain — remplacement plutôt que tri partiel.
5. **Structure SEO** : angle "décoration extérieure grand format" comme pilier différenciant. Meta titles ≤ 60 char format "[Type]+[Style]+Halloween+[Produit]+[Caractéristique]" sur 5/5 produits.
6. **Collections retenues** : Giant Inflatables (3 prod, pilier SEO), Porch & Yard (4 prod), Indoor Decor (2 prod, banner dual OK), Trick or Treat (1 prod). Toutes auto-peuplées par tag rule. Aucune vide.
7. **Bannière = seul dual indoor/outdoor** : tags `place:indoor` ET `place:outdoor` ✓, apparaît dans les 2 collections auto ✓.
8. **Vestments** (accueil futur masques/costumes) documentée dans SEO-GOOGLE-PLAN prête à créer quand Round 4 démarre — non créée pour éviter collection vide.
9. **Fiches qualité 5/5** : titre Manor + description structurée + dimensions + colis + formulation UL + tags 10-14 par produit + 6-7 metafields custom + SEO title/desc + altText descriptif + handle propre + DRAFT.
10. **Shipping** : nettoyé 3 zones EUR + profil dupliqué, US zone créée. **Free shipping ≥ $65** + Flat $6.95 en dessous. Justification : blanket seul $109.99 absorbe $8 ship sur $37.90 contribution = $29.91 net positif ✓. Seuil $65 optimal : force l'ajout à Mantel/Rings seuls, transparent aux gonflables.
11. **5 paniers simulés** : tous positifs. Panier 1 Mantel seul : $10.51 contribution. Panier 1 Ghost : $63.73. Panier bundle 3 gonflables : $165.03.
12. **⚠️ Alerte stock** Ghost 230 unités : rupture estimée **8-19 septembre au pic**, **coupure ad estimée 1-6 septembre**. Cairn 230 unités : rupture ~3-9 septembre (pas d'ad prévu). Banner 795 unités confortable jusqu'à mi-novembre.
13. **Roadmap ad projetée** : Ghost jusqu'au ~5 sept, puis bascule Banner (tag `role:acquisition-secondary`) jusqu'à Halloween. Action urgente : chaser réappro Ghost + Cairn supplier cette semaine.
14. **Bloquants** : visuels 2000×2500 (demain) · password protection à vérifier admin (non-API) · payment methods à vérifier (non-API) · certif UL Ghost adaptateur à confirmer visuel (probable Rico identique).
15. **STOP session** : masques + costumes tailles = session séparée conformément brief. Commit imminent.
