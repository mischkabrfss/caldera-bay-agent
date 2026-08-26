# PRONOSTICS 2M

Plateforme VIP de pronostics sportifs, montée dans ce dépôt **à côté** du site Nexora
(qui reste intact à la racine `/`). Tout PRONOSTICS 2M vit sous `/2m`.

## Carte du site

| Page | Rôle |
| --- | --- |
| `/2m` | Accueil (hero, offres, fonctionnement) |
| `/2m/vip` | Les 3 formules, bascule mensuel / à vie, départ paiement |
| `/2m/inscription`, `/2m/connexion` | Compte client |
| `/2m/compte` | Espace membre : abonnement, espaces VIP, stats |
| `/2m/compte/profil` | Nom, email, mot de passe, historique de paiement, portail Stripe |
| `/2m/vip/safe`, `/2m/vip/premium`, `/2m/vip/grosse-cote` | Espaces VIP (verrouillés côté serveur) |
| `/2m/historique` | Historique filtrable + statistiques calculées |
| `/2m/faq`, `/2m/contact`, `/2m/conditions` | Pages publiques |
| `/2m/admin` | Tableau de bord (utilisateurs, abonnements, CA, stats) |
| `/2m/admin/pronostics` | Liste, ajout, modification, suppression |
| `/2m/admin/utilisateurs`, `/2m/admin/abonnements`, `/2m/admin/messages` | Gestion |

## Accès VIP

Le contrôle est **côté serveur** (`lib/access.ts`) : `requireVip()` vérifie qu’un abonnement
est `active` et non expiré avant de rendre la page. Modifier l’URL ne donne aucun accès.
Un abonné peut cumuler plusieurs VIP : chaque espace est indépendant.

Un abonnement n’est jamais activé par un clic sur le bouton de paiement — seule la
confirmation Stripe (webhook) passe le statut à `active`.

## Variables d’environnement

| Variable | Rôle |
| --- | --- |
| `SESSION_SECRET` | Signature des cookies de session (chaîne longue et aléatoire) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Secret du endpoint webhook (`whsec_…`) |
| `PUBLIC_SITE_URL` | URL publique du site, sans slash final |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Compte administrateur, créé à la première connexion |

En local : fichier `.dev.vars` (non versionné). En production : les secrets de l’hébergeur.

## Base de données

D1 (binding `DB`, déclaré dans `.openai/hosting.json`). Le schéma est créé automatiquement
au premier accès (`lib/db.ts`) : `users`, `vip_products`, `subscriptions`, `payments`,
`predictions`, `prediction_legs`, `messages`. Les mots de passe sont stockés en PBKDF2-SHA256
(100 000 itérations) — jamais en clair.

## Webhook Stripe

Endpoint à déclarer dans le dashboard Stripe : `https://<domaine>/2m/api/stripe/webhook`

Événements écoutés : `checkout.session.completed`, `invoice.paid`,
`invoice.payment_failed`, `customer.subscription.updated`,
`customer.subscription.deleted`. La signature est vérifiée à chaque appel.

## Compte administrateur

Renseignez `ADMIN_EMAIL` et `ADMIN_PASSWORD`, puis connectez-vous une fois : le compte est
créé (ou promu) automatiquement et redirigé vers `/2m/admin`.

## Publier un pronostic (sans toucher au code)

`/2m/admin` → **Ajouter un pronostic** → catégorie VIP, type, date, match, pari, cote,
analyse, confiance, statut → *Publier*. Il apparaît immédiatement dans l’espace des abonnés
de cette catégorie. Les montantes / combinés / grosses cotes se remplissent via les blocs
« sélections » : la cote totale est calculée automatiquement (sélections annulées exclues).
Un pronostic déjà publié se modifie à tout moment ; sa date de publication est conservée.
