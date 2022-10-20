const sign_in_exp = {
  title: 'Sign-in experience',
  description: 'Customize the sign in UI to match your brand and view in real time',
  tabs: {
    branding: 'Branding',
    sign_up_and_sign_in: 'Sign up and Sign in',
    others: 'Others',
  },
  welcome: {
    title:
      'This is the first time you define sign-in experience. This guide will help you go through all necessary settings and quickly get started.',
    get_started: 'Get Started',
    apply_remind:
      'Please note that sign-in experience will apply to all applications under this account.',
    got_it: 'Got It',
  },
  color: {
    title: 'COLOR',
    primary_color: 'Brand color',
    dark_primary_color: 'Brand color (Dark)',
    dark_mode: 'Enable dark mode',
    dark_mode_description:
      'Your app will have an auto-generated dark mode theme based on your brand color and Logto algorithm. You are free to customize.',
    dark_mode_reset_tip: 'Recalculate dark mode color based on brand color.',
    reset: 'Recalculate',
  },
  branding: {
    title: 'BRANDING AREA',
    ui_style: 'Style',
    styles: {
      logo_slogan: 'App logo with slogan',
      logo: 'App logo only',
    },
    logo_image_url: 'App logo image URL',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: 'App logo image URL (Dark)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    slogan: 'Slogan',
    slogan_placeholder: 'Unleash your creativity',
  },
  sign_up_and_sign_in: {
    identifiers: 'Sign up identifiers',
    identifiers_email: 'Email address',
    identifiers_phone: 'Phone number',
    identifiers_username: 'Username',
    identifiers_email_or_phone: 'Email address or phone number',
    identifiers_none: 'None',
    sign_up: {
      title: 'SIGN UP',
      sign_up_identifier: 'Sign up identifier',
      sign_up_authentication: 'Sign up authentication',
      set_a_password_option: 'Set a password',
      verify_at_sign_up_option: 'Verify at sign up',
      social_only_creation_description: '(This apply to social only account creation)',
    },
  },
  sign_in_methods: {
    title: 'SIGN-IN METHODS',
    primary: 'Primary sign-in method',
    enable_secondary: 'Enable secondary sign in',
    enable_secondary_description:
      "Once it's turned on, you app will support more sign-in method(s) besides the primary one. ",
    methods: 'Sign-in method',
    methods_sms: 'Phone number sign in',
    methods_email: 'Email sign in',
    methods_social: 'Social sign in',
    methods_username: 'Username-with-password sign in',
    methods_primary_tag: '(Primary)',
    define_social_methods: 'Define social sign-in methods',
    transfer: {
      title: 'Social connectors',
      footer: {
        not_in_list: 'Not in the list?',
        set_up_more: 'Set up more',
        go_to: 'social connectors or go to “Connectors” section.',
      },
    },
  },
  others: {
    terms_of_use: {
      title: 'TERMS OF USE',
      enable: 'Enable terms of use',
      description: 'Add the legal agreements for the use of your product',
      terms_of_use: 'Terms of use',
      terms_of_use_placeholder: 'https://your.terms.of.use/',
      terms_of_use_tip: 'Terms of use URL',
    },
    languages: {
      title: 'LANGUAGES',
      mode: 'Language mode',
      auto: 'Auto',
      fixed: 'Fixed',
      fallback_language: 'Fallback language',
      fallback_language_tip:
        'Which language to fall back if Logto finds no proper language phrase-set.',
      fixed_language: 'Fixed language',
    },
    authentication: {
      title: 'AUTHENTICATION',
      enable_create_account: 'Enable create account',
      enable_create_account_description:
        'Enable or disable create account (sign-up). Once disabled, your customers can’t create accounts through the sign-in UI, but you can still add users in Admin Console.',
    },
  },
  setup_warning: {
    no_connector: '',
    no_connector_phone:
      'You haven’t set up a SMS connector yet. Your sign in experience won’t go live until you finish the settings first. ',
    no_connector_email:
      'You haven’t set up an Email connector yet. Your sign in experience won’t go live until you finish the settings first. ',
    no_connector_email_or_phone:
      'You haven’t set up both Email and SMS connectors yet. Your sign in experience won’t go live until you finish the settings first. ',
    no_connector_none:
      'You haven’t set up any social connectors yet. Your sign in experience won’t go live until you finish the settings first. ',
    no_added_social_connector:
      'You’ve set up a few social connectors now. Make sure to add some to your sign in experience.',
  },
  save_alert: {
    description:
      'You are changing sign-in methods. This will impact some of your users. Are you sure you want to do that?',
    before: 'Before',
    after: 'After',
  },
  preview: {
    title: 'Sign-in preview',
    dark: 'Dark',
    light: 'Light',
    native: 'Native',
    desktop_web: 'Desktop Web',
    mobile_web: 'Mobile Web',
  },
};

export default sign_in_exp;
