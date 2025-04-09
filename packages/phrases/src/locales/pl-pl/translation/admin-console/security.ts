const security = {
  page_title: 'Bezpieczeństwo',
  title: 'Bezpieczeństwo',
  subtitle: 'Skonfiguruj zaawansowane zabezpieczenia, aby chronić się przed złożonymi atakami.',
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
};

export default Object.freeze(security);
