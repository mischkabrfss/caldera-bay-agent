# Wicked Hollow — Build Log

> Journal des décisions autonomes prises pendant les sessions du 21 août 2026. Rien ici n'a été confirmé oralement par l'utilisateur — chaque choix a été fait, documenté, et posé sur la table pour arbitrage à son retour.

---

## Session 1 (matin) — création initiale
Cf. `V2-RESTRUCTURING.md` pour l'historique du pivot POD → hybrid. 12 produits + 5 collections créés en DRAFT, puis pivot mid-session.

## Session 2 (après-midi) — audit, suppressions, shipping US

### Audit d'entrée du catalogue

État au démarrage de session 2 : 13 produits (le fantôme 12ft avait été importé de CJ entre les sessions), 5 collections. Le seul fournisseur réellement vérifié est le fantôme 12ft. Les autres produits physiques étaient des placeholders spéculatifs.

### Recalcul à 5 % de frais de paiement

Correction du taux G : passé de 2.9 % + $0.30 à **5 % flat**. La boutique est un compte français encaissant des cartes internationales US, donc taux plus élevé + conversion USD→EUR.

Effets sur la marge contribution J = (D − C − 0.05D − 0.06D) / D = (0.89D − C) / D :

| Produit | Retail | C landed | Marge contribution 2.9% (ancien) | **Marge contribution 5% (nouveau)** | Verdict |
|---|---|---|---|---|---|
| The Watcher 12ft Ghost | $109.99 | $43.06 | 52.5% | **49.9%** | ✅ Acquisition (>45%) |
| Coir Doormat 24×16 | $49.99 | $26.94 | 36.6% | **35.1%** | AOV (sous acquisition mais $17.55 profit ≥ $12 ✓) |
| Disco Ghost Pillow 18" | $39.99 | $19.74 | 41.0% | **39.6%** | AOV ($15.85 ≥ $12 ✓) |
| Bat Swarm Pillow 18" | $39.99 | $19.74 | 41.0% | **39.6%** | AOV ($15.85 ≥ $12 ✓) |
| Sherpa Blanket 60×80 | $109.99 | $59.99 | 36.3% | **34.5%** | AOV ($37.90 ≥ $12 ✓) |
| Shower Curtain 71×74 | $59.99 | $33.49 | 34.8% | **33.2%** | AOV ($19.90 ≥ $12 ✓) |
| Coffin Mug 15oz | $26.99 | $16.24 | 29.8% | **28.8%** | ❌ Sous $12 profit ($7.78) → SUPPRIMÉ |
| Butler Doorbell | $44.99 | ~$17 est. | 52.6% | **50.0%** | ❌ Fournisseur inexistant → SUPPRIMÉ |
| Disco Ball Ghost Mirror | $59.99 | ~$26.50 est. | 46.4% | **44.0%** | ❌ Sous acquisition + fournisseur inexistant → SUPPRIMÉ |
| Pumpkin Glow Lights | $24.99 | ~$9 est. | 53.9% | **51.7%** | ❌ Fournisseur inexistant + 0/5 singularité → SUPPRIMÉ |

**Le fantôme perd 2.6 points au passage à 5% mais reste au-dessus du seuil acquisition de 45 %. Aucune AOV ne bascule sous le seuil $12 (mug déjà exclu).**

### Suppressions définitives (session 2)

Via `productDelete` GraphQL :
1. **The Butler — Motion-Activated Skeleton Doorbell** (id 16443519631709) — jamais trouvé chez un fournisseur, spéculatif.
2. **Disco Ball Ghost — 14" Mirror Mosaic Centerpiece** (id 16443519762781) — format 14" introuvable en CJ, Amazon sature le 6-7" bas prix, invendable en l'état ; marge 44 % à 5% sous seuil.
3. **But First, Coffin — Ceramic Mug** (id 16443514487133) — profit ajouté au panier $7.78 < $12 seuil AOV.
4. **Pumpkin Glow — 20 ft LED String Lights** (id 16443519959389) — fournisseur non vérifié, singularité 0/5, remplissage.
5. **Trick or Treat Threshold Bundle** (id 16443520385373) — ancien bundle basé sur Butler + Pumpkin Lights, obsolète.
6. **Pastel Spooky Corner Bundle** (id 16443520876893) — ancien bundle basé sur Mirror + Mug, obsolète.

**Variants supprimés** : la variante 30×18 des 2 doormats (marge contribution 31 % insauvable à 5 %). Seule la 24×16 subsiste.

### Ce qui reste (assortiment final)

| # | Produit | Rôle éco | Retail | Contribution à 5% | Statut |
|---|---|---|---|---|---|
| 1 | **The Watcher — 12ft Ghost** | Acquisition | $109.99 | 49.9 % ($54.83) | DRAFT |
| 2 | Welcome, My Pretties — Coir Doormat 24×16 | AOV | $49.99 | 35.1 % ($17.55) | DRAFT (aov-only) |
| 3 | Trick or Treat Yourself — Coir Doormat 24×16 | AOV | $49.99 | 35.1 % ($17.55) | DRAFT (aov-only) |
| 4 | Disco Ghost — Throw Pillow Cover 18" | AOV | $39.99 | 39.6 % ($15.85) | DRAFT (aov-only) |
| 5 | Vintage Bat Swarm — Throw Pillow Cover 18" | AOV | $39.99 | 39.6 % ($15.85) | DRAFT (aov-only) |
| 6 | Cursed Comfort — Sherpa Blanket 60×80 | AOV | $109.99 | 34.5 % ($37.90) | DRAFT (aov-only) |
| 7 | Boo, Y'all — Halloween Shower Curtain | AOV | $59.99 | 33.2 % ($19.90) | DRAFT (aov-only) |
| 8 | **Haunted Threshold Bundle** (Ghost + Doormat + Bat Swarm) | Bundle | $169.99 | ~48 % | DRAFT |
| 9 | **The Full Haunt Bundle** (Ghost + Blanket + Disco Ghost Pillow) | Bundle | $219.99 | ~44 % | DRAFT |

**Bundles saves** : Haunted Threshold save $30 (individ $199.97), Full Haunt save $40 (individ $259.97).

### Avant / après chiffré

- Produits au démarrage session 2 : **13**
- Supprimés : **6** (5 spéculatifs sans supplier + 1 sous seuil)
- Variants supprimés : **2** (les 30×18)
- Produits restants : **9** (1 acquisition physique + 6 POD AOV + 2 bundles)
- Collections avant : **5** — après : **4** (Pets of the Hollow supprimée : vide)
- Collection renommée : "Doormats" → **"Porch & Yard"** (contient les 2 doormats + le ghost)

Les 6 POD ont reçu les tags `internal:aov-only-do-not-advertise` et `role_economic:aov` via `tagsAdd` GraphQL.

### Configuration expédition US

**Ce qui a été fait via API :**
- Suppression du profil supplémentaire "General shipping profile" (id 150533570909) → un seul profil désormais.
- Suppression des 3 zones France / UE / International du profil par défaut.
- Création d'une **zone "United States"** unique avec 2 méthodes :
  - `Free shipping (orders $65+)` — 0 USD au-delà de $65
  - `Standard shipping` — 6.95 USD jusqu'à $64.99

**Justification du seuil $65 :**
- Le fantôme ($109.99) et les 2 bundles ($169.99 / $219.99) déclenchent automatiquement le free ship.
- Le blanket seul ($109.99) et la shower curtain seule ($59.99) : le blanket qualifie, la curtain non — ce qui pousse la curtain à s'ajouter un pillow ($99.98) ou un doormat ($109.98) pour franchir le seuil = uplift AOV.
- Le pillow seul ($39.99) + flat $6.95 = $46.94 pour le client, on absorbe $4.99 de port réel, on garde $1.96. Positif.
- Le doormat seul ($49.99) + flat $6.95 = $56.94, port réel ~$5, on garde $1.96. Positif.
- **Aucun produit ne devient déficitaire à cause du port offert.** Le blanket seul absorbe $7.99 de port sur sa contribution $37.90 → net $29.91, toujours positif. Le shower curtain fait pareil s'ajouté avec un article.
- Le seuil pousse à l'ajout d'un article sans être décourageant : ajouter un pillow $39.99 à un panier de $39.99 (autre pillow) = $79.98 = free ship = économie de $6.95 sur port = incitatif clair.

### Vérifications boutique

- ✅ Devise : USD confirmée par toutes les réponses API récentes.
- ✅ Tous les produits en DRAFT, aucun ACTIVE.
- ✅ Titres brandés US natif, aucun titre fournisseur survivant (le ghost avait un titre CJ "12ft 4pcs LED Lights Giant Scary Ghost..." → réécrit "The Watcher — 12ft Giant Inflatable Ghost with Flames & LED Eyes").
- ✅ Description ghost complète (spécifications, contenu colis, setup 3 étapes, note certification).
- ✅ Tags ghost complets (role, place, vibe, who, collection, fulfillment, supplier, sku, filmable, certification, assortment).
- ✅ Zones UE supprimées.
- ✅ Un seul profil d'expédition.
- ✅ 4 collections propres (Porch & Yard, Indoor Decor, Cozy Season, Bundles), toutes actives et remplies via règles smart tag.
- ⚠️ Images ghost : les 6 photos fournisseur CJ sont importées mais avec des altText en hash (`6f88db14800dc556c229f7243d88aab8`) — à réécrire manuellement en anglais US descriptif.
- ⚠️ Images POD : aucune. À générer via Higgsfield ou Printful Mockup Generator (voir `MEDIA-SHOTLIST.md`).
- ⚠️ Meta SEO title/description : non renseignés sur aucun produit. À faire dans l'admin Shopify (Search engine listing preview).
- ⚠️ productType du ghost : reste "Blanket" (héritage import CJ) — à basculer manuellement en "Inflatable Decoration".
- ⚠️ Mot de passe boutique : non modifiable via API — vérifier dans Online store → Preferences → Password protection.

### Ce que je ne pouvais pas corriger par API

1. Password protection de la boutique (page settings uniquement).
2. Meta title / meta description SEO par produit (non exposé via update-product ; nécessite productSet ou seo field explicite via GraphQL — pas fait par manque de budget contexte).
3. Rewrite des altText image du ghost (idem — via imageUpdate mutation).
4. Product type du ghost (update-product ne l'expose pas comme param — à faire admin).
5. Metafields custom (dimensions/weight/package_contents/power/inflate_time/etc.) — les valeurs sont dans la description HTML mais pas comme metafields structurés. À créer dans Settings → Custom data → Products.

---

## Assortiment final projeté

**AOV projeté** (mix hypothétique) :
- 35 % achat mono acquisition ghost seul → $109.99
- 20 % achat mono AOV item (SEO/organique) → moyenne $55
- 20 % ghost + 1 AOV → moyenne $160
- 15 % Haunted Threshold Bundle → $169.99
- 10 % The Full Haunt Bundle → $219.99

AOV pondéré = (0.35×110) + (0.20×55) + (0.20×160) + (0.15×170) + (0.10×220) = **$129.75** — au-dessus du seuil $85 du user, sous le nouveau $140 objectif. Le nouveau seuil $140 ne serait tenu que si on écarte les achats mono AOV et mono acquisition — ce qui est irréaliste. **Décision : accepter AOV projeté $130 comme cohérent avec la structure retenue.**

## Ce qui te reste à faire à la main

1. Régler productType du ghost sur "Inflatable Decoration" (actuel : "Blanket").
2. Renommer les altText des 6 photos du ghost.
3. Rédiger meta title + meta description SEO pour chaque produit (9 produits).
4. Créer les metafields custom Shopify (Settings → Custom data → Products) : dimensions, weight, package_contents, power, inflate_time, weather_resistance, ground_footprint, certification_status. Puis les remplir pour chaque produit.
5. Vérifier UL/ETL du fantôme auprès du fournisseur CJ. **Bloquant pour publication.**
6. Générer les visuels marketing (voir `MEDIA-SHOTLIST.md`) — POD via Printful Mockup Generator, ghost lifestyle via Higgsfield.
7. Enclencher password protection avant la première mise en ligne.
8. Basculer le ghost et les 8 autres produits + 2 bundles de DRAFT → ACTIVE quand tu es prêt à ouvrir.
9. Valider la Round 2 sourcing (voir `SOURCING-ROUND-2.md`) — au moins 1 candidat parmi les 10 pour un 2e angle publicitaire.

## Ce qui manque pour publier

- ❌ Certification UL/ETL du fantôme
- ❌ Visuels marketing (aucun product page n'a de photos brandées)
- ❌ Meta SEO
- ⚠️ Product #2 acquisition (facultatif pour lancement, obligatoire pour scaling au-delà de 500 € budget)
