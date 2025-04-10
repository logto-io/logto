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

const security = {
  page_title: 'Sécurité',
  title: 'Sécurité',
  subtitle: 'Configurez une protection avancée contre les attaques sophistiquées.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Politique de mot de passe',
  },
  bot_protection: {
    title: 'Protection contre les bots',
    description:
      "Activez CAPTCHA pour l'inscription, la connexion et la récupération de mot de passe afin de bloquer les menaces automatisées.",
    captcha: {
      title: 'CAPTCHA',
      placeholder: "Sélectionnez un fournisseur CAPTCHA et configurez l'intégration.",
      add: 'Ajouter un CAPTCHA',
    },
    settings: 'Paramètres',
    enable_captcha: 'Activer CAPTCHA',
    enable_captcha_description:
      "Activer la vérification CAPTCHA pour les processus d'inscription, de connexion et de récupération de mot de passe.",
  },
  create_captcha: {
    setup_captcha: 'Configurer CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'La solution CAPTCHA de niveau entreprise de Google qui offre une détection avancée des menaces et des analyses de sécurité détaillées pour protéger votre site Web des activités frauduleuses.',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        "L'alternative CAPTCHA intelligente de Cloudflare qui offre une protection contre les bots non intrusive tout en garantissant une expérience utilisateur fluide sans puzzles visuels.",
    },
  },
  captcha_details: {
    back_to_security: 'Retour à la sécurité',
    page_title: 'Détails du CAPTCHA',
    check_readme: 'Vérifiez le README',
    options_change_captcha: 'Changer de fournisseur CAPTCHA',
    connection: 'Connexion',
    description: 'Configurez vos connexions captcha.',
    site_key: 'Clé du site',
    secret_key: 'Clé secrète',
    project_id: 'ID du projet',
    recaptcha_key_id: 'ID de clé reCAPTCHA',
    recaptcha_api_key: 'Clé API du projet',
    deletion_description: 'Êtes-vous sûr de vouloir supprimer ce fournisseur CAPTCHA ?',
    captcha_deleted: 'Fournisseur CAPTCHA supprimé avec succès',
    setup_captcha: 'Configurer CAPTCHA',
  },
  password_policy,
};

export default Object.freeze(security);
