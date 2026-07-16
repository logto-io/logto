const inline_hooks = {
  page_title: 'Inline-Hooks',
  title: 'Inline-Hooks',
  subtitle:
    'Führe benutzerdefinierten Code an bestimmten Punkten im Authentifizierungsablauf aus, um das Verhalten von Logto zu erweitern.',
  details_page_title: '{{name}}',
  status: {
    not_configured: 'Nicht konfiguriert',
    configured: 'Konfiguriert',
    enabled: 'Aktiviert',
    disabled: 'Deaktiviert',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'Nach Überprüfung des ersten Faktors',
      description:
        'Führe benutzerdefinierte Logik aus, nachdem der erste Authentifizierungsfaktor überprüft wurde und bevor die Anmeldung fortgesetzt wird.',
    },
    post_sign_in: {
      name: 'Nach der Anmeldung',
      description:
        'Führe benutzerdefinierte Logik aus, nachdem sich ein Benutzer erfolgreich angemeldet hat.',
    },
  },
  data_source_tab: 'Datenquelle',
  test_tab: 'Testkontext',
  settings_tab: 'Einstellungen',
  event_data: {
    title: 'Ereignis-Payload',
    subtitle: 'Verwende den Eingabeparameter `event` für die Authentifizierungsereignisdaten.',
  },
  result_data: {
    title: 'Hook-Ergebnis',
    subtitle: 'Gib ein Ergebnisobjekt zurück, das Logto für diesen Hook-Typ versteht.',
  },
  environment_variables: {
    title: 'Umgebungsvariablen festlegen',
    subtitle: 'Verwende Umgebungsvariablen, um sensible Informationen zu speichern.',
    input_field_title: 'Umgebungsvariablen hinzufügen',
    sample_code: 'Zugriff auf Umgebungsvariablen im Inline-Hook-Handler. Beispiel:',
  },
  fetch_external_data: {
    title: 'Externe Daten abrufen',
    subtitle: 'Rufe externe APIs aus deinem Hook-Skript auf.',
    description:
      'Verwende die Funktion `fetch`, um externe APIs aufzurufen und die Daten in das Hook-Ergebnis aufzunehmen. Beispiel:',
  },
  settings: {
    title: 'Einstellungen',
    subtitle: 'Steuere, ob der Hook aktiv ist und wie Laufzeitfehler behandelt werden.',
    enabled: {
      title: 'Hook aktivieren',
      description: 'Führe dieses Skript aus, wenn das Authentifizierungsereignis ausgelöst wird.',
    },
    on_execution_error: {
      title: 'Bei Skriptfehler',
      description:
        'Wähle, wie sich Logto verhalten soll, wenn das Skript zur Laufzeit fehlschlägt.',
      block: 'Authentifizierungsablauf blockieren',
      allow: 'Authentifizierungsablauf fortsetzen lassen',
      post_first_factor_description:
        'Wenn dieses Skript fehlschlägt, lehnt Logto ungültige Anmeldedaten immer ab, damit die Passwortprüfung nicht umgangen werden kann.',
    },
  },
  test_context: {
    subtitle: 'Passe die Mock-Ereignis-Payload an, die beim Ausführen von Tests verwendet wird.',
    input_field_title: 'Ereignisbeispiel-JSON',
  },
  script: {
    title: 'Skript',
    restore: 'Standardwerte wiederherstellen',
    restored: 'Wiederhergestellt',
  },
  tester: {
    run_button: 'Test ausführen',
    result_title: 'Testergebnis',
  },
  form_error: {
    invalid_json: 'Ungültiges JSON-Format',
  },
  security_warning: {
    title: 'Sicherheitswarnung',
    description:
      'Durch diesen Hook bereitgestellte Benutzer umgehen nur für die Registrierung geltende Schutzmaßnahmen, einschließlich E-Mail-Blockliste, SSO-only-Domain, deaktiviertem Anmeldemodus und Pflichtprofilprüfungen bei der Registrierung. Profil- und Passwortänderungen bestehender Benutzer erfolgen außerdem, bevor MFA abgeschlossen ist.',
  },
  delete_modal_title: 'Inline-Hook löschen',
  delete_modal_content:
    'Möchtest du diesen Inline-Hook wirklich löschen? Der Authentifizierungsablauf führt dieses Skript dann nicht mehr aus.',
  deleted: 'Inline-Hook gelöscht',
  created: 'Inline-Hook erstellt',
  saved: 'Inline-Hook gespeichert',
};

export default Object.freeze(inline_hooks);
