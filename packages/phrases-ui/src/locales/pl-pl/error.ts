const error = {
  general_required: `{{types, list(type: disjunction;)}} jest wymagany`,
  general_invalid: `{{types, list(type: disjunction;)}} jest nieprawidłowe`,
  username_required: 'Nazwa użytkownika jest wymagana',
  password_required: 'Hasło jest wymagane',
  username_exists: 'Nazwa użytkownika już istnieje',
  username_should_not_start_with_number: 'Nazwa użytkownika nie powinna zaczynać się od liczby',
  username_invalid_charset:
    'Nazwa użytkownika powinna zawierać tylko litery, liczby lub podkreślenia.',
  invalid_email: 'Nieprawidłowy adres e-mail',
  invalid_phone: 'Nieprawidłowy numer telefonu',
  password_min_length: 'Hasło wymaga minimum {{min}} znaków',
  invalid_password:
    'Hasło wymaga minimum {{min}} znaków i zawiera kombinację liter, cyfr oraz symboli.',
  passwords_do_not_match: 'Hasła nie pasują do siebie. Proszę spróbuj ponownie.',
  invalid_passcode: 'Nieprawidłowy kod weryfikacyjny',
  invalid_connector_auth: 'Nieprawidłowa autoryzacja',
  invalid_connector_request: 'Nieprawidłowe dane konektora',
  unknown: 'Nieznany błąd. Proszę spróbuj ponownie później.',
  invalid_session: 'Sesja nie znaleziona. Proszę wróć i zaloguj się ponownie.',
  timeout: 'Czas żądania upłynął. Proszę spróbuj ponownie później.',
};

export default error;
