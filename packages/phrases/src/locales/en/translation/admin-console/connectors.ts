const connectors = {
  page_title: 'Connectors',
  title: 'Connectors',
  subtitle: 'Set up connectors to enable passwordless and social sign-in experience',
  create: 'Add Social Connector',
  config_sie_notice: 'You’ve set up connectors. Make sure to configure it in <a>{{link}}</a>.',
  config_sie_link_text: 'sign in experience',
  tab_email_sms: 'Email and SMS connectors',
  tab_social: 'Social connectors',
  connector_name: 'Connector name',
  demo_tip:
    'The maximum number of messages allowed for this demo connector is limited to 100 and is not recommended for deployment in a production environment.',
  social_demo_tip:
    'The demo connector is designed exclusively for demonstration purposes and is not recommended for deployment in a production environment.',
  connector_type: 'Type',
  placeholder_title: 'Social connector',
  placeholder_description:
    'Logto has provided many widely used social sign-in connectors meantime you can create your own with standard protocols.',
  save_and_done: 'Save and Done',
  type: {
    email: 'Email connector',
    sms: 'SMS connector',
    social: 'Social connector',
  },
  setup_title: {
    email: 'Set up email connector',
    sms: 'Set up SMS connector',
    social: 'Add Social Connector',
  },
  guide: {
    subtitle: 'A step by step guide to configure your connector',
    general_setting: 'General settings',
    parameter_configuration: 'Parameter configuration',
    test_connection: 'Test connection',
    name: 'Name for social sign-in button',
    name_placeholder: 'Enter name for social sign-in button',
    name_tip:
      'The name of the connector button will be displayed as "Continue with {{name}}." Be mindful of the length of the naming in case it gets too long.',
    connector_logo: 'Connector logo',
    connector_logo_tip: 'The logo will be displayed on the connector sign-in button.',
    target: 'Identity provider name',
    target_placeholder: 'Enter connector identity provider name',
    target_tip:
      'The value of “IdP name” can be a unique identifier string to distinguish your social identifies.',
    target_tip_standard:
      'The value of “IdP name” can be a unique identifier string to distinguish your social identifies. This setting cannot be changed after the connector is built.',
    target_tooltip:
      '"IdP name" in Logto social connectors refers to the "source" of your social identities. In Logto design, we do not accept the same "IdP name" of a specific platform to avoid conflicts. You should be very careful before you add a connector since you CAN NOT change its value once you create it. <a>Learn more</a>',
    target_conflict:
      'The IdP name entered matches the existing <span>name</span> connector. Using the same idp name may cause unexpected sign-in behavior where users may access the same account through two different connectors.',
    target_conflict_line2:
      'If you\'d like to replace the current connector with the same identity provider and allow previous users to sign in without registering again, please delete the <span>name</span> connector and create a new one with the same "IdP name".',
    target_conflict_line3:
      'If you\'d like to connect to a different identity provider, please modify the "IdP name" and proceed.',
    config: 'Enter your config JSON',
    sync_profile: 'Sync profile information',
    sync_profile_only_at_sign_up: 'Only sync at sign-up',
    sync_profile_each_sign_in: 'Always do a sync at each sign-in',
    sync_profile_tip:
      "Sync the basic profile from the social provider, such as users' names and their avatars.",
    enable_token_storage: {
      title: 'Store tokens for persistent API access',
      description:
        'Store access and refresh tokens in the Secret Vault. Allows automated API calls without repeated user consent. Example: let your AI Agent add events to Google Calendar with persistent authorization. <a>Learn how to call third-party APIs</a>',
    },
    callback_uri: 'Callback URI',
    callback_uri_description:
      "Also called redirect URI, is the URI in Logto where users will be sent back after social authorization, copy and paste to the social provider's config page.",
    acs_url: 'Assertion consumer service URL',
  },
  platform: {
    universal: 'Universal',
    web: 'Web',
    native: 'Native',
  },
  add_multi_platform: ' supports multiple platform, select a platform to continue',
  drawer_title: 'Connector Guide',
  drawer_subtitle: 'Follow the instructions to integrate your connector',
  unknown: 'Unknown Connector',
  standard_connectors: 'Standard connectors',
  create_form: {
    third_party_connectors:
      'Integrate third-party providers for quick social sign-in, social account linking, and API access. <a>Learn more</a>',
    standard_connectors: 'Or you can customize your social connector by a standard protocol.',
  },
};

export default Object.freeze(connectors);
