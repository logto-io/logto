const mfa = {
  totp: 'OTP aplikacji autentykacyjnej',
  webauthn: 'Klucz dostępu',
  backup_code: 'Kod zapasowy',
  link_totp_description: 'Połącz Google Authenticator itp',
  link_webauthn_description: 'Połącz swoje urządzenie lub sprzęt USB',
  link_backup_code_description: 'Wygeneruj kod zapasowy',
  verify_totp_description: 'Wprowadź jednorazowy kod w aplikacji',
  verify_webauthn_description: 'Zweryfikuj swoje urządzenie lub sprzęt USB',
  verify_backup_code_description: 'Wklej kod zapasowy, który zachowałeś',
  add_mfa_factors: 'Dodaj autoryzację dwuetapową',
  add_mfa_description:
    'Autoryzacja dwuetapowa jest włączona. Wybierz swój drugi sposób weryfikacji, aby bezpiecznie zalogować się na swoje konto.',
  verify_mfa_factors: 'Autoryzacja dwuetapowa',
  verify_mfa_description:
    'Dla tego konta włączono autoryzację dwuetapową. Wybierz drugi sposób weryfikacji swojej tożsamości.',
  add_authenticator_app: 'Dodaj aplikację autentykacyjną',
  step: 'Krok {{step, number}}: {{content}}',
  scan_qr_code: 'Zeskanuj ten kod QR',
  scan_qr_code_description:
    'Zeskanuj ten kod QR za pomocą swojej aplikacji autentykacyjnej, takiej jak Google Authenticator, Duo Mobile, Authy itp.',
  qr_code_not_available: 'Nie możesz zeskanować kodu QR?',
  copy_and_paste_key: 'Skopiuj i wklej klucz',
  copy_and_paste_key_description:
    'Wklej poniższy klucz do swojej aplikacji autentykacyjnej, takiej jak Google Authenticator, Duo Mobile, Authy itp.',
  want_to_scan_qr_code: 'Chcesz zeskanować kod QR?',
  enter_one_time_code: 'Wprowadź jednorazowy kod',
  enter_one_time_code_link_description:
    'Wprowadź 6-cyfrowy kod weryfikacyjny wygenerowany przez aplikację autentykacyjną.',
  enter_one_time_code_description:
    'Dla tego konta włączono autoryzację dwuetapową. Wprowadź jednorazowy kod widoczny w połączonej aplikacji autentykacyjnej.',
  link_another_mfa_factor: 'Połącz inne urządzenie autentykacyjne dwuetapowe',
  save_backup_code: 'Zachowaj swój kod zapasowy',
  save_backup_code_description:
    'Możesz użyć jednego z tych kodów zapasowych, aby uzyskać dostęp do swojego konta, jeśli wystąpią problemy podczas autoryzacji dwuetapowej innymi sposobami. Każdy kod można użyć tylko raz.',
  backup_code_hint: 'Upewnij się, że je skopiujesz i zachowasz w bezpiecznym miejscu.',
  enter_backup_code_description:
    'Wprowadź kod zapasowy, który zachowałeś, gdy początkowo włączono autoryzację dwuetapową.',
  create_a_passkey: 'Utwórz klucz dostępu',
  create_passkey_description:
    'Zarejestruj klucz dostępu do weryfikacji za pomocą hasła urządzenia lub biometrii, skanowania kodu QR lub użycia klucza bezpieczeństwa USB, takiego jak YubiKey.',
  name_your_passkey: 'Nadaj swojemu kluczowi dostępu nazwę',
  name_passkey_description:
    'Pomyślnie zweryfikowałeś to urządzenie do autoryzacji dwuetapowej. Dostosuj nazwę, aby rozpoznać go, jeśli masz wiele kluczy.',
  try_another_verification_method: 'Wypróbuj inny sposób weryfikacji',
  verify_via_passkey: 'Weryfikacja za pomocą klucza dostępu',
  verify_via_passkey_description:
    'Użyj klucza dostępu do weryfikacji za pomocą hasła urządzenia lub biometrii, skanowania kodu QR lub użycia klucza bezpieczeństwa USB, takiego jak YubiKey.',
  secret_key_copied: 'Skopiowano klucz prywatny.',
  backup_code_copied: 'Skopiowano kod zapasowy.',
};

export default Object.freeze(mfa);
