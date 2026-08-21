# Wicked Hollow — Halloween 2026 · Sourcing

> Mise à jour session 3 (21 août 2026, soir) : 4 nouveaux produits CJ vérifiés (bannière squelette, citrouilles empilées, voile de cheminée, bagues LED 50-pack). Le fantôme 12ft passe à $119.99 pour tenir la hiérarchie de taille avec les 2 nouveaux gonflables.

---

## Section A — POD Printful US (6 produits · rôle AOV) · coûts NON VÉRIFIÉS

Printful US : impression et expédition depuis 4 centres US (Charlotte NC, LA CA, Dallas TX, ou partenaire). Délai 2–5 jours ouvrés. Aucun capital, aucune rupture.

| Produit | Printful product name | Base cost estimé | Shipping US estimé | À vérifier |
|---|---|---|---|---|
| Coir Doormat 24×16 | Coir Doormat 24×16 | **$21.95** | ~$4.99 | Vérifier prix Printful actuel |
| Throw Pillow Cover 18×18 AOP (×2 designs) | Throw Pillow Cover AOP | **$14.75** | ~$4.99 | Vérifier + comparer Printify partners |
| Sherpa Blanket 60×80 AOP | All-Over Print Sherpa Blanket large | **$52.00** | ~$7.99 | Vérifier + comparer |
| Shower Curtain 71×74 AOP | Shower Curtain AOP | **$27.50** | ~$5.99 | Vérifier disponibilité (produit récent Printful) |

## Section B — Physique CJ US (5 produits + 3 dans bundles) · VÉRIFIÉ

Tous ont un fournisseur confirmé sur CJ, entrepôt US, et coût rendu communiqué par le user.

| SKU | Produit | Coût rendu | Stock US | Prix vente | Marge contribution 5% | Statut |
|---|---|---|---|---|---|---|
| CJDP30526200001 | The Watcher — 12ft Giant Inflatable Ghost | **$43.06** | 460 | **$119.99** | 53.1 % | HERO acquisition |
| CJHD254437201AZ | The Welcoming Committee — 9.6ft Skeleton Banner Inflatable | **$42.92** | 801 | **$109.99** | 50.0 % | CORE acquisition |
| CJDP30549140001 | The Cairn — 9ft Stacked Pumpkins Inflatable | **$33.76** | 230 | **$89.99** | 51.5 % | CORE acquisition (family angle) |
| CJHD26005990001 | Cobweb Lace 96" Mantel Scarf | **$11.73** | 230 | $24.99 | 42.1 % ⚠️ | ACCESSORY AOV — recommend price up $27.99 |
| CJLX130994902BY | Glow Rings 50-Pack (variante Ring, PAS Christmas) | **$10.57** | 982 | $24.99 | 46.7 % ⚠️ | ACCESSORY AOV — recommend price up $27.99 |

Tous les 5 : **shipping fournisseur gratuit** (inclus dans coût rendu), expédition US 3–8 jours ouvrés.

## Section C — Compliance US (à valider avant publication)

### C.1 — Certification UL / ETL (bloquant)

**Trois gonflables** utilisent un souffleur électrique alimenté par adaptateur secteur US 110 V. La certification UL ou ETL est obligatoire pour tout appareil électrique vendu au consommateur US, sinon risque de retrait produit + saisie douanière + responsabilité produit en cas d'incident.

| SKU | Certification demandée | Statut |
|---|---|---|
| CJDP30526200001 (Ghost) | UL ou ETL sur blower + adapter | **À CONFIRMER** avec CJ |
| CJHD254437201AZ (Banner) | UL ou ETL sur blower + adapter | **À CONFIRMER** avec CJ |
| CJDP30549140001 (Pumpkins) | UL ou ETL sur blower + adapter | **À CONFIRMER** avec CJ |

**Action** : email CJ supplier avec la question suivante en anglais :
> "Please confirm the UL or ETL certification number for the electric blower and AC power adapter on SKU [X]. If certified, please provide the certification file. If not certified, is a certified alternative available?"

**Kill switch** : si aucun des 3 n'est certifié et qu'aucun équivalent certifié n'est disponible, ces 3 SKUs ne peuvent pas être vendus légalement aux US. Bascule alors sur POD-only et abandon du plan ad ghost/banner/pumpkins.

### C.2 — Avertissement petites pièces (Glow Rings)

- **Réglementation** : CPSC 16 CFR 1500.19 exige un warning label sur tout jouet contenant des petites pièces destiné aux enfants < 3 ans OU accessible par eux.
- Les bagues LED contiennent des piles button-cell (danger d'ingestion + brûlure interne critique) et de petits composants → warning obligatoire.
- **Implémenté** : la description produit contient explicitement "Not suitable for children under 3 years of age. Contains small parts and button-cell batteries — choking and swallowing hazard." + tag `warning:small-parts-age-3plus`.
- **À faire côté physique** : au moment de la réception fournisseur, vérifier que le packaging externe porte le pictogramme age warning 0-3 barré. Si absent, ajouter un sticker sur chaque unité ou négocier packaging avec CJ.

### C.3 — Délai de livraison (Skeleton Banner)

- La fiche CJ du SKU CJHD254437201AZ n'affiche pas le champ "processing time" — c'était vide au moment de la vérification.
- **Action** : demander à CJ le temps de traitement moyen historique. Si > 3 jours, ajouter un buffer dans la description ("Ships in 4–10 business days") et surveiller la promesse en ad copy Phase 3.

### C.4 — FDA / lentilles / cosmétiques / faux sang

Aucun produit du catalogue concerné. Non applicable.

### C.5 — CPSC 16 CFR 1610 (costumes enfants)

Aucun costume au catalogue. Non applicable.

---

## Section D — Google Merchant Center (GTIN)

Produits Printful et CJ n'ont pas de GTIN. Configuration Shopping :
- `identifier_exists` = `false` sur chaque produit (Google & YouTube app Shopify)
- `mpn` = SKU interne (ex. `CJDP30526200001`)
- `brand` = `Wicked Hollow`

---

## Section E — Metafields Shopify (à créer manuellement Settings → Custom data → Products)

Les valeurs sont déjà dans la description HTML de chaque produit, mais devraient être structurées en metafields pour un theme dynamique :

| Metafield | Type | Produits concernés |
|---|---|---|
| `custom.dimensions_deployed` | single_line_text | 3 gonflables + doormats + pillows + blanket + shower curtain + mantel scarf |
| `custom.weight_deflated` | single_line_text | 3 gonflables |
| `custom.package_contents` | multi_line_text | 3 gonflables |
| `custom.power_source` | single_line_text | 3 gonflables + LED rings |
| `custom.inflation_time` | single_line_text | 3 gonflables |
| `custom.weather_resistance` | single_line_text | 3 gonflables |
| `custom.ground_footprint` | single_line_text | 3 gonflables |
| `custom.certification_status` | single_line_text | 3 gonflables + LED rings |
| `custom.age_warning` | single_line_text | LED rings uniquement |
| `custom.cross_season_use` | single_line_text | Mantel Scarf (Halloween + Christmas) |
| `custom.shipping_lead_time_days` | integer | Tous |

Non créés via API cette session pour éviter overreach — à créer dans l'admin.

---

## Section F — Meta SEO title/desc (à ajouter dans admin Shopify)

Une meta title/description native n'est pas exposée par l'API `update-product`. À saisir manuellement dans chaque product page → Search engine listing preview → Edit website SEO.

### Suggestions par produit (à copier-coller)

| Produit | Meta title (max 60 char) | Meta description (max 155 char) |
|---|---|---|
| The Watcher 12ft Ghost | Giant 12ft Halloween Inflatable Ghost with Flames \| Wicked Hollow | 12-foot inflatable ghost with LED flames and red eyes. Everything included. Self-inflates in 90 seconds. Ships free from US. |
| Skeleton Banner 9.6ft | Halloween Skeleton Banner 9.6ft Inflatable, LED Lit \| Wicked Hollow | 9.6ft inflatable skeleton banner with witches' hats and 'Happy Halloween' scroll. LED-lit, self-inflates, US shipping. |
| Stacked Pumpkins 9ft | 9ft Halloween Stacked Pumpkins Inflatable Yard Decor \| Wicked Hollow | 9-foot tower of six carved LED pumpkins. Family-friendly Halloween yard centerpiece. Ships from US in 3–8 days. |
| Complete Yard Kit Bundle | Complete Halloween Yard Kit \| 3 Giant Inflatables — Save $40 | Ghost + Skeleton Banner + Pumpkin Tower — 3 giant Halloween inflatables in one order. Save $40. Free US shipping. |
| Haunted Threshold Bundle | Halloween Porch Bundle Ghost + Doormat + Pillow \| Save $30 | 12ft ghost inflatable + witchy doormat + bat pillow. Complete Halloween porch scene, save $30, US shipping. |
| The Full Haunt Bundle | Halloween Bundle Ghost + Blanket + Pillow \| Save $40 | Outdoor 12ft ghost + cozy indoor sherpa blanket + disco ghost pillow. Halloween at both ends of the house. |
| Welcome My Pretties Doormat | Halloween Witch Coir Doormat \| Welcome My Pretties | Coir doormat printed and shipped from the US. Weatherproof, thick natural coconut fiber, witchy welcome for the porch. |
| Trick or Treat Yourself Doormat | Halloween Coir Doormat 'Trick or Treat Yourself' | Coir doormat with UV-sealed print. Made in US, ships in 2–5 days. Bold serif type reads clearly from the sidewalk. |
| Disco Ghost Pillow | Pastel Disco Ghost Halloween Throw Pillow Cover 18" | All-over-print throw pillow cover, iridescent mirror mosaic ghost, US-printed. Pastel spooky, TikTok-viral aesthetic. |
| Bat Swarm Pillow | Vintage Bat Swarm Halloween Throw Pillow 18" | All-over-print pillow with vintage bat swarm illustration. Reads gothic year-round, Halloween in October. |
| Cursed Comfort Blanket | Halloween Sherpa Blanket 'Cursed Comfort' 60x80 | Ultra-soft sherpa blanket with skeleton lounge print. Cozy Halloween movie-night blanket, machine-washable. |
| Boo Y'all Shower Curtain | Halloween Shower Curtain 71x74 'Boo, Y'all' | Halloween shower curtain, all-over print, water-resistant, US-printed. The bathroom decor guests will remember. |
| Cobweb Lace Mantel Scarf | Halloween Cobweb Lace Mantel Scarf 96" \| Halloween + Christmas | 96-inch black cobweb lace runner for mantels and dinner tables. Halloween-to-Christmas dual season use. |
| Glow Rings 50-Pack | 50 LED Halloween Rings Party Favors Bulk Pack | 50 light-up LED Halloween rings in one pack. For trick-or-treat, parties, classroom giveaways. Ages 3+. |
