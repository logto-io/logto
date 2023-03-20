const connectors = {
  title: 'Conectores',
  subtitle: 'Configure conectores para habilitar a experiência de login social e sem senha',
  create: 'Adicionar conector social',
  config_sie_notice:
    'Você configurou os conectores. Certifique-se de configurá-lo em <a>{{link}}</a>.',
  config_sie_link_text: 'experiência de login',
  tab_email_sms: 'Conectores de e-mail e SMS',
  tab_social: 'Conectores sociais',
  connector_name: 'Nome do conector',
  demo_tip:
    'The maximum number of messages allowed for this demo connector is limited to 100 and is not recommended for deployment in a production environment.', // UNTRANSLATED
  connector_type: 'Tipo',
  connector_status: 'Experiência de login',
  connector_status_in_use: 'Em uso',
  connector_status_not_in_use: 'Fora de uso',
  not_in_use_tip: {
    content:
      'Fora de uso significa que sua experiência de login não usou esse método de login. <a>{{link}}</a> para adicionar este método de login. ',
    go_to_sie: 'Vá para a experiência de login',
  },
  placeholder_title: 'Social connector', // UNTRANSLATED
  placeholder_description:
    'Logto has provided many widely used social sign-in connectors meantime you can create your own with standard protocols.', // UNTRANSLATED
  save_and_done: 'Salvar e completar',
  type: {
    email: 'Conector de e-mail',
    sms: 'Conector de SMS',
    social: 'Conector social',
  },
  setup_title: {
    email: 'Configurar conector de e-mail',
    sms: 'Configurar conector SMS',
    social: 'Adicionar conector social',
  },
  guide: {
    subtitle: 'Um guia passo a passo para configurar seu conector',
    general_setting: 'General settings', // UNTRANSLATED
    parameter_configuration: 'Parameter configuration', // UNTRANSLATED
    test_connection: 'Test connection', // UNTRANSLATED
    name: 'Name for social sign-in button', // UNTRANSLATED
    name_placeholder: 'Enter name for social sign-in button', // UNTRANSLATED
    name_tip: 'O nome do botão do conector será exibido como "Continue com {{Connector Name}}".',
    logo: 'Logo URL for social sign-in button', // UNTRANSLATED
    logo_placeholder: 'https://your.cdn.domain/logo.png',
    logo_tip: 'A imagem do logotipo também será exibida no botão do conector.',
    logo_dark: 'Logo URL for social sign-in button (Dark mode)', // UNTRANSLATED
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png',
    logo_dark_tip:
      'Set your connector’s logo for dark mode after enabling it in the Sign-in Experience of Admin Console.', // UNTRANSLATED
    logo_dark_collapse: 'Collapse',
    logo_dark_show: 'Show logo setting for dark mode', // UNTRANSLATED
    target: 'Identity provider name', // UNTRANSLATED
    target_placeholder: 'Enter connector identity provider name', // UNTRANSLATED
    target_tip:
      'The value of “IdP name” can be a unique identifier string to distinguish your social identifies. This setting cannot be changed after the connector is built.', // UNTRANSLATED
    target_tooltip:
      '"Target" in Logto social connectors refers to the "source" of your social identities. In Logto design, we do not accept the same "target" of a specific platform to avoid conflicts. You should be very careful before you add a connector since you CAN NOT change its value once you create it. <a>Learn more.</a>', // UNTRANSLATED
    target_conflict:
      'The IdP name entered matches the existing <span>name</span>. Using the same idp name may cause unexpected sign-in behavior where users may access the same account through two different connectors.', // UNTRANSLATED
    target_conflict_line2:
      'If you\'d like to replace the current connector with the same identity provider and allow previous users to sign in without registering again, please delete the <span>name</span> connector and create a new one with the same "IdP name".', // UNTRANSLATED
    target_conflict_line3:
      'If you\'d like to connect to a different identity provider, please modify the "IdP name" and proceed.', // UNTRANSLATED
    config: 'Digite seu JSON aqui',
    sync_profile: 'Sincronizar informações de perfil',
    sync_profile_only_at_sign_up: 'Sincronizar apenas no registro',
    sync_profile_each_sign_in: 'Sempre sincronizar a cada login',
    sync_profile_tip:
      "Sync the basic profile from the social provider, such as users' names and their avatars.", // UNTRANSLATED
    callback_uri: 'Callback URI', // UNTRANSLATED
    callback_uri_description:
      "Also called redirect URI, is the URI in Logto where users will be sent back after social authorization, copy and paste to the social provider's config page.", // UNTRANSLATED
  },
  platform: {
    universal: 'Universal',
    web: 'Web',
    native: 'Native',
  },
  add_multi_platform: ' suporta várias plataformas, selecione uma plataforma para continuar',
  drawer_title: 'Guia do Conector',
  drawer_subtitle: 'Siga as instruções para integrar seu conector',
  unknown: 'Unknown Connector', // UNTRANSLATED
};

export default connectors;
