const oidc = {
  aborted: "L'utente finale ha annullato l'interazione.",
  invalid_scope: 'La scope {{scope}} non è supportata.',
  invalid_scope_plural: 'Le scope {{scopes}} non sono supportate.',
  invalid_token: 'Token non valido fornito.',
  invalid_client_metadata: 'Metadata client non valide fornite.',
  insufficient_scope: 'Token di accesso senza la scope richiesta {{scopes}}.',
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
};

export default oidc;
