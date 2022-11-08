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
    title:
      'Dies ist das erste Mal, dass du deine Anmeldeoberfläche anpasst. Diese Anleitung hilft dir, alle notwendigen Einstellungen vorzunehmen und schnell loszulegen.',
    get_started: 'Erste Schritte',
    apply_remind:
      'Bitte beachte, dass die Anmeldeoberfläche für alle Anwendungen unter diesem Konto gilt.',
    got_it: 'Alles klar',
  },
  sign_up_and_sign_in: {
    identifiers: 'Sign up identifiers', // UNTRANSLATED
    identifiers_email: 'Email address', // UNTRANSLATED
    identifiers_sms: 'Phone number', // UNTRANSLATED
    identifiers_username: 'Username', // UNTRANSLATED
    identifiers_email_or_sms: 'Email address or phone number', // UNTRANSLATED
    identifiers_none: 'None', // UNTRANSLATED
    and: 'and', // UNTRANSLATED
    or: 'or', // UNTRANSLATED
    sign_up: {
      title: 'SIGN UP', // UNTRANSLATED
      sign_up_identifier: 'Sign up identifier', // UNTRANSLATED
      sign_up_authentication: 'Sign up authentication', // UNTRANSLATED
      set_a_password_option: 'Set a password', // UNTRANSLATED
      verify_at_sign_up_option: 'Verify at sign up', // UNTRANSLATED
      social_only_creation_description: '(This apply to social only account creation)', // UNTRANSLATED
    },
    sign_in: {
      title: 'SIGN IN', // UNTRANSLATED
      sign_in_identifier_and_auth: 'Sign in identifier and authentication', // UNTRANSLATED
      description:
        'Users can use any one of the selected ways to sign in. Drag and drop to define identifier priority regarding the sign in flow. You can also define the password or verification code priority.', // UNTRANSLATED
      add_sign_in_method: 'Add Sign-in Method', // UNTRANSLATED
      password_auth: 'Password', // UNTRANSLATED
      verification_code_auth: 'Verification code', // UNTRANSLATED
      auth_swap_tip: 'Swap to change the priority', // UNTRANSLATED
    },
    social_sign_in: {
      title: 'SOCIAL SIGN IN', // UNTRANSLATED
      social_sign_in: 'Social sign in', // UNTRANSLATED
      description:
        'Users may need to enter required identifier when register through social accounts. This was defined by your sign up identifier.', // UNTRANSLATED
      add_social_connector: 'Add Social Connector', // UNTRANSLATED
      set_up_hint: {
        not_in_list: 'Not in the list?', // UNTRANSLATED
        set_up_more: 'Set up more', // UNTRANSLATED
        go_to: 'social connectors or go to “Connectors” section.', // UNTRANSLATED
      },
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
    styles: {
      logo_slogan: 'App logo mit Slogan',
      logo: 'Nur App logo',
    },
    logo_image_url: 'App logo URL',
    logo_image_url_placeholder: 'https://dein.cdn.domain/logo.png',
    dark_logo_image_url: 'App logo URL (Dunkler Modus)',
    dark_logo_image_url_placeholder: 'https://dein.cdn.domain/logo-dark.png',
    slogan: 'Slogan',
    slogan_placeholder: 'Entfessle deine Kreativität',
  },
  sign_in_methods: {
    title: 'ANMELDEMETHODEN',
    primary: 'Primäre Anmeldemethode',
    enable_secondary: 'Aktiviere sekundäre Anmeldemethoden',
    enable_secondary_description:
      'Sobald sie aktiviert ist, unterstützt deine App neben der primären Anmeldemethode noch weitere Anmeldemethoden. ',
    methods: 'Anmeldemethode',
    methods_sms: 'SMS Anmeldung',
    methods_email: 'E-Mail Anmeldung',
    methods_social: 'Social Anmeldung',
    methods_username: 'Benutzername-und-Passwort Anmeldung',
    methods_primary_tag: '(Primär)',
    define_social_methods: 'Definiere die unterstützten Social Anmeldemethoden',
    transfer: {
      title: 'Social Connectoren',
      footer: {
        not_in_list: 'Nicht in der Liste?',
        set_up_more: 'Mehr Social Connectoren einrichten',
        go_to: 'oder "Connectoren" aufrufen.',
      },
    },
  },
  others: {
    terms_of_use: {
      title: 'NUTZUNGSBEDINGUNGEN',
      terms_of_use_url: 'URL zu den Nutzungsbedingungen',
      terms_of_use_placeholder: 'https://beispiel.de/nutzungsbedingungen',
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
      got_it: 'Alles klar',
    },
    authentication: {
      title: 'AUTHENTIFIZIERUNG',
      enable_create_account: 'Aktiviere Registrierung',
      enable_create_account_description:
        'Aktiviere oder deaktiviere Konto Registrierung. Wenn diese Funktion deaktiviert ist, können deine Kunden keine Konten über die Anmeldeoberfläche erstellen, aber du kannst immer noch Benutzer in der Admin Konsole hinzufügen.',
      enable_user_registration: 'Enable user registration', // UNTRANSLATED
      enable_user_registration_description:
        'Enable or disallow user registration. Once disabled, users can still be added in the admin console but users can no longer establish accounts through the sign-in UI.', // UNTRANSLATED
    },
  },
  setup_warning: {
    no_connector: '',
    no_connector_sms:
      'Du hast noch keinen SMS Connector eingerichtet. Deine Anmeldung wird erst freigeschaltet, wenn du die Einstellungen abgeschlossen hast. ',
    no_connector_email:
      'Du hast noch keinen E-Mail Connector eingerichtet. Deine Anmeldung wird erst freigeschaltet, wenn du die Einstellungen abgeschlossen hast. ',
    no_connector_social:
      'Du hast noch keinen Social Connector eingerichtet. Deine Anmeldung wird erst freigeschaltet, wenn du die Einstellungen abgeschlossen hast. ',
    no_added_social_connector:
      'Du hast jetzt ein paar Social Connectoren eingerichtet. Füge jetzt einige zu deinem Anmeldeerlebnis hinzu.',
  },
  save_alert: {
    description:
      'Du änderst die Anmeldemethoden. Das wird sich auf einige deiner Benutzer auswirken. Bist du sicher, dass du das tun willst?',
    before: 'Vorher',
    after: 'Nachher',
    sign_up: 'Sign up', // UNTRANSLATED
    sign_in: 'Sign in', // UNTRANSLATED
    social: 'Social', // UNTRANSLATED
  },
  preview: {
    title: 'Vorschau',
    dark: 'Dunkel',
    light: 'Hell',
    native: 'Nativ',
    desktop_web: 'Desktop Web',
    mobile_web: 'Mobil Web',
  },
};

export default sign_in_exp;
