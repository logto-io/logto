const applications = {
  page_title: 'Anwendungen',
  title: 'Anwendungen',
  subtitle:
    'Richte eine native, single page, machine to machine oder herkömmliche Anwendung ein, die Logto zur Authentifizierung nutzt.',
  subtitle_with_app_type: 'Richte Logto-Authentifizierung für deine {{name}}-Anwendung ein',
  create: 'Anwendung erstellen',
  application_name: 'Anwendungsname',
  application_name_placeholder: 'Meine App',
  application_description: 'Anwendungsbeschreibung',
  application_description_placeholder: 'Gib eine Beschreibung ein',
  select_application_type: 'Wähle einen Anwendungstyp',
  no_application_type_selected: 'Du hast noch keinen Anwendungstyp ausgewählt',
  application_created: 'Die Anwendung wurde erfolgreich erstellt.',
  tab: {
    /** UNTRANSLATED */
    my_applications: 'My apps',
    /** UNTRANSLATED */
    third_party_applications: 'Third party apps',
  },
  app_id: 'App ID',
  type: {
    native: {
      title: 'Native App',
      subtitle: 'Eine Anwendung, die in einer nativen Umgebung läuft',
      description: 'z.B. iOS app, Android app',
    },
    spa: {
      title: 'Single Page App',
      subtitle:
        'Eine Anwendung, die in einem Webbrowser ausgeführt wird und Daten dynamisch an Ort und Stelle aktualisiert',
      description: 'z.B. React DOM app, Vue app',
    },
    traditional: {
      title: 'Herkömmliche Website',
      subtitle: 'Eine Anwendung, die Seiten allein durch den Webserver rendert und aktualisiert',
      description: 'z.B. Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle: 'Eine Anwendung (normalerweise ein Dienst), die direkt mit Ressourcen kommuniziert',
      description: 'z.B. Backend Dienst',
    },
    third_party: {
      /** UNTRANSLATED */
      title: 'Third-party app',
      /** UNTRANSLATED */
      subtitle: 'An app that is used as a third-party IdP connector',
      /** UNTRANSLATED */
      description: 'E.g., OIDC, SAML',
    },
  },
  placeholder_title: 'Wähle einen Anwendungstyp, um fortzufahren',
  placeholder_description:
    'Logto verwendet eine Anwendungs-Entität für OIDC, um Aufgaben wie die Identifizierung Ihrer Apps, die Verwaltung der Anmeldung und die Erstellung von Prüfprotokollen zu erleichtern.',
};

export default Object.freeze(applications);
