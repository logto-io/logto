const inline_hooks = {
  page_title: 'Hooki inline',
  title: 'Hooki inline',
  subtitle:
    'Uruchamiaj niestandardowy kod w określonych punktach procesu uwierzytelniania, aby rozszerzyć działanie Logto.',
  status: {
    not_configured: 'Nieskonfigurowany',
    configured: 'Skonfigurowany',
    enabled: 'Włączony',
    disabled: 'Wyłączony',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'Po weryfikacji pierwszego czynnika',
      description:
        'Uruchom niestandardową logikę po zweryfikowaniu pierwszego czynnika uwierzytelniania i przed kontynuowaniem logowania.',
    },
    post_sign_in: {
      name: 'Po zalogowaniu',
      description: 'Uruchom niestandardową logikę po pomyślnym zalogowaniu się użytkownika.',
    },
  },
  data_source_tab: 'Źródło danych',
  test_tab: 'Kontekst testowy',
  settings_tab: 'Ustawienia',
  event_data: {
    title: 'Payload zdarzenia',
    subtitle: 'Użyj parametru wejściowego `event` dla danych zdarzenia uwierzytelniania.',
  },
  result_data: {
    title: 'Wynik hooka',
    subtitle: 'Zwróć obiekt wyniku, który Logto rozumie dla tego typu hooka.',
  },
  environment_variables: {
    title: 'Ustaw zmienne środowiskowe',
    subtitle: 'Używaj zmiennych środowiskowych do przechowywania poufnych informacji.',
    input_field_title: 'Dodaj zmienne środowiskowe',
    sample_code: 'Dostęp do zmiennych środowiskowych w handlerze hooka inline. Przykład:',
  },
  fetch_external_data: {
    title: 'Pobierz dane zewnętrzne',
    subtitle: 'Wywołuj zewnętrzne API ze skryptu hooka.',
    description:
      'Użyj funkcji `fetch`, aby wywołać zewnętrzne API i dołączyć dane do wyniku hooka. Przykład:',
  },
  settings: {
    title: 'Ustawienia',
    subtitle: 'Kontroluj, czy hook jest aktywny oraz jak obsługiwane są błędy w czasie działania.',
    enabled: {
      title: 'Włącz hook',
      description: 'Uruchamiaj ten skrypt, gdy zostanie wywołane zdarzenie uwierzytelniania.',
    },
    on_execution_error: {
      title: 'Gdy skrypt zwróci błąd',
      description:
        'Wybierz, jak Logto ma się zachować, gdy skrypt zakończy się niepowodzeniem w czasie działania.',
      block: 'Zablokuj proces uwierzytelniania',
      allow: 'Pozwól procesowi uwierzytelniania kontynuować',
      post_first_factor_description:
        'Gdy ten skrypt zakończy się niepowodzeniem, Logto zawsze odrzuca nieprawidłowe dane uwierzytelniające, aby nie dało się pominąć weryfikacji hasła.',
    },
  },
  test_context: {
    subtitle: 'Dostosuj mock payload zdarzenia używany podczas testów.',
    input_field_title: 'Przykładowy JSON zdarzenia',
  },
  script: {
    title: 'Skrypt',
    restore: 'Przywróć domyślne',
    restored: 'Przywrócono',
  },
  tester: {
    run_button: 'Uruchom test',
    result_title: 'Wynik testu',
  },
  form_error: {
    invalid_json: 'Nieprawidłowy format JSON',
  },
  security_warning: {
    title: 'Ostrzeżenie bezpieczeństwa',
    description:
      'Użytkownicy provisionowani przez ten hook omijają zabezpieczenia dotyczące tylko rejestracji, w tym blokadę e-mail, domenę tylko SSO, tryb wyłączonej rejestracji oraz sprawdzanie obowiązkowego profilu przy rejestracji. Zapis profilu i hasła istniejących użytkowników również następuje przed zakończeniem MFA.',
  },
  delete_modal_title: 'Usuń hook inline',
  delete_modal_content:
    'Czy na pewno chcesz usunąć ten hook inline? Proces uwierzytelniania nie będzie już uruchamiał tego skryptu.',
  deleted: 'Hook inline usunięty',
  created: 'Hook inline utworzony',
  saved: 'Hook inline zapisany',
};

export default Object.freeze(inline_hooks);
