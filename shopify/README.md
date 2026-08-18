# SOLEVA™ — configuration de la boutique Shopify

Boutique : `s70d0u-qg.myshopify.com` · France · EUR · Europe/Paris
Thème live : **Helio** · Thème sur mesure prêt à publier : **SOLEVA — Boutique**

---

## 1. Ce qui est déjà en place dans Shopify

### Produit
`Sac de Lavage Chaussures SOLEVA™ — Lavez vos baskets en machine sans les abîmer`
Handle : `/products/sac-de-lavage-chaussures-soleva`

- Description réécrite en français sous forme de landing page complète : accroche, constat,
  solution, 4 bénéfices, mode d'emploi en 3 étapes, tableau comparatif, section
  compatibilité (ce qui va / ne va pas en machine), caractéristiques, FAQ, réassurance.
- Vendor `SOLEVA`, type `Entretien de chaussures`, 6 tags.
- SEO titre + méta-description renseignés.
- Textes alternatifs rédigés sur les 8 images (accessibilité + référencement image).

### Variantes — restructurées en grille 3 × 2
L'option unique `Color` (6 valeurs mélangeant couleur et quantité) a été remplacée par
deux options croisées :

| | 1 sac | Lot de 2 (-33 %) |
|---|---|---|
| Gris Ardoise | 24,90 € (barré 39,90 €) | 39,90 € (barré 79,80 €) |
| Bleu Ocean | 24,90 € (barré 39,90 €) | 39,90 € (barré 79,80 €) |
| Gris & Bleu | 24,90 € (barré 39,90 €) | 39,90 € (barré 79,80 €) |

Les prix d'origine étaient incohérents (10,99 € à 29,99 € pour le même produit).
Cette grille est une proposition : ajustez-la librement, la structure reste valable.

### Collections
- `Best-sellers` — automatique, sur le tag `best-seller`
- `Entretien de chaussures` — automatique, sur le type de produit

### Pages créées
| Page | URL |
|---|---|
| À propos de SOLEVA™ | `/pages/a-propos` |
| Questions fréquentes | `/pages/faq` |
| Livraison et délais | `/pages/livraison` |
| Suivi de commande | `/pages/suivi-de-commande` |
| Retours et remboursement | `/pages/politique-de-remboursement` |
| Politique d'expédition | `/pages/politique-expedition` |
| Conditions générales de vente | `/pages/cgv` |
| Mentions légales | `/pages/mentions-legales` |
| Nous contacter (refonte) | `/pages/contact` |

Les textes juridiques sont rédigés pour le droit français : rétractation L221-18,
garantie de conformité L217-3, livraison L216-1, médiation L612-1, LCEN, RGPD.

### Navigation
- **Menu principal** : Accueil · Le sac SOLEVA™ · Contact
- **Pied de page** : contact, FAQ, livraison, suivi, retours, expédition, CGV, mentions légales, confidentialité

---

## 2. Thème sur mesure « SOLEVA — Boutique »

Le thème live (Helio) n'est pas modifiable par API. Un duplicata **SOLEVA — Boutique**
a été créé et reçoit tout le design sur mesure. 12 fichiers y ont été écrits :

| Fichier | Rôle |
|---|---|
| `assets/soleva.css` | design system complet + animations |
| `assets/soleva.js` | apparitions au scroll, parallaxe, carrousel d'avis, compteur |
| `snippets/soleva-head.liquid` | chargement des assets, garde anti-double-exécution |
| `snippets/soleva-icon.liquid` | jeu d'icônes SVG |
| `sections/soleva-hero.liquid` | hero plein écran, image animée Ken Burns, logo, 2 boutons |
| `sections/soleva-intro.liquid` | bandeau de bienvenue |
| `sections/soleva-features.liquid` | cartes d'atouts, bloc image + texte, bandeau défilant |
| `sections/soleva-band.liquid` | bandeau image parallaxe avec appel à l'action |
| `sections/soleva-reviews.liquid` | section avis sur fond sombre, carrousel, note moyenne |
| `sections/soleva-contact.liquid` | formulaire de contact + blocs d'information |
| `templates/index.json` | page d'accueil assemblée (6 sections) |
| `templates/page.contact.json` | page contact dans la même direction artistique |

**Page d'accueil, dans l'ordre :** hero plein écran → Bienvenue chez SOLEVA →
bandeau parallaxe « N'hésitez pas à nous écrire » → Tout pour vos baskets (4 cartes,
bloc image + texte, bandeau défilant) → Ils nous font confiance (avis) →
bandeau final « Commander le sac SOLEVA ».

Quatre boutons mènent de l'accueil à la fiche produit : hero, section Bienvenue,
bloc image + texte, et bandeau final.

**Animations** — zoom lent sur le hero, apparitions échelonnées au scroll, parallaxe
sur les bandeaux image, bandeau de réassurance défilant en boucle, survols avec
élévation sur les cartes, flèche de défilement animée, compteur sur la note moyenne.
Tout est désactivé automatiquement si le visiteur a activé « réduire les animations ».

Chaque texte, image, bouton et avis est un réglage éditable dans
**Boutique en ligne → Thèmes → SOLEVA — Boutique → Personnaliser**.

**À faire :** prévisualiser le thème, choisir les images dans l'éditeur, puis publier.
Les images actuelles sont celles du fournisseur déjà présentes dans la boutique — elles
sont référencées par défaut mais remplaçables en deux clics dans chaque section.

## 3. À faire côté administration (non accessible par API)

### Obligatoire avant ouverture
- [ ] **Renommer la boutique** en `SOLEVA` — Paramètres → Détails de la boutique → Nom.
      (Le nom de boutique est en lecture seule dans l'API Admin.)
- [ ] **Coller les politiques de paiement** — Paramètres → Politiques. Reprendre le texte
      des pages `/pages/politique-de-remboursement`, `/pages/politique-expedition`,
      `/pages/cgv` et `/pages/mentions-legales`. Le scope `write_legal_policies` n'est pas
      accordé à cette connexion, ces textes doivent être copiés manuellement pour
      apparaître au moment du paiement.
- [ ] **Compléter tous les champs `[À COMPLÉTER]`** : raison sociale, SIRET, TVA, adresse
      postale, e-mail de contact, médiateur de la consommation, délais et frais de
      livraison réels. Ces mentions sont légalement obligatoires en France.
- [ ] **Passer du plan d'essai à un plan payant** — obligatoire pour encaisser.
- [ ] Configurer les zones et tarifs d'expédition — Paramètres → Expédition et livraison.
- [ ] Activer un bandeau cookies conforme (consentement préalable, refus aussi simple
      que l'acceptation).

### Domaine
Le rattachement d'un domaine n'est pas non plus modifiable par API.
Paramètres → Domaines :
- **Acheter un domaine** depuis Shopify (le plus simple, DNS auto-configuré), ou
- **Connecter un domaine existant** : pointer l'enregistrement `A` sur `23.227.38.65`
  et le `CNAME` `www` sur `shops.myshopify.com`, puis définir le domaine principal.

Un plan payant est requis dans les deux cas.

---

## 4. Avis clients

Aucun avis n'a été créé. Reprendre les avis Google d'une autre boutique reviendrait à
publier de faux avis : c'est interdit par l'article L121-2 du Code de la consommation et
la directive Omnibus (jusqu'à 300 000 € d'amende et 10 % du chiffre d'affaires), et c'est
un motif de fermeture de boutique chez Shopify.

Options légitimes :
1. **Judge.me / Loox / Fera** (gratuit au démarrage) — collecte automatique des avis
   après achat, et import possible des avis réels du produit chez le fournisseur.
2. **Avis vérifiés / Trustpilot** — plus crédible, payant.
3. Démarrage sans avis, avec la garantie 30 jours en réassurance le temps des premières
   commandes.
