const security = {
  page_title: 'Sécurité',
  title: 'Sécurité',
  subtitle: 'Configurez une protection avancée contre les attaques sophistiquées.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Politique de mot de passe',
    general: 'Général',
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
  password_policy: {
    password_requirements: 'Exigences relatives au mot de passe',
    password_requirements_description:
      "Renforcez les exigences de mot de passe pour vous défendre contre les attaques par bourrage d'identifiants et les attaques de mots de passe faibles.",
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
  },
  sentinel_policy: {
    card_title: 'Verrouillage des identifiants',
    card_description:
      "Verrouillez provisoirement un identifiant après plusieurs tentatives d'authentification échouées (par exemple, connexion avec mot de passe incorrect ou code de vérification) pour empêcher l'accès par force brute.",
    max_attempts: {
      title: 'Tentatives échouées maximum',
      description:
        'Limitez les connexions échouées consécutives par identifiant. Dépasser cette limite déclenche un blocage temporaire.',
      error_message: 'Les tentatives échouées maximum doivent être supérieures à 0.',
    },
    lockout_duration: {
      title: 'Durée du verrouillage (minutes)',
      description:
        'Bloquez les connexions pendant une période après avoir dépassé la limite des tentatives échouées.',
      error_message: "La durée du verrouillage doit être d'au moins 1 minute.",
    },
    manual_unlock: {
      title: 'Déverrouillage manuel',
      description:
        'Déverrouillez les utilisateurs immédiatement en confirmant leur identité et en entrant leur identifiant.',
      unblock_by_identifiers: 'Débloquer par identifiant',
      modal_description_1:
        "Un identifiant a été temporairement verrouillé en raison de plusieurs tentatives échouées de connexion/inscription. Pour protéger la sécurité, l'accès sera automatiquement restauré après la durée du verrouillage.",
      modal_description_2:
        "Déverrouillez manuellement uniquement si vous avez confirmé l'identité de l'utilisateur et vous êtes assuré qu'il n'y a pas de tentatives d'accès non autorisées.",
      placeholder:
        "Saisissez les identifiants (adresse e-mail / numéro de téléphone / nom d'utilisateur)",
      confirm_button_text: 'Déverrouiller maintenant',
      success_toast: 'Déverrouillé avec succès',
      duplicate_identifier_error: 'Identifiant déjà ajouté',
      empty_identifier_error: 'Veuillez saisir au moins un identifiant',
    },
  },
};

export default Object.freeze(security);
