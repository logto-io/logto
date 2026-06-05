import password_rejected from './password-rejected.js';

const error = {
  general_required: `{{types, list(type: disjunction;)}} jest wymagany`,
  general_invalid: `{{types, list(type: disjunction;)}} jest nieprawidłowe`,
  invalid_min_max_input: 'Wartość powinna być pomiędzy {{minValue}} a {{maxValue}}',
  invalid_min_max_length: 'Długość wartości powinna być pomiędzy {{minLength}} a {{maxLength}}',
  username_required: 'Nazwa użytkownika jest wymagana',
  password_required: 'Hasło jest wymagane',
  username_exists: 'Nazwa użytkownika już istnieje',
  username_should_not_start_with_number: 'Nazwa użytkownika nie powinna zaczynać się od liczby',
  username_invalid_charset:
    'Nazwa użytkownika powinna zawierać tylko litery, liczby lub podkreślenia.',
  /** UNTRANSLATED */
  username_too_short: 'Username must be at least {{min}} characters long.',
  /** UNTRANSLATED */
  username_too_long: 'Username must be at most {{max}} characters long.',
  /** UNTRANSLATED */
  username_uppercase_not_allowed: 'Uppercase letters are not allowed in usernames.',
  /** UNTRANSLATED */
  username_lowercase_not_allowed: 'Lowercase letters are not allowed in usernames.',
  /** UNTRANSLATED */
  username_numbers_not_allowed: 'Numbers are not allowed in usernames.',
  /** UNTRANSLATED */
  username_underscore_not_allowed: 'Underscores are not allowed in usernames.',
  invalid_email: 'Nieprawidłowy adres e-mail',
  invalid_phone: 'Nieprawidłowy numer telefonu',
  passwords_do_not_match: 'Hasła nie pasują do siebie.',
  invalid_passcode: 'Nieprawidłowy kod weryfikacyjny.',
  device_code_required: 'Kod jest wymagany.',
  invalid_device_code: 'Kod urządzenia jest nieprawidłowy.',
  device_flow_aborted: 'Żądanie logowania zostało przerwane.',
  invalid_connector_auth: 'Nieprawidłowa autoryzacja',
  invalid_connector_request: 'Nieprawidłowe dane konektora',
  unknown: 'Nieznany błąd.',
  invalid_session: 'Sesja nie znaleziona. Proszę wróć i zaloguj się ponownie.',
  timeout: 'Czas żądania upłynął.',
  password_rejected,
  sso_not_enabled: 'Pojedyncze logowanie nie jest włączony dla tego konta e-mail.',
  invalid_link: 'Nieprawidłowy link',
  invalid_link_description: 'Twój jednorazowy token mógł wygasnąć lub nie jest już ważny.',
  captcha_verification_failed: 'Weryfikacja captcha nie powiodła się.',
  terms_acceptance_required: 'Wymagana akceptacja warunków',
  terms_acceptance_required_description: 'Musisz zaakceptować warunki, aby kontynuować.',
  something_went_wrong: 'Coś poszło nie tak',
  access_denied: 'Odmowa dostępu',
  application_access_denied:
    'Nie masz uprawnień do dostępu do tej aplikacji. Skontaktuj się z administratorem, aby uzyskać pomoc.',
  feature_not_enabled:
    'Nie masz uprawnień do dostępu do tej funkcji. Skontaktuj się z administratorem, aby uzyskać pomoc.',
};

export default Object.freeze(error);
