# SOVRY → boutique mono-produit « plaid chauffant » — PROGRESS

Boutique : SOVRY — nkaq11-sh.myshopify.com — Basic — EUR — France
Objectifs : en ligne avant le 05/11/2026 · Black Friday 27/11/2026 · Noël

## Journal des actions

### 2026-10-27 — Étape 1 : Accès et sauvegarde ✅
- Accès API Admin Shopify confirmé via le connecteur Shopify (MCP). Lecture et écriture OK. Rien à créer de ton côté.
- Sauvegarde produits : `sovry/backup/products-2026-10-27.csv` (format d'import Shopify : 5 produits, variantes, prix, SKU, images, SEO, statut) + `products-2026-10-27.json` (copie brute).
  - Note : le lien de l'export groupé Shopify n'est pas exposé par le connecteur, alors le CSV a été généré à partir des données lues via l'API. Pour une 2e copie officielle : Admin › Produits › Exporter › Tous les produits › CSV.
- Thème dupliqué : **SOVRY-backup-2026-10-27** (id 208177987927, non publié), copie du thème actif « Horizon ».
- Aucun produit, page, menu ou thème n'a été modifié.

## État constaté (avant remise à zéro)
| Élément | Détail |
|---|---|
| Produits | Cloud — Canapé (**ACTIF à 0,00 €** ⚠️ quelqu'un peut le commander gratuitement), SOVRY Ligne (brouillon, 2 799 €), Plaid USB zip (brouillon, 49,90 €), Kit crochet Capybara (brouillon), Plaid velours XL (brouillon, 89,90 €) |
| Thèmes | Horizon (actif), Copie de Copie de Horizon (non publié), SOVRY-backup-2026-10-27 (non publié) |
| Collections | Page d'accueil (frontpage, 1 produit), Canapés design (1 produit) |
| Pages publiées | Aide & Contact, Notre Histoire, FAQ, Livraison, Retours (contenus « canapé ») — Conseils (masquée) |
| Menu principal | Notre canapé → /products/cloud-…, Notre Histoire → /pages/notre-histoire, Aide & Contact → /pages/contact |
| Menu pied de page | Rechercher → /search |

Points à corriger repérés dans les brouillons plaid :
- Velours XL : « sans frais de douane » et « lavable en machine » ne sont pas vérifiés. C'est aussi un modèle **filaire 230 V**, donc il ne remplit pas le critère « sans fil ».
- Le délai de livraison (7-12 j / 3-7 j) n'a été confirmé par aucun fournisseur.

## Décisions
- Les sauvegardes et les contenus sont stockés dans `sovry/` (dépôt git, branche claude/trusting-ptolemy-a2csbm).

## Reste à faire
- [ ] Validation du plan des étapes 2 à 5 par le propriétaire
- [ ] Étape 2 : remise à zéro réversible
- [ ] Étape 3 : sourcing et notation des fournisseurs, messages à envoyer
- [ ] Étape 4 : connexion du fournisseur à Shopify
- [ ] Étape 5 : boutique mono-produit
- [ ] Étape 6 : check-list de lancement
