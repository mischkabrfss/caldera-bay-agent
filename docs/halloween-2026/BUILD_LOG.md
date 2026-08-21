# Wicked Hollow — Build Log

> Journal des décisions autonomes prises pendant les sessions du 21 août 2026. Rien ici n'a été confirmé oralement par l'utilisateur — chaque choix a été fait, documenté, et posé sur la table pour arbitrage à son retour.

---

## Session 1 (matin) — création initiale
Cf. `V2-RESTRUCTURING.md`. 12 produits + 5 collections créés en DRAFT, puis pivot mid-session.

## Session 2 (après-midi) — audit, suppressions, shipping US
Voir version antérieure de ce log. 6 produits supprimés, shipping US configuré (Free ≥ $65 / Flat $6.95 sinon), assortiment reduit à 9 produits DRAFT.

## Session 3 (soir) — nouveaux CJ vérifiés + refonte hiérarchie prix

### Données d'entrée session 3

4 nouveaux SKUs CJ vérifiés fournis par le user :

| SKU | Produit | Coût rendu | Stock US | Retail cible |
|---|---|---|---|---|
| CJHD254437201AZ | Skeleton Banner Inflatable 9.6ft | $42.92 | 801 | $109.99 |
| CJDP30549140001 | Stacked Pumpkins Inflatable 9ft | $33.76 | 230 | $89.99 |
| CJHD26005990001 | Cobweb Lace Mantel Scarf 96×18" | $11.73 | 230 | $24.99 |
| CJLX130994902BY | Glow Rings 50-Pack LED | $10.57 | 982 | $24.99 |

Plus : **prix ghost 12ft passe de $109.99 à $119.99** pour tenir hiérarchie de taille (12ft > 9.6ft > 9ft doit se lire dans le prix).

### Recalcul marges à 5 % fees

Confirmation des 3 gonflables tenant le seuil acquisition ≥ 45 % :

| Produit | Prix | Contribution 5% | Verdict |
|---|---|---|---|
| Ghost 12ft | $119.99 | **53.1 %** ✓ | Acquisition HERO |
| Skeleton Banner 9.6ft | $109.99 | **50.0 %** ✓ | Acquisition CORE |
| Stacked Pumpkins 9ft | $89.99 | **51.5 %** ✓ | Acquisition CORE (family) |
| Mantel Scarf | $24.99 | 42.1 % ⚠️ | AOV — $10.51 sous seuil AOV $12 |
| Glow Rings | $24.99 | 46.7 % ⚠️ | AOV — $11.67 sous seuil AOV $12 |

**Signalement écarts prix** : les 2 accessoires (Mantel + Rings) passent sous le seuil AOV de $12 profit ajouté au panier au prix fixé $24.99. **Recommandation à valider par l'utilisateur : les monter tous les deux à $27.99** (delta +$3), ce qui les remet au-dessus du seuil (Mantel $13.18, Rings $14.34). Non appliqué automatiquement — décision de pricing = utilisateur.

### Produits créés session 3

1. **The Welcoming Committee — 9.6ft Skeleton Banner Inflatable** — DRAFT, tag role:core, place:outdoor, filmable:high, certification:pending-ul-etl, delay:pending-supplier-confirmation
2. **The Cairn — 9ft Stacked Pumpkins Inflatable** — DRAFT, tag role:core, vibe:friendly (angle family vs ghost scary)
3. **Cobweb Lace — 96" Mantel Scarf / Table Runner** — DRAFT, tag season:halloween-christmas (dual season), role:accessory
4. **Glow Rings — 50-Pack LED Halloween Party Favors** — DRAFT, tag warning:small-parts-age-3plus, collection:trick-or-treat
5. **Complete Yard Kit Bundle** — DRAFT, $279.99 (save $40 vs $319.97), 3 gonflables ensemble, marge contribution 46.2 % ✓

### Refonte prix bundles

- Haunted Threshold : $169.99 → **$179.99** (ghost était $109.99 dans bundle, maintenant $119.99 → +$10 à répercuter)
- Full Haunt : $219.99 → **$229.99** (idem)
- Complete Yard Kit : nouveau $279.99

### Nouvelle collection

**Trick or Treat** — smart collection sur tag `collection:trick-or-treat`. Contient les Glow Rings. Prête pour expansion futur avec candy accessories.

### Nouvelle échelle de prix (hiérarchie de taille)

```
Stacked Pumpkins 9ft   $89.99   ← angle family / entry point
Skeleton Banner 9.6ft  $109.99  ← positioning mid
The Watcher 12ft       $119.99  ← hero, tallest
```

### Assortiment final V4

**11 produits DRAFT au catalogue** (contre 9 en fin session 2 + 4 nouveaux − 2 vieux gardés) :

**Acquisition (3 verified physique)** :
- The Watcher 12ft Ghost $119.99 · marge 53.1 %
- The Welcoming Committee 9.6ft Banner $109.99 · marge 50.0 %
- The Cairn 9ft Pumpkins $89.99 · marge 51.5 %

**AOV (6 POD Printful + 2 CJ accessoires)** :
- Welcome My Pretties Doormat 24×16 $49.99
- Trick or Treat Yourself Doormat 24×16 $49.99
- Disco Ghost Throw Pillow 18" $39.99
- Vintage Bat Swarm Throw Pillow 18" $39.99
- Cursed Comfort Sherpa Blanket $109.99
- Boo Y'all Halloween Shower Curtain $59.99
- Cobweb Lace Mantel Scarf $24.99 (⚠️ à monter à $27.99)
- Glow Rings 50-Pack $24.99 (⚠️ à monter à $27.99)

**Bundles (3)** :
- Haunted Threshold Bundle $179.99 (save $30, marge 39.1 %)
- The Full Haunt Bundle $229.99 (save $40, marge 35.6 %)
- **Complete Yard Kit Bundle $279.99** (save $40, marge 46.2 %) — BEST bundle economics

Total : **11 produits standalone + 3 bundles = 14 SKUs** en DRAFT.

### AOV projeté V4

Mix hypothétique :
- 25 % achat mono inflatable → moyenne $107
- 20 % achat mono AOV item → moyenne $44
- 20 % inflatable + 1 AOV → moyenne $150
- 15 % Haunted Threshold Bundle → $180
- 10 % Full Haunt Bundle → $230
- 10 % Complete Yard Kit → $280

**AOV = $143.55** — au-dessus du seuil $140 du user. Objectif tenu.

### Vérification seuil shipping $65

Confirmé — le seuil tient avec le nouvel assortiment :
- Les 3 inflatables ≥ $65 → tous free ship
- Les 3 bundles ≥ $65 → tous free ship
- Blanket seul $109.99 → free ship
- Shower Curtain seul $59.99 → flat $6.95 (pousse à ajouter un doormat ou pillow → $99.98+ = free)
- Doormat + Mantel Scarf + Rings peuvent se combiner pour franchir $65
- Pas de scénario déficitaire identifié

Ajustement : aucun. Le seuil $65 tient.

### Conformité (rappel expansion)

Cf. `SOURCING.md` section C nouvelle. Points bloquants :
1. **UL/ETL à confirmer sur les 3 gonflables** (bloquant publication)
2. **Age warning 3+ sur Rings** — implémenté dans description, à vérifier packaging à réception
3. **Délai de livraison Skeleton Banner** — champ vide sur CJ, à confirmer supplier

### Ce que je ne pouvais pas corriger par API (persisté)

1. Password protection (page settings uniquement)
2. Meta title/desc SEO par produit → **suggestions rédigées dans SOURCING.md section F, à copier-coller dans admin**
3. altText images ghost/nouvelles photos → à réécrire admin
4. productType ghost reste "Blanket" → basculer "Inflatable Decoration" en admin
5. Metafields custom → à créer Settings → Custom data (schéma dans SOURCING.md section E)

---

## Ce qu'il te reste à faire à la main (V4 update)

1. **CRITIQUE** : confirmer UL/ETL des 3 blowers gonflables avec CJ supplier (email template dans SOURCING.md §C.1). Sans ça, aucun des 3 ne peut être ACTIVE.
2. **Décision pricing** : monter Mantel Scarf + Glow Rings à $27.99 chacun ? (recommandé pour clearer seuil AOV $12)
3. Product type ghost "Blanket" → "Inflatable Decoration" via admin
4. altText images ghost + prochaines photos nouvelles Higgsfield
5. Meta title + meta description SEO (14 produits) — suggestions prêtes dans SOURCING.md §F
6. Metafields custom (Settings → Custom data → Products) — schéma dans SOURCING.md §E
7. Générer visuels marketing (voir MEDIA-SHOTLIST.md V4)
8. Password protection avant première publish
9. Valider et éventuellement dupliquer collection "Cozy Season" — n'a plus qu'un produit (Blanket), envisager suppression + retag blanket sur `collection:indoor`

## Ce qui manque pour publier

- ❌ Certification UL/ETL sur les 3 gonflables (bloquant absolu)
- ❌ Visuels marketing des 5 produits physiques ajoutés (packshots + lifestyle)
- ❌ Meta SEO renseigné dans admin
- ❌ Vérification packaging Rings (age warning label)
- ⚠️ Décision pricing accessoires ($24.99 vs $27.99)
