const mfa = {
  totp: 'OTP aplikacji autentykacyjnej',
  webauthn: 'Klucz główny',
  backup_code: 'Kod zapasowy',
  email_verification_code: 'Kod weryfikacyjny e-mail',
  phone_verification_code: 'Kod weryfikacyjny SMS',
  link_totp_description: 'Np. Google Authenticator itp.',
  link_webauthn_description: 'Połącz urządzenie lub sprzęt USB',
  link_backup_code_description: 'Generuj kod zapasowy',
  link_email_verification_code_description: 'Połącz swój adres e-mail',
  link_email_2fa_description: 'Połącz swój adres e-mail dla 2-stopniowej weryfikacji',
  link_phone_verification_code_description: 'Połącz swój numer telefonu',
  link_phone_2fa_description: 'Połącz swój numer telefonu dla 2-stopniowej weryfikacji',
  verify_totp_description: 'Wprowadź jednorazowy kod w aplikacji',
  verify_webauthn_description: 'Zweryfikuj urządzenie lub sprzęt USB',
  verify_backup_code_description: 'Wklej kod zapasowy, który zapisałeś',
  verify_email_verification_code_description: 'Wprowadź kod wysłany na twój e-mail',
  verify_phone_verification_code_description: 'Wprowadź kod wysłany na twój telefon',
  add_mfa_factors: 'Dodaj weryfikację dwuetapową',
  add_mfa_description:
    'Weryfikacja dwuetapowa jest włączona. Wybierz swój drugi sposób weryfikacji dla bezpiecznego logowania.',
  verify_mfa_factors: 'Weryfikacja dwuetapowa',
  verify_mfa_description:
    'Włączono weryfikację dwuetapową dla tego konta. Proszę wybrać drugi sposób weryfikacji swojej tożsamości.',
  add_authenticator_app: 'Dodaj aplikację autentykacyjną',
  step: 'Krok {{step, number}}: {{content}}',
  scan_qr_code: 'Zeskanuj ten kod QR',
  scan_qr_code_description:
    'Zeskanuj poniższy kod QR za pomocą aplikacji autentykacyjnej, takiej jak Google Authenticator, Duo Mobile, Authy, itp.',
  qr_code_not_available: 'Nie można zeskanować kodu QR?',
  copy_and_paste_key: 'Skopiuj i wklej klucz',
  copy_and_paste_key_description:
    'Skopiuj i wklej poniższy klucz do aplikacji autentykacyjnej, takiej jak Google Authenticator, Duo Mobile, Authy, itp.',
  want_to_scan_qr_code: 'Chcesz zeskanować kod QR?',
  enter_one_time_code: 'Wprowadź jednorazowy kod',
  enter_one_time_code_link_description:
    'Wprowadź 6-cyfrowy kod weryfikacyjny wygenerowany przez aplikację autentykacyjną.',
  enter_one_time_code_description:
    'Dla tego konta włączono weryfikację dwuetapową. Proszę wprowadzić jednorazowy kod widoczny w aplikacji autentykacyjnej powiązanej z kontem.',
  link_another_mfa_factor: 'Przełącz na inny sposób',
  save_backup_code: 'Zapisz swój kod zapasowy',
  save_backup_code_description:
    'Możesz użyć jednego z tych kodów zapasowych, aby uzyskać dostęp do swojego konta w przypadku problemów z weryfikacją dwuetapową w inny sposób. Każdy kod można użyć tylko raz.',
  backup_code_hint: 'Upewnij się, że je skopiujesz i zapiszesz w bezpiecznym miejscu.',
  enter_a_backup_code: 'Wprowadź kod zapasowy',
  enter_backup_code_description:
    'Wprowadź kod zapasowy, który zapisałeś, gdy włączono weryfikację dwuetapową.',
  create_a_passkey: 'Utwórz klucz dostępu',
  create_passkey_description:
    'Zarejestruj swój klucz dostępu za pomocą biometrii urządzenia, kluczy bezpieczeństwa (np. YubiKey) lub innych dostępnych metod.',
  try_another_verification_method: 'Wypróbuj inny sposób weryfikacji',
  verify_via_passkey: 'Zweryfikuj za pomocą klucza dostępu',
  verify_via_passkey_description:
    'Użyj klucza dostępu do weryfikacji za pomocą hasła urządzenia lub biometrii, skanowania kodu QR lub użycia klucza bezpieczeństwa USB, takiego jak YubiKey.',
  secret_key_copied: 'Skopiowano klucz prywatny.',
  backup_code_copied: 'Skopiowano kod zapasowy.',
  webauthn_not_ready: 'WebAuthn nie jest jeszcze gotowy. Spróbuj ponownie później.',
  webauthn_not_supported: 'WebAuthn nie jest obsługiwane w tej przeglądarce.',
  webauthn_failed_to_create: 'Nie udało się utworzyć. Spróbuj ponownie.',
  webauthn_failed_to_verify: 'Nie udało się zweryfikować. Spróbuj ponownie.',
};

export default Object.freeze(mfa);
