const connectors = {
  title: 'Connectoren',
  subtitle: 'Richte Connectoren ein um passwortlose und Social Anmeldung zu aktivieren',
  create: 'Social Connector erstellen',
  config_sie_notice: 'You’ve set up connectors. Make sure to configure it in <a>{{link}}</a>.', // UNTRANSLATED
  config_sie_link_text: 'sign in experience', // UNTRANSLATED
  tab_email_sms: 'E-Mail und SMS Connectoren',
  tab_social: 'Social Connectoren',
  connector_name: 'Connectorname',
  connector_type: 'Typ',
  connector_status: 'Anmeldeoberfläche',
  connector_status_in_use: 'In Benutzung',
  connector_status_not_in_use: 'Nicht in Benutzung',
  not_in_use_tip: {
    content:
      'Not in use means your sign in experience hasn’t used this sign in method. <a>{{link}}</a> to add this sign in method. ', // UNTRANSLATED
    go_to_sie: 'Go to sign in experience', // UNTRANSLATED
  },
  social_connector_eg: 'z.B. Google, Facebook, Github',
  save_and_done: 'Speichern und fertigstellen',
  type: {
    email: 'E-Mail Connector',
    sms: 'SMS Connector',
    social: 'Social Connector',
  },
  setup_title: {
    email: 'E-Mail Connector einrichten',
    sms: 'SMS Connector einrichten',
    social: 'Social Connector erstellen',
  },
  guide: {
    subtitle: 'Eine Schritt-für-Schritt-Anleitung zur Konfiguration deines Connectors',
    connector_setting: 'Connector setting', // UNTRANSLATED
    name: 'Connector name', // UNTRANSLATED
    name_tip: 'Connector button’s name will display as "Continue with {{Connector Name}}".', // UNTRANSLATED
    logo: 'Connector logo URL', // UNTRANSLATED
    logo_placeholder: 'https://your.cdn.domain/logo.png', // UNTRANSLATED
    logo_tip: 'The logo image will also display on the connector button.', // UNTRANSLATED
    logo_dark: 'Connector logo URL (Dark mode)', // UNTRANSLATED
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png', // UNTRANSLATED
    logo_dark_tip:
      'This will be used when opening “Enable dark mode” in the setting of sign in experience.', // UNTRANSLATED
    logo_dark_collapse: 'Collapse', // UNTRANSLATED
    logo_dark_show: 'Show "Logo for dark mode"', // UNTRANSLATED
    target: 'Connector identity target', // UNTRANSLATED
    target_tip: 'A unique identifier for the connector.', // UNTRANSLATED
    target_tooltip:
      '"Target" in Logto social connectors refers to the "source" of your social identities. In Logto design, we do not accept the same "target" of a specific platform to avoid conflicts. You should be very careful before you add a connector since you CAN NOT change its value once you create it. <a>Learn more.</a>', // UNTRANSLATED
    config: 'Enter your JSON here', // UNTRANSLATED
    sync_profile: 'Sync profile information from the social provider', // UNTRANSLATED
    sync_profile_only_at_register: 'Only sync at register', // UNTRANSLATED
    sync_profile_each_sign_in: 'Always sync at each sign-in', // UNTRANSLATED
  },
  platform: {
    universal: 'Universal',
    web: 'Web',
    native: 'Nativ',
  },
  add_multi_platform: ' unterstützt mehrere Plattformen, wähle eine Plattform aus, um fortzufahren',
  drawer_title: 'Connector Anleitung',
  drawer_subtitle: 'Folge den Anweisungen, um deinen Connector zu integrieren',
};

export default connectors;
