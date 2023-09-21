const password_rejected = {
  too_short: 'La longueur minimale est {{min}}.',
  too_long: 'La longueur maximale est {{max}}.',
  character_types: 'Au moins {{min}} types de caractères sont requis.',
  unsupported_characters: 'Caractère non supporté trouvé.',
  pwned: "Évitez d'utiliser des mots de passe simples faciles à deviner.",
  restricted_found: "Évitez d'utiliser de manière excessive {{list, list}}.",
  restricted_repetition: 'caractères répétés',
  restricted_sequence: 'caractères séquentiels',
  restricted_userinfo: 'vos informations personnelles',
  restricted_words: 'contexte produit',
};

export default Object.freeze(password_rejected);
