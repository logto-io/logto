const oidc = {
  aborted: "L'utente finale ha annullato l'interazione.",
  invalid_scope: 'Ambito non valido: {{error_description}}.',
  invalid_token: 'Token non valido fornito.',
  invalid_client_metadata: 'Metadata client non valide fornite.',
  insufficient_scope: "Token mancante dell'ambito `{{scope}}`.",
  invalid_request: 'La richiesta non è valida.',
  invalid_grant: 'La richiesta di concessione non è valida.',
  invalid_issuer: 'Emittente non valido.',
  invalid_redirect_uri:
    '`redirect_uri` non corrisponde a nessuno dei `redirect_uris` registrati dal client.',
  access_denied: 'Accesso negato.',
  invalid_target: 'Indicatore di risorsa non valido.',
  unsupported_grant_type: 'Tipo di `grant_type` richiesto non supportato.',
  unsupported_response_mode: 'Modalità di risposta `response_mode` richiesta non supportata.',
  unsupported_response_type: 'Tipo di risposta `response_type` richiesto non supportato.',
  provider_error: 'Errore interno OIDC: {{message}}.',
  server_error: 'Si è verificato un errore OIDC sconosciuto. Si prega di riprovare più tardi.',
  provider_error_fallback: 'Si è verificato un errore OIDC: {{code}}.',
  key_required: 'È richiesta almeno una chiave.',
  key_not_found: 'Chiave con ID {{id}} non trovata.',
  /** UNTRANSLATED */
  invalid_session_payload: 'Invalid session payload.',
};

export default Object.freeze(oidc);
