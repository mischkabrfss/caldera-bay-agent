# V2 Restructuring — 21 août 2026

Note de décision, écrite en cours de projet. Le modèle économique de la V1 (POD comme véhicule d'acquisition) est mort avant même d'avoir été testé. Ce fichier documente le pivot.

---

## Le problème

Sur les 6 POD Printful, un seul (Disco Ghost Pillow à $39.99) atteint le seuil de 45 % de marge de contribution une fois le port intégré. Les autres — coir doormats, mug, blanket, shower curtain — plafonnent entre 29 % et 41 %.

Traduit en langage ad-payante : le ROAS d'équilibre POD tourne autour de **2.4–3.4**, ce qui est **impraticable sur du froid Meta en 2026** pour une marque neuve sans social proof.

Le seul moyen mécanique de faire tenir les marges POD serait de vendre le paillasson 30×18 à $86 et le plaid à $129. À ces prix, on est hors marché — l'ancre Etsy tourne autour de $45–65 sur les coir doormats et $75–95 sur les plaids sherpa AOP.

## Le pivot

**On sépare deux économies dans la même boutique.**

### Économie 1 — Produits d'acquisition (payés par Meta)

Ce sont eux qui reçoivent les $540 de budget ad. Seuils :
- Marge brute ≥ 60 %
- Marge contribution ≥ 45 %
- ROAS d'équilibre ≤ 1.9
- Ticket $39–$59
- Profit unitaire ≥ $8

Composition :

| SKU | Retail | Marge contribution | ROAS équilibre | Rôle test |
|---|---|---|---|---|
| WH-DB-BUTLER-01 (Doorbell) | $44.99 | ~53 % | 1.90 | Test principal Phase 1 |
| WH-DG-MIRROR-14 (Disco Ball Ghost) | $59.99 | ~46 % (limite) → 53 % si CJ ≤$18 | 2.15 → 1.88 | Test principal Phase 1 |
| WH-LT-PUMPKIN-20FT (Pumpkin Lights) | $24.99 | ~54 % | 1.85 | Test complémentaire Phase 3 (bundle boost) |

**Tous 3 sont physiques CJ US warehouse — sourcing critique, voir SOURCING.md §B.**

### Économie 2 — Produits d'AOV / organique / email (jamais paid cold)

Rôle : lifter le panier moyen, alimenter le SEO/organique, nourrir les email flows. Seuil unique : **profit ajouté au panier ≥ $12 par unité additionnelle**.

Composition :

| SKU | Retail | Profit ajouté au panier | Rôle |
|---|---|---|---|
| WH-DM-PRETTIES-24x16 | $49.99 | $18.30 | Cross-sell porche + SEO evergreen |
| WH-DM-TREATYOURSELF-24x16 | $49.99 | $18.30 | Cross-sell porche + SEO evergreen |
| WH-PL-DISCOGHOST-18 | $39.99 | $16.39 | Cross-sell salon + email flow disco ghost |
| WH-PL-BATSWARM-18 | $39.99 | $16.39 | Cross-sell salon |
| WH-SC-BOOYALL-71x74 | $54.99 | $16.31 | Cross-sell salle de bain + SEO exploratoire |
| WH-BL-CURSED-60x80 | $99.99 | $30.80 | Cross-sell canapé + email flow cozy season |
| WH-MG-COFFIN-15 | $26.99 | $8.05 | **BUNDLE-ONLY** (unfit standalone) — retirer du catalogue standalone sur front |

### Retirés / modifiés

- **Paillasson 30×18** (variant sur les 2 doormats) — **à supprimer dans Shopify admin** avant publication. Marge contribution 31 % = insauvable. Garder uniquement le 24×16.
- **Coffin Mug seul** — retirer de la collection Cozy Season côté front. Le taguer `internal:bundle-only-do-not-feature`. Reste dispo pour l'inclure dans le bundle Pastel Spooky Corner.

## Les 2 bundles reconfirmés (AOV ≥ $85 tenu)

### Bundle A — Trick or Treat Threshold (outdoor)
Composition : 1 doormat au choix + Doorbell + Pumpkin Lights
- Prix individuel : $119.97
- Bundle : **$99.99** — save $20
- AOV bundle : $99.99 ✓ (≥ $85)
- Contribution combinée : $33.36 → 33.4 % (bundle price)
- **Rôle** : le retargeting favori Phase 3

### Bundle B — Pastel Spooky Corner (indoor, bet #1)
Composition : Disco Ball Ghost Mirror + Disco Ghost Pillow + Coffin Mug
- Prix individuel : $126.97
- Bundle : **$109.99** — save $17
- AOV bundle : $109.99 ✓ (≥ $85)
- Contribution combinée : $37.41 → 34.0 %
- **Rôle** : le upsell direct sur le pillow (best margin acquisition candidate) et sur le mirror

## Recalcul du panier moyen projeté

Mix hypothèse V2 :
- 40 % achat mono d'un produit acquisition ($44.99–$59.99, moyenne $50)
- 25 % acquisition + 1 AOV item (moyenne $50 + $40 = $90)
- 15 % acquisition + 2 AOV items ($50 + $75 = $125)
- 15 % Bundle A ou B ($105 moyenne)
- 5 % achat mono AOV (SEO/organique — $40 moyenne)

**AOV projeté : (0.4×50) + (0.25×90) + (0.15×125) + (0.15×105) + (0.05×40) = $79.75** ✓ (dans cible 65–85 $)

## Printify vs Printful (comparaison estimée)

Printful bloqué, Printify bloqué depuis ce runtime. **Chiffres ci-dessous = ESTIMATES basées sur pricing public documenté — à vérifier**.

| Produit | Printful (estimé) | Printify meilleur partenaire US (estimé) | Delta |
|---|---|---|---|
| Coir Doormat 24×16 | $21.95 | ~$16.50 (Nickel Designs partner) | **-25 %** |
| Throw Pillow 18×18 AOP | $14.75 | ~$11.00 (Prodigi US ou T-Shirt & Sons) | **-25 %** |
| Ceramic Mug 15oz | $11.25 | ~$8.00 (Sensaria US ou Duplium) | **-29 %** |
| Ceramic Mug 11oz | $8.50 | ~$6.50 | **-24 %** |
| Sherpa Blanket 60×80 AOP | $52.00 | ~$38.00 (Underground Printing) | **-27 %** |
| Shower Curtain 71×74 | $27.50 | ~$22.00 (Awkward Styles) | **-20 %** |

**Effet net si tous les POD basculent sur Printify partenaires US** :
- Doormat 24×16 : marge contribution passe de 36.6 % à **47.5 %** — repasse au-dessus du seuil acquisition
- Pillow : passe de 41.0 % à **50.4 %** — franc au-dessus du seuil
- Blanket : passe de 30.8 % à **44.8 %** — juste sous le seuil, mais atteint
- Shower curtain : passe de 29.7 % à **39.7 %** — toujours sous, mais viable en AOV

**Recommandation** : basculer les pillows + mug + blanket sur Printify. Garder les doormats sur Printful si la qualité du coir print est meilleure (à valider visuellement sur des échantillons de mockup — Printify partenaires varient beaucoup en qualité). Shower curtain : test A/B sur les deux plateformes.

### Printful Growth Subscription

- Prix : $24.99/mois → break-even à ~$125 de profit uplift/mois
- Avantage : -20 % sur tous les produits Printful
- Calcul : si tu vends ~10 items POD/mois via Printful, le -20 % te fait économiser $25-30/mois — juste au-dessus du break-even
- **Recommandation** : ne pas prendre l'abonnement avant d'avoir 15+ ventes POD/mois validées. Commencer sans, l'activer à volume.

## Chemin critique post-V2

1. **Sourcing CJ** — priorité #1 absolue. Sans les 3 physiques verifiés, il n'y a pas d'assortiment d'acquisition. Voir la checklist Section B de SOURCING.md.
2. **Basculement Printify** — priorité #2. Créer les 5 POD sur Printify (pillows ×2, mug, blanket, shower curtain), sync via Shopify, comparer les mockups, choisir supplier final.
3. **Doormats sur Printful** — priorité #3 (déjà en place, à ajuster : supprimer variant 30×18).
4. **Adjustments prix Shopify** — à faire ou pas ? Cf réponse ci-dessous.

### Sur les ajustements de prix suggérés en V1

Étant donné le pivot, la logique change :
- Coffin Mug $26.99 → $29.99 : **inutile** puisque le mug ne se vend plus standalone. Le laisser à $26.99 permet un « save » visible dans le bundle Pastel Corner. Ne pas ajuster.
- Shower Curtain $54.99 → $59.99 : **à faire** — passe le profit-added-to-cart de $16.31 à $20.86 (+28 %), et le prix reste dans la fourchette psychologique US.
- Sherpa Blanket $99.99 → $109.99 : **à faire** — passe le contribution de $30.80 à $39.91 (+30 %), franchit le seuil $12 très largement, et le prix reste digestible sur le marché sherpa AOP.
