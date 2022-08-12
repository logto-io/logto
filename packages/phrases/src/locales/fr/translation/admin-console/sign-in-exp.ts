const sign_in_exp = {
  title: 'Expérience de connexion',
  description: "Personnalisez l'interface utilisateur pour qu'elle corresponde à votre marque et consultez-la en temps réel.",
  tabs: {
    branding: 'Image de marque',
    methods: 'Méthodes de connexion',
    others: 'Autres',
  },
  welcome: {
    title:
      "C'est la première fois que vous définissez l'expérience de connexion. Ce guide vous aidera à passer par tous les paramètres nécessaires et à démarrer rapidement.",
    get_started: 'Commencez',
    apply_remind:
      "Veuillez noter que l'expérience de connexion s'appliquera à toutes les applications sous ce compte.",
    got_it: 'Compris.',
  },
  color: {
    title: 'COULEUR',
    primary_color: 'Couleur de la marque',
    dark_primary_color: 'Couleur de la marque (Sombre)',
    dark_mode: 'Activer le mode sombre',
    dark_mode_description:
      "Votre application aura un thème en mode sombre généré automatiquement en fonction de la couleur de votre marque et de l'algorithme de Logto. Vous êtes libre de le personnaliser.",
    dark_mode_reset_tip: 'Recalculer la couleur du mode sombre en fonction de la couleur de la marque.',
    reset: 'Recalculer',
  },
  branding: {
    title: 'ZONE DE MARQUE',
    ui_style: 'Style',
    styles: {
      logo_slogan: "Logo de l'application avec slogan",
      logo: "Logo de l'application seulement",
    },
    logo_image_url: "URL de l'image du logo de l'application",
    logo_image_url_placeholder: 'https://votre.domaine.cdn/logo.png',
    dark_logo_image_url: "URL de l'image du logo de l'application (Sombre)",
    dark_logo_image_url_placeholder: 'https://votre.domaine.cdn/logo-dark.png',
    slogan: 'Slogan',
    slogan_placeholder: 'Libérez votre créativité',
  },
  terms_of_use: {
    title: "CONDITIONS D'UTILISATION",
    enable: "Activer les conditions d'utilisation",
    description: "Ajouter les accords juridiques pour l'utilisation de votre produit",
    terms_of_use: "Conditions d'utilisation",
    terms_of_use_placeholder: 'https://vos.conditions.utilisation/',
    terms_of_use_tip: "Conditions d'utilisation URL",
  },
  sign_in_methods: {
    title: 'METHODES DE CONNEXION',
    primary: 'Méthode de connexion principale',
    enable_secondary: 'Activer une seconde méthode de connexion',
    enable_secondary_description:
      "Une fois qu'elle est activée, votre application prend en charge d'autres méthodes de connexion que la méthode principale. ",
    methods: 'Méthode de connexion',
    methods_sms: 'Connexion avec numéro de téléphone',
    methods_email: 'Connexion avec email',
    methods_social: 'Connexion avec social',
    methods_username: "Connexion avec nom d'utilisateur et mot de passe",
    methods_primary_tag: '(Principale)',
    define_social_methods: "Définir les méthodes d'authentification sociale",
    transfer: {
      title: 'Connecteurs sociaux',
      footer: {
        not_in_list: 'Pas dans la liste ?',
        set_up_more: 'Configurer plus',
        go_to: 'connecteurs sociaux ou allez à la section "Connecteurs".',
      },
    },
  },
  others: {
    languages: {
      title: 'LANGAGES',
      mode: 'Mode langue',
      auto: 'Auto',
      fixed: 'Fixé',
      fallback_language: 'Langage par défaut',
      fallback_language_tip:
        'La langue de repli si Logto ne trouve pas de jeu de phrases dans la langue appropriée.',
      fixed_language: 'Langue fixe',
    },
  },
  setup_warning: {
    no_connector: '',
    no_connector_sms:
      "Vous n'avez pas encore configuré de connecteur SMS. Votre expérience de connexion ne sera pas disponible tant que vous n'aurez pas terminé les paramètres. ",
    no_connector_email:
      "Vous n'avez pas encore configuré de connecteur Email. Votre expérience de connexion ne sera pas disponible tant que vous n'aurez pas terminé les paramètres. ",
    no_connector_social:
      "Vous n'avez pas encore configuré de connecteurs sociaux. Votre expérience de connexion ne sera pas disponible tant que vous n'aurez pas terminé les paramètres. ",
    no_added_social_connector:
      "Vous avez maintenant configuré quelques connecteurs sociaux. Assurez-vous d'en ajouter quelques-uns à votre expérience de connexion."
  },
  save_alert: {
    description:
      'Vous changez de méthode de connexion. Cela aura un impact sur certains de vos utilisateurs. Êtes-vous sûr de vouloir faire cela ?',
    before: 'Avant',
    after: 'Après',
  },
  preview: {
    title: "Aperçu de l'expérience de connexion",
    dark: 'Sombre',
    light: 'Clair',
    native: 'Natif',
    desktop_web: 'Web ordinateur',
    mobile_web: 'Web mobile',
  },
};

export default sign_in_exp;
