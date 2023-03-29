const oidc = {
  aborted: 'Der Endnutzer hat die Interaktion abgebrochen.',
  invalid_scope: 'Scope {{scope}} wird nicht unterstützt.',
  invalid_scope_plural: 'Scopes {{scopes}} werden nicht unterstützt.',
  invalid_token: 'Ungültiger Token übermittelt.',
  invalid_client_metadata: 'Ungültige Client Metadaten übermittelt.',
  insufficient_scope: 'Access token fehlen angefragte scope {{scopes}}.',
  invalid_request: 'Anfrage ist ungültig.',
  invalid_grant: 'Grant request ist ungültig.',
  invalid_redirect_uri:
    '`redirect_uri` stimmt nicht mit den registrierten `redirect_uris` des Clients überein.',
  access_denied: 'Zugang verweigert.',
  invalid_target: 'Ungültiger resource indicator.',
  unsupported_grant_type: 'Nicht unterstützter `grant_type` angefragt.',
  unsupported_response_mode: 'Nicht unterstützter `response_mode` angefragt.',
  unsupported_response_type: 'Nicht unterstützter `response_type` angefragt.',
  provider_error: 'OIDC interner Fehler: {{message}}.',
};

export default oidc;
