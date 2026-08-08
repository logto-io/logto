const jwt_claims = {
  title: 'Benutzerdefiniertes JWT',
  description:
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
      "Die Ansprüche 'sub', 'email', 'phone', 'profile' und 'address' sind immer verfügbar. Andere Ansprüche müssen hier zuerst aktiviert werden. In allen Fällen muss Ihre App die entsprechenden Scopes bei der Integration anfordern, um sie zu erhalten.",
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
  error_handling_tab: 'Fehlerbehandlung',
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
      'Verwenden Sie den Parameter `context.interaction`, um auf die Interaktionsdetails des Benutzers der aktuellen Authentifizierungssitzung zuzugreifen.',
  },
  application_data: {
    title: 'Anwendungskontext',
    subtitle:
      'Verwenden Sie den Eingabeparameter `context.application`, um Anwendungsinformationen bereitzustellen, die dem Token zugeordnet sind.',
  },
  organization_data: {
    title: 'Organisationskontext',
    subtitle:
      'Verwenden Sie den Eingabeparameter `context.organization`, um Informationen zur Zielorganisation bereitzustellen, die nur für Organisationstoken verfügbar sind.',
  },
  token_data: {
    title: 'Token-Daten',
    subtitle: 'Verwenden Sie den `token` Eingabeparameter für die aktuelle Zugriffstoken-Payload.',
  },
  api_context: {
    title: 'API-Kontext: Zugriffskontrolle',
    subtitle: 'Verwenden Sie die Methode `api.denyAccess`, um die Token-Anfrage abzulehnen.',
  },
  cryptographic_capability: {
    title: 'API-Kontext: Kryptografie',
    subtitle: 'Verwende `api.crypto.sha256` und `api.crypto.hmacSha256` für UTF-8-Hashing.',
    description:
      'Beide Methoden sind asynchron und geben ein Promise mit einem 64-stelligen Hex-String in Kleinbuchstaben zurück. Eingaben werden ohne Unicode-Normalisierung als UTF-8 kodiert: `sha256(input)` berechnet SHA-256(UTF-8(input)); `hmacSha256({ key, input })` berechnet HMAC-SHA-256(UTF-8(key), UTF-8(input)). Lies HMAC-Schlüssel aus Umgebungsvariablen, rufe selbst `.trim()` auf und lehne ein leeres Ergebnis ab, bevor du HMAC aufrufst — die Methode trimmt nicht und fällt nicht auf SHA-256 zurück. Bevorzuge einen hochentropischen Schlüssel ohne Leerzeichen. Leere Nachrichteneingabe ist gültig; ein leerer Schlüssel nicht. Eingaben sind auf 1 MiB UTF-8-Bytes und HMAC-Schlüssel auf 64 KiB begrenzt. SHA-256 versteckt keine aufzählbaren Kennungen wie E-Mail-Adressen oder Telefonnummern; nutze HMAC für eine geheimnisgeschlüsselte stabile Kennung. Keine Methode ist für Passwortspeicherung geeignet. Umgebungsvariablen sind für autorisierte Custom-JWT-Administratoren und den Ausführungsrunner sichtbar und kein verwaltetes Schlüsselsystem. Das Rotieren eines HMAC-Schlüssels ändert jeden abgeleiteten Wert — Skripte mit Migration sollten eine anwendungsdefinierte Schlüsselversion und eine Doppelwertphase implementieren. Mehrere Werte brauchen eine eindeutige aufruferdefinierte Serialisierung (z. B. `JSON.stringify([value1, value2])` zur Laufzeit); sprachübergreifende Integrationen müssen ihre eigene kanonische Form vereinbaren. Auf selbst gehostetem Logto läuft dieses Skript weiterhin im Trusted-Script-Modell der Sandbox-Warnung.',
  },
  error_handling: {
    title: 'Fehlerbehandlung',
    subtitle:
      'Steuert, ob die Token-Ausstellung blockiert werden soll, wenn das Skript fehlschlägt.',
    input_field_title: 'Verhalten bei der Token-Ausstellung bei Skriptfehlern',
    block_issuance_switch: 'Token-Ausstellung blockieren, wenn das Skript Fehler wirft',
    default_hint_create:
      'Neue Skripte für benutzerdefinierte Claims blockieren standardmäßig die Token-Ausgabe, wenn das Skript fehlschlägt. Wenn die API bereits einen Wert liefert, wird stattdessen der gespeicherte Wert verwendet.',
    default_hint_edit:
      'Bestehende Skripte für benutzerdefinierte Claims ohne diese Einstellung behalten den bisherigen Standardwert "aus", bis Sie ausdrücklich einen Wert speichern.',
    warning:
      'Wenn aktiviert, lehnen Laufzeitfehler im Skript die Token-Anfrage mit `invalid_request` (400) und einer lokalisierten `error_description` ab. Aufrufe von `api.denyAccess` geben weiterhin `access_denied` zurück.',
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
  sandbox_warning: {
    title: 'Skripte laufen mit Serverrechten',
    description:
      'Bei selbst gehostetem Logto läuft dieses Skript in derselben Umgebung wie Logto selbst: Es kann Server-Umgebungsvariablen lesen und Dienste in deinem internen Netzwerk erreichen. Es ist nicht sandboxed. Gib nur Personen Zugriff auf diese Seite, denen du auch Zugriff auf den Server anvertrauen würdest.',
  },
  form_error: {
    invalid_json: 'Ungültiges JSON-Format',
  },
};

export default Object.freeze(jwt_claims);
