const security = {
  page_title: 'Bezpieczeństwo',
  title: 'Bezpieczeństwo',
  subtitle: 'Skonfiguruj zaawansowane zabezpieczenia, aby chronić się przed złożonymi atakami.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Polityka haseł',
    blocklist: 'Lista blokad',
    general: 'Ogólne',
  },
  bot_protection: {
    title: 'Ochrona przed botami',
    description:
      'Włącz CAPTCHA dla rejestracji, logowania i odzyskiwania hasła, aby blokować zautomatyzowane zagrożenia.',
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'Wybierz dostawcę CAPTCHA i skonfiguruj integrację.',
      add: 'Dodaj CAPTCHA',
    },
    settings: 'Ustawienia',
    enable_captcha: 'Włącz CAPTCHA',
    enable_captcha_description:
      'Włącz weryfikację CAPTCHA dla rejestracji, logowania i odzyskiwania hasła.',
  },
  create_captcha: {
    setup_captcha: 'Skonfiguruj CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'Rozwiązanie CAPTCHA firmy Google dla przedsiębiorstw, oferujące zaawansowane wykrywanie zagrożeń i szczegółowe analizy bezpieczeństwa, aby chronić Twoją witrynę przed oszustwami.',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'Inteligentna alternatywa dla CAPTCHA od Cloudflare, zapewniająca ochronę przed botami bez zakłócania użytkownika i gwarantująca płynne doświadczenie bez wizualnych łamigłówek.',
    },
  },
  captcha_details: {
    back_to_security: 'Powrót do bezpieczeństwa',
    page_title: 'Szczegóły CAPTCHA',
    check_readme: 'Sprawdź README',
    options_change_captcha: 'Zmień dostawcę CAPTCHA',
    connection: 'Połączenie',
    description: 'Skonfiguruj swoje połączenie CAPTCHA.',
    site_key: 'Klucz witryny',
    secret_key: 'Tajny klucz',
    project_id: 'ID projektu',
    domain: 'Domena (opcjonalna)',
    domain_placeholder: 'www.google.com (domyślna) lub recaptcha.net',
    recaptcha_key_id: 'ID klucza reCAPTCHA',
    recaptcha_api_key: 'Klucz API projektu',
    deletion_description: 'Czy na pewno chcesz usunąć tego dostawcę CAPTCHA?',
    captcha_deleted: 'Pomyślnie usunięto dostawcę CAPTCHA',
    setup_captcha: 'Skonfiguruj CAPTCHA',
    mode: 'Tryb weryfikacji',
    mode_invisible: 'Niewidoczny',
    mode_checkbox: 'Pole wyboru',
    mode_notice:
      'Tryb weryfikacji jest zdefiniowany w ustawieniach klucza reCAPTCHA w Google Cloud Console. Zmiana trybu tutaj wymaga odpowiedniego typu klucza.',
  },
  password_policy: {
    password_requirements: 'Wymagania dotyczące hasła',
    password_requirements_description:
      'Zwiększ wymagania dotyczące hasła, aby bronić się przed atakami typu credential stuffing i atakami na słabe hasła. ',
    minimum_length: 'Minimalna długość',
    minimum_length_description:
      'NIST sugeruje użycie <a>co najmniej 8 znaków</a> dla produktów internetowych.',
    minimum_length_error: 'Minimalna długość musi wynosić od {{min}} do {{max}} (włącznie).',
    minimum_required_char_types: 'Minimalna liczba wymaganych typów znaków',
    minimum_required_char_types_description:
      'Typy znaków: wielkie litery (A-Z), małe litery (a-z), cyfry (0-9) i znaki specjalne ({{symbols}}).',
    password_rejection: 'Odrzucanie hasła',
    compromised_passwords: 'Odrzucaj skompromitowane hasła',
    breached_passwords: 'Odrzucaj naruszone hasła',
    breached_passwords_description:
      'Odrzucaj hasła, które wcześniej zostały znalezione w bazach naruszeń.',
    restricted_phrases: 'Ogranicz niskie zabezpieczenia',
    restricted_phrases_tooltip:
      'Twoje hasło powinno omijać te frazy, chyba że zestawisz je z 3 lub więcej dodatkowymi znakami.',
    repetitive_or_sequential_characters: 'Powtarzające się lub sekwencyjne znaki',
    repetitive_or_sequential_characters_description: 'Na przykład "AAAA", "1234" i "abcd".',
    user_information: 'Informacje użytkownika',
    user_information_description:
      'Na przykład adres e-mail, numer telefonu, nazwa użytkownika itp.',
    custom_words: 'Niestandardowe słowa',
    custom_words_description: 'Słowa kontekstowe, niezależne od wielkości liter, jeden na linię.',
    custom_words_placeholder: 'Nazwa twojej usługi, nazwa firmy itp.',
    password_expiration: 'Wygasanie haseł',
    password_expiration_description:
      'Wymagaj od użytkowników zresetowania hasła po określonej liczbie dni. Użytkownicy logujący się przez SSO lub klucz dostępu nie są objęci tą zasadą.',
    enable_password_expiration: 'Włącz wygasanie haseł',
    enable_password_expiration_description:
      'Wymagaj od użytkowników okresowego resetowania hasła. Istniejący użytkownicy bez zapisanej daty zmiany hasła zostaną ocenieni na podstawie daty włączenia tej zasady.',
    enable_password_expiration_tip:
      'Wygasanie hasła można włączyć dopiero po skonfigurowaniu w doświadczeniu logowania co najmniej jednej metody odzyskiwania hasła z poprawnym konektorem.',
    expiration_period: 'Okres ważności hasła (dni)',
    expiration_period_description:
      'Liczba dni, przez które hasło pozostaje ważne przed wygaśnięciem.',
    expiration_period_error: 'Okres ważności hasła musi wynosić od {{min}} do {{max}} dni.',
    password_expiration_recovery_reminder:
      'Niektórzy użytkownicy mogą nie mieć adresu e-mail ani numeru telefonu, aby otrzymać kod odzyskiwania hasła, więc nie będą mogli zresetować wygasłego hasła. Wymagaj adresu e-mail lub numeru telefonu podczas rejestracji, aby każdy użytkownik mógł odzyskać swoje hasło.',
  },
  verification_code_policy: {
    card_title: 'Kod weryfikacyjny',
    card_description:
      'Skonfiguruj czas wygaśnięcia i maksymalną liczbę ponownych prób dla kodów weryfikacyjnych używanych podczas logowania, rejestracji i resetowania hasła.',
    enable: {
      title: 'Dostosuj ustawienia kodu weryfikacyjnego',
      description:
        'Zezwalaj na dostosowanie czasu wygaśnięcia kodu weryfikacyjnego i maksymalnej liczby ponownych prób.',
    },
    expiration_duration: {
      title: 'Czas wygaśnięcia (sekundy)',
      description: 'Czas w sekundach, przez jaki kod weryfikacyjny pozostaje ważny po wysłaniu.',
      error_message: 'Czas wygaśnięcia musi wynosić od 60 do 3600 sekund.',
    },
    max_retry_attempts: {
      title: 'Maksymalna liczba ponownych prób',
      description:
        'Maksymalna liczba nieudanych prób weryfikacji dozwolona przed unieważnieniem kodu.',
      error_message: 'Maksymalna liczba ponownych prób musi wynosić od 1 do 100.',
    },
  },

  sentinel_policy: {
    card_title: 'Blokada identyfikatora',
    card_description:
      'Blokada jest dostępna dla wszystkich użytkowników z ustawieniami domyślnymi, ale możesz ją dostosować dla większej kontroli.\n\nTymczasowo zablokuj identyfikator po wielu nieudanych próbach uwierzytelnienia (np. z rzędu niepoprawne hasło lub kod weryfikacyjny), aby zapobiec dostępowi siłowemu.',
    enable_sentinel_policy: {
      title: 'Dostosuj doświadczenie blokady',
      description:
        'Zezwól na dostosowanie maksymalnej liczby nieudanych prób logowania przed blokadą, czasu trwania blokady oraz natychmiastowego ręcznego odblokowania.',
    },
    max_attempts: {
      title: 'Maksymalna liczba nieudanych prób',
      description:
        'Tymczasowo zablokuj identyfikator po osiągnięciu maksymalnej liczby nieudanych prób logowania w ciągu godziny.',
      error_message: 'Maksymalna liczba nieudanych prób musi być większa niż 0.',
    },
    lockout_duration: {
      title: 'Czas trwania blokady (minuty)',
      description:
        'Zablokuj logowania na okres po przekroczeniu maksymalnej liczby nieudanych prób.',
      error_message: 'Czas trwania blokady musi wynosić co najmniej 1 minutę.',
    },
    manual_unlock: {
      title: 'Ręczne odblokowanie',
      description:
        'Odblokuj użytkowników natychmiastowo, potwierdzając ich tożsamość i wprowadzając ich identyfikator.',
      unblock_by_identifiers: 'Odblokuj według identyfikatora',
      modal_description_1:
        'Identyfikator został tymczasowo zablokowany z powodu wielu nieudanych prób logowania/rejestracji. Aby chronić bezpieczeństwo, dostęp zostanie automatycznie przywrócony po upływie czasu blokady.',
      modal_description_2:
        ' Ręcznie odblokuj tylko wtedy, gdy potwierdziłeś tożsamość użytkownika i upewniłeś się, że nie doszło do nieautoryzowanych prób dostępu.',
      placeholder: 'Wprowadź identyfikatory (adres e-mail / numer telefonu / nazwa użytkownika)',
      confirm_button_text: 'Odblokuj teraz',
      success_toast: 'Pomyślnie odblokowano',
      duplicate_identifier_error: 'Identyfikator już dodany',
      empty_identifier_error: 'Proszę wprowadzić co najmniej jeden identyfikator',
    },
  },
  blocklist: {
    card_title: 'Lista blokad email',
    card_description:
      'Przejmij kontrolę nad bazą użytkowników, blokując adresy email o wysokim ryzyku lub niepożądane.',
    disposable_email: {
      title: 'Zablokuj jednorazowe adresy email',
      description:
        'Włącz, aby odrzucać wszelkie próby rejestracji przy użyciu jednorazowego lub tymczasowego adresu email, co może zapobiec spamowi i poprawić jakość użytkowników.',
    },
    email_subaddressing: {
      title: 'Zablokuj podadresacje email',
      description:
        'Włącz, aby odrzucać wszelkie próby rejestracji przy użyciu podadresów email z plusem (+) i dodatkowymi znakami (np. user+alias@foo.com).',
    },
    custom_email_address: {
      title: 'Zablokuj niestandardowe adresy email',
      description:
        'Dodaj reguły blokujące określone domeny email, adresy email lub wzorce adresów email z symbolami wieloznacznymi przed rejestracją lub powiązaniem przez UI.',
      placeholder:
        'Wprowadź zablokowany adres email, domenę lub wzorzec adresu email z symbolem wieloznacznym (np. bar@example.com, @example.com, foo*@example.com, *@example.com)',
      duplicate_error:
        'Adres email, domena lub wzorzec adresu email z symbolem wieloznacznym już dodany',
      invalid_format_error:
        'Musi być ważnym adresem email (bar@example.com), domeną (@example.com) lub wzorcem adresu email z symbolem wieloznacznym (foo*@example.com, *@example.com)',
    },
  },
};

export default Object.freeze(security);
