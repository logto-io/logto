const jwt_claims = {
  title: 'Benutzerdefiniertes JWT',
  description:
    'Legen Sie benutzerdefinierte JWT-Ansprüche fest, die im Zugriffstoken enthalten sein sollen. Diese Ansprüche können verwendet werden, um zusätzliche Informationen an Ihre Anwendung zu übergeben.',
  user_jwt: {
    card_title: 'Für Benutzer',
    card_field: 'Benutzerzugriffstoken',
    card_description:
      'Fügen Sie benutzerspezifische Daten während der Ausstellung des Zugriffstokens hinzu.',
    for: 'für Benutzer',
  },
  machine_to_machine_jwt: {
    card_title: 'Für M2M',
    card_field: 'Maschine-zu-Maschine-Token',
    card_description:
      'Fügen Sie zusätzliche Daten während der Ausstellung des Maschine-zu-Maschine-Tokens hinzu.',
    for: 'für M2M',
  },
  code_editor_title: 'Passen Sie die {{token}}-Ansprüche an',
  custom_jwt_create_button: 'Benutzerdefinierte Ansprüche hinzufügen',
  custom_jwt_item: 'Benutzerdefinierte Ansprüche {{for}}',
  delete_modal_title: 'Benutzerdefinierte Ansprüche löschen',
  delete_modal_content:
    'Sind Sie sicher, dass Sie die benutzerdefinierten Ansprüche löschen möchten?',
  clear: 'Löschen',
  cleared: 'Gelöscht',
  restore: 'Standard wiederherstellen',
  restored: 'Wiederhergestellt',
  data_source_tab: 'Datenquelle',
  test_tab: 'Testumgebung',
  jwt_claims_description:
    'Standardansprüche werden automatisch im JWT enthalten und können nicht überschrieben werden.',
  user_data: {
    title: 'Benutzerdaten',
    subtitle:
      'Verwenden Sie den `context.user` Eingabeparameter, um wichtige Benutzerinformationen bereitzustellen.',
  },
  grant_data: {
    title: 'Zugriffsdaten',
    subtitle:
      'Verwenden Sie den `context.grant` Eingabeparameter, um wichtige Informationen zu gewähren, nur für den Token-Austausch verfügbar.',
  },
  token_data: {
    title: 'Token-Daten',
    subtitle: 'Verwenden Sie den `token` Eingabeparameter für die aktuelle Zugriffstoken-Payload.',
  },
  fetch_external_data: {
    title: 'Externe Daten abrufen',
    subtitle: 'Integrieren Sie Daten direkt aus Ihren externen APIs in die Ansprüche.',
    description:
      'Verwenden Sie die `fetch`-Funktion, um Ihre externen APIs aufzurufen und die Daten in Ihre benutzerdefinierten Ansprüche einzubeziehen. Beispiel: ',
  },
  environment_variables: {
    title: 'Umgebungsvariablen festlegen',
    subtitle: 'Verwenden Sie Umgebungsvariablen, um vertrauliche Informationen zu speichern.',
    input_field_title: 'Umgebungsvariablen hinzufügen',
    sample_code:
      'Zugriff auf Umgebungsvariablen in Ihrem benutzerdefinierten JWT-Anspruchshandler. Beispiel: ',
  },
  jwt_claims_hint:
    'Beschränken Sie benutzerdefinierte Ansprüche auf weniger als 50 KB. Standard-JWT-Ansprüche werden automatisch im Token enthalten und können nicht überschrieben werden.',
  tester: {
    subtitle: 'Mock-Token und Benutzerdaten für Tests anpassen.',
    run_button: 'Test ausführen',
    result_title: 'Testergebnis',
  },
  form_error: {
    invalid_json: 'Ungültiges JSON-Format',
  },
};

export default Object.freeze(jwt_claims);
