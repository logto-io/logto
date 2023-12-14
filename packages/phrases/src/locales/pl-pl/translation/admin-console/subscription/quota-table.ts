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
    /** UNTRANSLATED */
    organizations: 'Organizations',
    /** UNTRANSLATED */
    monthly_active_organization: 'Monthly active organization',
    /** UNTRANSLATED */
    allowed_users_per_org: 'Allowed users per org',
    /** UNTRANSLATED */
    invitation: 'Invitation (Coming soon)',
    /** UNTRANSLATED */
    org_roles: 'Org roles',
    /** UNTRANSLATED */
    org_permissions: 'Org permissions',
    /** UNTRANSLATED */
    just_in_time_provisioning: 'Just-in-time provisioning',
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
  monthly_price: '${{value, number}}/mies.',
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} dzień',
  days_other: '{{count, number}} dni',
  add_on: 'Dodatkowy',
  tier: 'Poziom{{value, number}}: ',
  /** UNTRANSLATED */
  free_token_limit_tip: 'Free for {{value}}M token issued.',
  /** UNTRANSLATED */
  paid_token_limit_tip:
    'Free for {{value}}M token issued. We may add charges if you go beyond {{value}}M tokens once we finalize the prices.',
  /** UNTRANSLATED */
  paid_quota_limit_tip:
    'We may add charges for features that go beyond your quota limit as add-ons once we finalize the prices.',
  /** UNTRANSLATED */
  beta_feature_tip:
    'Free to use during the beta phase. We will begin charging once we finalize the add-on pricing.',
  /** UNTRANSLATED */
  beta: 'Beta',
  /** UNTRANSLATED */
  add_on_beta: 'Add-on (Beta)',
};

export default Object.freeze(quota_table);
