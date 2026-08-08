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
  error_handling_tab: 'Obsługa błędów',
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
  organization_data: {
    title: 'Kontekst organizacji',
    subtitle:
      'Użyj parametru wejściowego `context.organization`, aby dostarczyć informacje o docelowej organizacji, dostępne tylko dla tokenów organizacji.',
  },
  token_data: {
    title: 'Dane tokenu',
    subtitle: 'Użyj parametru wejściowego `token`, aby uzyskać bieżący ładunek tokenu dostępu.',
  },
  api_context: {
    title: 'Kontekst API: kontrola dostępu',
    subtitle: 'Użyj metody `api.denyAccess`, aby odrzucić żądanie tokenu.',
  },
  cryptographic_capability: {
    title: 'Kontekst API: kryptografia',
    subtitle: 'Użyj `api.crypto.sha256` i `api.crypto.hmacSha256` do haszowania UTF-8.',
    description:
      'Obie metody są asynchroniczne i zwracają Promise z 64-znakowym małymi literami heksadecymalnym ciągiem. Wejścia są kodowane jako UTF-8 bez normalizacji Unicode: `sha256(input)` oblicza SHA-256(UTF-8(input)); `hmacSha256({ key, input })` oblicza HMAC-SHA-256(UTF-8(key), UTF-8(input)). Odczytuj klucze HMAC ze zmiennych środowiskowych, samodzielnie wywołaj `.trim()` i odrzuć pusty wynik przed wywołaniem HMAC — metoda nigdy nie przycina i nie przełącza się na SHA-256. Preferuj klucz o wysokiej entropii bez białych znaków. Puste wejście wiadomości jest prawidłowe; pusty klucz nie. Wejście jest ograniczone do 1 MiB bajtów UTF-8, a klucz HMAC do 64 KiB. SHA-256 nie ukrywa wyliczalnych identyfikatorów, takich jak e-maile czy numery telefonów; użyj HMAC dla stabilnego identyfikatora z tajnym kluczem. Żadna metoda nie służy do przechowywania haseł. Zmienne środowiskowe są widoczne dla uprawnionych administratorów Custom JWT i środowiska wykonawczego i nie stanowią zarządzanego systemu kluczy. Rotacja klucza HMAC zmienia każdą wartość pochodną — skrypty wymagające migracji powinny nieść zdefiniowaną przez aplikację wersję klucza i zaimplementować ewentualny okres podwójnej wartości. Wiele wartości wymaga jednoznacznej serializacji zdefiniowanej przez wywołującego (np. `JSON.stringify([value1, value2])` w tym samym runtime); integracje międzyjęzykowe muszą uzgodnić własną formę kanoniczną. W self-hosted Logto ten skrypt nadal działa w modelu zaufanego skryptu opisanym w ostrzeżeniu sandbox.',
  },
  error_handling: {
    title: 'Obsługa błędów',
    subtitle: 'Określa, czy wydanie tokena ma zostać zablokowane, gdy skrypt zakończy się błędem.',
    input_field_title: 'Zachowanie wydawania tokena przy błędzie skryptu',
    block_issuance_switch: 'Blokuj wydanie tokena, gdy skrypt zgłasza błędy',
    default_hint_create:
      'Nowe skrypty niestandardowych claims domyślnie blokują wydanie tokenu, gdy skrypt zakończy się błędem. Jeśli API zwraca już wartość, zostanie użyta zapisana wartość.',
    default_hint_edit:
      'Istniejące skrypty niestandardowych claims bez tego ustawienia zachowują dotychczasowe domyślne wyłączenie tej opcji, dopóki nie zapiszesz jej jawnie.',
    warning:
      'Po włączeniu błędy wykonania skryptu odrzucają żądanie tokena z `invalid_request` (400) i zlokalizowanym `error_description`. Wywołania `api.denyAccess` nadal zwracają `access_denied`.',
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
  sandbox_warning: {
    title: 'Skrypty działają z uprawnieniami serwera',
    description:
      'W samodzielnie hostowanym Logto ten skrypt działa w tym samym środowisku co samo Logto: może odczytywać zmienne środowiskowe serwera i osiągać usługi w Twojej sieci wewnętrznej. Nie jest w piaskownicy. Udostępniaj tę stronę tylko osobom, którym zaufałbyś dostęp do serwera.',
  },
  form_error: {
    invalid_json: 'Nieprawidłowy format JSON',
  },
};

export default Object.freeze(jwt_claims);
