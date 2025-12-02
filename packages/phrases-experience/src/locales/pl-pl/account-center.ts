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
    title: 'Połącz telefon',
    description: 'Połącz swój numer telefonu, aby się logować lub ułatwić odzyskiwanie konta.',
    verification_title: 'Wprowadź kod weryfikacyjny telefonu',
    verification_description: 'Kod weryfikacyjny został wysłany na Twój telefon {{phone_number}}.',
    success: 'Główny telefon połączono pomyślnie.',
    verification_required: 'Weryfikacja wygasła. Zweryfikuj swoją tożsamość ponownie.',
  },

  code_verification: {
    send: 'Wyślij kod weryfikacyjny',
    resend: 'Wyślij kod ponownie',
    resend_countdown: 'Nie otrzymałeś? Wyślij ponownie po {{seconds}} s.',
  },

  email_verification: {
    title: 'Zweryfikuj swój e-mail',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Adres e-mail',
    send: 'Wyślij kod weryfikacyjny',
    description:
      'Kod weryfikacyjny został wysłany na adres {{email}}. Wprowadź kod, aby kontynuować.',
    resend: 'Wyślij kod ponownie',
    resend_countdown: 'Nie otrzymałeś? Wyślij ponownie po {{seconds}} s.',
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
    resend: 'Wyślij kod ponownie',
    resend_countdown: 'Nie otrzymałeś? Wyślij ponownie po {{seconds}} s.',
    error_send_failed: 'Nie udało się wysłać kodu weryfikacyjnego. Spróbuj ponownie później.',
    error_verify_failed: 'Weryfikacja nie powiodła się. Wprowadź kod ponownie.',
    error_invalid_code: 'Kod weryfikacyjny jest nieprawidłowy lub wygasł.',
  },
  update_success: {
    default: {
      title: 'Aktualizacja zakończona sukcesem',
      description: 'Twoje zmiany zostały pomyślnie zapisane.',
    },
    email: {
      title: 'Zaktualizowano adres e-mail!',
      description: 'Adres e-mail Twojego konta został pomyślnie zmieniony.',
    },
    phone: {
      title: 'Zaktualizowano numer telefonu!',
      description: 'Numer telefonu Twojego konta został pomyślnie zmieniony.',
    },
  },
};

export default Object.freeze(account_center);
