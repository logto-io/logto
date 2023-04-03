const oidc = {
  aborted: 'Koniec interakcji z użytkownikiem.',
  invalid_scope: 'Zakres {{scope}} nie jest obsługiwany.',
  invalid_scope_plural: 'Zakresy {{scopes}} nie są obsługiwane.',
  invalid_token: 'Podano nieprawidłowy token.',
  invalid_client_metadata: 'Podano nieprawidłowe metadane klienta.',
  insufficient_scope: 'Brakujący zakres żądanego tokena dostępu {{scopes}}.',
  invalid_request: 'Żądanie jest nieprawidłowe.',
  invalid_grant: 'Żądanie przyznania jest nieprawidłowe.',
  invalid_redirect_uri:
    'Adres URL `redirect_uri` nie pasuje do zarejestrowanych przez klienta `redirect_uris`.',
  access_denied: 'Odmowa dostępu.',
  invalid_target: 'Nieprawidłowy wskaźnik zasobów.',
  unsupported_grant_type: 'Żądany typ `grant_type` nie jest obsługiwany.',
  unsupported_response_mode: 'Żądany tryb `response_mode` nie jest obsługiwany.',
  unsupported_response_type: 'Żądany typ `response_type` nie jest obsługiwany.',
  provider_error: 'Wewnętrzny błąd OIDC: {{message}}.',
};

export default oidc;
