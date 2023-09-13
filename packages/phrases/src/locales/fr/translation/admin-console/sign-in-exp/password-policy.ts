const password_policy = {
  password_requirements: 'Exigences relatives au mot de passe',
  minimum_length: 'Longueur minimale',
  minimum_length_description:
    "NIST suggère d'utiliser <a>au moins 8 caractères</a> pour les produits web.",
  minimum_length_error:
    'La longueur minimale doit être comprise entre {{min}} et {{max}} (inclus).',
  minimum_required_char_types: 'Nombre minimum de types de caractères requis',
  minimum_required_char_types_description:
    'Types de caractères : majuscules (A-Z), minuscules (a-z), chiffres (0-9) et symboles spéciaux ({{symbols}}).',
  password_rejection: 'Rejet du mot de passe',
  compromised_passwords: 'Mots de passe compromis',
  breached_passwords: 'Mots de passe compromis',
  breached_passwords_description:
    'Rejeter les mots de passe précédemment trouvés dans les bases de données de violation.',
  restricted_phrases: 'Restreindre les phrases à faible sécurité',
  restricted_phrases_tooltip:
    'Votre mot de passe devrait éviter ces phrases à moins que vous ne les combiniez avec 3 caractères supplémentaires ou plus.',
  repetitive_or_sequential_characters: 'Caractères répétitifs ou séquentiels',
  repetitive_or_sequential_characters_description: 'Par exemple, "AAAA", "1234" et "abcd".',
  user_information: 'Informations utilisateur',
  user_information_description:
    "Par exemple, adresse e-mail, numéro de téléphone, nom d'utilisateur, etc.",
  custom_words: 'Mots personnalisés',
  custom_words_description:
    'Personnalisez les mots spécifiques au contexte, sans distinction de casse, un par ligne.',
  custom_words_placeholder: 'Nom de votre service, nom de votre entreprise, etc.',
};

export default Object.freeze(password_policy);
