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
3. Dans Stripe, active le portail client : Paramètres → Facturation → Portail client → **Enregistrer**. C'est lui qui permet à tes clients de résilier et de télécharger leurs factures.

C'est tout. Les 3 abonnements sont créés automatiquement dans Stripe à la première vente : tu n'as aucun produit à configurer.

### Optionnel
- `PORTAL_LOGIN_URL` : le lien de connexion du portail client Stripe (disponible dans la même page de Stripe). Il permet à un client qui a récupéré son accès sur un nouvel appareil de gérer son abonnement.
- Nom de domaine perso : Cloudflare → ton Worker → Paramètres → Domaines.
- Modifier les prix : `src/plans.js` (en centimes).
- Boutiques scannées par le radar : `src/seeds.js`.
- **À faire avant de vendre** : complète les `[À COMPLÉTER]` dans `public/mentions-legales.html`, `public/cgv.html` et `public/confidentialite.html`.

## Développement local

```bash
npm install
npm test                        # 17 tests (moteur, sécurité, Stripe simulé)
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
