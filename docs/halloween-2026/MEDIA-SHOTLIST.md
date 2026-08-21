# Wicked Hollow — Halloween 2026 · Media Shotlist (V3)

Format standard : **4:5 vertical · 2000 × 2500 px · sRGB · PNG ou JPG haute qualité**. Vidéos ad : **9:16 · 1080 × 1920 px · 6–15 sec**.

Convention nommage : `<handle>-XX-<type>.jpg`.

⚠️ Aucun visuel brandé importé pour l'instant. Le ghost a 6 photos fournisseur CJ importées (webp, altText en hash à réécrire). Les 6 POD n'ont aucune image.

---

## PRIORITÉ 1 — The Watcher (12ft Ghost) · produit d'acquisition unique

C'est le produit qui reçoit les 500 € de budget ad. Priorité absolue sur ses visuels.

### Photos produit (5 prises requises)

| Fichier | Description | Higgsfield feasibility |
|---|---|---|
| `the-watcher-12ft-01-hero.jpg` | Packshot fond neutre gradient sombre, fantôme déployé plein cadre, angle 3/4 face, LED yeux + flames actives | **OUI** — Higgsfield peut générer à partir des photos fournisseur CJ (composition virtuelle + éclairage nuit) |
| `the-watcher-12ft-02-hero-yard-night.jpg` | Fantôme déployé devant maison typique US (porche + citrouilles), crépuscule bleuté, LED actives, ambiance cinématique | **OUI** — Higgsfield excelle en scenes lifestyle nocturnes. Fournir 2-3 refs de "typical US suburban porch at dusk" + le fantôme découpé |
| `the-watcher-12ft-03-detail-face.jpg` | Close-up sur les yeux rouges clignotants + bouche flammes LED orange | **PARTIEL** — Higgsfield peut zoomer/enhance à partir des photos fournisseur mais risque de dégrader le rendu LED. Alternative : shot manuel du fantôme réel sur commande de test |
| `the-watcher-12ft-04-scale-human.jpg` | Personne debout à côté (silhouette adulte 5'10") pour donner l'échelle 12 ft | **OUI** — Higgsfield peut composer un mannequin numérique à côté. Refs : "adult person silhouette next to inflatable Halloween decoration, low angle" |
| `the-watcher-12ft-05-package-compact.jpg` | Colis compact fermé + sac de transport + accessoires étalés (7 stakes, 3 ropes, blower, adapter) | **NON** — nécessite photo réelle du produit à réception. Fournisseur CJ peut fournir photo colis ; sinon shot manuel obligatoire |

### Vidéos ad (5 concepts — voir AD-TEST-PLAN.md)

| Fichier | Concept | Higgsfield feasibility |
|---|---|---|
| `the-watcher-12ft-ad-A-90seconds.mp4` | Timelapse gonflage 90s compressé 5s | **OUI** — Higgsfield peut générer un timelapse animé à partir de 2-3 keyframes (dégonflé, mi-gonflé, gonflé) |
| `the-watcher-12ft-ad-B-neighbor-reaction.mp4` | POV trottoir + tilt up + réaction visage | **PARTIEL** — Higgsfield fait bien le tilt up mais la réaction visage humain reste risquée (uncanny). Alternative : shot iPhone réel après réception |
| `the-watcher-12ft-ad-C-setup-3steps.mp4` | 3 shots courts setup | **OUI** — Higgsfield peut composer 3 clips distincts et enchaîner |
| `the-watcher-12ft-ad-D-day-vs-night.mp4` | Split screen jour/nuit | **OUI** — Higgsfield gère bien le split screen composé |
| `the-watcher-12ft-ad-E-block-reaction.mp4` | Long form 20s timelapse ambulatoire + groupes | **NON pour lancement** — nécessite le vrai produit installé + tournage sur une soirée trick-or-treat. Recommandé pour saison 2027 (UGC collecté). |

**Recommandation** : lancer A + B (Higgsfield generable) + C (Higgsfield ok) pour Phase 1. Attendre réception d'un exemplaire physique pour tourner D et E manuellement fin septembre.

### Actions immédiates ghost

1. Renommer les 6 altText CJ (`6f88db14800dc...`) → altText descriptifs anglais : "12ft ghost inflatable front view", "12ft ghost inflatable side view", etc.
2. Lancer Higgsfield sur les 5 prises photo prioritaires (batch overnight)
3. Générer les 3 vidéos A/B/C via Higgsfield vidéo mode

---

## PRIORITÉ 2 — POD (rôle AOV / organique / bundle)

Les 6 POD n'ont pas besoin de visuels de qualité pub cold. Priorité : mockups Printful natifs suffisent pour les product pages, upsell pop-ups, et emails.

### Génération recommandée

**Utilisez le Printful Mockup Generator** (natif, gratuit, US-fit) pour les 6 POD. Il génère automatiquement les 4-6 mockups par produit (packshot + lifestyle) à partir du design PNG que tu uploades. Pas besoin de Higgsfield ici.

| Produit | Priorité mockups | Higgsfield utilité |
|---|---|---|
| welcome-my-pretties-coir-doormat | packshot + porch lifestyle | Faible (Printful mockup natif suffit) |
| trick-or-treat-yourself-coir-doormat | packshot + porch lifestyle | Faible |
| disco-ghost-throw-pillow-cover | packshot + canapé lifestyle | Faible (mockup Printful ok) |
| vintage-bat-swarm-throw-pillow-cover | packshot + canapé lifestyle | Faible |
| but-first-coffin-mug (SUPPRIMÉ) | — | — |
| cursed-comfort-sherpa-blanket | packshot + couch scene | **OUI** pour lifestyle "cozy movie night" |
| boo-yall-shower-curtain | packshot + salle de bain installée | **OUI** — Printful mockup salle de bain souvent médiocre, Higgsfield fera mieux |

### Actions POD

1. Créer les 6 produits POD dans Printful US (ou Printify partenaires US)
2. Uploader les fichiers design (voir folder `/designs/` à créer)
3. Exporter les mockups Printful (packshot + 1-2 lifestyle par produit)
4. Uploader dans Shopify via update-product `images` param (URLs HTTPS publiques Printful ok)
5. Pour blanket + shower curtain : compléter avec 1 shot Higgsfield lifestyle

---

## PRIORITÉ 3 — Bundles

Les 2 bundles ont besoin de shots composites (flatlay ou scene).

| Bundle | Fichier hero | Higgsfield feasibility |
|---|---|---|
| Haunted Threshold Bundle | Scene porche avec ghost + doormat + pillow visible sur banc | **OUI** — Higgsfield compose bien les scènes lifestyle |
| The Full Haunt Bundle | Split scene : yard avec ghost / living room avec blanket + pillow | **OUI** — split scene est un format Higgsfield-friendly |

---

## Style guide commun (rappel)

- **Palette** : crème (#F5EFE0), noir profond (#1A1210), orange citrouille (#E8763A), rouge LED (#D9302B pour eyes ghost)
- **Ambiance lumière** : crépuscule bleuté ou golden hour tungstène chaud
- **Contextes** : maisons US suburbaines typiques (fantôme), intérieurs bois clair vintage (POD indoor), porches bois (doormats)
- **Modèles** : mains + silhouettes uniquement, pas de visages identifiables (droits + focus produit)
- **Overlays vidéo** : Inter Bold ou serif condensée, jamais les sous-titres jaunes TikTok defaults

## Deadline

Les visuels du ghost doivent être prêts pour le **lancement Phase 1 le 25 août**. Si Higgsfield ne rend pas d'ici cette date, décaler le début d'ad au 1er septembre — mieux vaut retarder que lancer sans lifestyle photo.
