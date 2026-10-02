# Shoplift : SaaS d'audit Shopify et de recherche produit

- **Page de vente** animée, pensée pour mobile : `/`
- **Application** : `/app`
  - audit de boutique (score sur 100, 6 catégories, plan d'action avec le pourquoi et le comment) ;
  - note de chaque fiche produit ;
  - espion concurrents ;
  - radar de produits gagnants ;
  - comparateur de boutiques et export CSV.
- **4 offres** : Test (gratuit, 1 analyse), Basique à 19 €, Pro à 49 € et Scale à 99 € par mois, via un abonnement Stripe.
- **Coût** : 0 €. Hébergement sur Cloudflare Workers (offre gratuite), sans base de données et sans IA payante.
- **Connexion Shopify** : le client colle simplement l'adresse de sa boutique. On lit ses données publiques : aucune app à installer, aucun compte Shopify Partner nécessaire.

## Mise en ligne (une seule fois, environ 5 minutes)

1. Clique sur le bouton ci-dessous et connecte-toi à Cloudflare (compte gratuit) :

   [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mischkabrfss/caldera-bay-agent/tree/claude/pensive-keller-yre2ua/shoplift)

2. Quand Cloudflare demande `STRIPE_SECRET_KEY`, colle ta clé secrète Stripe :
   - `sk_test_…` pour tester (carte de test `4242 4242 4242 4242`) ;
   - `sk_live_…` pour vendre.

   Tu la trouves dans Stripe → Développeurs → Clés API.
3. Dans Stripe (5 minutes) :
   - **Portail client** : Paramètres → Facturation → Portail client → **Enregistrer**. Il permet à tes clients de résilier, changer de carte et télécharger leurs factures.
   - **Reçus automatiques** : Paramètres → E-mails clients → coche « Paiements réussis » et « Remboursements ». Chaque client reçoit sa facture par e-mail.
   - **Moyens de paiement** : Paramètres → Moyens de paiement → active Apple Pay et Google Pay (la page de vente les annonce).

C'est tout. Les 3 abonnements sont créés automatiquement dans Stripe à la première vente : tu n'as aucun produit à configurer.

### Si le bouton de déploiement ne marche pas
Depuis un ordinateur avec Node.js, dans le dossier `shoplift/` :
```bash
npm install
npx wrangler deploy                         # ouvre la connexion Cloudflare la 1re fois
npx wrangler secret put STRIPE_SECRET_KEY   # colle ta clé Stripe
```

### Optionnel
- `PORTAL_LOGIN_URL` : le lien de connexion du portail client Stripe (disponible dans la même page de Stripe). Il permet à un client qui a récupéré son accès sur un nouvel appareil de gérer son abonnement.
- Nom de domaine perso : Cloudflare → ton Worker → Paramètres → Domaines.
- Modifier les prix : `src/plans.js` (en centimes).
- Boutiques scannées par le radar : `public/seeds.js` (puis `npm run snapshot` pour l’aperçu).
- **À faire avant de vendre** : complète les `[À COMPLÉTER]` dans `public/mentions-legales.html`, `public/cgv.html` et `public/confidentialite.html`.

## Connexion des clients (tous appareils)
- Après le paiement, le client choisit un mot de passe (fenêtre de bienvenue ou onglet Compte).
- Le mot de passe est haché (PBKDF2-SHA256, 100 000 itérations, sel aléatoire) et rangé dans la fiche client **Stripe** (`metadata.sl_pw`) : aucune base de données à gérer.
- Connexion : e-mail + mot de passe, n'importe quel appareil. Mot de passe oublié : e-mail + 4 derniers chiffres de la carte, puis nouveau mot de passe.

## Agents de sourcing
- Liste dans `public/agents.js` (1 agent en Basique, 3 en Pro, 10 en Scale). Le fichier n'est jamais servi tel quel : le serveur le bloque et ne renvoie que les agents de l'offre du client (`/api/agents`).
- Coordonnées vérifiées le 30/09/2026 : e-mails et adresses sur les fiches officielles du Shopify App Store, numéros WhatsApp/téléphone sur les sites officiels. À revérifier de temps en temps (les agents peuvent changer de numéro).

## Montée en charge, 100 % gratuit (offre Cloudflare Free)

Conçu pour tenir dans les limites gratuites de Cloudflare : 10 ms de calcul par requête, 100 000 appels d'API par jour, 50 sous-requêtes.

- Pages, images et scripts : servis par le CDN de Cloudflare, gratuits et illimités (ne comptent pas dans les 100 000).
- Seule exception : la page d'accueil passe par le Worker (quelques microsecondes) pour donner aux réseaux sociaux l'adresse complète de l'image d'aperçu. `robots.txt` et `sitemap.xml` sont générés avec la vraie adresse du site.
- Une seule requête au démarrage de l'appli (`/api/me` renvoie aussi la configuration).
- Audit : 150 fiches analysées en détail (les plus récentes), le vrai nombre de produits affiché. Environ 4 à 11 ms de calcul la première fois, environ 1 ms ensuite (résultat en cache 30 min).
- Espion et comparateur : 100 fiches par boutique, environ 3 à 9 ms, puis cache 6 h servi tout de suite pendant le rafraîchissement.
- Radar : une tâche planifiée relit **une** boutique toutes les 7 minutes (chacune environ toutes les 5 h 20), environ 5 ms. Le résultat est rangé dans KV (`DATA`), créé automatiquement au premier déploiement. Les visiteurs ne font qu'une lecture. Avant le premier passage, ce sont les vrais produits du dernier relevé figé qui s'affichent.
- Pics de trafic : une boutique n'est chargée qu'une fois même si 1 000 personnes la demandent en même temps. Au plus 4 catalogues sont en mémoire par instance. Une boutique introuvable est gardée en mémoire 2 min.
- Cache : le cache Cloudflare agit avec un nom de domaine. Sur l'adresse gratuite `*.workers.dev`, une mémoire locale de chaque instance prend le relais (50 derniers résultats).
- Anti-abus (limiteurs Cloudflare gratuits, déjà dans `wrangler.jsonc`) :
  - 20 analyses par minute et par IP ;
  - 3 essais de connexion ou de récupération par minute et par e-mail.
- Mots de passe : empreinte PBKDF2 liée à un secret du serveur généré automatiquement au premier démarrage et gardé dans KV, environ 2 ms. Rien à configurer.
- Quotas KV gratuits : environ 400 écritures sur 1 000 et quelques milliers de lectures sur 100 000 par jour.
- Plus tard, si le trafic dépasse 100 000 appels d'API par jour : offre Workers Paid à 5 $/mois, sans rien changer au code.

## Développement local

```bash
npm install
npm test                        # 24 tests (moteur, sécurité, Stripe simulé)
node test/mock-shop.mjs &       # faux Shopify local
printf 'DEV_UNLOCK=true\nSHOPIFY_MOCK=http://127.0.0.1:8790\n' > .dev.vars
npm run dev                     # http://localhost:8787 (/api/dev-login?plan=scale pour tout débloquer)
```

## Comment ça marche

| Fichier | Rôle |
|---|---|
| `src/worker.js` | API et sert le site statique |
| `src/shopify.js` | Lecture des données publiques Shopify (`/products.json`, `/meta.json`, page d'accueil, best-sellers, politiques) |
| `src/analyze.js` | Moteur d'analyse (plus de 30 règles d'expert, score produit gagnant) |
| `src/stripe.js` | Abonnements (Checkout, changement d'offre au prorata, portail, récupération d'accès) |
| `src/auth.js` | Sessions signées HMAC : pas de base de données |
| `public/` | Front en HTML/CSS/JS vanilla |

L'accès payant est vérifié auprès de Stripe toutes les 12 h. Un abonnement annulé ou impayé repasse automatiquement en offre Test.
