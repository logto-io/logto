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
  /** UNTRANSLATED */
  verification_blocked_too_many_attempts:
    'Too many attempts in a short time. Please try again {{relativeTime}}.',
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
  /** UNTRANSLATED */
  not_supported_for_forgot_password: 'This operation is not supported for forgot password.',
  mfa: {
    /** UNTRANSLATED */
    require_mfa_verification: 'Mfa verification is required to sign in.',
    /** UNTRANSLATED */
    mfa_sign_in_only: 'Mfa is only available for sign-in interaction.',
    /** UNTRANSLATED */
    pending_info_not_found: 'Pending MFA info not found, please initiate MFA first.',
    /** UNTRANSLATED */
    invalid_totp_code: 'Invalid TOTP code.',
    /** UNTRANSLATED */
    webauthn_verification_failed: 'WebAuthn verification failed.',
  },
};

export default Object.freeze(session);
