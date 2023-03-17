const sign_in_exp = {
  title: 'Anmeldeoberfläche',
  description:
    'Passe die Benutzeroberfläche für die Anmeldung an deine Marke an und zeige eine Vorschau in Echtzeit an',
  tabs: {
    branding: 'Branding',
    methods: 'Anmeldemethoden',
    sign_up_and_sign_in: 'Sign up and Sign in', // UNTRANSLATED
    others: 'Andere',
  },
  welcome: {
    title: 'Customize sign-in experience', // UNTRANSLATED
    description:
      'Get started fast with your first sign-in setup. This guide walks you through all the necessary settings.', // UNTRANSLATED
    get_started: 'Erste Schritte',
    apply_remind:
      'Bitte beachte, dass die Anmeldeoberfläche für alle Anwendungen unter diesem Konto gilt.',
  },
  sign_up_and_sign_in: {
    identifiers_email: 'Email address', // UNTRANSLATED
    identifiers_phone: 'Phone number', // UNTRANSLATED
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
      require_auth_factor: 'You have to select at least one authentication factor.', // UNTRANSLATED
    },
    social_sign_in: {
      title: 'SOCIAL SIGN-IN', // UNTRANSLATED
      social_sign_in: 'Social sign-in', // UNTRANSLATED
      description:
        'Depending on the mandatory identifier you set up, your user may be asked to provide an identifier when signing up via social connector.', // UNTRANSLATED
      add_social_connector: 'Add Social Connector', // UNTRANSLATED
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
  color: {
    title: 'FARBE',
    primary_color: 'Markenfarbe',
    dark_primary_color: 'Markenfarbe (Dunkler Modus)',
    dark_mode: 'Aktiviere Dunklen Modus',
    dark_mode_description:
      'Deine App erhält einen automatisch generierten Dunklen Modus, der auf deiner Markenfarbe und dem Logto-Algorithmus basiert. Du kannst diesen nach Belieben anpassen.',
    dark_mode_reset_tip: 'Neuberechnung der Farbe des dunklen Modus basierend auf der Markenfarbe.',
    reset: 'Neuberechnen',
  },
  branding: {
    title: 'BRANDING',
    ui_style: 'Stil',
    favicon: 'Favicon', // UNTRANSLATED
    logo_image_url: 'App logo URL',
    logo_image_url_placeholder: 'https://dein.cdn.domain/logo.png',
    dark_logo_image_url: 'App logo URL (Dunkler Modus)',
    dark_logo_image_url_placeholder: 'https://dein.cdn.domain/logo-dark.png',
    logo_image: 'App logo',
    dark_logo_image: 'App logo (Dunkler Modus)',
    logo_image_error: 'App logo: {{error}}', // UNTRANSLATED
    favicon_error: 'Favicon: {{error}}', // UNTRANSLATED
  },
  custom_css: {
    title: 'CUSTOM CSS', // UNTRANSLATED
    css_code_editor_title: 'Personalize your UI with Custom CSS', // UNTRANSLATED
    css_code_editor_description1: 'See the example of Custom CSS.', // UNTRANSLATED
    css_code_editor_description2: '<a>{{link}}</a>', // UNTRANSLATED
    css_code_editor_description_link_content: 'Learn more', // UNTRANSLATED
    css_code_editor_content_placeholder:
      '// Enter your Custom CSS code to tailor the styles of color, font, components, and layout... of Sign-in, Create-account, Forgot-Password, and other pages to your exact specifications. Express your creativity and make your UI stand out.', // UNTRANSLATED
  },
  others: {
    terms_of_use: {
      title: 'Terms', // UNTRANSLATED
      terms_of_use: 'URL zu den Nutzungsbedingungen',
      terms_of_use_placeholder: 'https://beispiel.de/nutzungsbedingungen',
      privacy_policy: 'URL zu den Datenschutzrichtlinien',
      privacy_policy_placeholder: 'https://beispiel.de/datenschutzrichtlinien',
    },
    languages: {
      title: 'SPRACHEN',
      enable_auto_detect: 'Aktiviere automatische Spracherkennung',
      description:
        'Deine Software erkennt die Sprach-Einstellung des Nutzers und schaltet auf die lokale Sprache um. Du kannst neue Sprachen hinzufügen, indem du die Benutzeroberfläche vom Englischen in eine andere Sprache übersetzt.',
      manage_language: 'Sprachen verwalten',
      default_language: 'Standard-Sprache',
      default_language_description_auto:
        'Die Standardsprache wird verwendet, wenn die erkannte Benutzersprache nicht in der aktuellen Sprachbibliothek enthalten ist.',
      default_language_description_fixed:
        'Wenn die automatische Erkennung deaktiviert ist, ist die Standardsprache die einzige Sprache, die deine Software anzeigt. Schalte die automatische Erkennung ein um weitere Sprachen anzuzeigen.',
    },
    manage_language: {
      title: 'Sprachen verwalten',
      subtitle:
        'Erweitere die Anmeldeoberfläche durch neue Sprachen und Übersetzungen. Deine Übersetzung kann als Standard-Sprache verwendet werden.',
      add_language: 'Sprache hinzufügen',
      logto_provided: 'Von Logto bereitgestellt',
      key: 'Schlüssel',
      logto_source_values: 'Logto Übersetzungen',
      custom_values: 'Benutzerdefinierte Übersetzungen',
      clear_all_tip: 'Alle benutzerdefinierten Übersetzungen löschen',
      unsaved_description:
        'Wenn du diese Seite verlässt, ohne zu speichern, werden die Änderungen nicht gespeichert.',
      deletion_tip: 'Sprache löschen',
      deletion_title: 'Willst du diese Sprache wirklich löschen?',
      deletion_description:
        'Nach dem Löschen können deine Benutzer diese Sprache nicht mehr nutzen.',
      default_language_deletion_title: 'Die Standardsprache kann nicht gelöscht werden.',
      default_language_deletion_description:
        '{{language}} ist als Standardsprache eingestellt und kann nicht gelöscht werden. ',
    },
    advanced_options: {
      title: 'ERWEITERTE OPTIONEN',
      enable_create_account: 'Aktiviere Registrierung',
      enable_create_account_description:
        'Aktiviere oder deaktiviere Konto Registrierung. Wenn diese Funktion deaktiviert ist, können deine Kunden keine Konten über die Anmeldeoberfläche erstellen, aber du kannst immer noch Benutzer in der Admin Konsole hinzufügen.',
      enable_user_registration: 'Enable user registration', // UNTRANSLATED
      enable_user_registration_description:
        'Enable or disallow user registration. Once disabled, users can still be added in the admin console but users can no longer establish accounts through the sign-in UI.', // UNTRANSLATED
    },
  },
  setup_warning: {
    no_connector_sms:
      'No SMS connector set-up yet. Until you finish configuring your SMS connector, you won’t be able to sign in. <a>{{link}}</a> in "Connectors"', // UNTRANSLATED
    no_connector_email:
      'No email connector set-up yet. Until you finish configuring your email connector, you won’t be able to sign in. <a>{{link}}</a> in "Connectors"', // UNTRANSLATED
    no_connector_social:
      'No social connector set-up yet. Until you finish configuring your social connector, you won’t be able to sign in. <a>{{link}}</a> in "Connectors"', // UNTRANSLATED
    no_added_social_connector:
      'Du hast jetzt ein paar Social Connectoren eingerichtet. Füge jetzt einige zu deinem Anmeldeerlebnis hinzu.',
    setup_link: 'Set up',
  },
  save_alert: {
    description:
      'You are implementing new sign-in and sign-up procedures. All of your users may be affected by the new set-up. Are you sure to commit to the change?', // UNTRANSLATED
    before: 'Vorher',
    after: 'Nachher',
    sign_up: 'Sign-up', // UNTRANSLATED
    sign_in: 'Sign-in', // UNTRANSLATED
    social: 'Social', // UNTRANSLATED
  },
  preview: {
    title: 'Vorschau',
    live_preview: 'Live preview', // UNTRANSLATED
    live_preview_tip: 'Save to preview changes', // UNTRANSLATED
    native: 'Nativ',
    desktop_web: 'Desktop Web',
    mobile_web: 'Mobil Web',
  },
};

export default sign_in_exp;
