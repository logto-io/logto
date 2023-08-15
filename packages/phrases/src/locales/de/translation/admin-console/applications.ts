const applications = {
  page_title: 'Anwendungen',
  title: 'Anwendungen',
  subtitle:
    'Richte eine native, single page, machine to machine oder herkömmliche Anwendung ein, die Logto zur Authentifizierung nutzt.',
  create: 'Anwendung erstellen',
  application_name: 'Anwendungsname',
  application_name_placeholder: 'Meine App',
  application_description: 'Anwendungsbeschreibung',
  application_description_placeholder: 'Gib eine Beschreibung ein',
  select_application_type: 'Wähle einen Anwendungstyp',
  no_application_type_selected: 'Du hast noch keinen Anwendungstyp ausgewählt',
  application_created:
    'Die Anwendung {{name}} wurde erfolgreich erstellt.\nKonfiguriere jetzt die Anwendung.',
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
  },
  guide: {
    header_title: 'Select a framework or tutorial', // UNTRANSLATED
    modal_header_title: 'Start with SDK and guides', // UNTRANSLATED
    header_subtitle: 'Jumpstart your app development process with our pre-built SDK and tutorials.', // UNTRANSLATED
    start_building: 'Start Building', // UNTRANSLATED
    categories: {
      featured: 'Popular and for you', // UNTRANSLATED
      Traditional: 'Traditional web app', // UNTRANSLATED
      SPA: 'Single page app', // UNTRANSLATED
      Native: 'Native', // UNTRANSLATED
      MachineToMachine: 'Machine-to-machine', // UNTRANSLATED
    },
    filter: {
      title: 'Filter framework', // UNTRANSLATED
      placeholder: 'Search for framework', // UNTRANSLATED
    },
    get_sample_file: 'Zum Beispielprojekt',
    title: 'Die Anwendung wurde erfolgreich erstellt',
    subtitle:
      'Folge nun den folgenden Schritten, um deine App-Einstellungen abzuschließen. Bitte wähle den SDK-Typ aus, um fortzufahren.',
    description_by_sdk:
      'Diese Schnellstart-Anleitung zeigt, wie man Logto in die {{sdk}} App integriert',
    do_not_need_tutorial:
      'If you don’t need a tutorial, you can continue without a framework guide', // UNTRANSLATED
    create_without_framework: 'Create app without framework', // UNTRANSLATED
    finish_and_done: 'Fertig und erledigt',
    cannot_find_guide: "Can't find your guide?", // UNTRANSLATED
    describe_guide_looking_for: 'Describe the guide you are looking for', // UNTRANSLATED
    describe_guide_looking_for_placeholder: 'E.g., I want to integrate Logto into my Angular app.', // UNTRANSLATED
    request_guide_successfully: 'Your request has been successfully submitted. Thank you!', // UNTRANSLATED
  },
  placeholder_title: 'Wähle einen Anwendungstyp, um fortzufahren',
  placeholder_description:
    'Logto verwendet eine Anwendungs-Entität für OIDC, um Aufgaben wie die Identifizierung Ihrer Apps, die Verwaltung der Anmeldung und die Erstellung von Prüfprotokollen zu erleichtern.',
};

export default Object.freeze(applications);
