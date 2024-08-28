const jwt_claims = {
  title: 'Niestandardowe JWT',
  description:
    'Ustaw niestandardowe roszczenia JWT, które mają być dołączone do tokenu dostępowego. Te roszczenia mogą być wykorzystane do przekazywania dodatkowych informacji do Twojej aplikacji.',
  user_jwt: {
    card_title: 'Dla użytkownika',
    card_field: 'Token dostępowy użytkownika',
    card_description:
      'Dodaj dane specyficzne dla użytkownika podczas wydawania tokenu dostępowego.',
    for: 'dla użytkownika',
  },
  machine_to_machine_jwt: {
    card_title: 'Dla M2M',
    card_field: 'Token maszynowy do maszyny',
    card_description: 'Dodaj dodatkowe dane podczas wydawania tokena maszynowego do maszyny.',
    for: 'dla M2M',
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
      'Użyj parametru wejściowego `data.user`, aby dostarczyć istotne informacje o użytkowniku.',
  },
  token_data: {
    title: 'Dane tokenu',
    subtitle: 'Użyj parametru wejściowego `token`, aby uzyskać bieżący ładunek tokenu dostępu.',
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
