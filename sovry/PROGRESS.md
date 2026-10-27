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

### 2026-10-27 — Validation du propriétaire
- Produit principal : plaid/poncho **sans fil USB 5 V**. Le « Velours XL » filaire est abandonné.
- Boutique sous mot de passe pendant la transition : oui (action à faire par toi).
- Étape 2 validée.
- Échantillon : accord de principe (~18 € + port), **uniquement après** validation du fournisseur, du coût total, du modèle exact et des documents. Aucun achat sans accord final sur le montant.

### 2026-10-27 — Étape 2 : Remise à zéro ✅ (sauf 1 point manuel)
- 5 produits **archivés** (réversible : Produits › filtre Archivé › Définir comme brouillon) :
  Cloud — Canapé design gris (était ACTIF à 0 €), SOVRY Ligne — Lit escamotable, Plaid chauffant USB zip, Kit crochet Capybara, Plaid chauffant velours XL.
- Menu principal : remplacé par **Accueil** + **Aide & Contact**. L'ancien contenu est noté plus bas (« État constaté »).
- Pages **dépubliées** (pas supprimées) : Notre Histoire, FAQ, Livraison, Retours. Aide & Contact reste en ligne, Conseils était déjà masquée.
- Thème de travail créé : **SOVRY-plaid-2026** (id 208178872663, non publié). Le thème actif Horizon n'a pas été modifié.
- ⚠️ **Retrait de la collection « Canapés design » refusé par le connecteur** (règle de sécurité). Elle est vide côté client, puisque son produit est archivé. À faire par toi : Produits › Collections › Canapés design › Canaux de vente › décocher Boutique en ligne et Shop.

### 2026-10-27 — Étape 3 : Sourcing (1er tour) ✅ → `sovry/fournisseurs.md`
- Alibaba et Global Sources bloquent la lecture automatique. Aucun navigateur réel (Chrome ou contrôle d'ordinateur) n'est disponible dans cette session cloud. Le blocage n'a pas été contourné : l'analyse repose sur ton brief et des sources web publiques.
- Notes provisoires : CJ (canal de lancement) 7,5 · Mydays 7 · Heatmate 5 · Maxtop 4,5 · Texpro 4 · Lixiang 4 · marques UE 3 · Ningbo 3 · AliExpress Local Depot 2 (écartée).
- Décision proposée : lancement via **CJ, stock à Francfort**, avec Mydays en parallèle (stockage possible chez CJ DE).
- Correctif réglementaire : la LVD ne s'applique pas en 5 V. On exige à la place la DoC EMC+RoHS, le rapport EN 60335-2-17, UN38.3/MSDS et la personne responsable GPSR.
- Messages fournisseurs en anglais rédigés (Mydays, Heatmate, CJ Sourcing).

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
### Toi
- [ ] Mettre la boutique sous mot de passe : Boutique en ligne › Préférences › Protection par mot de passe
- [ ] Retirer « Canapés design » des canaux Boutique en ligne et Shop
- [ ] Envoyer les messages A (Mydays) et B (Heatmate) sur Alibaba
- [ ] Créer un compte CJ Dropshipping (gratuit), envoyer le message C via « Sourcing », chercher « heated blanket USB » avec le filtre entrepôt DE, et me coller les liens et les prix
- [ ] Me coller les réponses des fournisseurs (et les PDF des certificats)
### Moi
- [ ] Étape 3 : notes définitives dès réception des réponses et documents
- [ ] Lire le Google Doc « SOVRY – Rapport sourcing plaid » produit par la session Claude Desktop (prompt : sovry/PROMPT-recherche-auto.md)
- [ ] Étape 5 (préparable dès maintenant) : noms + domaines, page produit, pages légales, prix, offres BF, flux Merchant Center
- [ ] Étape 4 : connexion du fournisseur à Shopify
- [ ] Étape 5 : boutique mono-produit
- [ ] Étape 6 : check-list de lancement
