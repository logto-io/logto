const sign_in_exp = {
  title: 'Expérience de connexion',
  description:
    "Personnalisez l'interface utilisateur pour qu'elle corresponde à votre marque et consultez-la en temps réel.",
  tabs: {
    branding: 'Image de marque',
    sign_up_and_sign_in: 'Sign up and Sign in', // UNTRANSLATED
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
    dark_mode_reset_tip:
      'Recalculer la couleur du mode sombre en fonction de la couleur de la marque.',
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
  sign_up_and_sign_in: {
    identifiers: 'Sign-up identifiers', // UNTRANSLATED
    identifiers_email: 'Email address', // UNTRANSLATED
    identifiers_sms: 'Phone number', // UNTRANSLATED
    identifiers_username: 'Username', // UNTRANSLATED
    identifiers_email_or_sms: 'Email address or phone number', // UNTRANSLATED
    identifiers_none: 'Not applicable', // UNTRANSLATED
    and: 'and', // UNTRANSLATED
    or: 'or', // UNTRANSLATED
    sign_up: {
      title: 'SIGN UP', // UNTRANSLATED
      sign_up_identifier: 'Sign-up identifier', // UNTRANSLATED
      identifier_description:
        'The sign-up identifier is required for account creation and must be included in your sign-in screen.', // UNTRANSLATED
      sign_up_authentication: 'Authentication setting for sign-up', // UNTRANSLATED
      authentication_description:
        'All selected actions will be obligatory for users to complete the flow.', // UNTRANSLATED
      set_a_password_option: 'Create your password', // UNTRANSLATED
      verify_at_sign_up_option: 'Verify at sign-up', // UNTRANSLATED
      social_only_creation_description: '(This apply to social only account creation)', // UNTRANSLATED
    },
    sign_in: {
      title: 'SIGN IN', // UNTRANSLATED
      sign_in_identifier_and_auth: 'Identifier and authentication settings for sign-in', // UNTRANSLATED
      description:
        'Users can sign in using any of the options available. Adjust the layout by drag and dropping below options.', // UNTRANSLATED
      add_sign_in_method: 'Add Sign-in Method', // UNTRANSLATED
      password_auth: 'Password', // UNTRANSLATED
      verification_code_auth: 'Verification code', // UNTRANSLATED
      auth_swap_tip: 'Swap the options below to determine which appears first in the flow.', // UNTRANSLATED
    },
    social_sign_in: {
      title: 'SOCIAL SIGN-IN', // UNTRANSLATED
      social_sign_in: 'Social sign-in', // UNTRANSLATED
      description:
        'Depending on the mandatory identifier you set up, your user may be asked to provide an identifier when signing up via social connector.', // UNTRANSLATED
      add_social_connector: 'Link Social Connector', // UNTRANSLATED
      set_up_hint: {
        not_in_list: 'Not in the list?', // UNTRANSLATED
        set_up_more: 'Set up', // UNTRANSLATED
        go_to: 'other social connectors now.', // UNTRANSLATED
      },
    },
    tip: {
      set_a_password: 'A unique set of a password to your username is a must.', // UNTRANSLATED
      verify_at_sign_up:
        'We currently only support verified email. Your user base may contain a large number of poor-quality email addresses if no validation.', // UNTRANSLATED
      password_auth:
        'This is essential as you have enabled the option to set a password during the sign-up process.', // UNTRANSLATED
      verification_code_auth:
        'This is essential as you have only enabled the option to provide verification code when signing up. You’re free to uncheck the box when password set-up is allowed at the sign-up process.', // UNTRANSLATED
      delete_sign_in_method:
        'This is essential as you have selected {{identifier}} as a required identifier.', // UNTRANSLATED
    },
  },
  others: {
    terms_of_use: {
      title: "CONDITIONS D'UTILISATION",
      enable: "Activer les conditions d'utilisation",
      description: "Ajouter les accords juridiques pour l'utilisation de votre produit",
      terms_of_use: "Conditions d'utilisation",
      terms_of_use_placeholder: 'https://vos.conditions.utilisation/',
      terms_of_use_tip: "Conditions d'utilisation URL",
    },
    languages: {
      title: 'LANGAGES',
      enable_auto_detect: 'Enable auto-detect', // UNTRANSLATED
      description:
        "Your software detects the user's locale setting and switches to the local language. You can add new languages by translating UI from English to another language.", // UNTRANSLATED
      manage_language: 'Manage language', // UNTRANSLATED
      default_language: 'Default language', // UNTRANSLATED
      default_language_description_auto:
        'The default language will be used when the detected user language isn’t covered in the current language library.', // UNTRANSLATED
      default_language_description_fixed:
        'When auto-detect is off, the default language is the only language your software will show. Turn on auto-detect for language extension.', // UNTRANSLATED
    },
    manage_language: {
      title: 'Manage language', // UNTRANSLATED
      subtitle:
        'Localize the product experience by adding languages and translations. Your contribution can be set as the default language.', // UNTRANSLATED
      add_language: 'Add Language', // UNTRANSLATED
      logto_provided: 'Logto provided', // UNTRANSLATED
      key: 'Key', // UNTRANSLATED
      logto_source_values: 'Logto source values', // UNTRANSLATED
      custom_values: 'Custom values', // UNTRANSLATED
      clear_all_tip: 'Clear all values', // UNTRANSLATED
      unsaved_description: 'Changes won’t be saved if you leave this page without saving.', // UNTRANSLATED
      deletion_tip: 'Delete the language', // UNTRANSLATED
      deletion_title: 'Do you want to delete the added language?', // UNTRANSLATED
      deletion_description:
        'After deletion, your users won’t be able to browse in that language again.', // UNTRANSLATED
      default_language_deletion_title: 'Default language can’t be deleted.', // UNTRANSLATED
      default_language_deletion_description:
        '{{language}} is set as your default language and can’t be deleted. ', // UNTRANSLATED
      got_it: 'Got It', // UNTRANSLATED
    },
    authentication: {
      title: 'AUTHENTICATION',
      enable_user_registration: 'Enable user registration', // UNTRANSLATED
      enable_user_registration_description:
        'Enable or disallow user registration. Once disabled, users can still be added in the admin console but users can no longer establish accounts through the sign-in UI.', // UNTRANSLATED
    },
  },
  setup_warning: {
    no_connector: '',
    no_connector_sms:
      'No SMS connector set-up yet. Until you finish configuring your SMS connector, you won’t be able to sign in.', // UNTRANSLATED
    no_connector_email:
      'No email connector set-up yet. Until you finish configuring your email connector, you won’t be able to sign in.', // UNTRANSLATED
    no_connector_social:
      'No social connector set-up yet. Until you finish configuring your social connector, you won’t be able to sign in.', // UNTRANSLATED
    no_added_social_connector:
      "Vous avez maintenant configuré quelques connecteurs sociaux. Assurez-vous d'en ajouter quelques-uns à votre expérience de connexion.",
  },
  save_alert: {
    description:
      'You are implementing new sign-in and sign-up procedures. All of your users may be affected by the new set-up. Are you sure to commit to the change?', // UNTRANSLATED
    before: 'Avant',
    after: 'Après',
    sign_up: 'Sign-up', // UNTRANSLATED
    sign_in: 'Sign-in', // UNTRANSLATED
    social: 'Social', // UNTRANSLATED
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
