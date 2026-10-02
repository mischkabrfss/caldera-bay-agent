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

## Montée en charge (1 000+ visiteurs simultanés)

- Pages, images et scripts : servis par le CDN de Cloudflare, sans limite.
- Analyses : chaque boutique est chargée **une seule fois** même si 1 000 personnes la demandent en même temps (verrou en cache), puis gardée en cache (audit 30 min, espion et radar 6 h).
- Radar et espion : passé ce délai, l'ancien résultat est servi tout de suite pendant qu'un seul rafraîchissement tourne en arrière-plan.
- Boutique introuvable : réponse gardée 2 min (pas de nouvel essai à chaque visiteur).
- Mémoire : 4 catalogues au plus chargés en même temps par instance, les autres patientent.
- Anti-abus : 20 analyses par minute et par IP (limiteur Cloudflare `LIMITER`, gratuit, déjà dans `wrangler.jsonc`).
- Stripe : délai maximal de 10 s et seconde tentative sur les lectures ; l'appli relance d'elle-même une requête en cas de coupure ou de saturation passagère.
- Test : `npm test` vérifie que 300 analyses simultanées de la même boutique ne font qu'un seul chargement Shopify.

**Offre Cloudflare conseillée dès le lancement : Workers Paid (5 $/mois).** L'offre gratuite limite à 100 000 appels d'API par jour et à 10 ms de calcul par requête : la connexion par mot de passe (hachage sécurisé) et l'audit des gros catalogues peuvent dépasser ce temps. L'offre payante passe à 10 millions de requêtes par mois et 30 s de calcul, sans rien changer au code.

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
