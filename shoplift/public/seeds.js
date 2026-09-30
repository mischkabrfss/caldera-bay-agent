// Radar : boutiques Shopify de référence par niche + types de produits réellement demandés.
// Un produit n'entre dans le radar que s'il correspond à un de ces types : produit générique,
// trouvable chez un fournisseur et revendable (pas un article de marque impossible à sourcer).
// Boutiques vérifiées le 30/09/2026 (catalogue public accessible). 8 maximum par niche (limite Cloudflare gratuite).
const k = (list) => list.map(([re, label]) => [new RegExp(`\\b(${re})\\b`, 'i'), label]);

export const NICHES = {
  mode: {
    label: 'Mode',
    stores: ['fashionnova.com', 'edikted.com', 'us.princesspolly.com', 'showpo.com', 'honeylove.com', 'ohpolly.com', 'cutsclothing.com', 'lounge.com'],
    kinds: k([['leggings?', 'Legging'], ['shapewear|bodysuits?|body shaper|shaping', 'Gainant'], ['bras?|bralette|bralettes', 'Brassière'], ['dress(es)?|robes?', 'Robe'], ['hoodies?|sweatshirts?|sweat', 'Sweat'], ['joggers?|sweatpants?|trousers?|pants|pantalons?', 'Pantalon'], ['jeans?', 'Jean'], ['skirts?|skort|jupes?', 'Jupe'], ['sets?|co-?ord|ensembles?', 'Ensemble'], ['jumpsuits?|rompers?|combinaisons?', 'Combinaison'], ['cardigans?|sweaters?|knit|pulls?', 'Pull'], ['jackets?|blazers?|coats?|vestes?|manteaux?', 'Veste'], ['corsets?|tops?|tanks?|camis?|tees?|t-shirts?', 'Haut'], ['shorts?', 'Short'], ['briefs?|thongs?|underwear|boxers?', 'Sous-vêtement']]),
  },
  beaute: {
    label: 'Beauté',
    stores: ['colourpop.com', 'glowrecipe.com', 'soldejaneiro.com', 'lashify.com', 'bondisands.com', 'dermaflash.com', 'kyliecosmetics.com', 'drsquatch.com'],
    kinds: k([['serums?|sérums?', 'Sérum'], ['mascara', 'Mascara'], ['palettes?|eyeshadows?', 'Palette'], ['lip gloss|gloss|lip oil|lip balm|lipsticks?|lip liner|lip', 'Lèvres'], ['blush|bronzer|highlighter|contour', 'Teint'], ['foundation|concealer|primer|setting spray|powder', 'Fond de teint'], ['lashes|lash|cils', 'Cils'], ['self tan|tanning|tan mousse|tan', 'Autobronzant'], ['dermaplaning|dermaplaner|facial', 'Soin visage'], ['masks?|masques?', 'Masque'], ['cleansers?|toner|moisturi[sz]er|creams?|crèmes?|body butter|lotion', 'Crème'], ['body mist|perfume|parfum|fragrance|mists?', 'Parfum'], ['oils?|huiles?', 'Huile'], ['scrubs?|exfoliat\\w*', 'Gommage'], ['soaps?|body wash|shampoo|conditioner|deodorant', 'Soin corps'], ['brushes|brush|pinceaux?|sponge', 'Pinceau'], ['sunscreen|spf', 'Solaire']]),
  },
  maison: {
    label: 'Maison',
    stores: ['blissy.com', 'cozyearth.com', 'homesick.com', 'loftie.com', 'bearaby.com', 'brooklinen.com', 'parachutehome.com', 'stanley1913.com'],
    kinds: k([['pillowcases?|pillows?|oreillers?', 'Oreiller'], ['weighted blanket|blankets?|throws?|couvertures?|plaids?', 'Couverture'], ['sheets?|sheet set|duvet|comforter|bedding|draps?|housse', 'Linge de lit'], ['towels?|serviettes?|bath sheet', 'Serviette'], ['candles?|bougies?', 'Bougie'], ['diffusers?|reed', 'Diffuseur'], ['lamps?|lampes?|light', 'Lampe'], ['clocks?|alarm|réveil', 'Réveil'], ['planters?|flower pots?|vases?', 'Pot & vase'], ['robes?|peignoirs?|pajamas?|pyjamas?|sleepwear|lounge', 'Pyjama'], ['eye masks?|sleep mask|scrunchies?', 'Accessoire sommeil'], ['rugs?|tapis|mats?', 'Tapis'], ['mugs?|glasses|verres?|tumblers?|cups?', 'Tasse'], ['baskets?|paniers?|storage|organizers?|rangement', 'Rangement'], ['mattress topper|toppers?', 'Surmatelas'], ['cushions?|coussins?', 'Coussin']]),
  },
  bijoux: {
    label: 'Bijoux & accessoires',
    stores: ['puravidabracelets.com', 'gorjana.com', 'ringconcierge.com', 'burga.com', 'goodr.com', 'ridgewallet.com', 'blenderseyewear.com'],
    kinds: k([['necklaces?|colliers?|chains?|chokers?', 'Collier'], ['bracelets?|bangles?|cuffs?', 'Bracelet'], ['rings?|bagues?', 'Bague'], ['earrings?|huggies|hoops?|studs?|boucles?', "Boucles d'oreilles"], ['pendants?|charms?|pendentifs?', 'Pendentif'], ['anklets?', 'Chaîne de cheville'], ['sunglasses|sunnies|lunettes', 'Lunettes de soleil'], ['phone cases?|iphone|case|coques?', 'Coque de téléphone'], ['magsafe|chargers?|power bank|wallet|cardholder|card holder|portefeuille', 'Portefeuille & MagSafe'], ['keychains?|key ?case|porte-clés', 'Porte-clés'], ['watch bands?|straps?|watch', 'Bracelet de montre'], ['hair clips?|claw clips?|scrunchies?|headbands?', 'Accessoire cheveux']]),
  },
  sport: {
    label: 'Sport & bien-être',
    stores: ['gymshark.com', 'oneractive.com', 'buffbunny.com', 'gymreapers.com', 'ryderwear.com', 'hydrojug.com'],
    kinds: k([['leggings?', 'Legging'], ['sports? bras?|bras?|bralette', 'Brassière'], ['shorts?', 'Short'], ['lifting straps?|straps?', 'Sangles'], ['grips?|gloves?|gants?', 'Gants & grips'], ['belts?|ceintures?', 'Ceinture de force'], ['wrist wraps?|wraps?|knee sleeves?|sleeves?', 'Protection'], ['bottles?|jugs?|tumblers?|shakers?|gourdes?', 'Gourde'], ['bags?|backpacks?|sacs?|duffel', 'Sac de sport'], ['resistance bands?|bands?|élastiques?', 'Élastique'], ['hoodies?|sweatshirts?|zip', 'Sweat'], ['joggers?|pants|sweatpants?', 'Jogging'], ['tanks?|tops?|tees?|t-shirts?|stringers?|crops?', 'Haut'], ['unitards?|bodysuits?|onesies?|sets?', 'Ensemble'], ['socks?|chaussettes?', 'Chaussettes'], ['massage|massager|foam roller|roller', 'Récupération']]),
  },
  animaux: {
    label: 'Animaux',
    stores: ['wildone.com', 'pupford.com', 'pawz.com', 'bestfriendsbysheri.com', 'rabbitgoo.com', 'maxbone.com', 'earthrated.com', 'zeedog.com'],
    kinds: k([['harness(es)?|harnais', 'Harnais'], ['leash(es)?|lead|laisses?', 'Laisse'], ['collars?|colliers?', 'Collier'], ['beds?|donut|cuddler|lits?|paniers?', 'Lit pour animal'], ['toys?|balls?|jouets?|balles?|chew|tug|squeaky|plush', 'Jouet'], ['bowls?|feeders?|gamelles?|fountains?|fontaines?', 'Gamelle'], ['brush(es)?|grooming|comb|shampoo|wipes|lingettes?|brosses?', 'Toilettage'], ['carriers?|backpacks?|sac de transport', 'Transport'], ['poop bags?|waste bags?|bag holder|dispensers?|sacs à crottes', 'Sacs à crottes'], ['pee pads?|pads|training pads|alèses?', 'Tapis éducateur'], ['treats?|friandises?|chews?|jerky|biscuits?', 'Friandise'], ['boots?|booties|shoes|paw protect\\w*|socks?', 'Bottines'], ['coats?|jackets?|raincoats?|sweaters?|hoodies?|manteaux?|pulls?', 'Manteau'], ['blankets?|couvertures?|mats?|lick mats?', 'Tapis & couverture'], ['car seat|seat covers?|ramps?|stairs?', 'Voiture & accès']]),
  },
};

// Type de produit reconnu (ou null) pour une niche.
// Le titre prime sur le type Shopify (souvent vague : « Apparel », « Harness & Leash »…).
export function kindOf(niche, product) {
  const kinds = NICHES[niche]?.kinds || [];
  for (const text of [product.title || '', product.type || '']) for (const [re, label] of kinds) if (re.test(text)) return label;
  return null;
}

// Concurrents proposés en exemple dans l'espion (un par niche).
export const SPY_EXAMPLES = ['bestfriendsbysheri.com', 'blissy.com', 'glowrecipe.com', 'showpo.com', 'burga.com', 'gymreapers.com'];

// Terme de recherche fournisseur (anglais) pour chaque type de produit.
export const KIND_EN = {
  Legging: 'leggings', Gainant: 'shapewear bodysuit', Brassière: 'bra', Robe: 'dress', Sweat: 'hoodie', Pantalon: 'pants', Jean: 'jeans', Jupe: 'skirt', Ensemble: 'set', Combinaison: 'jumpsuit', Pull: 'sweater', Veste: 'jacket', Haut: 'top', Short: 'shorts', 'Sous-vêtement': 'underwear',
  Sérum: 'serum', Mascara: 'mascara', Palette: 'eyeshadow palette', Lèvres: 'lip', Teint: 'blush', 'Fond de teint': 'foundation', Cils: 'false lashes', Autobronzant: 'self tanner', 'Soin visage': 'facial', Masque: 'face mask', Crème: 'cream', Parfum: 'body mist', Huile: 'oil', Gommage: 'scrub', 'Soin corps': 'body care', Pinceau: 'makeup brush', Solaire: 'sunscreen',
  Oreiller: 'pillowcase', Couverture: 'blanket', 'Linge de lit': 'bed sheet', Serviette: 'towel', Bougie: 'candle', Diffuseur: 'diffuser', Lampe: 'lamp', Réveil: 'alarm clock', 'Pot & vase': 'vase', Pyjama: 'pajamas', 'Accessoire sommeil': 'sleep mask', Tapis: 'rug', Tasse: 'tumbler', Rangement: 'storage basket', Surmatelas: 'mattress topper', Coussin: 'cushion',
  Collier: 'necklace', Bracelet: 'bracelet', Bague: 'ring', "Boucles d'oreilles": 'earrings', Pendentif: 'pendant', 'Chaîne de cheville': 'anklet', 'Lunettes de soleil': 'sunglasses', 'Coque de téléphone': 'phone case', 'Portefeuille & MagSafe': 'magsafe wallet', 'Porte-clés': 'keychain', 'Bracelet de montre': 'watch band', 'Accessoire cheveux': 'hair clip',
  Sangles: 'lifting straps', 'Gants & grips': 'gym grips', 'Ceinture de force': 'lifting belt', Protection: 'knee sleeves', Gourde: 'water bottle', 'Sac de sport': 'gym bag', Élastique: 'resistance bands', Jogging: 'joggers', Chaussettes: 'socks', Récupération: 'massage gun',
  Harnais: 'dog harness', Laisse: 'dog leash', 'Lit pour animal': 'pet bed', Jouet: 'dog toy', Gamelle: 'pet bowl', Toilettage: 'pet grooming', Transport: 'pet carrier', 'Sacs à crottes': 'poop bags', 'Tapis éducateur': 'pee pads', Friandise: 'dog treats', Bottines: 'dog boots', Manteau: 'dog coat', 'Tapis & couverture': 'pet blanket', 'Voiture & accès': 'dog car seat',
};
