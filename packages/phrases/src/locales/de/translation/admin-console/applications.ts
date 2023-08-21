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
    header_title: 'Wähle ein Framework oder Tutorial',
    modal_header_title: 'Starte mit SDK und Anleitungen',
    header_subtitle:
      'Starte deinen App-Entwicklungsprozess mit unserem vorgefertigten SDK und Tutorials.',
    start_building: 'Starte mit dem Aufbau',
    categories: {
      featured: 'Beliebt und für dich',
      Traditional: 'Herkömmliche Webanwendung',
      SPA: 'Single page app',
      Native: 'Native',
      MachineToMachine: 'Machine-to-machine',
    },
    filter: {
      title: 'Framework filtern',
      placeholder: 'Suche nach Framework',
    },
    select_a_framework: 'Wähle ein Framework',
    checkout_tutorial: 'Anleitung zu {{name}} ansehen',
    get_sample_file: 'Beispielprojekt erhalten',
    title: 'Die Anwendung wurde erfolgreich erstellt',
    subtitle:
      'Folge nun den folgenden Schritten, um deine App-Einstellungen abzuschließen. Bitte wähle den SDK-Typ aus, um fortzufahren.',
    description_by_sdk:
      'Diese Schnellstart-Anleitung zeigt, wie man Logto in die {{sdk}}-App integriert.',
    do_not_need_tutorial:
      'Wenn du kein Tutorial benötigst, kannst du ohne Framework-Anleitung fortfahren.',
    create_without_framework: 'App ohne Framework erstellen',
    finish_and_done: 'Fertig und erledigt',
    cannot_find_guide: 'Findest du deine Anleitung nicht?',
    describe_guide_looking_for: 'Beschreibe die Anleitung, nach der du suchst',
    describe_guide_looking_for_placeholder:
      'z.B. Ich möchte Logto in meine Angular-App integrieren.',
    request_guide_successfully: 'Deine Anfrage wurde erfolgreich abgesendet. Danke!',
  },
  placeholder_title: 'Wähle einen Anwendungstyp, um fortzufahren',
  placeholder_description:
    'Logto verwendet eine Anwendungs-Entität für OIDC, um Aufgaben wie die Identifizierung Ihrer Apps, die Verwaltung der Anmeldung und die Erstellung von Prüfprotokollen zu erleichtern.',
};

export default Object.freeze(applications);
