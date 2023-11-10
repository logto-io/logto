const oidc = {
  aborted: 'Der Endnutzer hat die Interaktion abgebrochen.',
  /** UNTRANSLATED */
  invalid_scope: 'Invalid scope: {{error_description}}.',
  invalid_token: 'Ungültiger Token übermittelt.',
  invalid_client_metadata: 'Ungültige Client Metadaten übermittelt.',
  /** UNTRANSLATED */
  insufficient_scope: 'Token missing scope `{{scope}}`.',
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
  /** UNTRANSLATED */
  server_error: 'An unknown OIDC error occurred. Please try again later.',
  /** UNTRANSLATED */
  provider_error_fallback: 'An OIDC error occurred: {{code}}.',
  /** UNTRANSLATED */
  key_required: 'At least one key is required.',
  /** UNTRANSLATED */
  key_not_found: 'Key with ID {{id}} is not found.',
};

export default Object.freeze(oidc);
