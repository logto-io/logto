const session = {
  not_found: 'Sitzung nicht gefunden. Bitte melde dich erneut an.',
  invalid_credentials: 'Ungültige Zugangsdaten. Überprüfe deine Eingaben.',
  invalid_sign_in_method: 'Aktuelle Anmeldemethode ist ungültig.',
  invalid_connector_id: 'Connector mit ID {{connectorId}} wurde nicht gefunden.',
  insufficient_info: 'Unzureichende Informationen für die Anmeldung.',
  connector_id_mismatch: 'Connector ID stimmt nicht mit Sitzung überein.',
  connector_session_not_found: 'Connector Sitzung nicht gefunden. Bitte melde dich erneut an.',
  verification_session_not_found:
    'Die Verifizierung war nicht erfolgreich. Starte die Verifizierung neu und versuche es erneut.',
  verification_expired:
    'Die Verbindung wurde unterbrochen. Verifiziere erneut, um die Sicherheit deines Kontos zu gewährleisten.',
  unauthorized: 'Bitte melde dich erst an.',
  unsupported_prompt_name: 'Nicht unterstützter prompt Name.',
  forgot_password_not_enabled: 'Forgot password is not enabled.',
  verification_failed:
    'Die Verifizierung war nicht erfolgreich. Starte die Verifizierung neu und versuche es erneut.',
  connector_validation_session_not_found:
    'Die Connector-Sitzung zur Token-Validierung wurde nicht gefunden.',
  identifier_not_found:
    'Benutzerkennung nicht gefunden. Bitte gehen Sie zurück und melden Sie sich erneut an.',
  interaction_not_found:
    'Interaktionssitzung nicht gefunden. Bitte gehen Sie zurück und starten Sie die Sitzung erneut.',
};
export default session;
