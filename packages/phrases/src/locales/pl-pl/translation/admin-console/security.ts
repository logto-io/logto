const security = {
  page_title: 'Bezpieczeństwo',
  title: 'Bezpieczeństwo',
  subtitle: 'Skonfiguruj zaawansowane zabezpieczenia, aby chronić się przed złożonymi atakami.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Polityka haseł',
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
    recaptcha_key_id: 'ID klucza reCAPTCHA',
    recaptcha_api_key: 'Klucz API projektu',
    deletion_description: 'Czy na pewno chcesz usunąć tego dostawcę CAPTCHA?',
    captcha_deleted: 'Pomyślnie usunięto dostawcę CAPTCHA',
    setup_captcha: 'Skonfiguruj CAPTCHA',
  },
  password_policy: {
    password_requirements: 'Wymagania dotyczące hasła',
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
};

export default Object.freeze(security);
