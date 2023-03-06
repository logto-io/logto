const sign_in_exp = {
  title: 'Sign-in experience',
  description: 'Customize the sign in UI to match your brand and view in real time',
  tabs: {
    branding: 'Branding',
    sign_up_and_sign_in: 'Sign up and Sign in',
    others: 'Others',
  },
  welcome: {
    title: 'Customize sign-in experience',
    description:
      'Get started fast with your first sign-in setup. This guide walks you through all the necessary settings.',
    get_started: 'Get Started',
    apply_remind:
      'Please note that sign-in experience will apply to all applications under this account.',
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
    favicon: 'Browser favicon',
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
    identifiers_email: 'Email address',
    identifiers_phone: 'Phone number',
    identifiers_username: 'Username',
    identifiers_email_or_sms: 'Email address or phone number',
    identifiers_none: 'Not applicable',
    and: 'and',
    or: 'or',
    sign_up: {
      title: 'SIGN UP',
      sign_up_identifier: 'Sign-up identifier',
      identifier_description:
        'The sign-up identifier is required for account creation and must be included in your sign-in screen.',
      sign_up_authentication: 'Authentication setting for sign-up',
      authentication_description:
        'All selected actions will be obligatory for users to complete the flow.',
      set_a_password_option: 'Create your password',
      verify_at_sign_up_option: 'Verify at sign-up',
      social_only_creation_description: '(This apply to social only account creation)',
    },
    sign_in: {
      title: 'SIGN IN',
      sign_in_identifier_and_auth: 'Identifier and authentication settings for sign-in',
      description:
        'Users can sign in using any of the options available. Adjust the layout by drag and dropping below options.',
      add_sign_in_method: 'Add Sign-in Method',
      password_auth: 'Password',
      verification_code_auth: 'Verification code',
      auth_swap_tip: 'Swap the options below to determine which appears first in the flow.',
      require_auth_factor: 'You have to select at least one authentication factor.',
    },
    social_sign_in: {
      title: 'SOCIAL SIGN-IN',
      social_sign_in: 'Social sign-in',
      description:
        'Depending on the mandatory identifier you set up, your user may be asked to provide an identifier when signing up via social connector.',
      add_social_connector: 'Add Social Connector',
      set_up_hint: {
        not_in_list: 'Not in the list?',
        set_up_more: 'Set up',
        go_to: 'other social connectors now.',
      },
    },
    tip: {
      set_a_password: 'A unique set of a password to your username is a must.',
      verify_at_sign_up:
        'We currently only support verified email. Your user base may contain a large number of poor-quality email addresses if no validation.',
      password_auth:
        'This is essential as you have enabled the option to set a password during the sign-up process.',
      verification_code_auth:
        'This is essential as you have only enabled the option to provide verification code when signing up. You’re free to uncheck the box when password set-up is allowed at the sign-up process.',
      delete_sign_in_method:
        'This is essential as you have selected {{identifier}} as a required identifier.',
    },
  },
  others: {
    terms_of_use: {
      title: 'TERMS OF USE',
      terms_of_use: 'Terms of use',
      terms_of_use_placeholder: 'https://your.terms.of.use/',
      terms_of_use_tip: 'Terms of use URL',
    },
    languages: {
      title: 'LANGUAGES',
      enable_auto_detect: 'Enable auto-detect',
      description:
        "Your software detects the user's locale setting and switches to the local language. You can add new languages by translating UI from English to another language.",
      manage_language: 'Manage language',
      default_language: 'Default language',
      default_language_description_auto:
        'The default language will be used when the detected user language isn’t covered in the current language library.',
      default_language_description_fixed:
        'When auto-detect is off, the default language is the only language your software will show. Turn on auto-detect for language extension.',
    },
    manage_language: {
      title: 'Manage language',
      subtitle:
        'Localize the product experience by adding languages and translations. Your contribution can be set as the default language.',
      add_language: 'Add Language',
      logto_provided: 'Logto provided',
      key: 'Key',
      logto_source_values: 'Logto source values',
      custom_values: 'Custom values',
      clear_all_tip: 'Clear all values',
      unsaved_description: 'Changes won’t be saved if you leave this page without saving.',
      deletion_tip: 'Delete the language',
      deletion_title: 'Do you want to delete the added language?',
      deletion_description:
        'After deletion, your users won’t be able to browse in that language again.',
      default_language_deletion_title: 'Default language can’t be deleted.',
      default_language_deletion_description:
        '{{language}} is set as your default language and can’t be deleted. ',
    },
    advanced_options: {
      title: 'ADVANCED OPTIONS',
      enable_user_registration: 'Enable user registration',
      enable_user_registration_description:
        'Enable or disallow user registration. Once disabled, users can still be added in the admin console but users can no longer establish accounts through the sign-in UI.',
    },
  },
  setup_warning: {
    no_connector_sms:
      'No SMS connector set-up yet. Until you finish configuring your SMS connector, you won’t be able to sign in. <a>{{link}}</a> in "Connectors"',
    no_connector_email:
      'No email connector set-up yet. Until you finish configuring your email connector, you won’t be able to sign in. <a>{{link}}</a> in "Connectors"',
    no_connector_social:
      'No social connector set-up yet. Until you finish configuring your social connector, you won’t be able to sign in. <a>{{link}}</a> in "Connectors"',
    no_added_social_connector:
      'You’ve set up a few social connectors now. Make sure to add some to your sign in experience.',
    setup_link: 'Set up',
  },
  save_alert: {
    description:
      'You are implementing new sign-in and sign-up procedures. All of your users may be affected by the new set-up. Are you sure to commit to the change?',
    before: 'Before',
    after: 'After',
    sign_up: 'Sign-up',
    sign_in: 'Sign-in',
    social: 'Social',
  },
  preview: {
    title: 'Sign-in preview',
    live_preview: 'Live preview',
    live_preview_tip: 'Save to preview changes',
    native: 'Native',
    desktop_web: 'Desktop Web',
    mobile_web: 'Mobile Web',
  },
};

export default sign_in_exp;
