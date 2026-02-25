const oidc = {
  aborted: 'Koniec interakcji z użytkownikiem.',
  invalid_scope: 'Nieprawidłowy zakres: {{error_description}}.',
  invalid_token: 'Podano nieprawidłowy token.',
  invalid_client_metadata: 'Podano nieprawidłowe metadane klienta.',
  insufficient_scope: 'Token nie zawiera zakresu `{{scope}}`.',
  invalid_request: 'Żądanie jest nieprawidłowe.',
  invalid_grant: 'Żądanie przyznania jest nieprawidłowe.',
  invalid_issuer: 'Nieprawidłowy wydawca.',
  invalid_redirect_uri:
    'Adres URL `redirect_uri` nie pasuje do zarejestrowanych przez klienta `redirect_uris`.',
  access_denied: 'Odmowa dostępu.',
  invalid_target: 'Nieprawidłowy wskaźnik zasobów.',
  unsupported_grant_type: 'Żądany typ `grant_type` nie jest obsługiwany.',
  unsupported_response_mode: 'Żądany tryb `response_mode` nie jest obsługiwany.',
  unsupported_response_type: 'Żądany typ `response_type` nie jest obsługiwany.',
  provider_error: 'Wewnętrzny błąd OIDC: {{message}}.',
  server_error: 'Wystąpił nieznany błąd OIDC. Spróbuj ponownie później.',
  provider_error_fallback: 'Wystąpił błąd OIDC: {{code}}.',
  key_required: 'Wymagany jest co najmniej jeden klucz.',
  key_not_found: 'Nie znaleziono klucza o ID {{id}}.',
  invalid_session_payload: 'Nieprawidłowy ładunek sesji.',
  session_not_found: 'Nie znaleziono sesji.',
  invalid_session_account_id: 'Niezgodność ID konta sesji.',
};

export default Object.freeze(oidc);
