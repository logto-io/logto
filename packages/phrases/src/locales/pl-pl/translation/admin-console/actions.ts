const actions = {
  page_title: 'Actions',
  title: 'Actions',
  subtitle:
    'Uruchamiaj niestandardowy kod w określonych punktach procesu uwierzytelniania, aby rozszerzyć działanie Logto.',
  status: {
    not_configured: 'Nieskonfigurowany',
    configured: 'Skonfigurowany',
    enabled: 'Włączony',
    disabled: 'Wyłączony',
  },
  types: {
    post_first_factor_verification: {
      name: 'Po weryfikacji pierwszego czynnika',
      description:
        'Uruchom niestandardową logikę po nieudanej weryfikacji lokalnego hasła podczas logowania.',
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
    title: 'Wynik akcji',
    subtitle: 'Zwróć obiekt wyniku, który Logto rozumie dla tego typu akcji.',
  },
  environment_variables: {
    title: 'Ustaw zmienne środowiskowe',
    subtitle: 'Używaj zmiennych środowiskowych do przechowywania poufnych informacji.',
    input_field_title: 'Dodaj zmienne środowiskowe',
    sample_code: 'Dostęp do zmiennych środowiskowych w handlerze akcji. Przykład:',
  },
  fetch_external_data: {
    title: 'Pobierz dane zewnętrzne',
    subtitle: 'Wywołuj zewnętrzne API ze skryptu akcji.',
    description:
      'Użyj funkcji `fetch`, aby wywołać zewnętrzne API i dołączyć dane do wyniku akcji. Przykład:',
  },
  settings: {
    title: 'Ustawienia',
    subtitle: 'Kontroluj, czy akcja jest aktywna oraz jak obsługiwane są błędy w czasie działania.',
    enabled: {
      title: 'Włącz akcję',
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
      'Ta akcja jest uruchamiana dopiero po nieudanej weryfikacji lokalnego hasła. Zwracaj `passwordVerified: true` tylko po niezależnym zweryfikowaniu przesłanego hasła. Użytkownicy provisionowani przez tę akcję omijają zabezpieczenia dotyczące tylko rejestracji, w tym blokadę e-mail, domenę tylko SSO, tryb wyłączonej rejestracji oraz sprawdzanie obowiązkowego profilu przy rejestracji. Zapis profilu i hasła istniejących użytkowników również następuje przed zakończeniem MFA.',
  },
  delete_modal_title: 'Usuń akcję',
  delete_modal_content:
    'Czy na pewno chcesz usunąć tę akcję? Proces uwierzytelniania nie będzie już uruchamiał tego skryptu.',
  deleted: 'Akcja usunięta',
  created: 'Akcja utworzona',
  saved: 'Akcja zapisana',
};

export default Object.freeze(actions);
