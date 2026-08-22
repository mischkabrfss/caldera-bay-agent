# Digital Product Blueprint Pro

Prototype d'une plateforme de formation interactive premium en français. L'interface propose deux parcours (créateur et revendeur MRR), une progression sauvegardée localement, des modules actionnables et un espace de ressources.

## Lancer le projet

```bash
npm start
```

Puis ouvrir `http://localhost:4173`.

## Accéder à la formation

- Depuis le dashboard, cliquer sur **Accéder à ma formation** dans la grande carte verte ou dans le menu latéral.
- Pour ouvrir directement le lecteur de cours, utiliser `http://localhost:4173/#formation`.
- La formation contient 24 modules ; le sommaire complet apparaît à gauche dans le lecteur.

## Déploiement GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` publie automatiquement le site à chaque push sur `main` ou `work`.

1. Créer un dépôt GitHub et y pousser cette branche.
2. Dans **Settings → Pages → Build and deployment**, sélectionner **GitHub Actions**.
3. Ouvrir l'onglet **Actions** et attendre la fin du workflow **Deploy Digital Product Blueprint Pro**.
4. Le lien public est ensuite affiché dans **Settings → Pages** et dans le résumé du workflow.
