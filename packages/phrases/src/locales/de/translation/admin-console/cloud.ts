const cloud = {
  welcome: {
    page_title: 'Willkommen',
    title: 'Willkommen, lass uns deine eigene Logto Cloud Preview erstellen',
    description:
      'Egal, ob Sie ein Open-Source- oder Cloud-Benutzer sind, machen Sie eine Tour durch die Showcase und erleben Sie den vollen Wert von Logto. Die Cloud-Vorschau dient auch als vorläufige Version von Logto Cloud.',
    project_field: 'Ich verwende Logto für',
    project_options: {
      personal: 'Persönliches Projekt',
      company: 'Unternehmensprojekt',
    },
    deployment_type_field: 'Bevorzugst du Open-Source oder Cloud?',
    deployment_type_options: {
      open_source: 'Open-Source',
      cloud: 'Cloud',
    },
  },
  about: {
    page_title: 'Ein bisschen über Sie',
    title: 'Ein wenig über Sie',
    description:
      'Machen Sie Ihre Logto-Erfahrung einzigartig, indem Sie uns besser kennenlernen. Ihre Informationen sind bei uns sicher.',
    title_field: 'Ihr Titel',
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
  congrats: {
    page_title: 'Frühe Credits verdienen',
    title:
      'Großartige Neuigkeiten! Du bist berechtigt, frühzeitige Logto Cloud-Credits zu verdienen!',
    description:
      'Verpassen Sie nicht die Chance, nach dem offiziellen Start einen kostenlosen <strong>60-Tage-Abonnement</strong> von Logto Cloud zu genießen! Kontaktieren Sie jetzt das Logto-Team, um mehr zu erfahren.',
    check_out_button: 'Live-Vorschau ansehen',
    reserve_title: 'Reservieren Sie Ihre Zeit beim Logto-Team',
    reserve_description: 'Das Guthaben ist nur einmal nach Validierung berechtigt.',
    book_button: 'Jetzt buchen',
    join_description:
      'Treten Sie unserem öffentlichen <a>{{link}}</a> bei, um sich mit anderen Entwicklern zu verbinden und zu chatten.',
    discord_link: 'Discord-Kanal',
    enter_admin_console: 'Logto Cloud Preview betreten',
  },
  gift: {
    title: 'Nutzen Sie Logto Cloud 60 Tage lang kostenlos. Treten Sie jetzt den Vorreitern bei!',
    description: 'Buchen Sie eine Einzelsitzung mit unserem Team für frühes Guthaben.',
    reserve_title: 'Reservieren Sie Ihre Zeit beim Logto-Team',
    reserve_description: 'Das Guthaben ist nur einmal nach Bewertung berechtigt.',
    book_button: 'Buch',
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
  broadcast: '📣 Sie befinden sich in Logto Cloud (Preview)',
  socialCallback: {
    title: 'Sie haben sich erfolgreich angemeldet',
    description:
      'Sie haben sich erfolgreich mit Ihrem Social-Account angemeldet. Um eine nahtlose Integration und den Zugriff auf alle Funktionen von Logto zu gewährleisten, empfehlen wir Ihnen, Ihren eigenen Social-Connector zu konfigurieren.',
  },
};

export default cloud;
