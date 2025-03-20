const security = {
  page_title: 'Sécurité',
  title: 'Sécurité',
  subtitle: 'Configurez une protection avancée contre les attaques sophistiquées.',
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
    captcha_required_flows: 'Flux nécessitant un CAPTCHA',
    sign_up: "S'inscrire",
    sign_in: 'Se connecter',
    forgot_password: 'Mot de passe oublié',
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
    deletion_description: 'Êtes-vous sûr de vouloir supprimer ce fournisseur CAPTCHA ?',
    captcha_deleted: 'Fournisseur CAPTCHA supprimé avec succès',
    setup_captcha: 'Configurer CAPTCHA',
  },
};

export default Object.freeze(security);
