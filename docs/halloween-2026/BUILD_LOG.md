# Wicked Hollow — Build Log

> Journal des décisions autonomes des sessions du 21 août 2026.

## Session 1 — création initiale
Cf. `V2-RESTRUCTURING.md`. 12 produits DRAFT, pivot POD/hybrid mid-session.

## Session 2 — audit + shipping US
6 produits supprimés (Butler, Mirror, Coffin Mug, Pumpkin Lights, 2 vieux bundles). Shipping US configuré (Free ≥ $65 / Flat $6.95 sinon). Zones EU supprimées. Assortiment réduit à 9 DRAFT.

## Session 3 — 4 nouveaux CJ + hiérarchie prix
Ghost $109.99 → $119.99. 4 nouveaux SKUs CJ vérifiés créés :
- The Welcoming Committee 9.6ft Skeleton Banner ($109.99, marge 50.0 %)
- The Cairn 9ft Stacked Pumpkins ($89.99, marge 51.5 %)
- Cobweb Lace Mantel Scarf ($24.99, dual-season)
- Glow Rings 50-Pack ($24.99, small-parts warning)
Complete Yard Kit Bundle créé ($279.99, marge 46.2 %). Trick or Treat collection créée. AOV V4 : $143.55.

## Session 4 — gamme d'entrée & structure d'accueil

### Structure des collections rationalisée

**Décision autonome** : basculement du système de smart collections des tags `collection:*` vers les tags `place:*` pour auto-routing sur import futur. Deux mutations exécutées :

- **Porch & Yard** : rule passée de `collection:doormats` → **`place:outdoor`**. Contient désormais automatiquement : 3 gonflables (Watcher, Banner, Cairn) + 2 doormats + Glow Rings + tout futur produit tagué `place:outdoor`.
- **Indoor Decor** : rule passée de `collection:indoor` → **`place:indoor`**. Contient : 2 pillows + blanket + shower curtain + mantel scarf + tout futur `place:indoor`.

**Collection supprimée** : **Cozy Season** (contenait seulement le blanket → devient redondante avec Indoor Decor auto-routé). Blanket a le tag `place:indoor` → apparaît maintenant dans Indoor Decor auto.

**État final : 4 collections propres, aucune vide, aucune incohérente.**
- Porch & Yard (rule: `place:outdoor`)
- Indoor Decor (rule: `place:indoor`) — **à renommer manuellement — 3 propositions dans SOURCING-ROUND-3.md**
- Bundles (rule: `role:bundle`)
- Trick or Treat (rule: `collection:trick-or-treat`)

### Renommage Indoor Decor — 3 options proposées

Per user request de proposer plutôt que d'imposer :
1. **"The Manor"** — brand-cohérent avec Wicked Hollow (recommandé)
2. **"Home Haunt"** — direct, playful
3. **"Indoor Rites"** — evocative, ritual

À trancher côté user, renommage 1 clic dans admin.

### Gamme d'entrée sourcée — 20 candidats dans SOURCING-ROUND-3.md

10 INDOOR + 10 OUTDOOR, tous classés par potentiel, avec search terms CJ exacts, prix marché US constaté (sources Amazon/Etsy), prix vente cible, coût rendu MAX pour tenir profit ≥ $10 + marge ≥ 45 % à 5 % fees.

**Analyse cost formula** :
- $12.99-19.99 = bundle-only (profit $10 pas atteignable standalone à cause du port fixe CJ ~$5-7)
- $22.99-27.99 = fourchette d'or (profit + marge OK)
- $29.99-34.99 = confortable pour produits à C ≤ $14

**Top 5 candidats** :
1. LED Pumpkin Tea Lights 24-pack ($16.99) — bundle attach roi
2. Foam Tombstones 5-pack ($24.99) — dual indoor/outdoor
3. Halloween Wreath 20-24" ($34.99) — evergreen porte
4. Yard Silhouette Stakes 6-pack ($29.99) — trend ascendant witchy
5. Ground Breaker Zombie Hands paire ($22.99) — filmable, angle TikTok

### 2 bundles d'entrée proposés

- **The Indoor Coven** ($64.99) — Tea Lights + Skull Mug + Bat Silhouettes + Window Clings. Save $4.97.
- **The Curb Appeal Kit** ($69.99) — Tombstones + Silhouette Stakes + LED Cauldron. Save $9.98.

À créer une fois les composants validés dans CJ.

### AOV projeté post-Round 3

Baisse à **$87.10** (vs $143.55 V4). Trade-off assumé : volumes attendus 2-3× plus élevés grâce à ticket d'entrée $15-35 accessible + activation du seuil free shipping.

### Impact seuil $65 free shipping

**Avant Round 3** : seuil ne servait pas (aucun panier ne s'en approchait sans un inflatable).
**Après Round 3** : seuil devient un vrai levier AOV. Ex : 3 accessoires d'entrée $16.99+$22.99+$24.99 = $64.97 → 1 cent sous seuil → trigger urgent d'ajout du 4e item.

**Recommandation : ne pas modifier le seuil.**

---

## Ce qu'il te reste à faire à la main (mise à jour V4→V5)

Pré-existant :
1. **CRITIQUE** confirmer UL/ETL des 3 blowers gonflables avec CJ
2. Décision pricing Mantel Scarf + Glow Rings à $27.99
3. Product type ghost → "Inflatable Decoration"
4. altText images ghost
5. Meta title + desc SEO (14 → bientôt 24 produits) — suggestions dans SOURCING.md §F
6. Metafields custom
7. Générer visuels marketing (voir MEDIA-SHOTLIST.md)
8. Password protection avant publish

**Nouveau session 4** :
9. **Renommer collection "Indoor Decor"** — pick 1 des 3 propositions (The Manor / Home Haunt / Indoor Rites)
10. **Vérifier + acheter les 8-10 SKUs de Round 3 dans CJ** (checklist prête dans SOURCING-ROUND-3.md, prioritisé top 10)
11. Créer les 2 bundles d'entrée une fois les composants importés
12. Ajouter tag `warning:small-parts-age-3plus` sur les tea lights (batteries CR2032 button-cell)

## Ce qui manque pour publier

- ❌ Certification UL/ETL sur les 3 gonflables (bloquant absolu)
- ❌ Gamme d'entrée pas encore importée (bloquant pour activer réellement le levier $65 free ship)
- ❌ Visuels marketing
- ❌ Meta SEO renseigné
- ⚠️ Décision pricing accessoires
- ⚠️ Renommage collection Indoor
