# SOLEVA™ — configuration de la boutique Shopify

Boutique : `s70d0u-qg.myshopify.com` · France · EUR · Europe/Paris
Thème live : **SOLEVA — Boutique** · Brouillon en cours : **SOLEVA — Boutique v2**

> **Boucle de travail.** L'API interdit toute écriture sur le thème publié. Chaque série
> de modifications part donc dans un duplicata (`v2`, puis `v3`…) que vous prévisualisez
> et publiez. Pour éviter ce va-et-vient, gardez un thème de travail non publié et ne
> publiez qu'une fois satisfait.

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
| Laisser un avis | `/pages/laisser-un-avis` |
| Origine de nos avis | `/pages/avis-clients` |

Les textes juridiques sont rédigés pour le droit français : rétractation L221-18,
garantie de conformité L217-3, livraison L216-1, médiation L612-1, LCEN, RGPD.

### Navigation
- **Menu principal** : Accueil · Le sac SOLEVA™ · Nous contacter
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
| `sections/soleva-product.liquid` | fiche produit : galerie, sélecteurs, panier, dépliants |
| `assets/soleva-product.css` | styles de la fiche produit |
| `snippets/soleva-logo.liquid` | symbole et logotype SOLEVA en SVG |
| `assets/soleva-anim.css` | animations avancées : révélations, brillance, barre de progression |
| `assets/soleva-anim.js` | découpe des titres en mots, lecteur vidéo, notation en étoiles |
| `sections/soleva-gallery.liquid` | mosaïque photo avec révélation au scroll |
| `sections/soleva-video.liquid` | vidéo de démonstration + 3 étapes |
| `sections/soleva-review-form.liquid` | formulaire d'avis avec notation en étoiles |
| `assets/soleva-x.css` | carrousel, barre d'achat fixe, soulignement des titres |
| `assets/soleva-x.js` | carrousel, barre d'achat, inclinaison des cartes, parallaxe du hero |
| `templates/index.json` | page d'accueil assemblée (6 sections) |
| `templates/page.contact.json` | page contact dans la même direction artistique |
| `templates/product.json` | fiche produit assemblée (produit + vidéo + galerie + avis + bandeau) |
| `templates/page.laisser-un-avis.json` | page de dépôt d'avis |

**Page d'accueil, dans l'ordre :** hero plein écran → Bienvenue chez SOLEVA →
bandeau parallaxe « N'hésitez pas à nous écrire » → Tout pour vos baskets (4 cartes,
bloc image + texte, bandeau défilant) → Ils nous font confiance (avis) →
bandeau final « Commander le sac SOLEVA ».

Quatre boutons mènent de l'accueil à la fiche produit : hero, section Bienvenue,
bloc image + texte, et bandeau final.

**Page produit** — **carrousel** plein cadre : glissement au doigt, flèches au survol,
pastilles de progression, compteur de photos, navigation au clavier, vignettes
synchronisées, et saut automatique à la bonne photo quand on change de coloris.
Pastille « Best-seller », prix avec prix barré et pourcentage de remise calculé
automatiquement,
sélecteurs **Couleur** et **Format** en pastilles (les combinaisons en rupture se
barrent toutes seules), sélecteur de quantité, bouton d'ajout au panier, bandeau de
réassurance à 4 entrées, trois dépliants (mode d'emploi, compatibilité, livraison et
retours). Le bloc d'achat reste collé en haut au défilement sur grand écran, et une
**barre d'achat fixe** apparaît en bas de l'écran sur mobile dès que le bouton principal
sort du champ.

Sous le bloc d'achat, le pavé de texte a été remplacé par une **section vidéo** avec
trois étapes courtes en dessous, puis une **mosaïque de 7 photos** qui se révèlent au
scroll, puis les avis et un bandeau contact. La description longue reste enregistrée sur
le produit (utile pour le référencement) mais n'est plus affichée : un simple interrupteur
« Afficher la description complète » la remet si besoin.

La section vidéo accepte une vidéo téléversée dans Contenu → Fichiers, ou un lien YouTube
ou Vimeo. Tant qu'aucune vidéo n'est fournie, l'emplacement affiche la marche à suivre
plutôt qu'un trou.

**Photos** — les 8 visuels du fournisseur ont été remplacés par les vôtres. Chaque coloris
est associé à sa photo : choisir Bleu Océan fait défiler le carrousel jusqu'à la bonne
image. La mosaïque affiche 6 photos légendées, dont les deux avant / après en pleine
largeur.

**Animations** — zoom lent sur le hero, apparitions échelonnées au scroll, parallaxe sur
les bandeaux image, bandeau de réassurance défilant en boucle, survols avec élévation sur
les cartes, flèche de défilement animée, compteur sur la note moyenne, barre de
progression de lecture en haut de page, révélation des photos par volet montant,
brillance qui balaie les boutons au survol, titres qui apparaissent mot par mot,
défilement fluide sur les ancres, halo pulsé sur le bouton de lecture vidéo, contenu du
hero qui s'éloigne et s'estompe au défilement, trait qui se dessine sous chaque titre de
section, inclinaison légère des cartes suivant la souris, pulsation du prix à chaque
changement de variante, pastilles du carrousel qui s'étirent, barre d'achat qui remonte
en glissant. Tout est désactivé automatiquement si le visiteur a activé « réduire les
animations ».

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

### Le dépôt d'avis fonctionne déjà
La page **`/pages/laisser-un-avis`** est en ligne et reliée au bouton « Laisser un avis »
des deux sections d'avis, ainsi qu'au pied de page. Elle contient un vrai formulaire :
notation en étoiles cliquable, prénom, e-mail, numéro de commande, texte de l'avis.
L'envoi arrive dans la boîte de réception de la boutique via le formulaire de contact
Shopify — aucune application requise.

### La section d'avis s'adapte toute seule
Tant qu'aucun avis réel n'est saisi, elle affiche « Soyez le premier à donner votre avis »
avec le bouton de dépôt, et masque la note moyenne — pas de cartes vides ni de note
inventée. Dès qu'un bloc « Avis » contient un vrai texte, les cartes et la note
apparaissent automatiquement et le message d'administration disparaît.

### Afficher un avis repris d'ailleurs — la règle
Chaque bloc « Avis » a un champ **Provenance**, affiché sous le texte de l'avis. Un avis
d'un acheteur du même modèle sur une autre plateforme est parfaitement publiable, à une
condition : la provenance doit être **lisible à côté de l'avis**, pas rangée dans une page
de politiques. L'article L111-7-2 du Code de la consommation impose que l'information sur
l'origine et le contrôle des avis figure à proximité des avis eux-mêmes — c'est cette
visibilité qui rend la pratique légale, et la dissimuler la rendrait trompeuse.

Trois éléments couvrent cette obligation :
1. Le champ **Provenance** sur chaque avis (« Client SOLEVA · achat vérifié », ou le nom
   de la plateforme d'origine).
2. Le paragraphe **Provenance des avis** affiché juste au-dessus des cartes.
3. La page **`/pages/avis-clients`** qui détaille sources, vérifications, délai de
   publication, calcul de la moyenne et procédure de signalement.

Cette page décrit une méthode que vous devez réellement appliquer : si vos pratiques
diffèrent, adaptez-la avant publication.

### Pour importer les avis existants du produit — Judge.me

1. Applications → rechercher **Judge.me Product Reviews** → Installer (offre gratuite).
2. Dans Judge.me : *Import reviews* → coller l'URL AliExpress du produit → importer.
   Cela récupère les avis réels d'acheteurs de ce produit, avec leurs photos.
3. Vérifier les avis importés et supprimer ceux qui ne sont pas exploitables.
4. Activer la demande d'avis automatique après achat, pour vos propres clients.
5. Deux options d'affichage :
   - garder la section SOLEVA et y recopier les meilleurs avis à la main ;
   - ou remplacer la section par le widget Judge.me, qui se met à jour tout seul.
6. Une fois de vrais avis en place, décocher **Afficher l'avertissement** dans l'éditeur
   et ajuster la note moyenne.

Ce qui n'a pas été fait, et ne peut pas l'être depuis ici : aller chercher les avis
réels du produit sur AliExpress ou CJ. Le proxy réseau de la session bloque ces domaines.
L'import Judge.me ci-dessus est la voie la plus rapide ; sinon, collez les avis et ils
seront intégrés en quelques minutes.

Le badge « Google Avis » avec une note et un nombre d'avis n'a pas été mis non plus. Il suppose une fiche Google Business Profile, que SOLEVA n'a pas encore.
Créez la fiche, collectez de vrais avis, puis branchez une application d'avis Google —
le bandeau sombre est déjà dimensionné pour l'accueillir.

Publier des avis inventés ou repris d'une autre boutique est sanctionné par
l'article L121-2 du Code de la consommation et la directive Omnibus (jusqu'à 300 000 €
d'amende et 10 % du chiffre d'affaires), et vaut fermeture de boutique chez Shopify.

---

## 5. Logo

Trois fichiers dans `shopify/brand/` :

| Fichier | Usage |
|---|---|
| `soleva-logo.svg` | symbole seul, encre sur fond transparent — logo d'en-tête |
| `soleva-favicon.svg` | symbole vert sur pastille encre — favicon |
| `soleva-lockup.svg` | symbole + logotype SOLEVA — signature, documents, réseaux |

Le symbole reprend le motif du lavage : un anneau, deux vagues et trois bulles. Il est
déjà utilisé en version vectorielle dans le hero via `snippets/soleva-logo.liquid`,
donc il reste net à toutes les tailles sans rien charger.

Pour le mettre en en-tête : Personnaliser → En-tête → Logo → téléverser `soleva-logo.svg`.
Pour le favicon : Personnaliser → Paramètres du thème → Favicon → `soleva-favicon.svg`.
Le logotype `soleva-lockup.svg` utilise la police Playfair Display, avec Georgia en
solution de repli si la police n'est pas installée sur le poste qui l'ouvre.
