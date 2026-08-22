'use client';

import { useEffect, useState } from 'react';

type PathId = 'creator' | 'mrr' | 'hybrid';
type LearnerLevel = 'beginner' | 'started' | 'seller';
type ProgramStep = { module: number; title: string; phase: string };
type Module = { title: string; phase: string; duration: string; outcome: string; lesson: string[]; action: string; template: string; checkpoint: string };
type CoachMessage = { role: 'coach' | 'user'; text: string; title?: string; bullets?: string[]; action?: string; links?: { label: string; url: string }[] };
type Quiz = { question: string; options: [string, string, string]; correct: number; explanation: string };
type KnowledgeMatch = { heading: string; body: string; score: number };

const paths: { id: PathId; label: string; duration: string; description: string }[] = [
  { id: 'creator', label: 'Creator Lab', duration: '30 jours', description: 'Construis un produit propriétaire de zéro jusqu’à sa vente.' },
  { id: 'mrr', label: 'MRR Sprint', duration: '7 jours', description: 'Transforme NEXORA en offre différenciée et lance-la rapidement.' },
  { id: 'hybrid', label: 'Hybrid Empire', duration: '21 jours', description: 'Vends une offre MRR puis construis tes propres actifs.' },
];

const raw: Array<[string, string, string, string, string, string]> = [
  ['Choisir le bon modèle', 'Fondations', 'Une stratégie claire pour les 30 prochains jours.', 'Compare création, service productisé, template et MRR selon ton temps, ton budget et tes compétences.', 'Je choisis le modèle ___ pendant 30 jours parce que ___.', 'Je peux expliquer mon modèle en une phrase.'],
  ['Trouver une demande réelle', 'Fondations', 'Une idée reliée à un problème observable.', 'Cherche les mots exacts du marché dans les avis, commentaires et communautés. Un bon problème est fréquent, urgent ou coûteux.', '[Audience] veut [résultat], mais bloque à cause de [problème].', 'J’ai collecté 10 formulations venant du marché.'],
  ['Valider avant de construire', 'Fondations', 'Une décision continuer, pivoter ou abandonner.', 'Une vue est un signal faible. Une conversation, un email volontaire ou une précommande transparente valent davantage.', 'Mes 3 seuils de validation sont : ___ / ___ / ___.', 'Mes critères ont été écrits avant le test.'],
  ['Définir le client idéal', 'Fondations', 'Un profil fondé sur des comportements.', 'Décris une situation, un déclencheur, une objection et un résultat désiré plutôt qu’un avatar imaginaire trop détaillé.', 'Quand ___ arrive, mon client cherche à ___ mais craint ___.', 'Je sais où trouver ces personnes.'],
  ['Construire une transformation', 'Produit', 'Une promesse découpée en étapes réalisables.', 'Un produit digital ne vend pas seulement de l’information : il réduit le temps, le risque ou l’incertitude entre départ et résultat.', 'Avant : ___ → étapes : ___ → après : ___.', 'Chaque étape produit un livrable concret.'],
  ['Créer une première version', 'Produit', 'Un MVP livrable rapidement.', 'Retire tout ce qui ne sert pas le résultat principal. Préfère une version courte terminée à un produit énorme jamais lancé.', 'Version 1 : inclus ___ / exclut ___ / livrée le ___.', 'Une personne peut utiliser la V1 sans mon aide.'],
  ['Transformer le produit en offre', 'Offre', 'Une offre claire et désirable.', 'Assemble le produit, les bonus utiles, la garantie adaptée, le support et la prochaine action. Chaque bonus doit lever un obstacle.', 'Produit + bonus + support + prix + CTA.', 'La valeur est comprise en moins de 20 secondes.'],
  ['Fixer un prix cohérent', 'Offre', 'Un prix défendable et une marge connue.', 'Le prix dépend de la valeur, du marché, du support et du positionnement. Calcule les frais avant de promettre trop.', 'Prix ___ € – frais ___ € – marge nette ___ €.', 'Je connais ma marge par vente.'],
  ['Créer une identité crédible', 'Offre', 'Un mini-système visuel cohérent.', 'Choisis une couleur dominante, une couleur d’accent, deux polices maximum et des règles simples pour rester cohérent.', 'Palette / typographies / ton / 3 règles visuelles.', 'La marque reste reconnaissable partout.'],
  ['Écrire des accroches fortes', 'Acquisition', '10 hooks honnêtes et spécifiques.', 'Une bonne accroche combine cible, problème, tension et bénéfice sans fausse urgence ni promesse de revenus garantis.', 'Si tu es [cible] et que [problème], voici [mécanisme].', 'Mes hooks restent crédibles après l’achat.'],
  ['Construire la page de vente', 'Acquisition', 'Une page qui répond aux objections.', 'Structure : promesse, problème, mécanisme, contenu, preuves, offre, FAQ et CTA. Montre exactement ce que le client reçoit.', 'Hero / problème / méthode / contenu / preuve / prix / FAQ.', 'Chaque section répond à une question du prospect.'],
  ['Installer paiement et livraison', 'Système', 'Un achat test réussi de bout en bout.', 'Le client doit comprendre le prix, les conditions, l’accès et le support. Teste paiement, email et livraison avant tout trafic.', 'Paiement / email / accès / facture / support.', 'J’ai réalisé un achat test complet.'],
  ['Créer le tunnel email', 'Système', 'Une séquence simple de bienvenue et de vente.', 'Écris pour livrer, rassurer, expliquer, traiter une objection puis proposer une action. Un email, une idée principale.', 'J0 bienvenue / J1 déclic / J2 méthode / J3 objection / J4 offre.', 'Chaque email contient une seule action.'],
  ['Créer un moteur de contenu', 'Acquisition', 'Un calendrier de 14 contenus.', 'Alterne éducation, preuve, coulisses et offre. Une idée forte devient vidéo, carrousel, email et posts courts.', 'Idée mère ___ → 5 angles → 4 formats.', 'Je peux publier deux semaines sans improviser.'],
  ['Prospecter sans spammer', 'Acquisition', 'Un script conversationnel respectueux.', 'Personnalise l’ouverture, pose une vraie question et demande la permission avant de présenter ton offre.', 'Contexte observé + question utile + permission + ressource.', 'Mon message fonctionnerait même sans lien.'],
  ['Créer des partenariats', 'Croissance', 'Une proposition gagnant-gagnant.', 'Un partenaire a besoin d’une audience compatible, d’un bénéfice clair, d’assets prêts et de règles transparentes.', 'Audience / bénéfice / commission / assets / suivi.', 'Le partenaire comprend l’offre en une page.'],
  ['Lancer en 7 jours', 'Lancement', 'Un calendrier de lancement réaliste.', 'Prépare page, contenus et réponses avant l’ouverture. Pendant le lancement, collecte les objections et ajuste le message.', 'J1 angle / J2 page / J3 contenus / J4 préchauffage / J5-7 vente.', 'Chaque jour a un livrable mesurable.'],
  ['Obtenir les 10 premières ventes', 'Lancement', 'Un tableau d’actions quotidiennes.', 'Commence par les canaux où tu peux apprendre vite : conversations ciblées, contenu et partenaires. Cherche des données.', '10 conversations + 1 contenu + 2 relances utiles par jour.', 'Je sais quelle action génère chaque conversation.'],
  ['Tester Meta Ads proprement', 'Croissance', 'Un test publicitaire avec limite de risque.', 'Ne scale pas une offre non validée. Teste une variable, définis un budget maximal et écris tes seuils de coupure.', 'Hypothèse / créa / audience / budget / seuil de coupure.', 'Je peux perdre le budget test sans difficulté.'],
  ['Mesurer et diagnostiquer', 'Optimisation', 'Un tableau de bord lisible.', 'Suis visites, clics, conversion, coût d’acquisition, marge et remboursements. Cherche le goulot avant de tout modifier.', 'Trafic → clic → checkout → vente → marge → rétention.', 'Je peux nommer le principal blocage.'],
  ['Fiscalité et statut en France', 'Conformité', 'Une checklist pour démarrer sans ignorer tes obligations.', 'Choisis un statut adapté avant d’encaisser régulièrement, déclare ton chiffre d’affaires même lorsqu’il est nul si ton régime l’exige, conserve tes justificatifs et surveille les règles de TVA. Les seuils et taux évoluent : vérifie toujours les pages officielles reliées dans le coach. Ce module est pédagogique et ne remplace pas un expert-comptable.', 'Statut envisagé ___ / activité ___ / déclaration ___ / TVA vérifiée le ___.', 'J’ai vérifié ma situation sur Service-Public, l’Urssaf et impots.gouv.fr.'],
  ['Cadre légal, RGPD et support', 'Conformité', 'Une vente transparente et un client correctement informé.', 'Avant le paiement, affiche vendeur, produit, prix, accès, livraison, support, conditions et règles de rétractation applicables. Collecte uniquement les données utiles, protège-les et demande le consentement pour les traceurs concernés. N’utilise pas une image, musique ou police sans droit commercial.', 'Identité vendeur / CGV / confidentialité / cookies / support / remboursements.', 'Mon client sait qui vend, ce qu’il achète et comment obtenir de l’aide.'],
  ['Droits de revente 100 %', 'MRR', 'Une licence claire pour revendre NEXORA.', 'La licence peut autoriser le revendeur à conserver 100 % du chiffre d’affaires de ses propres ventes. Cela ne signifie ni zéro frais, ni zéro taxe, ni propriété absolue. Elle doit préciser les fichiers, la durée, le territoire, le rebranding, les modifications, les canaux, le prix, le support et la transmission éventuelle du droit de revente.', 'Produit / droits autorisés / interdictions / prix / transmission / support.', 'Je peux expliquer précisément les droits sans dire « domaine public ».'],
  ['Automatiser et planifier 90 jours', 'Croissance', 'Une feuille de route durable.', 'Automatise seulement ce qui fonctionne. Documente les tâches répétées, protège le support et fixe trois priorités mensuelles.', 'Mois 1 valider / mois 2 optimiser / mois 3 développer.', 'Mon système fonctionne sans promesse irréaliste.'],
];

const modules: Module[] = raw.map(([title, phase, outcome, lesson, template, checkpoint], index) => ({
  title, phase, outcome, template: index === 13 ? 'Nom : ___\nAudience : ___\nPromesse : ___\nBio : J’aide [audience] à [résultat] grâce à [méthode]. Commence ici ↓\nLien testé : ___\n3 contenus : diagnostic / démonstration / preuve\nMot-clé DM : ___' : template, checkpoint,
  duration: index % 4 === 0 ? '18 min' : index % 3 === 0 ? '14 min' : '11 min',
  lesson: [lesson, 'Passe à l’action avant d’ouvrir le module suivant : produis une preuve de travail au lieu de seulement consommer du contenu.'],
  action: index === 13 ? 'Configure ton compte professionnel, choisis une bio, ajoute et teste le lien vers ta page, puis prépare trois contenus et un script de conversation privée.' : `Crée le livrable du module ${index + 1}, puis note ce que tu as appris et la prochaine décision à prendre.`,
}));

const programs: Record<PathId, { name: string; duration: string; promise: string; signature: string; steps: ProgramStep[] }> = {
  creator: {
    name: 'NEXORA Creator Lab', duration: '30 jours', signature: 'CRÉER · POSSÉDER · VENDRE',
    promise: 'Tu pars d’un problème réel et tu termines avec ton propre produit, ta page, ton paiement et ton plan de lancement.',
    steps: [
      { module: 0, title: 'Choisis ton véhicule de création', phase: 'Direction' }, { module: 1, title: 'Détecte un problème qui mérite une solution', phase: 'Recherche' },
      { module: 2, title: 'Teste l’idée avant de produire', phase: 'Validation' }, { module: 3, title: 'Entre dans la tête de ton futur client', phase: 'Client' },
      { module: 4, title: 'Dessine la transformation promise', phase: 'Produit' }, { module: 5, title: 'Construis une V1 vraiment utilisable', phase: 'Produit' },
      { module: 6, title: 'Transforme ton produit en offre', phase: 'Offre' }, { module: 7, title: 'Fixe un prix rentable et crédible', phase: 'Offre' },
      { module: 8, title: 'Crée une marque simple et mémorable', phase: 'Marque' }, { module: 9, title: 'Écris des accroches qui arrêtent le scroll', phase: 'Message' },
      { module: 10, title: 'Construis ta page de vente', phase: 'Vente' }, { module: 11, title: 'Branche paiement et livraison', phase: 'Système' },
      { module: 12, title: 'Écris ta séquence email', phase: 'Système' }, { module: 13, title: 'Construis ton compte pro et ton contenu', phase: 'Audience' },
      { module: 14, title: 'Trouve tes premiers prospects', phase: 'Audience' }, { module: 16, title: 'Orchestre ton lancement', phase: 'Lancement' },
      { module: 17, title: 'Décroche tes dix premières ventes', phase: 'Lancement' }, { module: 19, title: 'Lis tes chiffres et corrige', phase: 'Optimisation' },
      { module: 20, title: 'Sécurise fiscalité et statut', phase: 'Conformité' }, { module: 21, title: 'Protège le client et ton activité', phase: 'Conformité' },
      { module: 23, title: 'Construis ton système sur 90 jours', phase: 'Expansion' },
    ],
  },
  mrr: {
    name: 'NEXORA MRR Sprint', duration: '7 jours', signature: 'REBRANDER · LANCER · ENCAISSER',
    promise: 'Tu transformes la licence NEXORA en une offre à ton image, prête à vendre avec son message, sa page et son système client.',
    steps: [
      { module: 22, title: 'Maîtrise exactement tes droits MRR', phase: 'Licence' }, { module: 3, title: 'Choisis ton acheteur NEXORA', phase: 'Positionnement' },
      { module: 8, title: 'Rebrande la formation à ton image', phase: 'Rebranding' }, { module: 6, title: 'Crée ton pack, tes bonus et ton support', phase: 'Offre MRR' },
      { module: 7, title: 'Fixe ton prix et ta marge de revendeur', phase: 'Offre MRR' }, { module: 9, title: 'Écris tes hooks de revente', phase: 'Acquisition' },
      { module: 10, title: 'Monte ta page de vente MRR', phase: 'Conversion' }, { module: 11, title: 'Installe paiement, accès et livraison', phase: 'Système' },
      { module: 13, title: 'Configure ton compte pro + 7 jours de contenus', phase: 'Acquisition' }, { module: 14, title: 'Ouvre des conversations sans spam', phase: 'Acquisition' },
      { module: 16, title: 'Exécute le lancement Sprint 7 jours', phase: 'Lancement' }, { module: 17, title: 'Transforme les objections en ventes', phase: 'Vente' },
      { module: 20, title: 'Cadre tes encaissements', phase: 'Conformité' }, { module: 21, title: 'Livre et accompagne proprement', phase: 'Conformité' },
      { module: 23, title: 'Passe de revendeur à marque durable', phase: 'Expansion' },
    ],
  },
  hybrid: {
    name: 'NEXORA Hybrid Empire', duration: '21 jours', signature: 'VENDRE · APPRENDRE · POSSÉDER',
    promise: 'Tu utilises le MRR pour apprendre à vendre, puis tu transformes les données clients en produits qui t’appartiennent.',
    steps: [
      { module: 22, title: 'Utilise la licence comme point de départ', phase: 'Cashflow' }, { module: 0, title: 'Dessine ta stratégie à deux moteurs', phase: 'Stratégie' },
      { module: 3, title: 'Choisis une audience commune', phase: 'Audience' }, { module: 6, title: 'Construis ton offre MRR différenciée', phase: 'Offre 1' },
      { module: 8, title: 'Crée la marque qui reliera tes produits', phase: 'Marque' }, { module: 9, title: 'Trouve ton message de marché', phase: 'Message' },
      { module: 10, title: 'Lance ta première page de vente', phase: 'Vente 1' }, { module: 11, title: 'Automatise la première livraison', phase: 'Système' },
      { module: 13, title: 'Transforme ton compte pro en audience', phase: 'Audience' }, { module: 14, title: 'Apprends des conversations réelles', phase: 'Recherche' },
      { module: 16, title: 'Lance ton offre accélérateur', phase: 'Lancement 1' }, { module: 17, title: 'Obtiens ventes et données clients', phase: 'Données' },
      { module: 1, title: 'Détecte ton produit propriétaire', phase: 'Produit 2' }, { module: 2, title: 'Valide l’idée avec tes clients', phase: 'Produit 2' },
      { module: 4, title: 'Dessine ta transformation originale', phase: 'Produit 2' }, { module: 5, title: 'Crée ta première version propriétaire', phase: 'Produit 2' },
      { module: 12, title: 'Relie tes deux offres par email', phase: 'Écosystème' }, { module: 19, title: 'Mesure les deux moteurs', phase: 'Optimisation' },
      { module: 20, title: 'Sécurise ton activité hybride', phase: 'Conformité' }, { module: 21, title: 'Clarifie droits et expérience client', phase: 'Conformité' },
      { module: 23, title: 'Planifie ton empire sur 90 jours', phase: 'Expansion' },
    ],
  },
};

const introOutcomes: Record<PathId, Array<{ title: string; text: string }>> = {
  creator: [
    { title: 'Trouver une vraie demande', text: 'Repérer un problème que des personnes veulent déjà résoudre.' },
    { title: 'Créer ton produit', text: 'Transformer le problème en solution courte, utile et utilisable.' },
    { title: 'Construire ta vente', text: 'Écrire l’offre, le prix, la page, le paiement et la livraison.' },
    { title: 'Lancer proprement', text: 'Créer du contenu, parler aux prospects et obtenir des données réelles.' },
  ],
  mrr: [
    { title: 'Comprendre ta licence', text: 'Savoir exactement ce que tu peux modifier, présenter et revendre.' },
    { title: 'Créer ta différence', text: 'Choisir ton public, ton angle, ta marque, tes bonus et ton support.' },
    { title: 'Installer ton système', text: 'Préparer page, prix, paiement, accès et expérience client.' },
    { title: 'Lancer en 7 jours', text: 'Publier, ouvrir des conversations et transformer les objections.' },
  ],
  hybrid: [
    { title: 'Vendre une première offre', text: 'Utiliser le MRR pour apprendre le marché sans partir d’une page blanche.' },
    { title: 'Construire ton audience', text: 'Attirer, écouter et comprendre les besoins de tes futurs clients.' },
    { title: 'Créer ton actif', text: 'Transformer les données obtenues en produit qui t’appartient.' },
    { title: 'Relier deux moteurs', text: 'Faire fonctionner MRR et produit propriétaire dans une même marque.' },
  ],
};

const beginnerExamples = [
  'Lina a deux heures par jour. Elle choisit un petit guide pratique plutôt qu’une application complexe : son modèle correspond à ses moyens.',
  'Au lieu d’inventer un besoin, Adam relève dix commentaires disant « je ne sais jamais quoi publier ». Il tient un problème réel à tester.',
  'Maya présente une maquette et propose une bêta clairement annoncée. Trois personnes acceptent de payer : le signal est plus fort que cinquante likes.',
  'Son client n’est pas « tout le monde ». C’est un indépendant qui vient de lancer son activité, manque de temps et veut publier sans improviser.',
  'Le client part d’une page blanche. Le produit lui fait choisir un angle, écrire dix idées puis créer son calendrier : chaque étape produit quelque chose.',
  'Noé livre d’abord un PDF de 20 pages, trois modèles et une checklist. Il observe les questions avant d’enregistrer une formation entière.',
  'Le produit est un calendrier. L’offre ajoute un guide de démarrage, des exemples et un support court qui enlèvent les principaux blocages.',
  'À 39 €, Inès retire les frais de paiement et estime le temps de support. Elle sait ce qu’il reste réellement avant de choisir son prix.',
  'Même bleu, même typographie et même ton sur la page, les emails et les réseaux : la marque devient reconnaissable sans logo compliqué.',
  '« Tu publies seulement quand tu as une idée ? Voici une méthode pour préparer 14 contenus en 45 minutes. » La cible, le problème et le bénéfice sont visibles.',
  'Le visiteur comprend en cinq secondes : « Calendrier pour coachs débutants — 30 jours de contenus prêts à adapter ». Le bouton indique clairement la suite.',
  'Après un paiement test sur téléphone, Sam reçoit immédiatement son email, ouvre le produit et trouve le contact support sans chercher.',
  'Le premier email livre. Le deuxième explique le problème. Le troisième montre la méthode. Le quatrième répond à une objection. Le cinquième propose l’offre.',
  'Une idée sur les erreurs de contenu devient une vidéo, un carrousel, un email et trois posts courts : une idée, plusieurs formats.',
  'Au lieu d’envoyer un lien, Zoé cite un contenu du prospect, pose une question utile puis demande la permission de partager une ressource.',
  'Un partenaire possède une petite audience très concernée. Il reçoit une présentation, des visuels, ses règles de commission et un suivi transparent.',
  'Chaque journée du lancement a un résultat visible : angle, page, contenus, préchauffage, ouverture, réponses puis bilan.',
  'Pour ses premières ventes, Yanis ouvre cinq conversations ciblées par jour et note chaque objection au lieu d’attendre une vidéo virale.',
  'Avant la publicité, l’offre a déjà vendu. Le test change une seule accroche, possède un budget maximal et une règle d’arrêt écrite.',
  'Il y a des visites mais peu de clics sur le bouton : le problème est la page. On corrige ce passage avant de changer tout le tunnel.',
  'Sur 1 000 € encaissés, tout n’est pas disponible : il faut prévoir frais, remboursements, cotisations, impôt et parfois TVA.',
  'Avant le paiement, le client connaît le vendeur, le contenu, le prix, la livraison, le support et les conditions. Ses données sont limitées au nécessaire.',
  'La licence autorise Emma à revendre et à garder son chiffre d’affaires, mais elle vérifie ce qu’elle peut modifier et transmettre à ses propres clients.',
  'Après validation, les emails de livraison sont automatisés. Les réponses sensibles et l’amélioration du produit restent suivies par une personne.',
];

const tabs = ['Cours', 'Mission', 'Quiz'] as const;

const sourceModules: number[][] = [[1],[2],[3],[2,3],[4],[4],[5],[5],[6],[7],[8],[9],[10],[11],[12],[13],[22],[14],[15],[16],[],[19],[20,21,22],[17,18,23]];

const quizzes: Quiz[] = [
  { question: 'Quel est le meilleur modèle pour commencer ?', options: ['Le plus impressionnant', 'Celui qu’on peut réellement lancer avec ses ressources', 'Celui qui promet le plus de revenus'], correct: 1, explanation: 'Le bon modèle tient compte de ton temps, ton budget, tes compétences et ton accès au marché. Un modèle simple lancé et mesuré vaut mieux qu’un projet ambitieux jamais publié.' },
  { question: 'Quel signal montre le mieux qu’un problème mérite un test ?', options: ['Une intuition personnelle', 'Des phrases répétées par de vraies personnes', 'Un logo déjà terminé'], correct: 1, explanation: 'Les formulations répétées dans les avis, commentaires et conversations montrent un problème observable. Une intuition peut démarrer la recherche, mais elle ne remplace pas une preuve de marché.' },
  { question: 'Quelle est la preuve de validation la plus forte ?', options: ['Un like', 'Une vue', 'Une précommande transparente ou une bêta payante'], correct: 2, explanation: 'Une personne qui engage réellement son temps ou son argent fournit un signal plus fort qu’une interaction légère. La précommande doit rester transparente : le produit et la date de livraison doivent être clairement annoncés.' },
  { question: 'Une bonne transformation relie…', options: ['Un logo à une publicité', 'Une situation de départ à un résultat par un chemin minimum', 'Un prix à une réduction'], correct: 1, explanation: 'Le produit doit faire passer le client d’un point A précis à un point B réaliste. Chaque étape enlève un obstacle et se termine par une action ou un livrable vérifiable.' },
  { question: 'Un bonus utile doit surtout…', options: ['Augmenter artificiellement le volume', 'Enlever un obstacle à la transformation', 'Être coûteux à produire'], correct: 1, explanation: 'Le bonus n’est pas du remplissage. Il devient utile lorsqu’il accélère l’exécution, simplifie une étape ou répond à une objection directement liée au résultat principal.' },
  { question: 'Quelle règle rend une identité plus premium ?', options: ['Multiplier les couleurs et effets', 'Utiliser un système visuel simple et cohérent', 'Changer de style à chaque page'], correct: 1, explanation: 'Une idée visuelle forte, deux typographies maximum et trois couleurs principales créent davantage de cohérence qu’une accumulation d’effets.' },
  { question: 'Une accroche honnête doit…', options: ['Promettre un revenu garanti', 'Créer de la curiosité tout en restant vraie après l’achat', 'Cacher le public concerné'], correct: 1, explanation: 'L’accroche doit attirer l’attention sans déformer le produit. Elle relie une cible, un problème, un mécanisme ou un résultat crédible.' },
  { question: 'Le test des cinq secondes vérifie surtout…', options: ['La vitesse du serveur', 'La compréhension immédiate de la page', 'Le nombre d’animations'], correct: 1, explanation: 'En cinq secondes, une personne doit comprendre pour qui est l’offre, quel problème elle traite, quel résultat elle propose et quelle action effectuer.' },
  { question: 'Avant d’envoyer du trafic, il faut…', options: ['Tester tout le parcours d’achat', 'Ajouter dix bonus', 'Changer le prix chaque jour'], correct: 0, explanation: 'Teste paiement, email, accès, livraison, facture et support avec une vraie commande test. Une rupture dans cette chaîne peut annuler les efforts marketing.' },
  { question: 'Un bon email contient principalement…', options: ['Plusieurs actions concurrentes', 'Une idée et une prochaine action claires', 'Uniquement une réduction'], correct: 1, explanation: 'Un email efficace livre une idée, fait avancer le lecteur et propose une action principale. La séquence complète peut éduquer, rassurer et traiter les objections.' },
  { question: 'Pour démarrer, combien de canaux faut-il prioriser ?', options: ['Six', 'Un canal de découverte et un canal de conversion', 'Tous les réseaux disponibles'], correct: 1, explanation: 'La concentration permet d’apprendre plus vite. Un canal attire l’attention ; un autre transforme cette attention en conversation, email ou vente.' },
  { question: 'La prospection respectueuse commence par…', options: ['Un lien sans contexte', 'Une observation personnalisée et une question', 'Trois relances le même jour'], correct: 1, explanation: 'Une observation réelle montre que le message n’est pas automatisé. La permission vient avant la présentation détaillée de l’offre.' },
  { question: 'Un bon partenaire est d’abord…', options: ['Celui qui a le plus d’abonnés', 'Celui dont l’audience et la confiance correspondent à l’offre', 'Celui qui accepte gratuitement'], correct: 1, explanation: 'La compatibilité de l’audience, la qualité de l’engagement et la capacité à expliquer l’offre comptent souvent davantage que le volume brut d’abonnés.' },
  { question: 'Le premier objectif des dix premières ventes est…', options: ['Scaler immédiatement', 'Obtenir des ventes et surtout des données réelles', 'Automatiser tout le support'], correct: 1, explanation: 'Les premières ventes révèlent les objections, les mots qui convertissent, les blocages du checkout et les attentes clients. Ces données améliorent l’offre.' },
  { question: 'Quand lancer Meta Ads ?', options: ['Avant de tester la page', 'Quand l’offre, le paiement et la marge sont compris', 'Dès qu’un logo existe'], correct: 1, explanation: 'La publicité amplifie ce qui existe déjà. Sans offre comprise, checkout testé et marge connue, elle risque surtout d’accélérer les pertes.' },
  { question: 'Quel élément faut-il optimiser en premier ?', options: ['Tout en même temps', 'Le goulot principal du parcours', 'La couleur du logo'], correct: 1, explanation: 'Mesure chaque étape puis identifie la perte la plus importante. Change une variable, définis la métrique et conserve une référence pour comprendre le résultat.' },
  { question: 'Que faut-il automatiser ?', options: ['Un processus déjà compris et répétitif', 'Une tâche jamais testée', 'Toutes les conversations humaines'], correct: 0, explanation: 'Automatiser trop tôt fige les erreurs. Documente d’abord une méthode qui fonctionne, puis automatise la partie répétitive sans dégrader l’expérience.' },
  { question: 'Quand demander un témoignage ?', options: ['Avant l’utilisation du produit', 'Après une micro-victoire identifiable', 'En dictant les mots au client'], correct: 1, explanation: 'La demande devient naturelle après un progrès réel. Pose des questions sur la situation avant, la partie utilisée et le résultat, sans modifier le sens de la réponse.' },
  { question: 'Avant le paiement, le client doit connaître…', options: ['Seulement le prix', 'Vendeur, produit, prix, accès, conditions et support', 'Uniquement le nom de la marque'], correct: 1, explanation: 'Une vente transparente permet au client d’identifier le vendeur, le contenu, les modalités d’accès, le prix, les conditions applicables et le moyen d’obtenir de l’aide.' },
  { question: 'MRR signifie-t-il propriété totale ?', options: ['Oui, toujours', 'Non, les droits dépendent de la licence', 'Oui si le fichier est numérique'], correct: 1, explanation: 'Une licence MRR peut autoriser la revente et parfois la transmission du droit de revente. Elle ne transforme pas automatiquement le revendeur en auteur original.' },
  { question: 'Conserver 100 % du chiffre d’affaires signifie…', options: ['Aucun impôt ni frais', 'Garder les encaissements de ses ventes, sous réserve des frais et obligations', 'Posséder tous les droits d’auteur'], correct: 1, explanation: 'Le revendeur peut garder le chiffre d’affaires de ses propres ventes si la licence le prévoit, mais reste responsable des frais, taxes, remboursements, support et conformité.' },
  { question: 'Pour les données et cookies, la règle prudente est…', options: ['Tout collecter', 'Collecter le minimum et vérifier le consentement applicable', 'Copier les mentions d’un autre site'], correct: 1, explanation: 'Les besoins varient selon les outils utilisés. Identifie les données nécessaires, protège-les, informe les utilisateurs et vérifie les règles officielles applicables aux traceurs.' },
  { question: 'Comment différencier une offre MRR ?', options: ['Copier exactement tous les vendeurs', 'Créer son angle, ses bonus, sa marque et son accompagnement', 'Baisser le prix sans limite'], correct: 1, explanation: 'Le produit peut être identique, mais l’audience, le positionnement, la preuve, les bonus propriétaires, le support et la distribution construisent une offre distincte.' },
  { question: 'L’avantage durable après le lancement est…', options: ['La licence seule', 'La marque, l’audience, les données et les produits propriétaires', 'Une réduction permanente'], correct: 1, explanation: 'La licence est un point de départ. L’avantage se construit avec la relation client, les contenus, la liste email, le support et les ressources originales difficiles à copier.' },
];

const fiscalCourse = `# Fiscalité et statut en France\n\n## Pourquoi ce module existe\nVendre régulièrement un produit digital constitue une activité économique. Avant d’encaisser, identifie la nature de ton activité et le cadre adapté. Ce cours donne une méthode de vérification, pas un conseil fiscal personnalisé.\n\n## Checklist de départ\n- Décrire précisément ce que tu vends et à qui.\n- Vérifier la formalité de création ou de modification sur le guichet officiel.\n- Choisir une fréquence de déclaration adaptée à ton régime.\n- Séparer chiffre d’affaires, bénéfice, cotisations et impôt : ce ne sont pas les mêmes chiffres.\n- Conserver factures, justificatifs, remboursements et frais.\n- Vérifier ta situation TVA et la facturation électronique sur les pages officielles à la date de lecture.\n\n## Exemple\nTu encaisses 1 000 €. Ce montant est ton chiffre d’affaires brut, pas ton revenu disponible. Tu dois encore prendre en compte les frais de paiement, les remboursements, les cotisations, l’impôt éventuel et la TVA lorsqu’elle s’applique. Crée une réserve au lieu de dépenser tout l’encaissement.\n\n## Action\nÉcris ton activité, ton statut envisagé, tes dates de déclaration et les liens officiels vérifiés. En cas de doute ou de vente internationale, consulte un professionnel.`;

const socialAccountCourse = `# Créer un compte professionnel qui attire et convertit

## Le rôle réel de ton compte
Ton compte professionnel n’est pas seulement une vitrine. Il doit faire quatre choses dans l’ordre : attirer la bonne personne, lui faire comprendre ce que tu fais, créer une conversation, puis l’envoyer vers ta page de vente lorsqu’elle est intéressée. Tu ne promets pas un revenu facile : tu montres un problème, une méthode, un produit et des preuves honnêtes.

## Choisir et configurer le compte
- Utilise un nom facile à retenir et proche de ton offre.
- Choisis une photo nette : visage reconnaissable ou logo très simple.
- Passe en compte professionnel ou Business si ton activité et le réseau le permettent.
- Active la double authentification et conserve les codes de récupération.
- Ajoute une adresse de contact réservée au support et aux partenariats.
- Vérifie les règles musicales et commerciales du réseau avant de publier.

Sur Instagram, les noms des menus peuvent évoluer : ouvre ton profil, le menu, puis les paramètres du compte et recherche le passage vers un compte professionnel. Choisis Créateur si ta personne porte la marque, ou Entreprise si la marque doit être centrale. Sur TikTok, le chemin officiel est Profil, Menu, Paramètres et confidentialité, Compte, puis Passer à un compte Business. Un compte Business peut ajouter un site sur son profil, mais utilise une bibliothèque musicale commerciale plus limitée.

## Écrire une bio comprise en cinq secondes
Ta bio répond à trois questions : qui aides-tu, quel résultat proposes-tu et quelle action doit faire la personne ? Évite les mots vagues comme liberté, succès ou mindset sans contexte.

### Bios prêtes à copier
- J’aide [type de personne] à [résultat précis] grâce à [méthode]. Commence ici ↓
- [Résultat] pour [audience], sans [obstacle principal]. Guide et formation ↓
- Tu veux [résultat] ? Je partage [type de contenus] + une méthode pas à pas. Voir l’offre ↓
- De [situation de départ] à [situation désirée]. Conseils, coulisses et ressources ↓

### Exemple NEXORA
J’aide les débutants à créer et vendre leur première offre digitale, étape par étape. Formation + modèles ↓

## Ajouter un lien cliquable
Utilise le champ de lien ou site web prévu par le réseau, pas une longue adresse perdue dans la description. Le lien doit mener vers une seule prochaine étape : page de vente, page de présentation ou ressource gratuite. Clique toi-même sur le lien depuis un autre téléphone, vérifie le chargement, le bouton d’achat et la lisibilité. Sur certains réseaux ou types de comptes, l’accès au lien dépend du pays, du statut du compte ou d’un nombre minimal d’abonnés.

## Les quatre contenus qui développent le compte
- Diagnostic : explique une erreur ou un symptôme que ton client reconnaît.
- Démonstration : montre ton écran, une page, un modèle ou une étape de ta méthode.
- Preuve : partage un résultat réel, une amélioration ou une leçon documentée.
- Décision : réponds à une objection et indique clairement comment aller plus loin.

Ne publie pas uniquement « achète ma formation ». Alterne aide, démonstration, histoire et offre. Chaque contenu possède une seule idée et une seule action : commenter, s’abonner, envoyer un mot ou visiter le lien.

## Utiliser les lives et les démonstrations
Un live simple peut suivre ce plan : problème pendant deux minutes, démonstration pendant dix minutes, questions pendant cinq minutes, puis invitation vers le lien. Tu peux filmer ou enregistrer ta page de vente, expliquer chaque section et montrer ce que reçoit le client. Cache toujours emails, paiements, clés, données personnelles et informations clients.

### Exemple de live
Titre : Je construis une page de vente simple en direct. Montre le hero, la promesse, le contenu, la FAQ et le bouton. Termine par : « Si tu veux le modèle complet et la méthode, le lien est sur mon profil. »

## Développer une audience sans spam
- Suis des créateurs, prospects et entreprises réellement liés à ton marché.
- Observe leurs questions et ajoute des commentaires utiles et spécifiques.
- Réponds aux personnes qui interagissent avec toi sans envoyer immédiatement un lien.
- Fais des collaborations, lives communs et échanges de ressources cohérents.
- Évite le follow/unfollow massif, les commentaires génériques et les messages copiés à froid.

L’objectif n’est pas de collectionner des abonnés. Cent personnes concernées et actives peuvent être plus utiles que dix mille personnes qui ne comprennent pas ton offre.

## Passer du commentaire à la conversation privée
Quand une personne montre un intérêt réel, continue la conversation en privé avec sa permission. Ne force pas la vente. Comprends d’abord sa situation, puis conseille la prochaine étape adaptée.

### Script de conversation
- Ouverture : Merci pour ton commentaire sur [sujet]. Tu travailles déjà sur [objectif] ?
- Diagnostic : Qu’est-ce qui te bloque le plus aujourd’hui ?
- Clarification : Qu’as-tu déjà essayé ?
- Permission : Je pense avoir une ressource adaptée. Tu veux que je te montre comment elle fonctionne ?
- Proposition : Voici ce que tu vas apprendre, pour qui c’est et ce que cela ne promet pas.
- Conversion : Si cela correspond à ton besoin, voici la page avec le détail, le prix et les conditions.

## Exemple complet de parcours client
Une vidéo explique trois erreurs de page de vente. Une personne commente « PAGE ». Tu réponds publiquement, puis tu demandes la permission de lui écrire. En privé, tu identifies qu’elle n’a pas de promesse claire. Tu lui expliques la méthode, réponds à sa question et l’envoies seulement ensuite vers la page de vente. Après l’achat, elle reçoit automatiquement son accès et sait où demander de l’aide.

## Mission du module
Configure ton profil, choisis une bio, ajoute et teste ton lien, prépare trois contenus et écris ton script de conversation privée. Puis réalise une démonstration courte de ta page de vente sans afficher aucune information confidentielle.`;

const ignoredWords = new Set(['avec','pour','dans','comment','faire','quoi','quel','quelle','est','les','des','une','mon','mes','sur','que','qui','pas','plus','tout','tous','cette','cela','mais','donc','avoir','etre','suis','veux','peux']);
const conceptFamilies = [
  ['vente','vendre','client','prospect','conversion','premiere'],
  ['audience','cible','avatar','niche','marche','besoin','probleme'],
  ['page','landing','hero','conversion','copywriting','faq','cta'],
  ['offre','prix','bonus','garantie','valeur','promesse'],
  ['publicite','pub','ads','meta','roas','cac','budget'],
  ['mrr','revente','licence','droit','revendeur','rebranding'],
  ['fiscalite','tva','impot','urssaf','statut','micro','cotisation'],
  ['contenu','tiktok','instagram','video','hook','accroche','reseau'],
  ['email','tunnel','sequence','newsletter','relance'],
  ['legal','rgpd','cgv','cookie','donnee','retractation'],
  ['produit','idee','creer','validation','mvp','digital'],
  ['paiement','checkout','livraison','acces','facture','support'],
];

function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function queryTokens(value: string) {
  const base = normalizeText(value).split(' ').filter((word) => word.length > 2 && !ignoredWords.has(word));
  const expanded = new Set(base);
  conceptFamilies.forEach((family) => { if (family.some((word) => base.includes(word))) family.forEach((word) => expanded.add(word)); });
  return [...expanded];
}

function getKnowledgeMatches(source: string, query: string): KnowledgeMatch[] {
  if (!source) return [];
  const tokens = queryTokens(query);
  if (!tokens.length) return [];
  const sections: Array<{ heading: string; body: string }> = [];
  let heading = 'Fondations NEXORA';
  let body: string[] = [];
  const flush = () => {
    const value = body.join('\n').trim();
    if (value.length > 80) sections.push({ heading: heading.replace(/^#+\s*/, '').replace(/\*\*/g, ''), body: value });
    body = [];
  };
  source.split('\n').forEach((line) => {
    if (/^#{1,3}\s/.test(line)) { flush(); heading = line; }
    else if (line.trim() !== '---') body.push(line);
  });
  flush();
  const exact = normalizeText(query);
  return sections.map((section) => {
    const normalizedHeading = normalizeText(section.heading);
    const normalizedBody = normalizeText(section.body);
    let score = exact.length > 8 && normalizedBody.includes(exact) ? 12 : 0;
    tokens.forEach((token) => {
      if (normalizedHeading.includes(token)) score += 6;
      const occurrences = normalizedBody.split(token).length - 1;
      score += Math.min(occurrences, 4) * 1.5;
    });
    return { ...section, score };
  }).filter((section) => section.score >= 5).sort((a, b) => b.score - a.score).slice(0, 3);
}

function extractInsights(matches: KnowledgeMatch[]) {
  const seen = new Set<string>();
  return matches.flatMap((match) => match.body.split(/\n|(?<=[.!?])\s+/))
    .map((line) => line.replace(/^[-*>\d.)\s]+/, '').replace(/[#*_`]/g, '').trim())
    .filter((line) => line.length >= 45 && line.length <= 230)
    .filter((line) => { const key = normalizeText(line).slice(0, 70); if (seen.has(key)) return false; seen.add(key); return true; })
    .slice(0, 5);
}

function extractSourceModules(source: string, numbers: number[]) {
  if (!source || !numbers.length) return '';
  return numbers.map((number) => {
    const start = source.search(new RegExp(`^# MODULE ${number} —`, 'm'));
    if (start < 0) return '';
    const rest = source.slice(start + 1);
    const next = rest.search(/^# MODULE \d+ —/m);
    return source.slice(start, next < 0 ? source.length : start + 1 + next).trim();
  }).filter(Boolean).join('\n\n---\n\n');
}

function CourseContent({ text }: { text: string }) {
  const sections: Array<{ title: string; level: number; lines: string[] }> = [];
  let currentSection = { title: 'L’essentiel du module', level: 2, lines: [] as string[] };
  text.split('\n').forEach((rawLine) => {
    const line = rawLine.trim();
    const heading = line.match(/^(#{1,3})\s+(.+)/);
    if (heading) {
      if (currentSection.lines.some(Boolean)) sections.push(currentSection);
      currentSection = { title: heading[2].replace(/\*\*/g, ''), level: heading[1].length, lines: [] };
    } else if (line !== '---') currentSection.lines.push(line);
  });
  if (currentSection.lines.some(Boolean)) sections.push(currentSection);

  const labels = [
    { name: 'COMPRENDRE', icon: '◎' },
    { name: 'VOIR', icon: '◫' },
    { name: 'APPLIQUER', icon: '↗' },
    { name: 'VALIDER', icon: '✓' },
  ];
  const toneFor = (title: string, index: number) => {
    const clean = normalizeText(title);
    if (/exemple|script|cas|modele/.test(clean)) return 1;
    if (/action|checklist|mission|exercice|plan/.test(clean)) return 2;
    if (/test|validation|checkpoint|mesurer/.test(clean)) return 3;
    return index % 4;
  };
  const renderBody = (lines: string[]) => {
    const nodes: React.ReactNode[] = [];
    let list: string[] = [];
    const flushList = () => { if (list.length) { nodes.push(<ul key={`list-${nodes.length}`}>{list.map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ul>); list = []; } };
    lines.forEach((line) => {
      if (!line) { flushList(); return; }
      if (/^[-*]\s/.test(line)) { list.push(line.slice(2).replace(/\*\*/g, '')); return; }
      flushList();
      const clean = line.replace(/\*\*/g, '');
      if (line.startsWith('> ')) nodes.push(<blockquote key={`quote-${nodes.length}`}>{clean.slice(2)}</blockquote>);
      else if (line.startsWith('### ')) nodes.push(<h4 key={`h4-${nodes.length}`}>{clean.slice(4)}</h4>);
      else nodes.push(<p key={`p-${nodes.length}`}>{clean}</p>);
    });
    flushList();
    return nodes;
  };

  return <div className="full-course">
    <div className="learning-rail"><i />{labels.map((label, index) => <div key={label.name}><span>{label.icon}</span><small>0{index + 1}</small><b>{label.name}</b></div>)}</div>
    <div className="course-flow">{sections.map((section, index) => {
      const tone = toneFor(section.title, index);
      return <section className={`learn-card tone-${tone}`} style={{ animationDelay: `${Math.min(index, 10) * 55}ms` }} key={`${section.title}-${index}`}>
        <div className="learn-card-top"><span>{String(index + 1).padStart(2, '0')}</span><b>{labels[tone].icon} {labels[tone].name}</b></div>
        {section.level === 1 ? <h2>{section.title}</h2> : <h3>{section.title}</h3>}
        <div className="learn-body">{renderBody(section.lines)}</div>
      </section>;
    })}</div>
  </div>;
}

function BeginnerPrimer({ module, index, path }: { module: Module; index: number; path: PathId }) {
  const framing = path === 'creator'
    ? 'Applique cette notion à un produit que tu posséderas et pourras améliorer.'
    : path === 'mrr'
      ? 'Applique cette notion directement au rebranding et à la vente de NEXORA.'
      : 'Utilise cette notion pour vendre maintenant, puis transforme les données obtenues en actif propriétaire.';
  return <section className="beginner-primer">
    <header><span>MODE DÉBUTANT · {path === 'creator' ? 'CRÉATION' : path === 'mrr' ? 'MRR' : 'HYBRIDE'}</span><h2>Comprends d’abord. Applique ensuite.</h2><p>{framing}</p></header>
    <div className="primer-grid">
      <article><span>01 · EN CLAIR</span><b>L’idée simple</b><p>{module.lesson[0]}</p></article>
      <article><span>02 · EXEMPLE NEXO</span><b>Imagine cette situation</b><p>{beginnerExamples[index]}</p></article>
      <article><span>03 · À TOI</span><b>Ta preuve de travail</b><p>{module.action}</p></article>
    </div>
  </section>;
}

export default function Home() {
  const [view, setView] = useState<'home' | 'intro' | 'academy' | 'conclusion'>('home');
  const [path, setPath] = useState<PathId>('creator');
  const [current, setCurrent] = useState(0);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Cours');
  const [doneByPath, setDoneByPath] = useState<Record<PathId, number[]>>({ creator: [], mrr: [], hybrid: [] });
  const [note, setNote] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [knowledge, setKnowledge] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [diagnosticStep, setDiagnosticStep] = useState(0);
  const [diagnosticDone, setDiagnosticDone] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [learnerLevel, setLearnerLevel] = useState<LearnerLevel>('beginner');
  const [pace, setPace] = useState<'fast' | 'steady' | 'deep'>('steady');
  const [dailyTime, setDailyTime] = useState('30 min');
  const [saleTarget, setSaleTarget] = useState('30 jours');
  const [startingPoint, setStartingPoint] = useState('Je pars de zéro');
  const [hydrated, setHydrated] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([{ role: 'coach', title: 'Je suis Nexo 👋', text: 'Commençons ensemble jusqu’à ta première vente. Je peux expliquer chaque notion simplement, retrouver une méthode dans la formation et t’aider à choisir ta prochaine action.', action: 'Dis-moi ce que tu veux vendre ou l’endroit précis où tu bloques.' }]);

  useEffect(() => {
    const saved = localStorage.getItem('blueprint-progress');
    if (saved) try { const data = JSON.parse(saved); const savedPath: PathId = data.path ?? 'creator'; setPath(savedPath); setDoneByPath(data.doneByPath ?? { creator: savedPath === 'creator' ? (data.done ?? []) : [], mrr: savedPath === 'mrr' ? (data.done ?? []) : [], hybrid: savedPath === 'hybrid' ? (data.done ?? []) : [] }); setCurrent(data.current ?? 0); setLearnerLevel(data.learnerLevel ?? 'beginner'); setPace(data.pace ?? 'steady'); setDiagnosticDone(data.diagnosticDone ?? false); setDiagnosticStep(data.diagnosticDone ? 3 : 0); setIntroDone(data.introDone ?? false); setDailyTime(data.dailyTime ?? '30 min'); setSaleTarget(data.saleTarget ?? '30 jours'); setStartingPoint(data.startingPoint ?? 'Je pars de zéro'); } catch { /* old invalid data */ } finally { setHydrated(true); }
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem('blueprint-progress', JSON.stringify({ doneByPath, path, current, learnerLevel, pace, diagnosticDone, introDone, dailyTime, saleTarget, startingPoint })); }, [hydrated, doneByPath, path, current, learnerLevel, pace, diagnosticDone, introDone, dailyTime, saleTarget, startingPoint]);
  useEffect(() => { fetch('/nexora-formation-complete.txt').then((response) => response.text()).then(setKnowledge).catch(() => undefined); }, []);

  const program = programs[path];
  const programSteps = program.steps;
  const orderedIndexes = programSteps.map((step) => step.module);
  const done = doneByPath[path];
  const currentPosition = orderedIndexes.indexOf(current);
  const currentStep = programSteps[Math.max(currentPosition, 0)];
  const completedInProgram = done.filter((index) => orderedIndexes.includes(index)).length;
  const progress = Math.round((completedInProgram / programSteps.length) * 100);
  const sourceLesson = extractSourceModules(knowledge, sourceModules[current]);
  const completeLesson = current === 20 ? fiscalCourse : current === 13 ? `${socialAccountCourse}\n\n---\n\n${sourceLesson}` : sourceLesson;
  useEffect(() => { if (hydrated && !orderedIndexes.includes(current)) setCurrent(orderedIndexes[0]); }, [hydrated, path, current, orderedIndexes]);
  function openModule(index: number) { setCurrent(index); setActiveTab('Cours'); setView('academy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function switchProgram(nextPath: PathId) { setPath(nextPath); setCurrent(programs[nextPath].steps[0].module); setIntroDone(false); setIntroStep(0); setView('intro'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function toggleDone() { setDoneByPath((all) => ({ ...all, [path]: all[path].includes(current) ? all[path].filter((id) => id !== current) : [...all[path], current] })); }
  function validateAndContinue() {
    setDoneByPath((all) => ({ ...all, [path]: all[path].includes(current) ? all[path] : [...all[path], current] }));
    if (currentPosition < orderedIndexes.length - 1) openModule(orderedIndexes[currentPosition + 1]);
    else setView('conclusion');
  }
  function finishDiagnostic() { setDiagnosticDone(true); setIntroDone(false); setIntroStep(0); setCurrent(programs[path].steps[0].module); setDiagnosticStep(3); }
  function finishIntroduction() { setIntroDone(true); openModule(programs[path].steps[0].module); }
  function askCoach() {
    const value = question.trim();
    if (!value) return;
    const q = normalizeText(value);
    const previousContext = messages.filter((message) => message.role === 'user').slice(-3).map((message) => message.text).join(' ');
    const contextualQuery = /^(et|ca|cela|pourquoi|comment|ensuite|apres|donc)\b/.test(q) ? `${previousContext} ${value}` : value;
    const matches = getKnowledgeMatches(knowledge, contextualQuery);
    let answer: CoachMessage;
    let addWebSearch = true;
    if (/^(salut|bonjour|bonsoir|hello|hey|yo|bjr)$/.test(q)) {
      addWebSearch = false;
      answer = { role: 'coach', title: 'Salut, moi c’est Nexo 👋', text: 'Commençons ensemble jusqu’à ta première vente. Je garde le fil de notre échange et je transforme tes questions en étapes simples.', bullets: ['Créer ton propre produit digital', 'Revendre NEXORA avec la licence MRR', 'Construire une offre, une page et un système de vente'], action: 'Dis-moi simplement ce que tu veux vendre et où tu bloques aujourd’hui.' };
    } else if (/je vais bien|moi ca va|ca va merci|oui ca va/.test(q)) {
      addWebSearch = false;
      answer = { role: 'coach', title: 'Content de l’entendre.', text: 'Parfait. Moi aussi je suis en forme, et je garde ton parcours ainsi que ton étape actuelle en mémoire. On peut continuer quand tu veux.' };
    } else if (/ca va|sa va|comment vas tu|tu vas bien|comment allez vous/.test(q)) {
      addWebSearch = false;
      answer = { role: 'coach', title: 'Oui, merci 👋', text: 'Je vais bien. Ravi de te retrouver dans NEXORA. Tu peux me parler normalement : je peux discuter avec toi ou t’aider sur la formation, selon ce dont tu as besoin.' };
    } else if (/quoi de neuf|tu racontes quoi|tu fais quoi|t es la|es tu la/.test(q)) {
      addWebSearch = false;
      answer = { role: 'coach', title: 'Je suis bien là.', text: `Je suis disponible et je garde ton contexte : programme « ${program.name} », étape « ${currentStep?.title ?? modules[current].title} ». Rien ne t’oblige à parler uniquement business avec moi.` };
    } else if (/au revoir|a plus|bonne nuit|bonne soiree|bye/.test(q)) {
      addWebSearch = false;
      answer = { role: 'coach', title: 'À bientôt 👋', text: 'Ta progression est sauvegardée. Tu reprendras exactement là où tu t’es arrêté.' };
    } else if (/tu peux m aider|aide moi|j ai besoin d aide|besoin de toi/.test(q)) {
      addWebSearch = false;
      answer = { role: 'coach', title: 'Oui, je suis là pour ça.', text: `Tu es actuellement à l’étape « ${currentStep?.title ?? modules[current].title} ». Je peux t’expliquer le cours, corriger une idée, t’aider à écrire un texte ou débloquer ta prochaine action.`, action: 'Écris simplement : « Je veux ___ mais je bloque sur ___ ». Même si ta phrase n’est pas parfaite, je suivrai le contexte.' };
    } else if (/je sais pas|aucune idee|j ai pas d idee|je suis perdu|je comprends rien/.test(q)) {
      addWebSearch = false;
      answer = { role: 'coach', title: 'Pas de problème, on simplifie.', text: 'Tu n’as pas besoin d’avoir toutes les réponses maintenant. On va choisir une seule petite décision et avancer depuis là.', bullets: ['Ce que tu aimes ou sais déjà faire', 'Le type de personnes que tu comprends bien', 'Un problème que ces personnes répètent souvent'], action: 'Donne-moi seulement un sujet que tu connais ou que tu aimes. Je t’aiderai à en tirer trois idées de produit.' };
    } else if (/plus simple|j ai pas compris|explique moi|ca veut dire|c est quoi/.test(q)) {
      addWebSearch = false;
      answer = { role: 'coach', title: `Version simple : ${currentStep?.title ?? modules[current].title}`, text: modules[current].lesson[0], bullets: [`Exemple : ${beginnerExamples[current]}`, `Résultat attendu : ${modules[current].outcome}`], action: modules[current].action };
    } else if (/^(oui|ouais|ok|okay|d accord|non|pas vraiment)$/.test(q)) {
      addWebSearch = false;
      const lastCoach = [...messages].reverse().find((message) => message.role === 'coach');
      answer = { role: 'coach', title: 'Je te suis.', text: lastCoach?.action ? `On reprend à partir de ma dernière proposition : ${lastCoach.action}` : 'On peut avancer tranquillement, une décision à la fois.', action: 'Ajoute juste un détail : qu’est-ce qui te bloque exactement maintenant ?' };
    } else if (/merci|parfait|super/.test(q) && q.length < 40) {
      addWebSearch = false;
      answer = { role: 'coach', title: 'On avance.', text: 'Avec plaisir. Je garde le contexte de ce qu’on vient de voir.', action: 'Quelle décision veux-tu prendre maintenant : produit, offre, contenu, page de vente ou première vente ?' };
    } else if (/qui es tu|tu es qui|ton role/.test(q)) {
      addWebSearch = false;
      answer = { role: 'coach', title: 'Je suis Nexo', text: `Je suis le coach intégré à NEXORA. J’utilise la formation complète, nos derniers messages et ton parcours ${paths.find((item) => item.id === path)?.label.toLowerCase()} pour t’orienter.`, bullets: ['Je retrouve les méthodes utiles dans le cours', 'J’explique les mots compliqués avec un exemple', 'Je termine par une mission immédiate', 'Je te donne des recherches Web et des sources officielles quand elles sont utiles'], action: 'Pose une question précise ou décris ton projet en une phrase.' };
    } else if (/fiscal|impot|tva|urssaf|statut|micro|cotisation/.test(q)) answer = { role: 'coach', title: 'Sécurise ton cadre avant d’encaisser', text: 'Pour une activité régulière en France, distingue toujours chiffre d’affaires, bénéfice, cotisations, impôt et TVA. Les seuils changent : vérifie-les au moment où tu agis.', bullets: [
      'Décris précisément l’activité vendue et à qui tu la vends.',
      'Choisis un statut adapté et note tes dates de déclaration.',
      'Conserve factures, frais, remboursements et preuves de paiement.',
      'Vérifie la TVA, surtout pour les ventes numériques et internationales.',
      'Crée une réserve : tout l’argent encaissé n’est pas ton revenu disponible.',
    ], action: 'Écris aujourd’hui : activité, statut envisagé, pays des clients, chiffre d’affaires estimé et date de vérification officielle.', links: [
      { label: 'Créer ou modifier une activité', url: 'https://entreprendre.service-public.fr/vosdroits/F24023' },
      { label: 'Déclarations des indépendants', url: 'https://www.urssaf.fr/accueil/independant/declarer-vos-revenus/declaration-revenus-independants.html' },
      { label: 'TVA des micro-entrepreneurs', url: 'https://www.impots.gouv.fr/professionnel/questions/en-tant-que-micro-entrepreneur-puis-je-etre-redevable-de-la-tva' },
    ] };
    else if (/page|landing|conversion|hero|faq|copywriting/.test(q)) answer = { role: 'coach', title: 'Construis une page qui guide la décision', text: 'Une page de vente n’est pas une affiche : elle répond aux questions du prospect dans le bon ordre.', bullets: ['Hero : cible + résultat + mécanisme + CTA visible.', 'Problème : montre la situation exacte sans dramatiser artificiellement.', 'Méthode : explique pourquoi ta solution fonctionne différemment.', 'Offre : contenu, bonus utiles, prix, accès, support et garantie.', 'Preuves et FAQ : réponds aux objections réelles, pas à des objections inventées.', 'Répète un CTA cohérent après les sections décisives.'], action: 'Montre ton hero à quelqu’un pendant 5 secondes. S’il ne sait pas pour qui c’est, ce que ça apporte et quoi faire, réécris-le.' };
    else if (/mrr|revente|licence|100|droit|revendeur/.test(q)) answer = { role: 'coach', title: 'Utilise le MRR comme accélérateur, pas comme copie', text: 'La licence peut t’autoriser à conserver 100 % du chiffre d’affaires de tes ventes, mais elle ne supprime ni frais, ni taxes, ni responsabilités.', bullets: ['Lis précisément les droits de rebranding, modification et transmission.', 'Choisis une audience et un angle différents des autres revendeurs.', 'Ajoute tes propres bonus, exemples, support et contenus.', 'Explique clairement ce que ton client peut ou ne peut pas revendre.', 'Construis ensuite une audience et des produits propriétaires.'], action: 'Rédige une fiche de licence en deux colonnes : AUTORISÉ / INTERDIT, puis ajoute ton angle de différenciation en une phrase.' };
    else if (/premiere vente|vendre|aucun client|pas de client|prospect|vente/.test(q)) answer = { role: 'coach', title: 'Plan première vente : cherche une conversation, pas la viralité', text: 'Ta première vente vient plus vite quand tu réduis la distance entre une vraie personne, un problème précis et une offre simple.', bullets: ['Choisis 20 personnes qui correspondent réellement à la cible.', 'Ouvre 5 conversations personnalisées par jour sans envoyer de lien immédiatement.', 'Pose des questions sur leur situation, leurs tentatives et leurs objections.', 'Propose une petite version claire avec résultat, délai, prix et limite.', 'Relance avec une information utile, puis note chaque objection.', 'Améliore le message après 10 conversations, pas après 100 vues.'], action: 'Aujourd’hui : liste 20 prospects, contacte-en 5 et note leurs mots exacts. Ton objectif est d’obtenir une réponse utile, pas de forcer une vente.' };
    else if (/produit|idee|niche|creer|mvp|validation/.test(q)) answer = { role: 'coach', title: 'Trouve un produit à partir d’une preuve', text: 'Ne pars pas d’une catégorie vague. Pars d’un problème que des personnes essaient déjà de résoudre.', bullets: ['Collecte 10 formulations réelles dans avis, commentaires et conversations.', 'Choisis un problème fréquent, urgent ou coûteux.', 'Définis un résultat petit mais vérifiable.', 'Crée le chemin minimum entre la situation actuelle et ce résultat.', 'Teste l’intérêt avec des conversations ou une précommande transparente.', 'Construis uniquement la V1 nécessaire à la promesse.'], action: 'Complète : « Quand ___ arrive, [cible] veut ___ mais bloque à cause de ___. Ma V1 l’aide à ___ en ___. »' };
    else if (/prix|offre|bonus|garantie|promesse/.test(q)) answer = { role: 'coach', title: 'Rends l’offre évidente avant de baisser le prix', text: 'Une offre forte assemble une transformation, un mécanisme crédible et une réduction du risque.', bullets: ['Nommer une cible et une situation précises.', 'Promettre un résultat réaliste, pas un revenu garanti.', 'Présenter les étapes et les livrables concrets.', 'Ajouter uniquement les bonus qui retirent un obstacle.', 'Calculer frais, temps de support, remboursements et marge.', 'Expliquer pour qui l’offre n’est pas adaptée.'], action: 'Écris ton offre en une phrase : « J’aide [cible] à [résultat] grâce à [mécanisme], sans [obstacle principal]. »' };
    else if (/compte pro|compte professionnel|business account|bio|lien cliquable|lien bio|live/.test(q)) answer = { role: 'coach', title: 'Transforme ton profil en chemin vers la vente', text: 'Ton compte doit attirer, expliquer, ouvrir une conversation puis orienter la personne intéressée vers ta page. Les menus et conditions changent selon le réseau.', bullets: ['Photo ou logo net et nom facile à retenir.', 'Bio : audience + résultat + méthode + action.', 'Un lien testé vers une seule prochaine étape.', 'Contenus : diagnostic, démonstration, preuve et décision.', 'Live : problème, démonstration, questions puis invitation.', 'Message privé : comprendre, demander la permission, proposer seulement si c’est adapté.'], action: 'Configure ton profil puis teste le lien depuis un autre téléphone. Ouvre ensuite l’étape « compte professionnel » de ton programme.', links: [{ label: 'Démarrer sur Instagram Business', url: 'https://business.instagram.com/business/instagram/getting-started' }, { label: 'Types de comptes TikTok', url: 'https://support.tiktok.com/en/using-tiktok/growing-your-audience/switching-to-a-creator-or-business-account' }] };
    else if (/contenu|tiktok|instagram|hook|video|accroche|reseau/.test(q)) answer = { role: 'coach', title: 'Un moteur de contenu simple et répétable', text: 'Choisis un canal de découverte et transforme une idée forte en plusieurs contenus.', bullets: ['Diagnostic : révèle une erreur ou un symptôme précis.', 'Démonstration : montre ta méthode sur un exemple.', 'Preuve : partage un avant/après, une donnée ou une leçon réelle.', 'Décision : traite une objection et propose une prochaine action.', 'Format court : accroche 0–2 s, problème 2–7 s, méthode 7–20 s, preuve 20–27 s, CTA 27–30 s.'], action: 'Prends une question client et écris 3 angles : erreur fréquente, méthode en 3 étapes, exemple avant/après.' };
    else if (/client ideal|cible|audience|avatar|marche/.test(q)) answer = { role: 'coach', title: 'Définis une personne qu’on peut réellement trouver', text: 'Une cible utile n’est pas une fiche imaginaire remplie de détails. C’est un groupe qui vit une situation précise et cherche déjà une solution.', bullets: ['Situation actuelle : que se passe-t-il maintenant ?', 'Déclencheur : pourquoi la personne agit-elle aujourd’hui ?', 'Résultat : quel progrès visible veut-elle obtenir ?', 'Obstacle : qu’a-t-elle déjà essayé sans succès ?', 'Lieu : où lit-elle, cherche-t-elle ou demande-t-elle de l’aide ?'], action: 'Complète : « Quand ___ arrive, [type de personne] cherche à ___ mais bloque à cause de ___. Je peux la trouver sur ___. »' };
    else if (/marque|branding|identite|logo|couleur|nom/.test(q)) answer = { role: 'coach', title: 'Crée une marque simple avant de créer une marque compliquée', text: 'La confiance vient surtout de la cohérence : même promesse, même ton et mêmes repères visuels partout.', bullets: ['Une couleur dominante et une couleur d’accent.', 'Deux typographies maximum.', 'Une phrase claire qui décrit la transformation.', 'Trois règles de ton : par exemple simple, direct, honnête.', 'Un modèle réutilisable pour les contenus et les pages.'], action: 'Prépare une mini-fiche : nom / promesse / 2 couleurs / 2 polices / 3 mots de ton.' };
    else if (/lancement|lancer|planning|7 jours|calendrier/.test(q)) answer = { role: 'coach', title: 'Lance avec un livrable par jour', text: 'Un lancement devient fluide quand chaque journée possède un résultat précis, pas une longue liste vague.', bullets: ['J1 : angle et promesse.', 'J2 : page de vente.', 'J3 : paiement et livraison testés.', 'J4 : contenus de préchauffage.', 'J5 : ouverture et conversations.', 'J6 : objections et preuves.', 'J7 : relances utiles et bilan.'], action: 'Choisis ta date d’ouverture puis écris le livrable unique de chaque journée précédente.' };
    else if (/temoignage|preuve|avis|resultat client/.test(q)) answer = { role: 'coach', title: 'Obtiens une preuve sans inventer', text: 'La bonne preuve montre une situation, une utilisation et un progrès réel. Elle n’a pas besoin d’être spectaculaire.', bullets: ['Demande après une micro-victoire observable.', 'Questionne la situation avant le produit.', 'Demande quelle partie a été utilisée.', 'Fais préciser le résultat ou le changement.', 'Obtiens l’autorisation avant publication.', 'Ne modifie jamais le sens des mots du client.'], action: 'Envoie trois questions : « Où en étais-tu ? Qu’as-tu utilisé ? Qu’est-ce qui a changé ? »' };
    else if (/mesurer|statistique|analytics|kpi|taux|diagnostic/.test(q)) answer = { role: 'coach', title: 'Trouve le goulot avant de tout modifier', text: 'Les chiffres servent à localiser l’endroit où les personnes abandonnent.', bullets: ['Visites : assez de personnes voient-elles la page ?', 'Clics : la promesse donne-t-elle envie d’avancer ?', 'Checkout : le prix et les conditions sont-ils compris ?', 'Ventes : le parcours fonctionne-t-il jusqu’au bout ?', 'Marge et remboursements : la vente reste-t-elle saine ?'], action: 'Écris tes chiffres dans cet ordre puis entoure la plus grosse chute. Modifie uniquement ce passage pendant ton prochain test.' };
    else if (/automatis|outil|systeme|gagner du temps|organisation/.test(q)) answer = { role: 'coach', title: 'Automatise après avoir compris', text: 'Une automatisation répète très vite ce qu’on lui donne. Si la méthode est mauvaise, elle répète aussi l’erreur.', bullets: ['Réalise la tâche manuellement plusieurs fois.', 'Écris chaque étape et les cas d’échec.', 'Automatise la partie répétitive seulement.', 'Garde une vérification humaine pour les exceptions.', 'Contrôle régulièrement emails, accès, paiements et support.'], action: 'Choisis une seule tâche répétitive et écris son déclencheur, ses étapes, son résultat attendu et son plan de secours.' };
    else if (/partenaire|affilie|collaboration|commission/.test(q)) answer = { role: 'coach', title: 'Propose un échange gagnant-gagnant', text: 'Un bon partenaire n’est pas seulement une grosse audience : son public doit faire confiance à ses recommandations et correspondre à ton offre.', bullets: ['Audience compatible et problème commun.', 'Bénéfice clair pour le partenaire et son public.', 'Commission, paiement et durée expliqués.', 'Page, visuels et messages prêts à utiliser.', 'Suivi transparent des résultats.', 'Règles sur les promesses et les remboursements.'], action: 'Prépare une page partenaire avec : public / offre / bénéfice / commission / ressources / suivi / contact.' };
    else if (/pub|meta|ads|roas|cac|publicite/.test(q)) answer = { role: 'coach', title: 'Teste la publicité avec une limite de risque', text: 'La publicité amplifie une offre ; elle ne répare pas une offre incomprise.', bullets: ['Teste d’abord le paiement et la livraison.', 'Connais ta marge maximale disponible pour acquérir un client.', 'Choisis une seule hypothèse : créa, audience ou accroche.', 'Écris budget maximal, durée et seuil de coupure avant de lancer.', 'Mesure clic, checkout, conversion, CAC, marge et remboursements.', 'Décide avec les données, sans augmenter le budget par émotion.'], action: 'Écris ton test sur une ligne : hypothèse / variable / budget / durée / métrique / seuil d’arrêt.' };
    else if (/email|tunnel|newsletter|relance|sequence/.test(q)) answer = { role: 'coach', title: 'Construis une séquence qui fait avancer', text: 'Un email doit porter une seule idée principale et une seule prochaine action.', bullets: ['J0 : livrer et rassurer.', 'J1 : expliquer le déclic ou le problème.', 'J2 : enseigner la méthode avec un exemple.', 'J3 : traiter l’objection principale.', 'J4 : présenter l’offre et le CTA.', 'Relance : apporter une information nouvelle, pas seulement « as-tu vu ? ».'], action: 'Écris les objets de ces 5 emails avant leur contenu. Chaque objet doit annoncer l’idée centrale.' };
    else if (/paiement|checkout|livraison|acces|facture|support|remboursement/.test(q)) answer = { role: 'coach', title: 'Teste toute la chaîne client', text: 'Une vente n’est réussie que lorsque le client paie, reçoit le bon accès et sait obtenir de l’aide.', bullets: ['Prix, devise et conditions visibles avant paiement.', 'Commande test avec un vrai parcours complet.', 'Email de confirmation et accès reçus immédiatement.', 'Facture, support et règles de remboursement accessibles.', 'Test sur mobile et avec une autre adresse email.', 'Procédure écrite si l’accès échoue.'], action: 'Fais un achat test aujourd’hui et chronomètre le temps entre le paiement et l’ouverture du produit.' };
    else if (/rgpd|cookie|donnee|legal|cgv|retractation/.test(q)) answer = { role: 'coach', title: 'Vends avec un cadre clair', text: 'Le client doit identifier le vendeur, ce qu’il achète, les conditions et le moyen d’obtenir de l’aide.', bullets: ['Affiche identité du vendeur, produit, prix, accès et livraison.', 'Prépare CGV, confidentialité et politique de remboursement adaptées.', 'Collecte seulement les données nécessaires.', 'Vérifie le consentement préalable pour les traceurs concernés.', 'Utilise uniquement des images, musiques et polices avec droits commerciaux.'], action: 'Parcours ton site comme un client et liste chaque information absente avant le paiement.', links: [{ label: 'Règles CNIL sur les cookies', url: 'https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles-cookies' }] };
    else if (matches.length) {
      const bullets = extractInsights(matches);
      answer = { role: 'coach', title: matches[0].heading, text: `J’ai relié ta question aux parties les plus pertinentes de la formation${matches[1] ? `, notamment « ${matches[1].heading} »` : ''}. Voici l’essentiel à appliquer :`, bullets: bullets.length ? bullets : ['Reformule le problème précis, le résultat attendu et la prochaine preuve à produire.'], action: `Ouvre le module le plus proche de « ${matches[0].heading} », réalise son livrable, puis reviens me dire ce qui bloque.` };
    } else if (q.split(' ').length <= 5) {
      addWebSearch = false;
      answer = { role: 'coach', title: 'Je t’écoute.', text: 'Je comprends ton message. Tu peux continuer à me parler normalement ; je ne vais pas transformer chaque phrase en exercice de formation.' };
    } else {
      addWebSearch = false;
      answer = { role: 'coach', title: 'J’ai besoin d’un détail pour te répondre précisément', text: 'Ta question est trop courte ou ne correspond pas encore clairement à un sujet de la formation. Je préfère préciser plutôt que te donner une réponse passe-partout.', bullets: ['Ce que tu veux vendre', 'À qui tu veux le vendre', 'Le blocage exact que tu rencontres'], action: 'Écris une phrase sous cette forme : « Je vends ___ à ___ et je bloque sur ___. »' };
    }
    if (addWebSearch) {
      const webLink = { label: 'Approfondir cette question sur le Web', url: `https://duckduckgo.com/?q=${encodeURIComponent(value)}` };
      answer.links = [...(answer.links ?? []), webLink];
    }
    setMessages((old) => [...old, { role: 'user', text: value }, answer]);
    setQuestion('');
  }

  return <main>
    <header className="nav">
      <button className="brand" onClick={() => setView('home')} aria-label="Retour à l’accueil"><span className="brand-mark">N</span><span>NEXORA</span></button>
      <nav><button onClick={() => setView('home')}>{diagnosticDone ? 'Mon parcours' : 'Diagnostic'}</button>{diagnosticDone && <button onClick={() => { setIntroStep(0); setView('intro'); }}>Introduction</button>}{introDone && <button onClick={() => setView('academy')}>Formation</button>}<span className="nav-progress"><i style={{ width: `${progress}%` }} />{progress}%</span></nav>
      <button className="nav-cta" onClick={() => diagnosticDone ? setView(introDone ? 'academy' : 'intro') : document.getElementById('diagnostic')?.scrollIntoView({ behavior: 'smooth' })}>{diagnosticDone ? (introDone ? 'Continuer' : 'Voir l’introduction') : 'Mon parcours'}</button>
    </header>

    {view === 'home' ? <section className="onboarding-page" id="diagnostic">
      <div className="onboarding-copy">
        <div className="eyebrow"><span /> NEXORA — TON PARCOURS PERSONNALISÉ</div>
        <h1>{diagnosticDone ? 'Ton parcours est prêt.' : 'Commençons par toi.'}</h1>
        <p>{diagnosticDone ? 'Une seule étape à la fois. NEXORA garde ta progression et t’indique toujours quoi faire ensuite.' : 'Réponds à trois questions. On choisit le bon ordre des modules, puis tu entres directement dans la formation.'}</p>
        <div className="simple-flow"><div><span>1</span><b>Comprends</b></div><i>→</i><div><span>2</span><b>Applique</b></div><i>→</i><div><span>3</span><b>Teste-toi</b></div><i>→</i><div><span>4</span><b>Continue</b></div></div>
        <div className="onboarding-trust"><span>3 programmes distincts</span><span>Un quiz à chaque étape</span><span>Progression séparée</span></div>
      </div>
      <div className="diagnostic-card onboarding-card">
        <div className="diagnostic-top"><small>{diagnosticStep < 3 ? `QUESTION ${diagnosticStep + 1} SUR 3` : 'PARCOURS TERMINÉ'}</small><div className="diagnostic-progress"><i style={{ width: `${Math.min((diagnosticStep + 1) * 25, 100)}%` }} /></div></div>
        {diagnosticStep === 0 && <><h3>Quel est ton premier objectif ?</h3><div className="diagnostic-options"><button onClick={() => { setPath('creator'); setDiagnosticStep(1); }}><span>✦</span><b>Créer mon produit</b><small>De l’idée à ma première offre.</small></button><button onClick={() => { setPath('mrr'); setDiagnosticStep(1); }}><span>↗</span><b>Revendre NEXORA</b><small>Créer mon angle et commencer à vendre.</small></button><button onClick={() => { setPath('hybrid'); setDiagnosticStep(1); }}><span>◎</span><b>Faire les deux</b><small>Revendre puis créer mes produits.</small></button></div></>}
        {diagnosticStep === 1 && <><h3>Quel est ton niveau actuel ?</h3><div className="diagnostic-options"><button onClick={() => { setLearnerLevel('beginner'); setDiagnosticStep(2); }}><span>01</span><b>Je pars de zéro</b><small>Je veux des explications très simples.</small></button><button onClick={() => { setLearnerLevel('started'); setDiagnosticStep(2); }}><span>02</span><b>J’ai déjà commencé</b><small>J’ai une idée ou un début d’offre.</small></button><button onClick={() => { setLearnerLevel('seller'); setDiagnosticStep(2); }}><span>03</span><b>Je vends déjà</b><small>Je veux améliorer mon système.</small></button></div></>}
        {diagnosticStep === 2 && <><h3>Quel rythme te convient ?</h3><div className="diagnostic-options"><button onClick={() => { setPace('fast'); finishDiagnostic(); }}><span>7J</span><b>Rapide</b><small>Une priorité claire chaque jour.</small></button><button onClick={() => { setPace('steady'); finishDiagnostic(); }}><span>21J</span><b>Régulier</b><small>Le meilleur équilibre pour progresser.</small></button><button onClick={() => { setPace('deep'); finishDiagnostic(); }}><span>30J</span><b>Approfondi</b><small>Plus de pratique entre les modules.</small></button></div></>}
        {diagnosticStep === 3 && <div className="diagnostic-result"><span>✓ TON PROGRAMME EST PRÊT</span><h3>{program.name}</h3><p>{program.promise}</p>{completedInProgram > 0 && <div className="resume-progress"><i><em style={{ width: `${progress}%` }} /></i><small>{progress}% terminé · étape {Math.max(currentPosition + 1, 1)} sur {programSteps.length}</small></div>}<button className="primary enter-academy" onClick={() => introDone ? openModule(completedInProgram ? current : orderedIndexes[0]) : setView('intro')}>{introDone ? (completedInProgram ? 'Reprendre ma formation' : 'Accéder à la formation') : 'Découvrir mon programme'} <span>→</span></button><button className="restart-diagnostic" onClick={() => { setDiagnosticDone(false); setIntroDone(false); setDiagnosticStep(0); }}>Modifier mes réponses</button></div>}
      </div>
    </section> : view === 'intro' ? <section className={`program-intro program-${path}`}>
      <div className="intro-hero">
        <button className="back" onClick={() => setView('home')}>← Retour au diagnostic</button>
        <span className="program-signature">{program.signature}</span>
        <h1>{program.name}</h1><p>{program.promise}</p>
        <div className="program-facts"><div><b>{program.duration}</b><span>durée conseillée</span></div><div><b>{programSteps.length}</b><span>étapes exclusives</span></div><div><b>{dailyTime}</b><span>par session</span></div></div>
        <div className="program-preview">{Array.from(new Set(programSteps.map((step) => step.phase))).slice(0, 5).map((phase, index) => <div key={phase}><span>0{index + 1}</span><b>{phase}</b></div>)}</div>
      </div>
      <div className="intro-profile-card">
        <div className="diagnostic-top"><small>{introStep === 0 ? 'INTRODUCTION' : introStep < 4 ? `PERSONNALISATION ${introStep} SUR 3` : 'PLAN PERSONNALISÉ'}</small><div className="diagnostic-progress"><i style={{ width: `${(introStep + 1) * 20}%` }} /></div></div>
        {introStep === 0 && <div className="intro-welcome intro-welcome-complete"><span>✦</span><h2>Bienvenue dans {program.name}.</h2><p className="intro-reassurance">Tu n’as pas besoin d’être expert, de connaître tous les mots du marketing ou d’avoir déjà vendu. Le programme t’accompagne depuis ton point de départ jusqu’à un système que tu peux montrer, tester et améliorer.</p><div className="intro-outcomes">{introOutcomes[path].map((outcome, index) => <article key={outcome.title}><small>0{index + 1}</small><div><b>{outcome.title}</b><p>{outcome.text}</p></div></article>)}</div><div className="how-to-learn"><div><span>1</span><p><b>Lis le cours</b> avec les explications simples et les exemples.</p></div><div><span>2</span><p><b>Réalise la mission</b> avec le modèle prêt à copier.</p></div><div><span>3</span><p><b>Fais le mini-quiz</b> puis passe automatiquement à la suite.</p></div></div><div className="nexo-intro"><span>N</span><div><b>Si tu bloques, Nexo est toujours là.</b><p>Ouvre la bulle en bas à droite. Explique ton problème avec tes propres mots : Nexo connaît ton programme, ton étape et peut simplifier le cours.</p></div></div><p className="intro-rule"><b>Ta seule règle :</b> ne cherche pas à tout terminer d’un coup. Termine une petite mission avant d’ouvrir l’étape suivante.</p><button className="next-step-cta" onClick={() => setIntroStep(1)}><small>L’INTRODUCTION EST TERMINÉE</small>Personnaliser mon rythme <span>→</span></button></div>}
        {introStep === 1 && <><h2>Combien de temps peux-tu travailler par jour ?</h2><div className="profile-options"><button onClick={() => { setDailyTime('15 min'); setIntroStep(2); }}><b>15 min</b><span>Une petite action très ciblée</span></button><button onClick={() => { setDailyTime('30 min'); setIntroStep(2); }}><b>30 min</b><span>Le rythme recommandé</span></button><button onClick={() => { setDailyTime('60 min'); setIntroStep(2); }}><b>1 heure</b><span>Pour avancer plus vite</span></button></div></>}
        {introStep === 2 && <><h2>Quand veux-tu viser ta première vente ?</h2><div className="profile-options"><button onClick={() => { setSaleTarget('7 jours'); setIntroStep(3); }}><b>Dans 7 jours</b><span>Priorité au lancement rapide</span></button><button onClick={() => { setSaleTarget('30 jours'); setIntroStep(3); }}><b>Dans 30 jours</b><span>Construire puis vendre proprement</span></button><button onClick={() => { setSaleTarget('Sans date fixe'); setIntroStep(3); }}><b>Sans pression</b><span>Apprendre avant de fixer une date</span></button></div></>}
        {introStep === 3 && <><h2>Avec quoi commences-tu ?</h2><div className="profile-options"><button onClick={() => { setStartingPoint('Je pars de zéro'); setIntroStep(4); }}><b>Rien pour l’instant</b><span>Idée, audience et offre à construire</span></button><button onClick={() => { setStartingPoint('J’ai une audience'); setIntroStep(4); }}><b>Une petite audience</b><span>Je dois apprendre à la convertir</span></button><button onClick={() => { setStartingPoint('J’ai déjà une offre'); setIntroStep(4); }}><b>Une offre existante</b><span>Je dois la rendre plus claire et vendable</span></button></div></>}
        {introStep === 4 && <div className="profile-result"><span>TON CONTRAT D’ACTION</span><h2>Une première vente visée en {saleTarget.toLowerCase()}.</h2><ul><li><b>Temps :</b> {dailyTime} par jour</li><li><b>Départ :</b> {startingPoint}</li><li><b>Programme :</b> {program.name}</li><li><b>Règle :</b> une mission terminée avant le module suivant</li></ul><button className="next-step-cta finish-step" onClick={finishIntroduction}><small>TON ÉTAPE 1 EST PRÊTE</small>Entrer dans la formation <span>→</span></button></div>}
      </div>
    </section> : view === 'academy' ? <section className="academy">
      <aside className="course-sidebar"><div className="program-sidebar-head"><small>{program.signature}</small><b>{program.name}</b><span>{program.duration} · {programSteps.length} étapes</span><button onClick={() => { setIntroStep(0); setView('intro'); }}>Revoir l’introduction →</button></div><div className="path-switcher"><small>CHANGER DE PROGRAMME</small><select value={path} onChange={(e) => switchProgram(e.target.value as PathId)}>{paths.map((item) => <option value={item.id} key={item.id}>{item.label} — {item.duration}</option>)}</select></div><label className="mobile-module-picker"><small>ÉTAPE À OUVRIR</small><select value={current} onChange={(e) => openModule(Number(e.target.value))}>{programSteps.map((step, position) => <option value={step.module} key={`${step.module}-${step.title}`}>{position + 1}. {step.title}</option>)}</select></label><div className="progress-box"><div><span>Progression</span><b>{progress}%</b></div><i><em style={{ width: `${progress}%` }} /></i><small>{completedInProgram} sur {programSteps.length} étapes terminées</small></div><div className="lesson-list">{programSteps.map((step, position) => <button className={current === step.module ? 'active' : ''} key={`${step.module}-${step.title}`} onClick={() => openModule(step.module)}><span>{done.includes(step.module) ? '✓' : String(position + 1).padStart(2, '0')}</span><div><small>{step.phase}</small><b>{step.title}</b></div></button>)}</div></aside>
      <article className="lesson"><button className="back" onClick={() => setView('home')}>← Mon tableau de bord</button><div className="lesson-meta"><span>{currentStep?.phase}</span><span>Étape {String(currentPosition + 1).padStart(2, '0')} / {programSteps.length}</span><span>{dailyTime}</span></div><h1>{currentStep?.title ?? modules[current].title}</h1><p className="outcome">Objectif : {modules[current].outcome}</p><div className="learner-context"><span>{program.name}</span><span>1re vente · {saleTarget}</span><span>{startingPoint}</span></div><div className="lesson-tabs">{tabs.map((tab) => <button className={activeTab === tab ? 'active' : ''} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>
        <div className="lesson-panel">
          {activeTab === 'Cours' && <><div className="panel-label">1 · COMPRENDRE</div><BeginnerPrimer module={modules[current]} index={current} path={path} />{completeLesson ? <CourseContent text={completeLesson} /> : <><h2>Chargement du cours…</h2>{modules[current].lesson.map((text) => <p key={text}>{text}</p>)}</>}<div className="insight"><span>✦</span><div><b>À retenir</b><p>Tu n’as pas besoin de tout mémoriser. Comprends l’idée, produis ta mission, puis vérifie-toi.</p></div></div><button className="next-step-cta" onClick={() => setActiveTab('Mission')}><small>ÉTAPE SUIVANTE</small>Passer à ma mission <span>→</span></button></>}
          {activeTab === 'Mission' && <><div className="panel-label">2 · APPLIQUER</div><h2>Mission {program.name}</h2><div className={`path-mission path-mission-${path}`}><span>{currentStep?.phase}</span><p>{path === 'creator' ? 'Tu construis ici une pièce de ton produit propriétaire.' : path === 'mrr' ? 'Tu adaptes ici NEXORA pour créer une offre que tes concurrents ne présentent pas comme toi.' : 'Tu réalises cette étape pour vendre, apprendre du marché et préparer ton actif propriétaire.'}</p></div><div className="task"><span>01</span><p>{modules[current].action}</p></div><div className="task"><span>02</span><p>Utilise le modèle ci-dessous. Il sert de point de départ, pas de réponse parfaite.</p></div><div className="copy-box">{modules[current].template}<button onClick={() => navigator.clipboard?.writeText(modules[current].template)}>Copier</button></div><label className="work-label">Ton travail ou tes notes<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Écris ici ce que tu as produit ou décidé…" /></label><button className="next-step-cta" onClick={() => setActiveTab('Quiz')}><small>ÉTAPE SUIVANTE</small>Faire le mini-quiz <span>→</span></button></>}
          {activeTab === 'Quiz' && <><div className="panel-label">3 · VÉRIFIER</div><h2>Ton mini-quiz</h2><p className="quiz-skip">Une question, puis une correction expliquée. Chaque étape de {program.name} possède sa validation.</p><div className="quiz-card"><h3>{quizzes[current].question}</h3><div className="quiz-options">{quizzes[current].options.map((option, index) => <button className={quizAnswers[current] === index ? (index === quizzes[current].correct ? 'chosen correct' : 'chosen wrong') : ''} onClick={() => setQuizAnswers((old) => ({ ...old, [current]: index }))} key={option}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{quizAnswers[current] !== undefined && <div className={`quiz-feedback ${quizAnswers[current] === quizzes[current].correct ? 'correct' : 'wrong'}`}><b>{quizAnswers[current] === quizzes[current].correct ? '✓ Bonne réponse' : '→ À revoir'}</b><p>{quizzes[current].explanation}</p></div>}</div><div className="checkpoint-box"><b>Avant de continuer</b><p>{modules[current].checkpoint}</p></div>{quizAnswers[current] !== undefined ? <button className="next-step-cta finish-step" onClick={validateAndContinue}><small>{currentPosition === orderedIndexes.length - 1 ? 'PROGRAMME TERMINÉ' : 'ÉTAPE VALIDÉE'}</small>{currentPosition === orderedIndexes.length - 1 ? 'Ouvrir ma conclusion' : 'Continuer à l’étape suivante'} <span>→</span></button> : <p className="answer-first">Choisis une réponse pour débloquer la suite.</p>}<button className={`complete subtle-complete ${done.includes(current) ? 'done' : ''}`} onClick={toggleDone}>{done.includes(current) ? '✓ Étape déjà terminée' : 'Marquer sans faire le quiz'}</button></>}
        </div><div className="lesson-nav"><button disabled={currentPosition <= 0} onClick={() => openModule(orderedIndexes[currentPosition - 1])}>← Module précédent</button><button disabled={currentPosition >= orderedIndexes.length - 1} onClick={() => openModule(orderedIndexes[currentPosition + 1])}>Module suivant →</button></div>
      </article>
    </section> : <section className={`course-conclusion conclusion-${path}`}>
      <div className="conclusion-hero"><span>PROGRAMME TERMINÉ · {program.name}</span><h1>Tu sais construire.<br />Maintenant, mets-le en vente.</h1><p>Tu as terminé le parcours. La dernière étape transforme ton travail en une offre achetable, livrable et revendable.</p><div className="completion-ring"><b>100%</b><small>{programSteps.length} étapes validées</small></div></div>
      <div className="rights-card"><div><span>LICENCE NEXORA</span><h2>Droits de revente à 100 %</h2><p>Tu peux rebrander NEXORA selon les autorisations de la licence, la présenter comme ton offre et conserver 100 % du chiffre d’affaires de tes propres ventes. Tu restes responsable des frais, taxes, remboursements, support et règles applicables.</p></div><ul><li>Créer ton nom, ton angle et tes bonus</li><li>Vendre la formation à tes propres clients</li><li>Conserver le chiffre d’affaires de tes ventes</li><li>Respecter les limites exactes de la licence fournie</li></ul></div>
      <div className="launch-kit"><div className="section-head"><span>LA MISE EN VENTE FINALE</span><h2>De la formation au premier paiement.</h2></div><div className="launch-grid">
        <article><span>01</span><h3>Crée ta page de vente</h3><p>Écris cible, problème, résultat, méthode, contenu, bonus, prix, preuves, FAQ et un seul bouton d’achat. Commence avec une page simple avant d’ajouter des effets.</p><b>LIVRABLE · une page lisible sur téléphone</b></article>
        <article><span>02</span><h3>Ouvre ton compte Stripe</h3><p>Crée le compte sur Stripe, renseigne ton identité ou entreprise, ajoute le compte bancaire, active la double authentification puis termine les vérifications demandées.</p><b>LIVRABLE · compte vérifié et sécurisé</b></article>
        <article><span>03</span><h3>Crée le paiement</h3><p>Dans Stripe, crée le produit, son prix puis un Payment Link ou un Checkout. Place ce lien derrière le bouton d’achat. Ne mets jamais une clé secrète dans la page.</p><b>LIVRABLE · paiement test accessible</b></article>
        <article><span>04</span><h3>Héberge et livre la formation</h3><p>Publie les fichiers sur ton espace membre ou hébergement, crée l’email d’accès, explique le support et teste le parcours complet avec une autre adresse.</p><b>LIVRABLE · paiement → email → accès</b></article>
      </div></div>
      <div className="final-check"><h2>Le test avant ouverture</h2><div><span>✓ Page comprise en 5 secondes</span><span>✓ Paiement mobile testé</span><span>✓ Email reçu</span><span>✓ Formation accessible</span><span>✓ Support visible</span><span>✓ Conditions vérifiées</span></div><button className="primary" onClick={() => setView('home')}>Retour à mon tableau de bord</button></div>
    </section>}
    <button className={`coach-bubble ${chatOpen ? 'open' : ''}`} onClick={() => setChatOpen((v) => !v)} aria-label="Ouvrir le coach Nexo"><span>✦</span>{chatOpen ? 'Fermer' : 'Demander à Nexo'}</button>
    {chatOpen && <aside className="coach-panel" aria-label="Coach Nexo">
      <header><div><span className="coach-avatar">N</span><div><b>Nexo</b><small>Coach personnel NEXORA</small></div></div><button onClick={() => setChatOpen(false)}>×</button></header>
      <div className="coach-notice">Formation complète · contexte du parcours · ressources officielles</div>
      <div className="coach-messages">{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.text}-${index}`}>{message.title && <b className="message-title">{message.title}</b>}<p>{message.text}</p>{message.bullets && <ul>{message.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}{message.action && <div className="message-action"><span>MISSION</span>{message.action}</div>}{message.links?.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label} ↗</a>)}</div>)}</div>
      <div className="coach-suggestions"><button onClick={() => setQuestion('Comment obtenir ma première vente ?')}>1re vente</button><button onClick={() => setQuestion('Comment créer mon produit ?')}>Créer mon produit</button><button onClick={() => setQuestion('Comment fonctionne la revente MRR ?')}>Droits MRR</button></div>
      <form onSubmit={(e) => { e.preventDefault(); askCoach(); }}><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Pose ta question…" aria-label="Question pour Nexo" /><button type="submit">↑</button></form>
    </aside>}
  </main>;
}
