const password_policy = {
  password_requirements: 'Exigences relatives au mot de passe',
  minimum_length: 'Longueur minimale',
  /** UNTRANSLATED */
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error:
    'La longueur minimale doit être comprise entre {{min}} et {{max}} (inclus).',
  minimum_required_char_types: 'Nombre minimum de types de caractères requis',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: 'Rejet du mot de passe',
  compromised_passwords: 'Rejeter les mots de passe compromis',
  breached_passwords: 'Mots de passe compromis',
  breached_passwords_description:
    'Rejeter les mots de passe précédemment trouvés dans les bases de données de violation.',
  restricted_phrases: 'Restreindre les phrases à faible sécurité',
  restricted_phrases_tooltip:
    "Les utilisateurs ne peuvent pas utiliser des mots de passe identiques ou composés des phrases répertoriées ci-dessous. L'ajout de 3 caractères non consécutifs ou plus est autorisé pour augmenter la complexité du mot de passe.",
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
