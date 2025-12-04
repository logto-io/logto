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
        'Dodaj określone domeny email lub adresy email, które nie mogą się rejestrować lub powiązać przez UI.',
      placeholder:
        'Wprowadź zablokowany adres email lub domenę (np. bar@example.com, @example.com)',
      duplicate_error: 'Adres email lub domena już dodana',
      invalid_format_error:
        'Musi być ważnym adresem email(bar@example.com) lub domeną(@example.com)',
    },
  },
};

export default Object.freeze(security);
