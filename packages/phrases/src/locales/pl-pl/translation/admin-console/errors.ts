const errors = {
  something_went_wrong: 'Ups! Coś poszło nie tak.',
  page_not_found: 'Nie znaleziono strony',
  unknown_server_error: 'Wystąpił nieznany błąd serwera',
  empty: 'Brak danych',
  missing_total_number: 'Nie można znaleźć wartości Total-Number w nagłówkach odpowiedzi',
  invalid_uri_format: 'Nieprawidłowy format URI',
  invalid_origin_format: 'Nieprawidłowy format pochodzenia URI',
  invalid_json_format: 'Nieprawidłowy format JSON',
  invalid_regex: 'Nieprawidłowe wyrażenie regularne',
  invalid_error_message_format: 'Nieprawidłowy format komunikatu błędu.',
  required_field_missing: 'Wpisz {{field}}',
  required_field_missing_plural: 'Musisz wprowadzić przynajmniej jeden {{field}}',
  more_details: 'Więcej szczegółów',
  username_pattern_error:
    'Nazwa użytkownika powinna zawierać tylko litery, cyfry lub znak podkreślenia i nie powinna zaczynać się od cyfry.',
  email_pattern_error: 'Adres e-mail jest nieprawidłowy.',
  phone_pattern_error: 'Numer telefonu jest nieprawidłowy.',
  insecure_contexts: 'Nieobsługiwane są niebezpieczne konteksty (non-HTTPS).',
  unexpected_error: 'Wystąpił nieoczekiwany błąd.',
  not_found: '404 nie znaleziono',
  create_internal_role_violation:
    'Tworzysz nową wewnętrzną rolę, co jest zabronione przez Logto. Spróbuj użyć innego nazwy, która nie zaczyna się od "#internal:". ',
  should_be_an_integer: 'Powinno być liczbą całkowitą.',
  number_should_be_between_inclusive:
    'Następnie liczba powinna być między {{min}} a {{max}} (włącznie).',
};

export default Object.freeze(errors);
