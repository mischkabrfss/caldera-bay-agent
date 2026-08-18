# SOLEVA™ — configuration de la boutique Shopify

Boutique : `s70d0u-qg.myshopify.com` · France · EUR · Europe/Paris
Thème live : **Helio** · Thème de travail créé : **SOLEVA — Boutique** (dupliqué, non publié)

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
- **Menu principal** : Accueil · Le sac SOLEVA™ · Boutique · Aide (5 sous-entrées) · À propos
- **Pied de page** : contact, FAQ, livraison, suivi, retours, expédition, CGV, mentions légales, confidentialité

---

## 2. Fichier de thème à appliquer

`shopify/theme/templates/index.json` — page d'accueil réécrite aux couleurs SOLEVA™
(14 blocs de texte : titre principal, boutons, image + texte, citation, carrousel des
3 bénéfices).

**Comment l'appliquer** — le thème live ne peut pas être écrit par API, un duplicata
a donc été préparé :

1. Boutique en ligne → Thèmes → **SOLEVA — Boutique** → ⋯ → Modifier le code
2. Ouvrir `templates/index.json`
3. Remplacer tout le contenu par celui de ce fichier, Enregistrer
4. Prévisualiser, puis Publier quand le rendu convient

Le thème **Helio** actuellement en ligne n'est pas touché tant que vous ne publiez pas.

---

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
