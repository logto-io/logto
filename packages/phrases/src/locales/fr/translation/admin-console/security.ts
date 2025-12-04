const security = {
  page_title: 'Sécurité',
  title: 'Sécurité',
  subtitle: 'Configurez une protection avancée contre les attaques sophistiquées.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Politique de mot de passe',
    blocklist: 'Liste de blocage',
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
    domain: 'Domaine (optionnel)',
    domain_placeholder: 'www.google.com (défaut) ou recaptcha.net',
    recaptcha_key_id: 'ID de clé reCAPTCHA',
    recaptcha_api_key: 'Clé API du projet',
    deletion_description: 'Êtes-vous sûr de vouloir supprimer ce fournisseur CAPTCHA ?',
    captcha_deleted: 'Fournisseur CAPTCHA supprimé avec succès',
    setup_captcha: 'Configurer CAPTCHA',
    mode: 'Mode de vérification',
    mode_invisible: 'Invisible',
    mode_checkbox: 'Case à cocher',
    mode_notice:
      'Le mode de vérification est défini dans les paramètres de votre clé reCAPTCHA dans Google Cloud Console. Changer le mode ici nécessite un type de clé correspondant.',
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
      "Le verrouillage est disponible pour tous les utilisateurs avec les paramètres par défaut, mais vous pouvez le personnaliser pour un meilleur contrôle.\n\nVerrouillez temporairement un identifiant après plusieurs tentatives d'authentification échouées (par exemple, mot de passe incorrect ou code de vérification consécutifs) pour empêcher l'accès par force brute.",
    enable_sentinel_policy: {
      title: "Personnaliser l'expérience de verrouillage",
      description:
        'Permettre la personnalisation des tentatives de connexion échouées maximales avant le verrouillage, la durée du verrouillage, et le déverrouillage manuel immédiat.',
    },
    max_attempts: {
      title: 'Tentatives échouées maximum',
      description:
        'Verrouiller temporairement un identifiant après avoir atteint le nombre maximum de tentatives de connexion échouées en une heure.',
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
  blocklist: {
    card_title: "Liste de blocage d'email",
    card_description:
      "Prenez le contrôle de votre base d'utilisateurs en bloquant les adresses e-mail à haut risque ou indésirables.",
    disposable_email: {
      title: 'Bloquer les adresses e-mail temporaires',
      description:
        "Activez pour rejeter toute tentative d'inscription utilisant une adresse e-mail jetable, ce qui peut prévenir le spam et améliorer la qualité des utilisateurs.",
    },
    email_subaddressing: {
      title: 'Bloquer le sous-adressage des e-mails',
      description:
        "Activez pour rejeter toute tentative d'inscription utilisant des sous-adresses e-mail avec un signe plus (+) et des caractères supplémentaires (par exemple, user+alias@foo.com).",
    },
    custom_email_address: {
      title: 'Bloquer les adresses e-mail personnalisées',
      description:
        "Ajoutez des domaines ou des adresses e-mail spécifiques qui ne peuvent pas s'inscrire ou se lier via l'interface utilisateur.",
      placeholder:
        "Entrez l'adresse email ou le domaine bloqué (ex. : bar@example.com, @example.com)",
      duplicate_error: 'Adresse e-mail ou domaine déjà ajouté',
      invalid_format_error:
        'Doit être une adresse e-mail valide (bar@example.com) ou un domaine (@example.com)',
    },
  },
};

export default Object.freeze(security);
