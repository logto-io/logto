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
    stage_field: 'In welchem Stadium befindet sich Ihr Produkt derzeit?',
    stage_options: {
      new_product: 'Starte ein neues Projekt und suche nach einer schnellen, Out-of-the-Box-Lösung',
      existing_product:
        'Migration von der derzeitigen Authentifizierung (z. B. selbst erstellt, Auth0, Cognito, Microsoft)',
      target_enterprise_ready:
        'Ich habe gerade größere Kunden gewonnen und möchte mein Produkt jetzt bereit machen, um es an Unternehmen zu verkaufen',
    },
    additional_features_field: 'Haben Sie noch etwas, das Sie uns wissen lassen möchten?',
    additional_features_options: {
      customize_ui_and_flow:
        'Erstellen und verwalten Sie Ihre eigene Benutzeroberfläche und Ihren eigenen Ablauf, anstatt nur die vorgefertigte und anpassbare Lösung von Logto zu verwenden',
      compliance: 'SOC2 und GDPR sind Pflicht',
      export_user_data: 'Benötigen Sie die Möglichkeit, Benutzerdaten von Logto zu exportieren',
      budget_control: 'Ich habe sehr strenge Budgetkontrolle',
      bring_own_auth:
        'Ich habe eigene Authentifizierungsdienste und benötige nur einige Logto-Funktionen',
      others: 'Keines der oben genannten',
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
