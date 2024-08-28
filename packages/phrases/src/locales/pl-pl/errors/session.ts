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
  verification_blocked_too_many_attempts:
    'Zbyt wiele prób w krótkim czasie. Proszę spróbuj ponownie {{relativeTime}}.',
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
  not_supported_for_forgot_password: 'Ta operacja nie jest obsługiwana dla zapomnienia hasła.',
  mfa: {
    require_mfa_verification: 'Wymagana jest weryfikacja MFA, aby się zalogować.',
    mfa_sign_in_only: 'MFA jest dostępne tylko dla interakcji logowania.',
    pending_info_not_found:
      'Nie znaleziono oczekujących informacji MFA, proszę najpierw zainicjować MFA.',
    invalid_totp_code: 'Nieprawidłowy kod TOTP.',
    webauthn_verification_failed: 'Weryfikacja WebAuthn nie powiodła się.',
    webauthn_verification_not_found: 'Nie znaleziono weryfikacji WebAuthn.',
    bind_mfa_existed: 'MFA już istnieje.',
    backup_code_can_not_be_alone: 'Kod zapasowy nie może być jedyną MFA.',
    backup_code_required: 'Kod zapasowy jest wymagany.',
    invalid_backup_code: 'Nieprawidłowy kod zapasowy.',
    mfa_policy_not_user_controlled: 'Polityka MFA nie jest kontrolowana przez użytkownika.',
  },
  sso_enabled: 'Single sign on jest włączony dla tego adresu e-mail. Zaloguj się za pomocą SSO.',
};

export default Object.freeze(session);
