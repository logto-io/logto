const applications = {
  page_title: 'Anwendungen',
  title: 'Anwendungen',
  subtitle:
    'Richte eine native, single-page-, Machine-to-Machine- oder herkömmliche Anwendung ein, die Logto zur Authentifizierung nutzt.',
  subtitle_with_app_type: 'Richte Logto-Authentifizierung für deine {{name}}-Anwendung ein',
  create: 'Anwendung erstellen',
  create_subtitle_third_party:
    'Verwende Logto als deinen Identitätsanbieter (IdP), um leicht mit Anwendungen von Drittanbietern zu integrieren',
  application_name: 'Anwendungsname',
  application_name_placeholder: 'Meine App',
  application_description: 'Anwendungsbeschreibung',
  application_description_placeholder: 'Gib eine Beschreibung ein',
  select_application_type: 'Wähle einen Anwendungstyp',
  no_application_type_selected: 'Du hast noch keinen Anwendungstyp ausgewählt',
  application_created: 'Die Anwendung wurde erfolgreich erstellt.',
  tab: {
    my_applications: 'Meine Apps',
    third_party_applications: 'Apps von Drittanbietern',
  },
  app_id: 'App-ID',
  type: {
    native: {
      title: 'Native App',
      subtitle: 'Eine Anwendung, die in einer nativen Umgebung läuft',
      description: 'z.B. iOS-App, Android-App',
    },
    spa: {
      title: 'Single-Page-App',
      subtitle:
        'Eine Anwendung, die im Webbrowser ausgeführt wird und Daten dynamisch vor Ort aktualisiert',
      description: 'z.B. React-DOM-App, Vue-App',
    },
    traditional: {
      title: 'Herkömmliche Website',
      subtitle: 'Eine Anwendung, die Seiten allein durch den Webserver rendert und aktualisiert',
      description: 'z.B. Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle: 'Eine Anwendung (normalerweise ein Dienst), die direkt mit Ressourcen kommuniziert',
      description: 'z.B. Backend-Dienst',
    },
    protected: {
      title: 'Geschützte App',
      subtitle: 'Eine von Logto geschützte App',
      description: 'N/A',
    },
    third_party: {
      title: 'Drittanbieter-App',
      subtitle: 'Eine App, die als Drittanbieter-IdP-Konnektor verwendet wird',
      description: 'z.B. OIDC, SAML',
    },
  },
  placeholder_title: 'Wähle einen Anwendungstyp, um fortzufahren',
  placeholder_description:
    'Logto verwendet eine Anwendungs-Entität für OIDC, um Aufgaben wie die Identifizierung deiner Apps, das Management der Anmeldung und die Erstellung von Prüfprotokollen zu erleichtern.',
};

export default Object.freeze(applications);
