const mfa = {
  title: 'Wielopoziomowe uwierzytelnianie',
  description:
    'Dodaj wielopoziomowe uwierzytelnianie, aby zwiększyć bezpieczeństwo swojego doświadczenia z logowaniem.',
  factors: 'Czynniki',
  multi_factors: 'Wieloczynniki',
  multi_factors_description:
    'Użytkownicy muszą zweryfikować jeden z włączonych czynników podczas dwustopniowej weryfikacji.',
  totp: 'Aplikacja autentykacyjna OTP',
  otp_description: 'Połącz Google Authenticator itp., aby zweryfikować jednorazowe hasła.',
  webauthn: 'WebAuthn (Klucz przechodni)',
  webauthn_description:
    'Zweryfikuj za pomocą metody obsługiwanej przez przeglądarkę: biometria, skanowanie telefonem lub klucz zabezpieczeń, itp.',
  webauthn_native_tip: 'WebAuthn nie jest obsługiwane dla aplikacji natywnych.',
  webauthn_domain_tip:
    'WebAuthn łączy klucze publiczne z konkretną domeną. Modyfikacja domeny usługi zablokuje użytkowników przed uwierzytelnianiem za pomocą istniejących kluczy przechodnich.',
  backup_code: 'Kod zapasowy',
  backup_code_description:
    'Generuj 10 jednorazowych kodów zapasowych po skonfigurowaniu dowolnej metody MFA przez użytkowników.',
  backup_code_setup_hint:
    'Gdy użytkownicy nie mogą zweryfikować powyższych czynników MFA, skorzystaj z opcji kopii zapasowej.',
  backup_code_error_hint:
    'Aby użyć kodu zapasowego, potrzebujesz co najmniej jednej kolejnej metody MFA do pomyślnego uwierzytelniania użytkownika.',
  policy: 'Polityka',
  policy_description: 'Ustaw politykę MFA dla procesów logowania i rejestracji.',
  two_step_sign_in_policy: 'Polityka weryfikacji dwuetapowej podczas logowania',
  user_controlled: 'Użytkownicy mogą samodzielnie włączać lub wyłączać MFA',
  user_controlled_tip:
    'Użytkownicy mogą pominąć konfigurację MFA podczas pierwszego logowania lub rejestracji lub włączyć/wyłączyć ją w ustawieniach konta.',
  mandatory: 'Użytkownicy zawsze muszą korzystać z MFA podczas logowania',
  mandatory_tip:
    'Użytkownicy muszą skonfigurować MFA podczas pierwszego logowania lub rejestracji i używać go przy każdym kolejnym logowaniu.',
};

export default Object.freeze(mfa);
