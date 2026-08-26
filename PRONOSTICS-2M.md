# PRONOSTICS 2M

Plateforme VIP de pronostics sportifs. Projet **autonome** dans le dossier `pronostics2m/`,
déployé séparément sur Cloudflare Workers. Le site Nexora, à la racine du dépôt, n’est pas
touché et continue de vivre sa vie.

## Lancer en local

```bash
pnpm install
cd pronostics2m
cp .dev.vars.example .dev.vars   # puis remplir les valeurs
pnpm dev
```

## Carte du site

| Page | Rôle |
| --- | --- |
| `/` | Accueil (hero, offres, fonctionnement) |
| `/vip` | Les 3 formules, bascule mensuel / à vie, départ paiement |
| `/inscription`, `/connexion` | Compte client |
| `/compte` | Espace membre : abonnement, espaces VIP, statistiques |
| `/compte/profil` | Nom, email, mot de passe, historique de paiement, portail Stripe |
| `/vip/safe`, `/vip/premium`, `/vip/grosse-cote` | Espaces VIP (verrouillés côté serveur) |
| `/historique` | Historique filtrable + statistiques calculées |
| `/faq`, `/contact`, `/conditions` | Pages publiques |
| `/admin` | Tableau de bord (utilisateurs, abonnements, CA, stats) |
| `/admin/pronostics` | Liste, ajout, modification, suppression |
| `/admin/utilisateurs`, `/admin/abonnements`, `/admin/messages` | Gestion |

## Accès VIP

Le contrôle est **côté serveur** (`lib/access.ts`) : `requireVip()` vérifie qu’un abonnement
est `active` et non expiré avant de rendre la page. Modifier l’URL ne donne aucun accès.
Un abonné peut cumuler plusieurs VIP : chaque espace est indépendant.

Un abonnement n’est jamais activé par un clic sur le bouton de paiement — seule la
confirmation Stripe (webhook) passe le statut à `active`. Quand la période mensuelle
expire, l’espace se re-verrouille automatiquement.

## Base de données

D1 (binding `DB`). Le schéma est créé automatiquement au premier accès (`lib/db.ts`) :
`users`, `vip_products`, `subscriptions`, `payments`, `predictions`, `prediction_legs`,
`messages`. Les mots de passe sont stockés en PBKDF2-SHA256 (100 000 itérations) — jamais
en clair, ni lisibles depuis l’administration.

## Variables d’environnement

| Variable | Rôle |
| --- | --- |
| `SESSION_SECRET` | Signature des cookies de session (chaîne longue et aléatoire) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Secret du endpoint webhook (`whsec_…`) |
| `PUBLIC_SITE_URL` | URL publique du site, sans slash final |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Compte administrateur, créé à la première connexion |

En local : fichier `.dev.vars`. En production : `wrangler secret put <NOM>`.

## Déployer sur Cloudflare (gratuit)

```bash
cd pronostics2m

# 1. se connecter (ouvre le navigateur, une seule fois)
npx wrangler login

# 2. créer la base de données
npx wrangler d1 create pronostics2m
#    → copier le database_id renvoyé dans wrangler.jsonc

# 3. enregistrer les secrets
npx wrangler secret put SESSION_SECRET
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put PUBLIC_SITE_URL   # ex. https://pronostics2m.<compte>.workers.dev

# 4. déployer
pnpm deploy
```

Le site est alors en ligne sur `https://pronostics2m.<compte>.workers.dev`.

### Brancher un vrai nom de domaine plus tard

Ajouter le domaine dans Cloudflare (Websites → Add a site), puis dans le Worker :
Settings → Domains & Routes → Add custom domain. Mettre ensuite `PUBLIC_SITE_URL` à jour
et redéployer.

## Webhook Stripe

Endpoint à déclarer dans le dashboard Stripe : `https://<domaine>/api/stripe/webhook`

Événements écoutés : `checkout.session.completed`, `invoice.paid`,
`invoice.payment_failed`, `customer.subscription.updated`,
`customer.subscription.deleted`. La signature est vérifiée à chaque appel.

## Compte administrateur

Renseignez `ADMIN_EMAIL` et `ADMIN_PASSWORD`, puis connectez-vous une fois : le compte est
créé (ou promu) automatiquement et redirigé vers `/admin`.

## Publier un pronostic (sans toucher au code)

`/admin` → **Ajouter un pronostic** → catégorie VIP, type, date, match, pari, cote,
analyse, confiance, statut → *Publier*. Il apparaît immédiatement dans l’espace des abonnés
de cette catégorie. Les montantes / combinés / grosses cotes se remplissent via les blocs
« sélections » : la cote totale est calculée automatiquement (sélections annulées exclues).
Un pronostic déjà publié se modifie à tout moment ; sa date de publication est conservée.
