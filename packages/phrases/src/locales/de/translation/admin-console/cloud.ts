const cloud = {
  general: {
    onboarding: 'Einführung',
  },
  welcome: {
    page_title: 'Willkommen',
    title: 'Willkommen bei Logto Cloud! Wir möchten gerne ein bisschen mehr über Sie erfahren.',
    description:
      'Machen Sie Ihre Logto-Erfahrung einzigartig, indem Sie uns besser kennenlernen. Ihre Informationen sind bei uns sicher.',
    project_field: 'Ich verwende Logto für',
    project_options: {
      personal: 'Persönliches Projekt',
      company: 'Unternehmensprojekt',
    },
    company_name_field: 'Firmenname',
    company_name_placeholder: 'Acme.co',
    /** UNTRANSLATED */
    stage_field: 'What stage is your product currently in?',
    stage_options: {
      /** UNTRANSLATED */
      new_product: 'Start a new project and looking for a quick, out-of-the-box solution',
      /** UNTRANSLATED */
      existing_product:
        'Migrate from current authentication (e.g., self-built, Auth0, Cognito, Microsoft)',
      /** UNTRANSLATED */
      target_enterprise_ready:
        'I just landed bigger clients and now make my product ready to sell to enterprises',
    },
    /** UNTRANSLATED */
    additional_features_field: 'Do you have anything else you want us to know?',
    additional_features_options: {
      /** UNTRANSLATED */
      customize_ui_and_flow:
        'Need the ability to bring my own UI, or customize my own flows via Logto API',
      /** UNTRANSLATED */
      compliance: 'SOC2 and GDPR are must-haves',
      /** UNTRANSLATED */
      export_user_data: 'Need the ability to export user data from Logto',
      /** UNTRANSLATED */
      budget_control: 'I have very tight budget control',
      /** UNTRANSLATED */
      bring_own_auth: 'Have my own auth services and just need some Logto features',
      /** UNTRANSLATED */
      others: 'None of these above',
    },
  },
  sie: {
    page_title: 'Meldeeinrichtung anpassen',
    title: 'Passen Sie zuerst Ihre Anmeldungserfahrung mit Leichtigkeit an',
    inspire: {
      title: 'Erstellen Sie überzeugende Beispiele',
      description:
        'Fühlen Sie sich unsicher bei der Anmeldeerfahrung? Klicken Sie einfach auf "Inspire me" und lassen Sie die Magie geschehen!',
      inspire_me: 'Inspirieren Sie mich',
    },
    logo_field: 'App-Logo',
    color_field: 'Markenfarbe',
    identifier_field: 'Identifikator',
    identifier_options: {
      email: 'E-Mail',
      phone: 'Telefon',
      user_name: 'Benutzername',
    },
    authn_field: 'Authentifizierung',
    authn_options: {
      password: 'Passwort',
      verification_code: 'Verifizierungscode',
    },
    social_field: 'Soziale Anmeldung',
    finish_and_done: 'Fertig und erledigt',
    preview: {
      mobile_tab: 'Mobil',
      web_tab: 'Web',
    },
    connectors: {
      unlocked_later: 'Später entsperrt',
      unlocked_later_tip:
        'Sobald Sie den Onboarding-Prozess abgeschlossen und das Produkt betreten haben, haben Sie Zugriff auf noch mehr soziale Anmeldeverfahren.',
      notice:
        'Bitte verwenden Sie den Demo-Connector nicht für Produktionszwecke. Sobald Sie mit dem Testen fertig sind, löschen Sie bitte den Demo-Connector und richten Sie Ihren eigenen Connector mit Ihren Anmeldeinformationen ein.',
    },
  },
  socialCallback: {
    title: 'Sie haben sich erfolgreich angemeldet',
    description:
      'Sie haben sich erfolgreich mit Ihrem Social-Account angemeldet. Um eine nahtlose Integration und den Zugriff auf alle Funktionen von Logto zu gewährleisten, empfehlen wir Ihnen, Ihren eigenen Social-Connector zu konfigurieren.',
  },
  tenant: {
    create_tenant: 'Tenant erstellen',
  },
};

export default Object.freeze(cloud);
