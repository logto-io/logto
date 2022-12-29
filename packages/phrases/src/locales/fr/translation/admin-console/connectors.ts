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
    connector_setting: 'Connector setting', // UNTRANSLATED
    name: 'Connector name', // UNTRANSLATED
    name_tip:
      'The name of the connector button will be displayed as "Continue with {{social_connector}}." Be mindful of the length of the naming in case it gets too long.', // UNTRANSLATED
    logo: 'Logo image URL', // UNTRANSLATED
    logo_placeholder: 'https://your.cdn.domain/logo.png', // UNTRANSLATED
    logo_tip:
      'Logo image will show on the connector. Get a publicly accessible image link and insert the link here.', // UNTRANSLATED
    logo_dark: 'Connector logo URL for dark mode', // UNTRANSLATED
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png', // UNTRANSLATED
    logo_dark_tip:
      'Set your connector’s logo for dark mode after enabling it in the Sign-in Experience of Admin Console.', // UNTRANSLATED
    logo_dark_collapse: 'Collapse', // UNTRANSLATED
    logo_dark_show: 'Show logo setting for dark mode', // UNTRANSLATED
    target: 'Connector identity target', // UNTRANSLATED
    target_tip:
      'If the connector is successfully built, the connector “Target” cannot be modified.', // UNTRANSLATED
    target_tooltip:
      '"Target" in Logto social connectors refers to the "source" of your social identities. In Logto design, we do not accept the same "target" of a specific platform to avoid conflicts. You should be very careful before you add a connector since you CAN NOT change its value once you create it. <a>Learn more.</a>', // UNTRANSLATED
    config: 'Enter your config JSON', // UNTRANSLATED
    sync_profile: 'Sync profile information', // UNTRANSLATED
    sync_profile_only_at_sign_up: 'Only sync at sign-up', // UNTRANSLATED
    sync_profile_each_sign_in: 'Always do a sync at each sign-in', // UNTRANSLATED
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
