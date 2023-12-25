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
    mfa: 'MFA',
    sso: 'SSO przedsiębiorstwowe',
  },
  user_management: {
    title: 'Zarządzanie użytkownikami',
    user_management: 'Zarządzanie użytkownikami',
    roles: 'Role',
    machine_to_machine_roles: 'Role maszyna-maszyna',
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
  organizations: {
    title: 'Organizacja',
    organizations: 'Organizacje',
    monthly_active_organization: 'Miesięczna liczba aktywnych organizacji',
    allowed_users_per_org: 'Dozwolona liczba użytkowników na organizację',
    invitation: 'Zaproszenie (Wkrótce)',
    org_roles: 'Role organizacji',
    org_permissions: 'Uprawnienia organizacji',
    just_in_time_provisioning: 'Provisioning w trybie just-in-time',
  },
  support: {
    /** UNTRANSLATED */
    title: 'Compliance and support',
    community: 'Społeczność',
    customer_ticket: 'Zgłoszenie wsparcia',
    premium: 'Premium',
    /** UNTRANSLATED */
    email_ticket_support: 'Email ticket support',
    /** UNTRANSLATED */
    soc2_report: 'SOC2 report (Coming soon)',
    /** UNTRANSLATED */
    hipaa_or_baa_report: 'HIPAA/BAA report (Coming soon)',
  },
  mau_unit_price_footnote:
    '* Aktywni użytkownicy miesięcznie (MAU) są podzieleni na 3 poziomy w zależności od częstotliwości logowania się w okresie rozliczeniowym. Każdy poziom ma inną cenę za jednostkę MAU.',
  unlimited: 'Nieograniczone',
  contact: 'Kontakt',
  monthly_price: '${{value, number}}/mies.',
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} dzień',
  days_other: '{{count, number}} dni',
  add_on: 'Dodatkowy',
  tier: 'Poziom{{value, number}}: ',
  free_token_limit_tip: 'Bezpłatne do wydania {{value}} M tokenów.',
  paid_token_limit_tip:
    'Bezpłatne do wydania {{value}} M tokenów. Możemy doliczyć opłaty, jeśli przekroczysz limity {{value}} M tokenów, gdy ustalimy ostateczne ceny.',
  paid_quota_limit_tip:
    'Możemy doliczyć opłaty za funkcje po przekroczeniu limitów kwoty jako dodatki, gdy ustalimy ostateczne ceny.',
  beta_feature_tip:
    'Darmowe w trakcie fazy beta. Będziemy pobierać opłaty po zakończeniu fazy beta przy ustaleniu cen dodatków.',
  usage_based_beta_feature_tip:
    'Darmowe w trakcie fazy beta. Będziemy pobierać opłaty po zakończeniu fazy beta przy ustaleniu opłat w oparciu o użycie organizacji.',
  beta: 'Beta',
  add_on_beta: 'Dodatkowy (Beta)',
};

export default Object.freeze(quota_table);
