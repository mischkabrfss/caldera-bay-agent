// Conseils propres à chaque niche (public, angles, idées de vidéos, photos, points de vigilance, accroches).
export const NICHE_INFO = {
  mode: { audience: 'Surtout des 18-35 ans qui achètent sur un coup de cœur vu en vidéo, souvent le soir et le week-end.',
    angles: ['La pièce qui fait tout un look à elle seule', 'Avant/après : tenue basique puis avec le produit', 'Le confort sans sacrifier le style'],
    ideas: ['« 3 façons de le porter »', 'Prépare-toi avec moi en le portant', 'Réaction d’une amie qui découvre la tenue', 'Gros plan sur la matière et les finitions', 'Le même vêtement sur 2 morphologies'],
    photo: 'Porté, en lumière naturelle, plus un gros plan sur la matière. Ajoute un guide des tailles en centimètres.',
    watch: 'Les tailles sont la 1re cause de retours en mode : demande le guide des tailles exact à ton agent et affiche-le sur ta page.',
    hooks: ['« La pièce que tout le monde me demande en ce moment »', '« 3 façons de porter le même haut »', '« Ce look complet à moins de [prix] € »'] },
  beaute: { audience: 'Surtout des 18-40 ans qui veulent voir le résultat avant d’acheter et lisent beaucoup les avis.',
    angles: ['Le résultat visible en quelques secondes', 'La routine simple qui remplace 3 produits', 'L’avis honnête après une semaine'],
    ideas: ['Avant/après sans filtre, même lumière', 'Routine du matin en 30 secondes', 'La texture en très gros plan', 'Réponse à « ça marche vraiment ? »', 'Jour 1 contre jour 7'],
    photo: 'Texture en gros plan, produit en main, résultat sans filtre : les filtres cassent la confiance.',
    watch: 'Les cosmétiques sont très encadrés en Europe : vends uniquement des produits avec un étiquetage conforme (ingrédients, responsable dans l’UE) et ne promets jamais d’effet médical.',
    hooks: ['« Sans filtre : voilà le vrai résultat »', '« La routine qui remplace 3 produits »', '« J’ai testé 7 jours, je te dis tout »'] },
  maison: { audience: 'Des 25-45 ans qui aménagent leur logement et achètent ce qui rend le quotidien plus simple ou plus beau.',
    angles: ['Le petit objet qui change une pièce', 'L’astuce qui fait gagner du temps', 'L’ambiance avant/après'],
    ideas: ['Avant/après d’une pièce ou d’un tiroir', 'Rangement ou nettoyage « satisfaisant »', 'Ambiance du soir avec le produit', 'Installation en 20 secondes', 'Le produit dans un vrai appartement'],
    photo: 'En situation dans une vraie pièce, plus une photo qui montre la taille réelle (dimensions en cm sur la page).',
    watch: 'Objets fragiles ou lourds : vérifie l’emballage avec ton agent, la casse et le port mangent vite la marge. Un produit électrique doit porter le marquage CE.',
    hooks: ['« L’objet qui a changé mon salon »', '« Avant / après en 20 secondes »', '« L’astuce rangement que personne ne connaît »'] },
  bijoux: { audience: 'Des 18-40 ans qui achètent pour elles ou pour offrir, très sensibles aux photos et à l’emballage.',
    angles: ['Le cadeau qui fait effet', 'Le bijou qui va avec tout', 'Le détail qui fait « cher » sans l’être'],
    ideas: ['Déballage avec un joli écrin', 'Porté en gros plan, au soleil', 'Idée cadeau pour une date (fête des mères, Noël…)', 'Le bijou sur 3 tenues différentes', '« On me demande toujours où je l’ai eu »'],
    photo: 'Porté sur la peau, en lumière naturelle, plus un fond neutre. L’écrin compte : montre-le.',
    watch: 'Demande à ton agent la matière exacte (acier inoxydable, plaqué or…) et s’il est sans nickel : les allergies causent beaucoup de retours. N’écris « or » que si c’est vrai.',
    hooks: ['« Le cadeau qui fait toujours effet »', '« Il va avec absolument tout »', '« On me demande toujours où je l’ai eu »'] },
  sport: { audience: 'Des 18-45 ans motivés par un objectif (forme, performance, bien-être) qui veulent voir le produit en action.',
    angles: ['La sensation pendant l’effort', 'L’accessoire qui remplace la salle', 'Le confort pendant une vraie séance'],
    ideas: ['Une vraie séance filmée avec le produit', 'Routine de 5 minutes à la maison', 'Test de solidité', 'L’erreur fréquente et comment l’éviter', 'Avant/après de posture ou de confort'],
    photo: 'En action, pendant une vraie séance, plus des photos de détails (matière, tailles).',
    watch: 'Aucune allégation santé : n’écris jamais qu’un produit fait maigrir ou soigne. Parle de confort, de motivation et d’usage.',
    hooks: ['« Ma séance de 5 minutes, sans salle »', '« L’accessoire qui a changé mes entraînements »', '« L’erreur que tout le monde fait (et comment l’éviter) »'] },
  animaux: { audience: 'Des propriétaires de chiens et de chats qui achètent par amour pour leur animal et adorent les vidéos où il réagit.',
    angles: ['La réaction de l’animal', 'Le problème réglé (poils, stress, balade)', 'Le confort et la sécurité de l’animal'],
    ideas: ['Première réaction de l’animal avec le produit', 'Avant/après (poils, désordre, tirage en laisse)', 'Une journée avec mon chien', 'Test de solidité face aux dents', 'Le produit sur un petit et un grand chien'],
    photo: 'L’animal qui utilise le produit, plus une photo avec les tailles (petit, moyen, grand).',
    watch: 'Tailles et sécurité d’abord : un harnais ou un jouet mal dimensionné revient en retour. Ne promets aucun effet vétérinaire.',
    hooks: ['« Sa réaction quand il l’a vu… »', '« Fini les poils sur le canapé »', '« Mon chien tirait en laisse, jusqu’à ça »'] },
  any: { audience: 'Tu choisiras ta niche au jour 2 : prends un univers que tu comprends, c’est plus facile de parler à tes clients.',
    angles: ['Le problème réglé', 'L’effet « waouh » visible en vidéo', 'L’idée cadeau'],
    ideas: ['Avant/après', 'Déballage', 'Réaction d’un proche', 'Le produit compris en 3 secondes', 'Réponse à une question en commentaire'],
    photo: 'En situation, plus un gros plan et une photo qui montre la taille.',
    watch: 'Évite au début les produits fragiles, électriques, cosmétiques ou de marque : plus de règles et plus de retours.',
    hooks: ['« Le truc que tout le monde me demande »', '« Je ne m’attendais pas à ça pour ce prix »', '« Avant / après : regarde »'] },
};

// Liens des outils cités dans les missions (pages officielles ou onglets Shoplift).
export const TOOLS = {
  radar: ['Radar Shoplift', 'app.html#radar'], espion: ['Espion Shoplift', 'app.html#espion'], agents: ['Agents Shoplift', 'app.html#agents'], audit: ['Audit Shoplift', 'app.html#audit'],
  shopify: ['Shopify', 'https://www.shopify.com/fr'], canva: ['Canva', 'https://www.canva.com'], capcut: ['CapCut', 'https://www.capcut.com'], tiktok: ['TikTok', 'https://www.tiktok.com'],
  instagram: ['Instagram', 'https://www.instagram.com'], tiktokads: ['TikTok Ads', 'https://ads.tiktok.com'], urssaf: ['URSSAF', 'https://autoentrepreneur.urssaf.fr'],
};
// Résultat attendu et outils de chaque mission (même ordre que les 30 jours).
const EXTRA = [
  ['Tu sais exactement comment tu vas gagner de l’argent', []], ['10 produits candidats avec leur prix', ['radar']], ['Tes 5 produits qui ont une vraie demande', ['tiktok']],
  ['Tes concurrents analysés et ton avantage', ['espion']], ['Ton prix de vente minimum', []], ['Ton produit n°1 et 2 produits de secours', []], ['Ton nom, ton logo, tes 2 couleurs', ['canva']],
  ['Les tarifs de 2 agents côte à côte', ['agents']], ['Ton échantillon commandé', []], ['Ta boutique créée et reliée à ton nom de domaine', ['shopify']], ['Ta page produit en ligne (encore privée)', ['shopify']],
  ['Tes pages légales complètes', ['shopify', 'urssaf']], ['Paiements et livraison prêts', ['shopify']], ['Une boutique testée de bout en bout', ['audit']], ['10 plans vidéo et 5 vraies photos', []],
  ['Tes comptes TikTok et Instagram prêts', ['tiktok', 'instagram']], ['Ta première vidéo montée', ['capcut']], ['@ADS', []], ['La meilleure de tes 3 accroches', ['tiktok']],
  ['Ta boutique ouverte à tous', ['shopify']], ['Ton tableau de suivi', []], ['Le point qui bloque tes ventes', ['shopify']], ['Une page produit plus convaincante', ['audit']],
  ['Un pack et un seuil de livraison offerte', ['shopify']], ['5 nouvelles variantes de tes meilleures vidéos', ['capcut']], ['Des clients contents (et du contenu gratuit)', []], ['@ADS2', []],
  ['Ta décision : garder ou changer de produit', []], ['Tes comptes à jour', ['urssaf']], ['Ton objectif du mois 2', []],
];

// Plan de lancement jour par jour (30 missions), adapté aux réponses du débutant. Textes fixes : rien à maintenir.
// c = { ads, small, nicheTxt, lo, hi, product }
export function planDays(c) {
  const W = [
    'Les bases et ton produit',
    'Fournisseur et boutique',
    'Contenu et lancement',
    'Analyse et accélération',
  ];
  const D = [
    // ---------- Semaine 1 ----------
    { title: 'Comprends le modèle avant de dépenser 1 €', min: 20, steps: [
      c.small ? 'Ton modèle : le dropshipping. Un client commande sur ta boutique, tu passes la commande à ton agent, il expédie directement chez le client. Tu gardes la différence.' : 'Ton modèle : tu testes en dropshipping (zéro stock), puis tu commandes un petit stock du produit qui vend tous les jours.',
      'Ton travail se résume à 3 choses : choisir un produit qui donne envie, avoir une page qui rassure, faire venir des gens sur cette page.',
      'Lis le bloc « Ton budget » plus bas : tu sais exactement où va chaque euro.',
      'Crée une note sur ton téléphone « Ma boutique » : tu y noteras tes idées, tes produits et tes chiffres pendant 30 jours.',
    ], tip: 'La plupart des débutants échouent parce qu’ils changent de produit tous les 3 jours. Le plan te fait tester proprement, avec des règles claires.' },
    { title: 'Liste 10 produits candidats', min: 40, steps: [
      `Pars des produits proposés plus bas dans ton plan : ce sont de vrais produits relevés sur des boutiques qui vendent, dans ${c.nicheTxt}.`,
      'Si ton offre inclut le radar Shoplift, ouvre l’onglet Radar et ajoute les produits vendus par plusieurs boutiques.',
      'Pour chaque produit, note : son nom, son prix, le nombre de boutiques qui le vendent, et pourquoi il plaît.',
      `Barre ceux qui ne se revendent pas entre ${c.lo} et ${c.hi} € : ${c.ads ? 'en dessous, la pub mange toute ta marge' : 'au-dessus, on n’achète plus sur un coup de cœur'}.`,
    ], tip: 'Un bon produit débutant : il règle un problème ou fait « waouh » en vidéo, il n’est pas en vente au supermarché, il est léger et ne casse pas.' },
    { title: 'Vérifie que les gens en veulent vraiment', min: 45, steps: [
      'Ouvre TikTok, tape le nom du produit (en français puis en anglais) et filtre par date : ce mois-ci.',
      'Bon signe : plusieurs vidéos récentes avec beaucoup de vues, et des commentaires « c’est où ? », « le lien ? ».',
      'Mauvais signe : les seules vidéos ont plus d’un an, ou personne ne demande où l’acheter.',
      'Fais pareil sur Instagram (Reels) et sur Google : « avis + nom du produit ».',
      'Garde tes 5 meilleurs produits dans ta note.',
    ], tip: 'Les commentaires valent plus que les vues : une personne qui demande le lien est une cliente potentielle.' },
    { title: 'Espionne ceux qui le vendent déjà', min: 45, steps: [
      'Cherche « nom du produit + boutique » sur Google et repère 2 ou 3 boutiques Shopify qui le vendent.',
      'Ouvre l’onglet Espion de Shoplift et colle l’adresse d’une boutique : tu vois ses best-sellers, ses prix et ses nouveautés.',
      'Note leur prix de vente, le nombre de photos, la présence d’avis clients et leur promesse principale.',
      'Trouve 1 chose qu’ils font mal (photos moches, pas d’avis, livraison floue) : ce sera ton avantage.',
    ] },
    { title: 'Calcule ta marge (sans te mentir)', min: 30, steps: [
      'Demande-toi le coût réel : prix du produit + livraison jusqu’au client (tu auras le chiffre exact de ton agent en semaine 2, mets une estimation pour l’instant).',
      'Utilise le calculateur de marge plus bas : entre le coût, la livraison et ton prix de vente.',
      'Règle simple : vends au moins 2,5 à 3 fois ton coût total, sinon tu n’auras rien pour la pub, les retours et les imprévus.',
      c.ads ? 'Regarde la ligne « ventes pour rembourser 100 € de pub » : si elle dépasse 5, cherche un produit plus rentable.' : 'Même sans pub au départ, garde une marge confortable : tu pourras booster une vidéo qui marche plus tard.',
    ] },
    { title: 'Choisis ton produit n°1 (et 2 de secours)', min: 20, steps: [
      'Note chaque produit de ta liste sur 5 points : effet « waouh » en vidéo, problème réglé, introuvable en magasin, bonne marge, facile à expédier.',
      'Le meilleur total devient ton produit n°1. Les 2 suivants sont tes produits de secours.',
      'Écris en une phrase pourquoi quelqu’un l’achèterait : ce sera la base de tes vidéos et de ta page.',
    ], tip: 'Ne lance qu’un seul produit au début. Une boutique « fourre-tout » convertit moins bien qu’une page dédiée à un produit fort.' },
    { title: 'Trouve ton nom et ton identité', min: 40, steps: [
      'Choisis un nom dans la liste « Noms de boutique » plus bas, ou inspire-t’en.',
      'Vérifie qu’il est libre : sur Instagram, sur TikTok, et en nom de domaine (.fr ou .com) chez un registraire.',
      'Crée un logo simple sur Canva (gratuit) : ton nom en belle typographie suffit.',
      'Choisis 2 couleurs et garde-les partout (boutique, vidéos, emballage).',
    ] },
    // ---------- Semaine 2 ----------
    { title: 'Contacte 2 agents de sourcing', min: 30, steps: [
      'Ouvre l’onglet Agents de Shoplift : chaque agent a ses coordonnées vérifiées et son point fort.',
      'Copie le « Message pour l’agent » plus bas (en anglais, la langue des agents) et envoie-le à 2 agents sur WhatsApp.',
      'Demande : prix du produit, prix et délai de livraison vers la France, prix d’un échantillon, possibilité de logo sur l’emballage.',
      'Mets leurs réponses côte à côte dans ta note.',
    ], tip: 'Le moins cher n’est pas toujours le meilleur : un agent qui répond vite et clairement t’évitera des clients mécontents.' },
    { title: 'Commande ton échantillon', min: 20, steps: [
      'Choisis l’agent le plus clair (prix + délai + réactivité) et commande 1 échantillon à ton adresse.',
      'Mets à jour le calculateur de marge avec les vrais chiffres de l’agent.',
      'Pendant l’attente (souvent 1 à 2 semaines), tu montes la boutique : c’est le programme des prochains jours.',
    ] },
    { title: 'Crée ta boutique Shopify', min: 45, steps: [
      'Va sur shopify.com et lance l’essai gratuit (le tarif de l’abonnement est affiché sur leur site, vérifie l’offre du moment).',
      'Pays : France, devise : euro. Ajoute ton nom de boutique.',
      'Thème : Boutique en ligne > Thèmes. Garde un thème gratuit et rapide (Dawn par exemple).',
      'Relie ton nom de domaine : Paramètres > Domaines.',
      'Ajoute ton logo et tes 2 couleurs dans l’éditeur du thème.',
    ] },
    { title: 'Ta page produit (la plus importante)', min: 90, steps: [
      'Produits > Ajouter : un titre clair (ce que c’est + le bénéfice), pas le titre anglais du fournisseur.',
      'Mets 5 photos minimum : le produit seul, en situation, en gros plan, la taille, l’emballage. Tu remplaceras par tes propres photos à la réception de l’échantillon.',
      'Colle la « Fiche produit à compléter » plus bas et remplis les [crochets] avec ce que tu as vérifié.',
      'Prix : celui calculé jour 5. N’affiche un prix barré que si tu as vraiment vendu à ce prix avant (un faux prix barré est interdit en France).',
      'Ajoute une FAQ sous la description (utilise le modèle « FAQ » plus bas).',
    ], tip: 'Regarde ta page sur ton téléphone : 8 clients sur 10 achèteront depuis un mobile.' },
    { title: 'Les pages obligatoires et ton statut', min: 60, steps: [
      'Paramètres > Politiques : Shopify propose des modèles pour les CGV, la confidentialité, les remboursements. Relis-les et complète-les.',
      'Ajoute les mentions légales (ton nom ou ta société, ton adresse, ton numéro SIRET) et une page Contact.',
      'Retours : en Europe, le client a 14 jours pour changer d’avis après réception. Écris-le clairement.',
      'Pour vendre régulièrement, déclare ton activité (la micro-entreprise est la plus simple, sur le site officiel de l’URSSAF).',
      'Copie les modèles « À propos » et « Livraison et retours » plus bas pour finir tes pages.',
    ] },
    { title: 'Paiements, livraison et taxes', min: 45, steps: [
      'Paramètres > Paiements : active Shopify Payments (cartes, Apple Pay) et ajoute PayPal.',
      'Paramètres > Expédition : crée un tarif France avec le délai réel donné par ton agent (annonce un délai honnête, pas « 48 h » si c’est 10 jours).',
      'Astuce : une livraison offerte dès un certain montant pousse à prendre 2 produits.',
      'Paramètres > Taxes : vérifie selon ton statut (en micro-entreprise, souvent sans TVA au départ, renseigne-toi selon ta situation).',
    ] },
    { title: 'Teste tout comme un vrai client', min: 30, steps: [
      'Passe une commande test : Paramètres > Paiements, active le mode test, achète, puis désactive-le.',
      'Vérifie sur ton téléphone : la page charge vite ? le bouton d’achat est visible sans chercher ? les frais de livraison sont clairs ?',
      'Lance l’audit Shoplift sur ta boutique (onglet Audit) et corrige les points rouges en priorité.',
      'Fais tester la boutique à 2 proches et note ce qui les bloque.',
    ] },
    // ---------- Semaine 3 ----------
    { title: 'Filme ton échantillon', min: 60, steps: [
      'Lumière du jour, téléphone à la verticale (9:16), objectif nettoyé.',
      'Filme 10 plans bruts de 3 à 5 secondes : déballage, mains qui utilisent le produit, gros plans, avant/après, réaction.',
      'Prends aussi 5 vraies photos pour remplacer celles du fournisseur sur ta page.',
      'Range tout dans un dossier « Rushes » : tu vas monter plusieurs vidéos avec les mêmes plans.',
    ], tip: 'Des vidéos « faites à la main » marchent souvent mieux que des vidéos trop parfaites : elles ressemblent à une recommandation, pas à une pub.' },
    { title: 'Crée tes comptes', min: 30, steps: [
      'Crée un compte TikTok au nom de ta boutique, passe-le en compte professionnel.',
      'Fais pareil sur Instagram (compte professionnel).',
      'Bio : ce que tu vends en une phrase + le lien de ta boutique.',
      'Dans Shopify, ajoute le canal de vente TikTok (et Facebook & Instagram) : il installe le suivi des visites et des ventes.',
    ] },
    { title: 'Monte ta première vidéo', min: 60, steps: [
      'Prends le « Script vidéo 1 » plus bas.',
      'Monte sur CapCut (gratuit) : 15 à 25 secondes, l’accroche dans les 2 premières secondes, sous-titres activés.',
      'Musique tendance en fond, volume bas : on doit comprendre le texte sans le son.',
      'Termine par une action claire : « lien en bio ».',
    ] },
    c.ads
      ? { title: 'Prépare ta première pub', min: 60, steps: [
        'Ouvre le gestionnaire de pubs TikTok (ou Meta) et vérifie que le suivi des ventes Shopify est bien relié.',
        'Crée une campagne « Ventes » avec 3 à 5 vidéos différentes dans la même campagne.',
        'Petit budget par jour au début : l’objectif est d’apprendre quelle vidéo fait cliquer, pas de gagner tout de suite.',
        'Publie aussi les mêmes vidéos en organique sur ton compte : c’est gratuit.',
      ], tip: 'Ne touche à rien pendant 2 ou 3 jours après le lancement d’une pub : la plateforme a besoin de temps pour apprendre.' }
      : { title: 'Lance ta routine de publication', min: 60, steps: [
        'Publie ta première vidéo, puis tiens 1 à 2 vidéos par jour, aux mêmes heures (souvent midi et en soirée).',
        'Réponds à chaque commentaire, et transforme les meilleures questions en nouvelles vidéos.',
        'Passe 15 minutes par jour à regarder ce qui marche dans ta niche pour t’en inspirer.',
      ], tip: 'La régularité compte plus que la perfection : 30 vidéos correctes battent 3 vidéos parfaites.' },
    { title: 'Teste 3 accroches', min: 45, steps: [
      'Reprends ta meilleure vidéo et change seulement les 2 premières secondes : 3 accroches différentes (liste « Accroches » plus bas).',
      'Publie-les à des moments différents.',
      'Note pour chacune le nombre de vues et le temps de visionnage moyen (statistiques TikTok).',
    ] },
    { title: 'Ouvre la boutique au public', min: 20, steps: [
      'Boutique en ligne > Préférences : retire le mot de passe. Sans ça, personne ne peut acheter.',
      'Ouvre ta boutique en navigation privée pour vérifier qu’elle est bien visible.',
      'Annonce l’ouverture sur tes comptes, avec un petit code promo de lancement si ta marge le permet.',
    ] },
    { title: 'Ton premier bilan', min: 30, steps: [
      'Dans ta note, crée un tableau : jour, vues, visites, ajouts au panier, ventes, dépenses.',
      'Remplis-le chaque soir à partir de maintenant (2 minutes).',
      'Regarde le bloc « Tes repères » plus bas pour savoir quoi améliorer en premier.',
    ] },
    // ---------- Semaine 4 ----------
    { title: 'Trouve où ça bloque', min: 30, steps: [
      'Ouvre Shopify > Statistiques : sessions, taux de conversion, ajouts au panier.',
      'Beaucoup de vues mais peu de visites : ta vidéo ne donne pas envie de cliquer, travaille l’accroche et la fin.',
      'Des visites mais pas d’ajout au panier : la page ou le prix ne convainc pas.',
      'Des paniers mais pas d’achat : frais de livraison, délai ou confiance (avis, paiement sécurisé).',
    ] },
    { title: 'Améliore ta page produit', min: 60, steps: [
      'Ajoute une application d’avis clients et demande un avis à chaque acheteur.',
      'Remplace les photos fournisseur par les tiennes et ajoute une vidéo de démonstration.',
      'Relance l’audit Shoplift et corrige les nouveaux points.',
      'Rends visibles sous le bouton d’achat : paiement sécurisé, délai de livraison, retours.',
    ] },
    { title: 'Augmente ton panier moyen', min: 45, steps: [
      'Crée un « Pack x2 » à prix réduit (Produits > Ajouter, ou une application de lots).',
      'Fixe la livraison offerte un peu au-dessus du prix d’un produit.',
      'Propose un petit accessoire complémentaire au moment de l’achat.',
    ] },
    { title: 'Refais ce qui marche', min: 60, steps: [
      'Repère tes 2 vidéos avec le meilleur temps de visionnage.',
      'Refais 5 variantes : même idée, autre accroche, autre décor, autre musique.',
      c.ads ? 'Ajoute ces variantes dans ta campagne et coupe les vidéos qui ne font pas cliquer.' : 'Publie-les sur la semaine : une variante d’une vidéo qui marche a plus de chances de marcher.',
    ] },
    { title: 'Soigne tes clients', min: 30, steps: [
      'Réponds aux messages en moins de 24 h (copie les réponses types de la FAQ).',
      'Envoie le numéro de suivi dès que l’agent te le donne.',
      'Demande une photo ou une vidéo à tes premiers clients contre un code promo : c’est ton meilleur contenu.',
    ] },
    c.ads
      ? { title: 'Coupe, garde, augmente', min: 45, steps: [
        'Coupe les pubs qui dépensent sans vendre après quelques jours.',
        'Sur une pub rentable (voir le seuil dans le calculateur), augmente le budget par petites étapes, pas tout d’un coup.',
        'Teste une nouvelle vidéo chaque semaine pour ne jamais tomber à court.',
      ] }
      : { title: 'Fais parler de toi gratuitement', min: 45, steps: [
        'Contacte 5 petits créateurs de ta niche : produit offert contre une vidéo honnête.',
        'Reposte les vidéos de tes clients (avec leur accord).',
        'Quand une vidéo dépasse tes autres de loin, pense à la booster avec un petit budget : c’est le moment où la pub devient rentable.',
      ] },
    { title: 'Décide pour ton produit', min: 30, steps: [
      'Il vend, même un peu : garde-le et continue d’améliorer vidéos et page.',
      'Toujours aucune vente après plusieurs centaines de visites et plusieurs angles de vidéo testés : passe à ton produit de secours n°1.',
      'Ne jette rien : ta boutique, tes comptes et ta méthode restent, seul le produit change.',
    ] },
    { title: 'Tes comptes et ta déclaration', min: 30, steps: [
      'Note chaque vente et chaque dépense (pub, échantillons, abonnement) dans un tableau.',
      'En micro-entreprise, tu déclares ton chiffre d’affaires sur le site de l’URSSAF (chaque mois ou chaque trimestre selon ton choix).',
      'Garde toutes tes factures (agent, Shopify, pub).',
    ] },
    { title: 'Ton plan du mois 2', min: 30, steps: [
      'Relis ton tableau : quelles vidéos, quels jours, quel produit ont le mieux marché ?',
      'Fixe 1 seul objectif chiffré pour le mois prochain (exemple : 30 ventes).',
      'Garde ce qui marche, coupe le reste, et refais le cycle : contenu, page, chiffres.',
    ], tip: 'Tu as maintenant une vraie méthode. Le mois 2 sert à faire la même chose, en mieux et plus souvent.' },
  ];
  // Personnalisation : niche, produit, budget et objectif injectés dans les missions.
  const N = NICHE_INFO[c.niche] || NICHE_INFO.any, add = (i, line) => D[i].steps.push(line);
  if (c.niche !== 'any') add(2, `Angles qui marchent en ${c.nicheLabel} : ${N.angles.join(' · ')}.`);
  if (c.product) D[5].steps.splice(1, 0, `Point de départ conseillé : « ${c.product} », vendu en ce moment par d’autres boutiques (voir tes produits plus bas).`);
  D[5].tip = N.watch;
  add(10, `Photos pour ta niche : ${N.photo}`);
  add(14, `Idées de plans pour ta niche : ${N.ideas.slice(0, 3).join(', ')}.`);
  add(16, `Accroche conseillée pour ta niche : ${N.hooks[0]}`);
  add(24, `Nouvelles idées à tester : ${N.ideas.slice(3).join(', ')}.`);
  D[0].steps.splice(2, 0, `Ton budget de départ (${c.budgetLabel}) et ton temps (${c.timeLabel}) sont pris en compte dans tout le plan : rythme, modèle et façon de vendre.`);
  if (c.ads && c.daily) D[17].steps.splice(2, 1, `Avec ton budget, commence vers ${c.daily} € par jour pour toute la campagne : l’objectif est d’apprendre quelle vidéo fait cliquer.`);
  if (c.goalLine) { add(20, c.goalLine); add(29, `Rappel de ton objectif : ${c.goalLine}`); }
  return D.map((d, i) => {
    const w = Math.min(3, Math.floor(i / 7));
    const [out, tools] = EXTRA[i];
    const res = out === '@ADS' ? (c.ads ? 'Ta première campagne en ligne' : 'Ta routine de publication lancée') : out === '@ADS2' ? (c.ads ? 'Des pubs triées : tu gardes celles qui vendent' : '5 créateurs contactés') : out;
    const tl = out === '@ADS' ? (c.ads ? ['tiktokads'] : ['tiktok']) : out === '@ADS2' ? (c.ads ? ['tiktokads'] : ['tiktok', 'instagram']) : tools;
    return { d: i + 1, week: w + 1, weekTitle: W[w], out: res, tools: tl, ...d };
  });
}

// Modèles prêts à copier : textes de pages, accroches, scripts, message pour l'agent.
export function readyContent(c) {
  const P = c.product || 'Nom du produit';
  return {
    hooks: [
      ...(NICHE_INFO[c.niche] || NICHE_INFO.any).hooks,
      '« Je ne m’attendais pas à ça pour ce prix… »',
      '« Arrête de scroller si tu as ce problème »',
      '« Le truc que tout le monde me demande depuis une semaine »',
      '« J’ai testé pour toi : voilà mon avis honnête »',
      '« 3 raisons de l’avoir avant tout le monde »',
      '« Pourquoi personne ne m’en a parlé avant ? »',
      '« POV : tu trouves enfin celui qui marche vraiment »',
      '« Ne l’achète pas avant d’avoir vu ça »',
      '« Avant / après : regarde la différence »',
      '« Le cadeau parfait pour quelqu’un qui a déjà tout »',
      '« Ce que je regrette de ne pas avoir acheté plus tôt »',
      '« Réponse au commentaire : oui, ça marche vraiment »',
    ],
    scripts: [
      { hook: '« Je ne m’attendais pas à ça pour ce prix… »', scenes: 'Plan 1 : le problème en 2 secondes. Plan 2 : tu sors le produit. Plan 3 : le résultat, en gros plan.', cta: 'Lien dans la bio.' },
      { hook: '« 3 raisons pour lesquelles tout le monde l’a en ce moment »', scenes: 'Une raison par plan, texte à l’écran, 2 secondes chacune. Finis sur le produit utilisé.', cta: 'Dis-moi en commentaire laquelle te parle.' },
      { hook: '« POV : tu trouves enfin celui qui… »', scenes: 'Filmé à la main, comme une vraie personne : déballage, premier essai, réaction honnête.', cta: 'Je mets le lien en bio.' },
      { hook: '« Avant / après »', scenes: 'Plan avant (le problème, sans filtre), transition rapide sur un geste, plan après. Texte à l’écran : ce qui a changé.', cta: 'Tu veux le même ? Lien en bio.' },
      { hook: '« Réponse au commentaire de @… »', scenes: 'Réponds en vidéo à une vraie question (taille, solidité, livraison) en montrant le produit.', cta: 'Pose ta question en commentaire.' },
      { hook: '« Déballe avec moi »', scenes: 'Colis fermé, ouverture, découverte, premier usage. Garde les vraies réactions, coupe les temps morts.', cta: 'Le lien est en bio.' },
    ],
    description: `${P}\n\n[Une phrase : le problème qu’il règle ou l’envie qu’il crée.]\n\n• [Bénéfice n°1 que le client voit tout de suite]\n• [Matière, taille ou détail qui rassure : vérifie-le sur ton échantillon]\n• [Pour qui / dans quelle situation]\n\nLivraison suivie · Paiement sécurisé · Retours sous [14 ou 30] jours`,
    about: '[Nom de la boutique] est né d’une idée simple : [le problème que tu veux régler]. Nous sélectionnons et testons chaque produit avant de le proposer, et nous répondons à chaque message en moins de 24 h.\n\nUne question ? Écris-nous à [ton e-mail].',
    faq: [
      ['Quels sont les délais de livraison ?', 'Les commandes sont expédiées sous [X] jours et livrées en [X à X] jours ouvrés en France. Tu reçois un numéro de suivi par e-mail.'],
      ['Puis-je retourner mon article ?', 'Oui, tu as [14 ou 30] jours après réception pour nous le retourner. Écris-nous à [ton e-mail] et nous t’expliquons la marche à suivre.'],
      ['Le paiement est-il sécurisé ?', 'Oui, le paiement passe par Shopify Payments ou PayPal. Nous n’avons jamais accès à tes données bancaires.'],
      ['Comment choisir la bonne taille / le bon modèle ?', '[Guide simple : mesures, conseil, ou « en cas de doute, écris-nous ».]'],
      ['Je n’ai pas reçu ma commande, que faire ?', 'Vérifie ton numéro de suivi, puis écris-nous à [ton e-mail] avec ton numéro de commande : nous trouvons une solution rapidement.'],
    ],
    shipping: 'Livraison\nCommandes préparées sous [X] jours ouvrés, livrées en [X à X] jours ouvrés en France métropolitaine. Numéro de suivi envoyé par e-mail.\n\nRetours\nTu disposes de 14 jours après réception pour exercer ton droit de rétractation[, prolongé à 30 jours chez nous]. Le produit doit être renvoyé dans son état d’origine. Remboursement sous 14 jours après réception du retour.\n\nContact : [ton e-mail]',
    agent: `Hello, I am launching an online store in France and I am looking for a reliable supplier for this product: ${P}${c.url ? ` (${c.url})` : ''}.\n\nCould you tell me:\n1. Your price per unit\n2. Shipping cost and delivery time to France (tracked)\n3. The price of 1 sample shipped to France\n4. If you can add my logo on the packaging later\n\nI plan to start with small orders and grow quickly if the product sells. Thank you!`,
  };
}
