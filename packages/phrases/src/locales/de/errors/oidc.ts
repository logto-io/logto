const oidc = {
  aborted: 'Der Endnutzer hat die Interaktion abgebrochen.',
  invalid_scope: 'Ungültiger Anwendungsbereich: {{error_description}}.',
  invalid_token: 'Ungültiger Token übermittelt.',
  invalid_client_metadata: 'Ungültige Client Metadaten übermittelt.',
  insufficient_scope: 'Token fehlt den Anwendungsbereich `{{scope}}`.',
  invalid_request: 'Anfrage ist ungültig.',
  invalid_grant: 'Grant Anfrage ist ungültig.',
  invalid_issuer: 'Ungültiger Aussteller.',
  invalid_redirect_uri:
    '`redirect_uri` stimmt nicht mit den registrierten `redirect_uris` des Clients überein.',
  access_denied: 'Zugang verweigert.',
  invalid_target: 'Ungültiger Ressourcenindikator.',
  unsupported_grant_type: 'Nicht unterstützter `grant_type` angefragt.',
  unsupported_response_mode: 'Nicht unterstützter `response_mode` angefragt.',
  unsupported_response_type: 'Nicht unterstützter `response_type` angefragt.',
  provider_error: 'OIDC interner Fehler: {{message}}.',
  server_error:
    'Ein unbekannter OIDC Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
  provider_error_fallback: 'Ein OIDC Fehler ist aufgetreten: {{code}}.',
  key_required: 'Mindestens ein Schlüssel ist erforderlich.',
  key_not_found: 'Der Schlüssel mit der ID {{id}} wurde nicht gefunden.',
  invalid_session_payload: 'Ungültige Sitzungsnutzlast.',
  session_not_found: 'Sitzung nicht gefunden.',
  invalid_session_account_id: 'Sitzung accountId stimmt nicht überein.',
};

export default Object.freeze(oidc);
