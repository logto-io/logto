const oidc = {
  aborted: "L'utente finale ha annullato l'interazione.",
  /** UNTRANSLATED */
  invalid_scope: 'Invalid scope: {{error_description}}.',
  invalid_token: 'Token non valido fornito.',
  invalid_client_metadata: 'Metadata client non valide fornite.',
  /** UNTRANSLATED */
  insufficient_scope: 'Token missing scope `{{scope}}`.',
  invalid_request: 'La richiesta non è valida.',
  invalid_grant: 'La richiesta di grant non è valida.',
  invalid_redirect_uri:
    '`redirect_uri` non corrisponde a nessuno degli `redirect_uris` registrati dal client.',
  access_denied: 'Accesso negato.',
  invalid_target: 'Indicatore di risorsa non valido.',
  unsupported_grant_type: 'Tipo di `grant_type` richiesto non supportato.',
  unsupported_response_mode: 'Modalità di risposta `response_mode` richiesta non supportata.',
  unsupported_response_type: 'Tipo di risposta `response_type` richiesto non supportato.',
  provider_error: 'Errore interno OIDC: {{message}}.',
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
