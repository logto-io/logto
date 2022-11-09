const connectors = {
  title: 'Connecteurs',
  subtitle:
    'Configurez des connecteurs pour permettre une expérience de connexion sans mot de passe et sociale.',
  create: 'Ajouter un connecteur social',
  config_sie_notice: 'You’ve set up connectors. Make sure to configure it in <a>{{link}}</a>.', // UNTRANSLATED
  config_sie_link_text: 'sign in experience', // UNTRANSLATED
  tab_email_sms: 'Connecteurs Email et SMS',
  tab_social: 'Connecteurs sociaux',
  connector_name: 'Nom du connecteur',
  connector_type: 'Type',
  connector_status: 'Experience de connexion',
  connector_status_in_use: "En cours d'utilisation",
  connector_status_not_in_use: 'Non utilisé',
  not_in_use_tip: {
    content:
      'Not in use means your sign in experience hasn’t used this sign in method. <a>{{link}}</a> to add this sign in method. ', // UNTRANSLATED
    go_to_sie: 'Go to sign in experience', // UNTRANSLATED
  },
  social_connector_eg: 'Exemple : Google, Facebook, Github',
  save_and_done: 'Sauvegarder et Finis',
  type: {
    email: 'Connecteur Email',
    sms: 'Connecreur SMS',
    social: 'Connecteur Social',
  },
  setup_title: {
    email: 'Configurer le connecteur Email',
    sms: 'Configurer le connecteur SMS',
    social: 'Ajouter un connecteur Social',
  },
  guide: {
    subtitle: 'Un guide étape par étape pour configurer votre connecteur',
  },
  platform: {
    universal: 'Universel',
    web: 'Web',
    native: 'Natif',
  },
  add_multi_platform: ' supporte plusieurs plateformes, sélectionnez une plateforme pour continuer',
  drawer_title: 'Guide des connecteurs',
  drawer_subtitle: 'Suivez les instructions pour intégrer votre connecteur',
};

export default connectors;
