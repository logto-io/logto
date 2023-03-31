const session = {
  not_found: 'Nie znaleziono sesji. Proszę wrócić i zalogować się ponownie.',
  invalid_credentials: 'Niepoprawne konto lub hasło. Sprawdź swoje dane wejściowe.',
  invalid_sign_in_method: 'Aktualna metoda logowania jest niedostępna.',
  invalid_connector_id: 'Nie można znaleźć dostępnego łącznika o id {{connectorId}}.',
  insufficient_info: 'Niewystarczające informacje do zalogowania.',
  connector_id_mismatch: 'Id łącznika nie pasuje do rekordu sesji.',
  connector_session_not_found: 'Nie znaleziono sesji łącznika. Proszę wróć i zaloguj ponownie.',
  verification_session_not_found:
    'Weryfikacja nie powiodła się. Uruchom proces weryfikacji ponownie i spróbuj ponownie.',
  verification_expired:
    'Połączenie wygasło. Zweryfikuj ponownie, aby zapewnić bezpieczeństwo Twojego konta.',
  unauthorized: 'Proszę się najpierw zalogować.',
  unsupported_prompt_name: 'Nieobsługiwana nazwa podpowiedzi.',
  forgot_password_not_enabled: 'Odzyskiwanie hasła nie jest włączone.',
  verification_failed:
    'Weryfikacja nie powiodła się. Uruchom proces weryfikacji ponownie i spróbuj ponownie.',
  connector_validation_session_not_found: 'Nie znaleziono sesji łącznika dla weryfikacji tokena.',
  identifier_not_found:
    'Nie znaleziono identyfikatora użytkownika. Proszę wróć i zaloguj się ponownie.',
  interaction_not_found:
    'Nie znaleziono sesji interakcji. Proszę wróć i rozpocznij sesję ponownie.',
};

export default session;
