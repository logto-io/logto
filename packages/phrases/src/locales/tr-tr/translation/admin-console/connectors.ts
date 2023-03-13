const connectors = {
  title: 'Connectorlar',
  subtitle:
    'Şifresiz ve sosyal oturum açma deneyimini etkinleştirmek için connectorları ayarlayınız.',
  create: 'Social Connector ekle',
  config_sie_notice: 'You’ve set up connectors. Make sure to configure it in <a>{{link}}</a>.', // UNTRANSLATED
  config_sie_link_text: 'sign in experience', // UNTRANSLATED
  tab_email_sms: 'E-posta ve SMS connectorları',
  tab_social: 'Social connectorlar',
  connector_name: 'Connector adı',
  connector_trial_tip:
    'This connector has been preconfigured for demonstration purposes only. It should not be utilized in a production environment. Once you have completed your testing, be sure to provide your own credentials and set up your own connectors. The one you created will replace the trial version.', // UNTRANSLATED
  connector_type: 'Tip',
  connector_status: 'Oturum açma deneyimi',
  connector_status_in_use: 'Kullanımda',
  connector_status_not_in_use: 'Kullanımda değil',
  not_in_use_tip: {
    content:
      'Not in use means your sign in experience hasn’t used this sign in method. <a>{{link}}</a> to add this sign in method. ', // UNTRANSLATED
    go_to_sie: 'Go to sign in experience', // UNTRANSLATED
  },
  placeholder_title: 'Social connector', // UNTRANSLATED
  placeholder_description:
    'Logto has provided many widely used social sign-in connectors meantime you can create your own with standard protocols.', // UNTRANSLATED
  save_and_done: 'Kaydet ve bitir',
  type: {
    email: 'Eposta connectorı',
    sms: 'SMS connectorı',
    social: 'Social connector',
  },
  setup_title: {
    email: 'Eposta connectorı ayarla',
    sms: 'SMS connectorı ayarla',
    social: 'Social Connector ekle',
  },
  guide: {
    subtitle: 'Connectorı yapılandırmak için adım adım kılavuz',
    general_setting: 'General settings', // UNTRANSLATED
    parameter_configuration: 'Parameter configuration', // UNTRANSLATED
    test_connection: 'Test connection', // UNTRANSLATED
    name: 'Name for social sign-in button', // UNTRANSLATED
    name_placeholder: 'Enter name for social sign-in button', // UNTRANSLATED
    name_tip:
      'The name of the connector button will be displayed as "Continue with {{name}}." Be mindful of the length of the naming in case it gets too long.', // UNTRANSLATED
    logo: 'Logo URL for social sign-in button', // UNTRANSLATED
    logo_placeholder: 'https://your.cdn.domain/logo.png', // UNTRANSLATED
    logo_tip:
      'Logo image will show on the connector. Get a publicly accessible image link and insert the link here.', // UNTRANSLATED
    logo_dark: 'Logo URL for social sign-in button (Dark mode)', // UNTRANSLATED
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png', // UNTRANSLATED
    logo_dark_tip:
      'Set your connector’s logo for dark mode after enabling it in the Sign-in Experience of Admin Console.', // UNTRANSLATED
    logo_dark_collapse: 'Collapse', // UNTRANSLATED
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
    config: 'Enter your config JSON', // UNTRANSLATED
    sync_profile: 'Sync profile information', // UNTRANSLATED
    sync_profile_only_at_sign_up: 'Only sync at sign-up', // UNTRANSLATED
    sync_profile_each_sign_in: 'Always do a sync at each sign-in', // UNTRANSLATED
    sync_profile_tip:
      "Sync the basic profile from the social provider, such as users' names and their avatars.", // UNTRANSLATED
    callback_uri: 'Callback URI', // UNTRANSLATED
    callback_uri_description:
      "Also called redirect URI, is the URI in Logto where users will be sent back after social authorization, copy and paste to the social provider's config page.", // UNTRANSLATED
  },
  platform: {
    universal: 'Evrensel',
    web: 'Web',
    native: 'Native',
  },
  add_multi_platform: ' birden fazla platformu destekler, devam etmek için bir platform seçin',
  drawer_title: 'Connector Kılavuzu',
  drawer_subtitle: 'Connectorı entegre etmek için yönergeleri izleyin',
  unknown: 'Bilinmeyen connector',
};

export default connectors;
