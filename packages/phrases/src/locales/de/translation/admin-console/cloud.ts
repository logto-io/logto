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
    title_field: 'Wählen Sie anwendbare Titel aus',
    title_options: {
      developer: 'Entwickler',
      team_lead: 'Teamleiter',
      ceo: 'CEO',
      cto: 'CTO',
      product: 'Produkt',
      others: 'Andere',
    },
    company_name_field: 'Firmenname',
    company_name_placeholder: 'Acme.co',
    company_size_field: 'Wie groß ist Ihre Firma?',
    company_options: {
      size_1: '1',
      size_2_49: '2-49',
      size_50_199: '50-199',
      size_200_999: '200-999',
      size_1000_plus: '1000+',
    },
    reason_field: 'Ich melde mich an, weil',
    reason_options: {
      passwordless: 'Auf der Suche nach passwortloser Authentifizierung und UI-Kit',
      efficiency: 'Auf der Suche nach out-of-the-box Identitätsinfrastruktur',
      access_control: 'Benutzerzugriff auf Rolle und Verantwortung kontrollieren',
      multi_tenancy: 'Auf der Suche nach Strategien für ein Multi-Tenancy-Produkt',
      enterprise: 'Suche nach SSO-Lösungen für Enterprise-Readiness',
      others: 'Andere',
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
