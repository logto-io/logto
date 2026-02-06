const jwt_claims = {
  title: 'Benutzerdefiniertes JWT',
  description:
    'Legen Sie benutzerdefinierte JWT-Ansprüche fest, die im Zugriffstoken enthalten sein sollen. Diese Ansprüche können verwendet werden, um zusätzliche Informationen an Ihre Anwendung zu übergeben.',
  description_with_id_token:
    'Passen Sie Zugriffstoken oder ID-Token an und stellen Sie Ihrer Anwendung zusätzliche Informationen zur Verfügung.',
  access_token: {
    card_title: 'Zugriffstoken',
    card_description:
      'Das Zugriffstoken ist die von APIs zur Autorisierung von Anfragen verwendete Berechtigung und enthält nur die für Zugriffsentscheidungen erforderlichen Ansprüche.',
  },
  user_jwt: {
    card_field: 'Benutzerzugriffstoken',
    card_description:
      'Fügen Sie benutzerspezifische Daten während der Ausstellung des Zugriffstokens hinzu.',
    for: 'für Benutzer',
  },
  machine_to_machine_jwt: {
    card_field: 'Maschine-zu-Maschine-Zugriffstoken',
    card_description:
      'Fügen Sie zusätzliche Daten während der Ausstellung des Maschine-zu-Maschine-Tokens hinzu.',
    for: 'für M2M',
  },
  id_token: {
    card_title: 'ID-Token',
    card_description:
      'Das ID-Token ist eine Identitätsaussage, die nach der Anmeldung empfangen wird und Benutzeridentitätsansprüche enthält, die der Client zur Anzeige oder Sitzungserstellung verwenden kann.',
    card_field: 'Benutzer-ID-Token',
    card_field_description:
      'Standard-OIDC-Ansprüche (z. B. sub, email, profile) sind immer verfügbar, während von Logto definierte Ansprüche zuerst hier aktiviert werden müssen. In beiden Fällen müssen Sie die entsprechenden Scopes bei der App-Integration anfordern, um sie zu erhalten.',
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
  interaction_data: {
    title: 'Benutzerinteraktionskontext',
    subtitle:
      'Verwenden Sie den Parameter `context.interaction`, um auf die Interaktionsdetails des Benutzers der aktuellen Authentifizierungssitzung zuzugreifen, einschließlich `interactionEvent`, `userId` und `verificationRecords`.',
  },
  token_data: {
    title: 'Token-Daten',
    subtitle: 'Verwenden Sie den `token` Eingabeparameter für die aktuelle Zugriffstoken-Payload.',
  },
  api_context: {
    title: 'API-Kontext: Zugriffskontrolle',
    subtitle: 'Verwenden Sie die Methode `api.denyAccess`, um die Token-Anfrage abzulehnen.',
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
