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
  csrf_token_mismatch: 'Nieprawidłowy token CSRF.',
  identifier_not_found:
    'Nie znaleziono identyfikatora użytkownika. Proszę wróć i zaloguj się ponownie.',
  interaction_not_found:
    'Nie znaleziono sesji interakcji. Proszę wróć i rozpocznij sesję ponownie.',
  invalid_interaction_type:
    'Ta operacja nie jest obsługiwana dla bieżącej interakcji. Proszę zainicjuj nową sesję.',
  not_supported_for_forgot_password: 'Ta operacja nie jest obsługiwana dla zapomnienia hasła.',
  identity_conflict:
    'Wykryto konflikt tożsamości. Proszę zainicjuj nową sesję, aby kontynuować przy użyciu innej tożsamości.',
  identifier_not_verified:
    'Podany identyfikator {{identifier}} nie został zweryfikowany. Proszę utwórz zapis weryfikacyjny dla tego identyfikatora i ukończ proces weryfikacji.',
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
    mfa_factor_not_enabled: 'Czynnik MFA nie jest włączony.',
    suggest_additional_mfa:
      'Dla lepszej ochrony rozważ dodanie kolejnej metody MFA. Możesz pominąć ten krok i kontynuować.',
  },
  sso_enabled: 'Single sign on jest włączony dla tego adresu e-mail. Zaloguj się za pomocą SSO.',
  captcha_required: 'Wymagana jest captcha.',
  captcha_failed: 'Weryfikacja captchy nie powiodła się.',
  email_blocklist: {
    disposable_email_validation_failed: 'Weryfikacja adresu email nie powiodła się.',
    invalid_email: 'Nieprawidłowy adres email.',
    email_subaddressing_not_allowed: 'Dodawanie subadresów do emaila nie jest dozwolone.',
    email_not_allowed: 'Adres email "{{email}}" jest zastrzeżony. Proszę wybrać inny.',
  },
  google_one_tap: {
    cookie_mismatch: 'Nieprawidłowe dopasowanie ciasteczek Google One Tap.',
    invalid_id_token: 'Nieprawidłowy token ID Google.',
    unverified_email: 'Niezweryfikowany email.',
  },
};

export default Object.freeze(session);
