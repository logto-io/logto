const quota_table = {
  quota: {
    title: 'Limit',
    tenant_limit: 'Limit lokatora',
    base_price: 'Cena podstawowa',
    mau_unit_price: '* Cena za MAU',
    mau_limit: 'Limit MAU',
  },
  application: {
    title: 'Aplikacje',
    total: 'Liczba aplikacji',
    m2m: 'Aplikacja typu maszyna-maszyna',
  },
  resource: {
    title: 'Zasoby API',
    resource_count: 'Liczba zasobów',
    scopes_per_resource: 'Uprawnienia na zasób',
  },
  branding: {
    title: 'Interfejs użytkownika i branding',
    custom_domain: 'Domena niestandardowa',
    custom_css: 'Niestandardowy CSS',
    app_logo_and_favicon: 'Logo aplikacji i ikona',
    dark_mode: 'Tryb ciemny',
    i18n: 'Internacjonalizacja',
  },
  user_authn: {
    title: 'Uwierzytelnianie użytkowników',
    omni_sign_in: 'Omni logowanie',
    password: 'Hasło',
    passwordless: 'Logowanie bez hasła - E-mail i SMS',
    email_connector: 'Podłączenie e-mail',
    sms_connector: 'Podłączenie SMS',
    social_connectors: 'Podłączenia społecznościowe',
    standard_connectors: 'Standardowe podłączenia',
    built_in_email_connector: 'Wbudowane podłączenie e-mail',
  },
  user_management: {
    title: 'Zarządzanie użytkownikami',
    user_management: 'Zarządzanie użytkownikami',
    roles: 'Role',
    scopes_per_role: 'Uprawnienia na rolę',
  },
  audit_logs: {
    title: 'Logi audytu',
    retention: 'Okres przechowywania',
  },
  hooks: {
    title: 'Webhooki',
    hooks: 'Webhooki',
  },
  support: {
    title: 'Wsparcie',
    community: 'Społeczność',
    customer_ticket: 'Zgłoszenie wsparcia',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* Aktywni użytkownicy miesięcznie (MAU) są podzieleni na 3 poziomy w zależności od częstotliwości logowania się w okresie rozliczeniowym. Każdy poziom ma inną cenę za jednostkę MAU.',
  unlimited: 'Nieograniczone',
  contact: 'Kontakt',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/mies.',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} dzień',
  days_other: '{{count, number}} dni',
  add_on: 'Dodatkowy',
};

export default quota_table;
