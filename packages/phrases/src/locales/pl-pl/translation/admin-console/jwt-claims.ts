const jwt_claims = {
  title: 'Niestandardowe JWT',
  description:
    'Dostosuj token dostępowy lub token ID, dostarczając dodatkowe informacje do Twojej aplikacji.',
  access_token: {
    card_title: 'Token dostępowy',
    card_description:
      'Token dostępowy to uprawnienie używane przez interfejsy API do autoryzacji żądań, zawierające tylko roszczenia niezbędne do decyzji o dostępie.',
  },
  user_jwt: {
    card_field: 'Token dostępowy użytkownika',
    card_description:
      'Dodaj dane specyficzne dla użytkownika podczas wydawania tokenu dostępowego.',
    for: 'dla użytkownika',
  },
  machine_to_machine_jwt: {
    card_field: 'Token dostępowy maszynowy do maszyny',
    card_description: 'Dodaj dodatkowe dane podczas wydawania tokena maszynowego do maszyny.',
    for: 'dla M2M',
  },
  id_token: {
    card_title: 'Token ID',
    card_description:
      'Token ID to twierdzenie tożsamości otrzymane po zalogowaniu, zawierające roszczenia tożsamości użytkownika dla klienta do wykorzystania w celu wyświetlenia lub tworzenia sesji.',
    card_field: 'Token ID użytkownika',
    card_field_description:
      "Roszczenia 'sub', 'email', 'phone', 'profile' i 'address' są zawsze dostępne. Inne roszczenia muszą być najpierw włączone tutaj. We wszystkich przypadkach Twoja aplikacja musi zażądać odpowiednich zakresów podczas integracji, aby je otrzymać.",
  },
  code_editor_title: 'Dostosuj roszczenia {{token}}',
  custom_jwt_create_button: 'Dodaj niestandardowe roszczenia',
  custom_jwt_item: 'Niestandardowe roszczenia {{for}}',
  delete_modal_title: 'Usuń niestandardowe roszczenia',
  delete_modal_content: 'Czy na pewno chcesz usunąć niestandardowe roszczenia?',
  clear: 'Wyczyść',
  cleared: 'Wyczyszczono',
  restore: 'Przywróć domyślne',
  restored: 'Przywrócono',
  data_source_tab: 'Źródło danych',
  test_tab: 'Kontekst testowy',
  jwt_claims_description:
    'Domyślne roszczenia są automatycznie dołączane do JWT i nie mogą być nadpisane.',
  user_data: {
    title: 'Dane użytkownika',
    subtitle:
      'Użyj parametru wejściowego `context.user`, aby dostarczyć istotne informacje o użytkowniku.',
  },
  grant_data: {
    title: 'Dane przyznania',
    subtitle:
      'Użyj parametru wejściowego `context.grant`, aby dostarczyć istotne informacje dotyczące przyznania, dostępne tylko przy wymianie tokenu.',
  },
  interaction_data: {
    title: 'Kontekst interakcji użytkownika',
    subtitle:
      'Użyj parametru `context.interaction`, aby uzyskać dostęp do szczegółów interakcji użytkownika dla bieżącej sesji uwierzytelniania.',
  },
  application_data: {
    title: 'Kontekst aplikacji',
    subtitle:
      'Użyj parametru wejściowego `context.application`, aby dostarczć informacje o aplikacji powiązanej z tokenem.',
  },
  token_data: {
    title: 'Dane tokenu',
    subtitle: 'Użyj parametru wejściowego `token`, aby uzyskać bieżący ładunek tokenu dostępu.',
  },
  api_context: {
    title: 'Kontekst API: kontrola dostępu',
    subtitle: 'Użyj metody `api.denyAccess`, aby odrzucić żądanie tokenu.',
  },
  fetch_external_data: {
    title: 'Pobierz zewnętrzne dane',
    subtitle: 'Włóż dane bezpośrednio z Twoich zewnętrznych API do roszczeń.',
    description:
      'Użyj funkcji `fetch`, aby wywołać Twoje zewnętrzne API i dołączyć dane do niestandardowych roszczeń. Przykład: ',
  },
  environment_variables: {
    title: 'Ustaw zmienne środowiskowe',
    subtitle: 'Użyj zmiennych środowiskowych do przechowywania poufnych informacji.',
    input_field_title: 'Dodaj zmienne środowiskowe',
    sample_code:
      'Dostęp do zmiennych środowiskowych w twoim programie obsługi niestandardowych roszczeń JWT. Przykład: ',
  },
  jwt_claims_hint:
    'Ogranicz niestandardowe roszczenia do mniej niż 50 KB. Domyślne roszczenia JWT są automatycznie dołączane do tokenu i nie mogą być nadpisane.',
  tester: {
    subtitle: 'Dostosuj fałszywy token i dane użytkownika do testowania.',
    run_button: 'Uruchom test',
    result_title: 'Wynik testu',
  },
  form_error: {
    invalid_json: 'Nieprawidłowy format JSON',
  },
};

export default Object.freeze(jwt_claims);
