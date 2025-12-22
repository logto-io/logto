const account_center = {
  header: {
    title: 'Centrum konta',
  },
  home: {
    title: 'Nie znaleziono strony',
    description: 'Ta strona jest niedostępna.',
  },
  verification: {
    title: 'Weryfikacja bezpieczeństwa',
    description:
      'Potwierdź, że to Ty, aby chronić bezpieczeństwo konta. Wybierz metodę weryfikacji tożsamości.',
    error_send_failed: 'Nie udało się wysłać kodu weryfikacyjnego. Spróbuj ponownie później.',
    error_invalid_code: 'Kod weryfikacyjny jest nieprawidłowy lub wygasł.',
    error_verify_failed: 'Weryfikacja nie powiodła się. Wprowadź kod ponownie.',
    verification_required: 'Weryfikacja wygasła. Zweryfikuj swoją tożsamość ponownie.',
    try_another_method: 'Wypróbuj inny sposób weryfikacji',
  },
  password_verification: {
    title: 'Zweryfikuj hasło',
    description: 'Aby chronić konto, wprowadź hasło, aby potwierdzić swoją tożsamość.',
    error_failed: 'Weryfikacja nie powiodła się. Sprawdź swoje hasło.',
  },
  verification_method: {
    password: {
      name: 'Hasło',
      description: 'Zweryfikuj swoje hasło',
    },
    email: {
      name: 'Kod weryfikacyjny e-mail',
      description: 'Wyślij kod weryfikacyjny na swój e-mail',
    },
    phone: {
      name: 'Kod weryfikacyjny telefoniczny',
      description: 'Wyślij kod weryfikacyjny na swój numer telefonu',
    },
  },
  email: {
    title: 'Połącz e-mail',
    description: 'Połącz swój e-mail, aby się logować lub ułatwić odzyskiwanie konta.',
    verification_title: 'Wprowadź kod weryfikacyjny e-mail',
    verification_description: 'Kod weryfikacyjny został wysłany na Twój e-mail {{email_address}}.',
    success: 'Główny e-mail połączono pomyślnie.',
    verification_required: 'Weryfikacja wygasła. Zweryfikuj swoją tożsamość ponownie.',
  },
  phone: {
    title: 'Połącz numer telefonu',
    description: 'Połącz swój numer telefonu, aby się logować lub ułatwić odzyskiwanie konta.',
    verification_title: 'Wprowadź kod weryfikacyjny SMS',
    verification_description: 'Kod weryfikacyjny został wysłany na Twój telefon {{phone_number}}.',
    success: 'Główny telefon połączono pomyślnie.',
    verification_required: 'Weryfikacja wygasła. Zweryfikuj swoją tożsamość ponownie.',
  },
  username: {
    title: 'Ustaw nazwę użytkownika',
    description: 'Nazwa użytkownika może zawierać tylko litery, cyfry i podkreślenia.',
    success: 'Nazwa użytkownika została pomyślnie zaktualizowana.',
  },
  password: {
    title: 'Ustaw hasło',
    description: 'Utwórz nowe hasło, aby zabezpieczyć swoje konto.',
    success: 'Hasło zostało pomyślnie zaktualizowane.',
  },

  code_verification: {
    send: 'Wyślij kod weryfikacyjny',
    resend: 'Nie otrzymałeś? <a>Wyślij kod weryfikacyjny ponownie</a>',
    resend_countdown: 'Nie otrzymałeś?<span> Wyślij ponownie po {{seconds}} s.</span>',
  },

  email_verification: {
    title: 'Zweryfikuj swój e-mail',
    prepare_description:
      'Potwierdź swoją tożsamość, aby chronić bezpieczeństwo konta. Wyślij kod weryfikacyjny na swój e-mail.',
    email_label: 'Adres e-mail',
    send: 'Wyślij kod weryfikacyjny',
    description:
      'Kod weryfikacyjny został wysłany na adres {{email}}. Wprowadź kod, aby kontynuować.',
    resend: 'Nie otrzymałeś? <a>Wyślij kod weryfikacyjny ponownie</a>',
    resend_countdown: 'Nie otrzymałeś?<span> Wyślij ponownie po {{seconds}} s.</span>',
    error_send_failed: 'Nie udało się wysłać kodu weryfikacyjnego. Spróbuj ponownie później.',
    error_verify_failed: 'Weryfikacja nie powiodła się. Wprowadź kod ponownie.',
    error_invalid_code: 'Kod weryfikacyjny jest nieprawidłowy lub wygasł.',
  },
  phone_verification: {
    title: 'Zweryfikuj swój telefon',
    prepare_description:
      'Potwierdź, że to Ty, aby chronić bezpieczeństwo konta. Wyślij kod weryfikacyjny na swój telefon.',
    phone_label: 'Numer telefonu',
    send: 'Wyślij kod weryfikacyjny',
    description:
      'Kod weryfikacyjny został wysłany na Twój telefon {{phone}}. Wprowadź kod, aby kontynuować.',
    resend: 'Nie otrzymałeś? <a>Wyślij kod weryfikacyjny ponownie</a>',
    resend_countdown: 'Nie otrzymałeś?<span> Wyślij ponownie po {{seconds}} s.</span>',
    error_send_failed: 'Nie udało się wysłać kodu weryfikacyjnego. Spróbuj ponownie później.',
    error_verify_failed: 'Weryfikacja nie powiodła się. Wprowadź kod ponownie.',
    error_invalid_code: 'Kod weryfikacyjny jest nieprawidłowy lub wygasł.',
  },
  mfa: {
    totp_already_added: 'Już dodano aplikację uwierzytelniającą. Najpierw usuń istniejącą.',
    totp_not_enabled:
      'Aplikacja uwierzytelniająca nie jest włączona. Skontaktuj się z administratorem, aby ją włączyć.',
    backup_code_already_added:
      'Masz już aktywne kody zapasowe. Użyj ich lub usuń przed wygenerowaniem nowych.',
    backup_code_not_enabled:
      'Kod zapasowy nie jest włączony. Skontaktuj się z administratorem, aby go włączyć.',
    backup_code_requires_other_mfa:
      'Kody zapasowe wymagają wcześniejszego skonfigurowania innej metody MFA.',
    passkey_not_enabled:
      'Passkey nie jest włączony. Skontaktuj się z administratorem, aby go włączyć.',
  },
  update_success: {
    default: {
      title: 'Zaktualizowano!',
      description: 'Twoje informacje zostały zaktualizowane.',
    },
    email: {
      title: 'Email zaktualizowany!',
      description: 'Twój adres email został pomyślnie zaktualizowany.',
    },
    phone: {
      title: 'Numer telefonu zaktualizowany!',
      description: 'Twój numer telefonu został pomyślnie zaktualizowany.',
    },
    username: {
      title: 'Nazwa użytkownika zmieniona!',
      description: 'Twoja nazwa użytkownika została pomyślnie zaktualizowana.',
    },

    password: {
      title: 'Hasło zmienione!',
      description: 'Twoje hasło zostało pomyślnie zaktualizowane.',
    },
    totp: {
      title: 'Aplikacja uwierzytelniająca dodana!',
      description: 'Twoja aplikacja uwierzytelniająca została pomyślnie połączona z kontem.',
    },
    backup_code: {
      title: 'Kody zapasowe wygenerowane!',
      description: 'Twoje kody zapasowe zostały zapisane. Przechowuj je w bezpiecznym miejscu.',
    },
    backup_code_deleted: {
      title: 'Kody zapasowe usunięte!',
      description: 'Twoje kody zapasowe zostały usunięte z konta.',
    },
    passkey: {
      title: 'Passkey dodany!',
      description: 'Twój passkey został pomyślnie połączony z kontem.',
    },
    passkey_deleted: {
      title: 'Passkey usunięty!',
      description: 'Twój passkey został usunięty z konta.',
    },
    social: {
      title: 'Konto społecznościowe połączone!',
      description: 'Twoje konto społecznościowe zostało pomyślnie połączone.',
    },
  },
  backup_code: {
    title: 'Kody zapasowe',
    description:
      'Możesz użyć jednego z tych kodów zapasowych, aby uzyskać dostęp do swojego konta, jeśli masz problemy z weryfikacją dwuetapową w inny sposób. Każdy kod może być użyty tylko raz.',
    copy_hint: 'Skopiuj je i przechowuj w bezpiecznym miejscu.',
    generate_new_title: 'Wygeneruj nowe kody zapasowe',
    generate_new: 'Wygeneruj nowe kody zapasowe',
    delete_confirmation_title: 'Usuń kody zapasowe',
    delete_confirmation_description:
      'Jeśli usuniesz te kody zapasowe, nie będziesz mógł ich użyć do weryfikacji.',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Dodano: {{date}}',
    last_used: 'Ostatnie użycie: {{date}}',
    never_used: 'Nigdy',
    unnamed: 'Passkey bez nazwy',
    renamed: 'Passkey został pomyślnie zmieniony.',
    add_another_title: 'Dodaj kolejny passkey',
    add_another_description:
      'Zarejestruj swój passkey używając biometrii urządzenia, kluczy bezpieczeństwa (np. YubiKey) lub innych dostępnych metod.',
    add_passkey: 'Dodaj passkey',
    delete_confirmation_title: 'Usuń passkey',
    delete_confirmation_description:
      'Czy na pewno chcesz usunąć "{{name}}"? Nie będziesz mógł używać tego passkey do logowania.',
    rename_passkey: 'Zmień nazwę passkey',
    rename_description: 'Wprowadź nową nazwę dla tego passkey.',
  },
};

export default Object.freeze(account_center);
