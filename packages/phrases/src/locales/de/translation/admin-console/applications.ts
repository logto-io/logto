const applications = {
  page_title: 'Anwendungen',
  title: 'Anwendungen',
  subtitle:
    'Richte eine native, single-page-, Machine-to-Machine- oder herkömmliche Anwendung ein, die Logto zur Authentifizierung nutzt.',
  subtitle_with_app_type: 'Richte Logto-Authentifizierung für deine {{name}}-Anwendung ein',
  create_device_flow_description:
    'Erstellen Sie eine native Anwendung, die den OAuth 2.0 Device Authorization Grant für eingabebeschränkte Geräte oder Headless-Apps verwendet.',
  create: 'Anwendung erstellen',
  create_third_party: 'Erstelle eine Drittanbieteranwendung',
  create_thrid_party_modal_title: 'Erstelle eine Drittanbieter-App ({{type}})',
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
      description: 'z.B. iOS-App, Android-App, Desktop-App, TVs, CLI',
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
    saml: {
      title: 'SAML-App',
      subtitle: 'Eine App, die als SAML IdP-Konnektor verwendet wird',
      description: 'z. B. SAML',
    },
    third_party: {
      title: 'Drittanbieter-App',
      subtitle: 'Eine App, die als Drittanbieter-IdP-Konnektor verwendet wird',
      description: 'z.B. OIDC, SAML',
    },
  },
  authorization_flow: {
    title: 'Autorisierungsfluss',
    tooltip:
      'Wählen Sie den Autorisierungsfluss für Ihre Anwendung. Einmal festgelegt, kann er nicht mehr geändert werden.',
    authorization_code: {
      title: 'Authorization code',
      description:
        'Der standardmäßige und am häufigsten verwendete Autorisierungstyp. Benutzer werden zur Anmeldeseite weitergeleitet, um den Zugriff direkt zu autorisieren.',
    },
    device_flow: {
      title: 'Device flow',
      description:
        'Für eingabebeschränkte Geräte oder kopflose Apps (z. B. Fernseher, CLI). Benutzer schließen die Anmeldung auf einem separaten Gerät ab, indem sie einen Gerätecode eingeben oder einen QR-Code scannen.',
    },
  },
  placeholder_title: 'Wähle einen Anwendungstyp, um fortzufahren',
  placeholder_description:
    'Logto verwendet eine Anwendungs-Entität für OIDC, um Aufgaben wie die Identifizierung deiner Apps, das Management der Anmeldung und die Erstellung von Prüfprotokollen zu erleichtern.',
  third_party_application_placeholder_description:
    'Verwende Logto als Identity Provider, um OAuth-Autorisierung für Drittanbieterdienste bereitzustellen. \n Beinhaltet einen vorgebauten Benutzerzustimmungsbildschirm für den Ressourcenzugriff. <a>Mehr erfahren</a>',
  dynamic_app: {
    title: 'Dynamische App',
    subtitle: 'CIMD',
    description:
      'Dynamische App erlaubt OAuth-Clients, sich ohne vorherige Registrierung zu verbinden.',
    settings_description:
      'Dynamische App erlaubt OAuth-Clients, sich ohne vorherige Registrierung zu verbinden. Verwendet die Spezifikation OAuth Client ID Metadata Document (CIMD).',
    beta_notice:
      'Dynamische App befindet sich derzeit in der Beta-Phase. Willkommen, es zu erkunden und <ContactLink>Geben Sie Ihr Feedback</ContactLink>.',
    app_id_placeholder: 'Wird von jedem Client dynamisch bereitgestellt',
    enable_confirm_modal: {
      title: 'Dynamischen Client-Zugriff aktivieren?',
      content:
        'Jeder OAuth-Client mit einer gültigen öffentlichen HTTPS-Client-ID-URL kann die Autorisierung für diesen Mandanten ohne vorherige Registrierung starten. Der Zugriff bleibt durch deine maximalen Berechtigungen und die Zustimmung der Benutzer begrenzt.',
      beta_pricing_notice:
        'Dynamische App ist während der Beta-Phase kostenlos. Nach der Beta-Phase können Add-on-Gebühren anfallen. Wir informieren dich rechtzeitig vorher, und du kannst die Funktion jederzeit deaktivieren.',
    },
    enabled: 'Dynamische App erfolgreich aktiviert.',
    disable_confirm_modal: {
      title: 'Dynamische App deaktivieren?',
      content:
        'CIMD-Clients können keine neuen Autorisierungsanfragen mehr starten. Bestehende Berechtigungen bleiben erhalten und bereits ausgestellte Access Tokens können bis zu ihrem Ablauf gültig bleiben.',
    },
    disabled: 'Dynamische App erfolgreich deaktiviert.',
    permissions: {
      user_title: 'Benutzer',
      user_description:
        'Wählen Sie die Berechtigungen aus, die von OAuth-Clients für den Zugriff auf bestimmte Benutzerdaten angefordert werden.',
      grant_user_level_permissions: 'Benutzerberechtigungen erteilen',
      organization_title: 'Organisation',
      organization_description:
        'Wählen Sie die Berechtigungen aus, die von OAuth-Clients für den Zugriff auf bestimmte Organisationsdaten angefordert werden.',
      grant_organization_level_permissions: 'Organisationsberechtigungen erteilen',
      permission_delete_confirm:
        'Diese Aktion entfernt die Berechtigung aus der dynamischen App, sodass OAuth-Clients keine Benutzerberechtigung mehr dafür anfragen können. Sind Sie sicher, dass Sie fortfahren möchten?',
    },
  },
  guide: {
    third_party: {
      title: 'Integriere eine Drittanbieteranwendung',
      description:
        'Verwende Logto als Identity Provider, um OAuth-Autorisierung für Drittanbieterdienste bereitzustellen. Beinhaltet einen vorgefertigten Benutzerzustimmungsbildschirm für sicheren Ressourcenzugriff. <a>Mehr erfahren</a>',
    },
  },
};

export default Object.freeze(applications);
