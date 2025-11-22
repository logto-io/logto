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
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
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
  email_verification: {
    title: 'Zweryfikuj swój e-mail',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
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
    send: 'Send verification code',
    description:
      'Kod weryfikacyjny został wysłany na Twój telefon {{phone}}. Wprowadź kod, aby kontynuować.',
    resend: 'Wyślij kod ponownie',
    resend_countdown: 'Nie otrzymałeś? Wyślij ponownie po {{seconds}} s.',
    error_send_failed: 'Nie udało się wysłać kodu weryfikacyjnego. Spróbuj ponownie później.',
    error_verify_failed: 'Weryfikacja nie powiodła się. Wprowadź kod ponownie.',
    error_invalid_code: 'Kod weryfikacyjny jest nieprawidłowy lub wygasł.',
  },
};

export default Object.freeze(account_center);
