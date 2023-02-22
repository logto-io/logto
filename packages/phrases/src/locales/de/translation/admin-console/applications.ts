const applications = {
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
    'Die Anwendung {{name}} wurde erfolgreich erstellt! \nKonfiguriere jetzt die Anwendung.',
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
      title: 'Machine to Machine',
      subtitle: 'Eine Anwendung (normalerweise ein Dienst), die direkt mit Ressourcen kommuniziert',
      description: 'z.B. Backend Dienst',
    },
  },
  guide: {
    get_sample_file: 'Zum Beispielprojekt',
    header_description:
      'Folge der Schritt-für-Schritt-Anleitung, um die Anwendung zu integrieren, oder klick auf die rechte Schaltfläche, um unser Beispielprojekt zu erhalten',
    title: 'Die Anwendung wurde erfolgreich erstellt',
    subtitle:
      'Folge nun den folgenden Schritten, um deine App-Einstellungen abzuschließen. Bitte wähle den SDK-Typ aus, um fortzufahren.',
    description_by_sdk:
      'Diese Schnellstart-Anleitung zeigt, wie man Logto in die {{sdk}} App integriert',
  },
};

export default applications;
