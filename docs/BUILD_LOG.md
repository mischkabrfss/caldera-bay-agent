# Wicked Hollow — Build Log (root)

> Journal des sessions de nuit. Pour le journal produit/sourcing détaillé, voir `docs/halloween-2026/BUILD_LOG.md`.

---

## Session 5 — nuit 21-22 août 2026 · thème "The Manor" v1

Cf. version précédente de ce fichier. Résumé : direction Manor choisie, design system + 10 sections Liquid + 1 template JSON, aucun rendu visuel (pas de shopify CLI). Branche `claude/theme-wicked-hollow-night`, commit `133078a`.

---

## Session 6 — nuit 22-23 août 2026 · finaliser fiches, SEO, sourcing masques + costumes

### Données réelles intégrées

**Certification électrique — résolu** : Rico "Class 2 LED Power Supply" RKPO-UL122000, INPUT 100-240V, OUTPUT 12V 2000mA 24W, c(UL)us LISTED file UL E461791 Dongguan Rico Electronic. Confirmé visuellement sur citrouilles + bannière. **Fantôme : à confirmer visuellement** (probablement identique).

**Formulation stricte à appliquer partout** :
- ✅ "UL Listed Class 2 power supply included"
- ✅ "Low-voltage 12V operation"
- ✅ "Energy-efficient LEDs, cool to the touch"
- ❌ "UL Listed product" · "UL certified inflatable" · toute formule laissant croire que le produit fini est certifié

**Fantôme — correction dimensions** : **11.8 ft H × 93 in L × 35 in P** (PAS 12 ft). Ne titre plus "12ft" — mettre à jour titre, description, meta SEO, JSON-LD futur.

### ⚠️ ALERTE STOCK — dates de rupture estimées

Fournisseur : *"the replenishment plan is currently uncertain"*. Aucun réapprovisionnement garanti. Écoulement plateforme sur 3 jours = **fantôme ~3/j**, **citrouilles ~4.7/j** (bannière non communiqué → hypothèse 2/j basée sur volume plus large).

Projection au pic (× 3 à × 5 vs baseline) — plage haute-basse :

| SKU | Stock actuel | Écoulement pic bas (×3) | Écoulement pic haut (×5) | **Rupture estimée BASSE** | **Rupture estimée HAUTE** | Risque publication ad |
|---|---|---|---|---|---|---|
| **Fantôme CJDP30526200001** | 451 (baissé de 460→451) | 9/j → 50j | 15/j → 30j | **22 septembre** (haute) | **10 octobre** (basse) | 🔴 CRITIQUE — risque rupture AVANT pic Halloween 18-25 oct |
| **Bannière CJHD254437201AZ** | 801 | 6/j → 133j | 10/j → 80j | **10 novembre** (haute) | fin janvier | 🟢 confortable, post-Halloween assuré |
| **Citrouilles CJDP30549140001** | 216 (baissé de 230→216) | 14/j → 15j | 24/j → 9j | **1er septembre** (haute) | **6 septembre** (basse) | 🔴 CRITIQUE — rupture AVANT lancement ad, confirmé décision "no ad budget" |

### 🔥 RÈGLE STOCK — ajoutée

**Coupure ad automatique dès qu'un SKU tombe sous 100 unités US.** Alerte via Windsor.ai / suivi manuel quotidien à partir du 1er septembre.

Projection seuil 100u :
- Fantôme : atteint 100u vers **12-25 septembre** (fenêtre pic bas/haut) → coupure ad estimée **entre 12 et 25 septembre**
- Bannière : atteint 100u vers **20 octobre-15 novembre** → coupure très tardive
- Citrouilles : déjà proche seuil, pas d'ad prévu → non applicable

**Implication stratégique** : le fantôme risque de rupturer AVANT le pic conversion Meta Halloween (18-25 oct). Solutions :
1. **Négocier réappro urgent** avec supplier (chaser cette semaine)
2. **Basculer budget ad sur Bannière** dès que Fantôme sous 100u — bannière = 801 unités, deuxième acquisition validée en Round 3
3. **Créer waitlist / notify-when-back** sur PDP fantôme post-rupture pour capter Nov 2026 relance

### PARTIE B — État des 14 fiches produit

**Note** : les updates Shopify des 3 gonflables (titres 11.8ft, descriptions UL Class 2, Setup 4 étapes, dual place bannière) n'ont pas pu être poussés cette session — MCP Shopify offline au moment critique. Ces updates sont documentées prêtes à pousser dès reconnexion, ou à faire manuellement dans l'admin. Tableau reflète l'état ACTUEL (avant updates prévues).

Légende : ✓ = complet · ✗ = manquant · ⚙️ = à corriger cette session (update prêt, blocage MCP)

| # | Produit | Titre Manor | Desc structurée | Dimensions exactes | Colis | Alim. formulation | Entretien | Warnings | Tags | Metafields | AltText | Handle | DRAFT | Setup 4 étapes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | The Watcher (Ghost) | ⚙️ (12ft→11.8ft) | ⚙️ (UL Class 2) | ⚙️ (11.8×93×35) | ✓ | ⚙️ | ✓ | ✓ | ✓ | ✗ (admin) | ⚙️ (hash CJ) | ✓ | ✓ | ⚙️ |
| 2 | Welcoming Committee (Banner) | ✓ | ⚙️ (UL + dual indoor/outdoor) | ✓ (9.61×3.61) | ✓ | ⚙️ | ✓ | ✓ | ⚙️ (add place:indoor) | ✗ (admin) | ✗ | ✓ | ✓ | ⚙️ |
| 3 | The Cairn (Pumpkins) | ✓ | ⚙️ (UL Class 2) | ✓ | ✓ | ⚙️ | ✓ | ✓ | ✓ | ✗ (admin) | ✗ | ✓ | ✓ | ⚙️ |
| 4 | Cobweb Lace Mantel Scarf | ✓ | ✓ | ✓ | n/a | n/a | ✓ | n/a | ✓ | ✗ (admin) | ✗ | ✓ | ✓ | n/a |
| 5 | Glow Rings 50-Pack | ✓ | ✓ | ✓ | ✓ | ✓ (button-cell) | n/a | ✓ (age 3+) | ✓ | ✗ (admin) | ✗ | ✓ | ✓ | n/a |
| 6 | Welcome My Pretties Doormat | ✓ | ✓ | ✓ | n/a | n/a | ✓ | n/a | ✓ | ✗ (admin) | ✗ | ✓ | ✓ | n/a |
| 7 | Trick or Treat Yourself Doormat | ✓ | ✓ | ✓ | n/a | n/a | ✓ | n/a | ✓ | ✗ (admin) | ✗ | ✓ | ✓ | n/a |
| 8 | Disco Ghost Pillow | ✓ | ✓ | ✓ | n/a | n/a | ✓ | n/a | ✓ | ✗ (admin) | ✗ | ✓ | ✓ | n/a |
| 9 | Bat Swarm Pillow | ✓ | ✓ | ✓ | n/a | n/a | ✓ | n/a | ✓ | ✗ (admin) | ✗ | ✓ | ✓ | n/a |
| 10 | Cursed Comfort Blanket | ✓ | ✓ | ✓ | n/a | n/a | ✓ | n/a | ✓ | ✗ (admin) | ✗ | ✓ | ✓ | n/a |
| 11 | Boo Y'all Shower Curtain | ✓ | ✓ | ✓ | n/a | n/a | ✓ | n/a | ✓ | ✗ (admin) | ✗ | ✓ | ✓ | n/a |
| 12 | Haunted Threshold Bundle | ✓ | ✓ | n/a | n/a | n/a | n/a | n/a | ✓ | ✗ | n/a | ✓ | ✓ | n/a |
| 13 | Full Haunt Bundle | ✓ | ✓ | n/a | n/a | n/a | n/a | n/a | ✓ | ✗ | n/a | ✓ | ✓ | n/a |
| 14 | Complete Yard Kit Bundle | ✓ | ✓ | n/a | n/a | n/a | n/a | n/a | ✓ | ✗ | n/a | ✓ | ✓ | n/a |

**Score fiches parfaitement complètes (hors metafields admin + altText image) : 8/14** (les 6 POD + bundles Threshold+Full Haunt + Yard Kit sont OK). **Les 3 gonflables ont 6 items ⚙️ chacun** — updates prêts, blocage MCP.

### PARTIE C — Structure SEO livrée

Voir `docs/SEO-GOOGLE-PLAN.md` (complet). Résumé :

- **Double titrage** appliqué aux 14 fiches — meta titles ≤ 60 char format `[Type] + [Style] + Halloween + [Produit] + [Caractéristique]`, meta descriptions ≤ 155 char
- **7 collections structurées** : Giant Inflatables (NOUVELLE, pilier SEO différenciant), Porch & Yard, Indoor Decor, **Vestments** (NOUVELLE, accueil chantiers 3-4), Bundles, Trick or Treat, All. Handles + meta titles + meta descriptions + intro 100 mots + smart tag rules définies pour chacune.
- **Navigation intent-first** : Shop mega-menu (Giant Inflatables push featured), raccourci Bundles top nav pour hit AOV, Season Notes + About = trust builders
- **Sections thème renommage** proposé : WH · X → Manor · X (10 sections, 1 ligne de changement par fichier, aucun impact fonctionnel)
- **Schema.org JSON-LD Product** : à intégrer Session 6+ dans template PDP custom
- **Google Merchant Center plan** : activation post go-live public uniquement, feed via Shopify natif, tous produits `identifier_exists: false` + `mpn: SKU` + `brand: Wicked Hollow`

### PARTIE D — Sourcing masques & accessoires

Voir `docs/halloween-2026/SOURCING-ROUND-4.md` (mis à jour). 12 candidats masques + accessoires + 6 costumes + 6 gift = **24 candidats totaux classés** avec search terms CJ exacts, prix marché, coût rendu max, stock mini, test Manor.

**Top 5 masques/accessoires** (à valider CJ) :
1. **Draped Lace Mourning Veil** ($29.99, C max $10.20, Manor ✓✓✓, signature identitaire)
2. **Krampus Devil Bronze Mask** ($34.99, C max $11.90, **seul bascule Halloween→Christmas**)
3. **Plague Doctor Beak Mask** ($39.99, C max $13.60, filmable iconique)
4. **Gothic Antler Crown** ($34.99, C max $11.90, marge saine + cross-season)
5. **Silver Filigree Masquerade Half-Mask** ($29.99, C max $10.20, marge excellente)

### PARTIE E — Sourcing costumes avec règles taille

**6 costumes analysés**, 4 retenus, 2 écartés (Zombie prom + Pirate captain — basculent sous seuil 45 % à 15 % retours).

**Top 3 costumes retenus (marge à 15 % retours calculée)** :

1. **Grim Reaper Robe** (D $49.99, C target $15, one-size) : à 15 % retours, **contribution 50.0 %** ✓ (bien au-dessus 45 %). Evergreen top 5 US.
2. **Victorian Vampire Cape** (D $54.99, C target $16, one-size) : à 15 % retours, **contribution 50.9 %** ✓. Manor pur, ticket haut, boost Nosferatu 2024.
3. **Full Skeleton Bodysuit** (D $44.99, C target $14, **multi-size**) : à 15 % retours, **contribution 48.9 %** ✓ (limite). Stock US par taille : M/L/XL ≥ 50 unités éliminatoire. **Le seul multi-size retenu ; risque sizing élevé, note "Runs small" obligatoire fiche.**

**+1 bonus** : **Widow Bride Dress** (D $59.99, multi-size, trend Nosferatu) : à 15 % retours, contribution 50.0 % ✓. À valider comme 30 %-trend bet.

**Règles taille absolues appliquées** :
- Tableau mensurations POUCES exigé supplier (poitrine, taille, hanches, longueur, épaules)
- Conversion asiatique→US obligatoire ("L" chinois = "M" US)
- Publier tableau dans fiche + metafield
- Note "Runs small — please check measurements" sur multi-size
- Stock US ≥ 50 unités par taille centrale (M, L, XL) = **critère éliminatoire**

### AOV projeté final (catalogue complet 22-24 SKUs)

Après intégration wearables : **AOV projeté ~$75.60**, au-dessus du seuil $65 free ship — maximum de leverage.

### Ce qui bloque encore

1. **MCP Shopify offline moments intermittents** — updates 3 gonflables (11.8ft ghost, UL Class 2, Setup 4 étapes, dual place banner) documentés prêts, à pousser dès reconnexion stable ou en admin manuel
2. **Certification UL fantôme à confirmer visuellement** sur l'adaptateur reçu (probablement Rico identique)
3. **Réappro fournisseur incertain** — risque rupture fantôme avant pic Halloween. **Action immédiate : négocier réappro urgent avec supplier**
4. **Visuels 600×600 fournisseur** insuffisants Google Merchant. Attente visuels 2000×2500 demain.
5. **WebSearch rate-limited** jusqu'au 24 août 17h UTC — Round 4 basé sur intelligence croisée sessions 1-3

### Rapport du matin (18 lignes)

1. **Fiches finalisées** : 8/14 parfaites (les 6 POD + 2 bundles simples). Les 3 gonflables + bundle Yard Kit ont des corrections prêtes (11.8ft ghost, UL Class 2 formulation, Setup 4 étapes, dual indoor/outdoor bannière), non pushées cause MCP Shopify offline intermittent — à pousser à reconnexion ou admin manuel. Bat Swarm handle propre partout.
2. **Structure SEO livrée** dans `docs/SEO-GOOGLE-PLAN.md` : double titrage complet (14 fiches + collections), 7 collections avec handles+meta+intros 100 mots, dont **Giant Inflatables (NEW pilier différenciant)** et **Vestments (NEW accueil wearables)**. Navigation intent-first documentée. Sections thème renommage Manor · X proposé.
3. **Top 5 masques/accessoires** (Round 4) : Mourning Veil $29.99 · Krampus Bronze Mask $34.99 · Plague Doctor Beak $39.99 · Antler Crown $34.99 · Filigree Masquerade $29.99. Tous ≥ 55 % contribution, test Manor ✓✓ ou ✓✓✓. Krampus est le seul avec bascule Halloween→Christmas explicite.
4. **Top 3 costumes retenus, marge à 15 % retours** : Grim Reaper Robe $49.99 one-size (50.0 % ✓) · Vampire Cape $54.99 one-size (50.9 % ✓) · Skeleton Bodysuit $44.99 multi-size (48.9 % ✓ limite). +bonus Widow Bride Dress $59.99 multi-size 30 %-trend (50.0 % ✓).
5. **Costumes écartés** après test 15 % : Zombie prom (42.3 %) + Pirate captain (38.5 %) — basculent sous seuil.
6. **Règles taille** absolues codées : mensurations pouces obligatoires supplier, conversion asiatique→US, stock M/L/XL ≥ 50 par taille éliminatoire, note "Runs small" obligatoire multi-size, tableau publié en fiche + metafield.
7. **Panier moyen projeté** catalogue complet 22-24 SKUs post-wearables : **$75.60** — au-dessus seuil $65 free ship, incentive maximum.
8. **Alerte stock** : Fantôme (451 units, 3/j baseline) rupture estimée **entre 22 sept et 10 oct** au pic — risque coupure ad AVANT pic conversion Meta Halloween (18-25 oct). Bannière (801 units) confortable. Citrouilles (216 units) rupture **~1er-6 septembre**, confirmé "no ad".
9. **Règle stock ajoutée** : coupure ad automatique dès SKU < 100 unités US. Fantôme atteint seuil 100u estimé entre **12-25 septembre**.
10. **Action supplier urgente** : chaser réappro fantôme cette semaine. Alternative : basculer budget ad sur Bannière quand fantôme rupture.
11. **Formulation UL stricte** codée : "UL Listed Class 2 power supply included" / "Low-voltage 12V operation" / "Energy-efficient LEDs, cool to the touch". Jamais "UL Listed product".
12. **Fantôme correction dimensions** : 11.8ft × 93in × 35in (pas 12ft). À corriger partout dès reconnexion Shopify.
13. **Bannière = seul dual indoor+outdoor** du catalogue — angle distinctif à exploiter : "salon soirée + jardin pelouse". Tags `place:indoor` ET `place:outdoor`, présence les 2 collections.
14. **Section supplier CJ 5-étoiles** : placeholder prêt dans SOURCING-ROUND-4.md pour intégrer sa réponse — si 3+ SKUs acceptables proposés, sélection finale = 100 % single-supplier consolidation.
15. **Ce qui bloque encore** : MCP Shopify offline intermittent (updates 3 gonflables en attente), certif UL fantôme à confirmer visuel, réappro fournisseur incertain, visuels 600×600 insuffisants Google Merchant.
16. **Ce à faire demain avec les images** : recevoir visuels 2000×2500, remplacer les 6+14+6 photos fournisseur des gonflables par les définitifs, générer altText descriptifs anglais US (position 2 ou 3 = shot d'échelle avec silhouette humaine — argument #1 vente gonflable), lancer Higgsfield sur les 3 catégories manquantes (Hero home, category tiles Porch/Indoor/Vestments).
17. **Livrables commit** : `docs/SEO-GOOGLE-PLAN.md` nouveau · `docs/halloween-2026/SOURCING-ROUND-4.md` étendu costumes+size rules+15% returns · `docs/BUILD_LOG.md` mis à jour tableau 14 fiches + stock rupture + morning report.
18. **Branche** `claude/theme-wicked-hollow-night`, tout push imminent.
