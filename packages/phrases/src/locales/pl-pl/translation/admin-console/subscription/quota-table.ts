const quota_table = {
  quota: {
    title: 'Limit',
    tenant_limit: 'Limit dzierżawcy',
    base_price: 'Cena podstawowa',
    mau_unit_price: '* Cena jednostkowa MAU',
    mau_limit: 'Limit MAU',
  },
  application: {
    title: 'Aplikacje',
    total: 'Razem',
    m2m: 'Maszyna do maszyny',
  },
  resource: {
    title: 'Zasoby API',
    resource_count: 'Liczba zasobów',
    scopes_per_resource: 'Uprawnienia na zasób',
  },
  branding: {
    title: 'Brandowanie',
    custom_domain: 'Niestandardowa domena',
  },
  user_authn: {
    title: 'Uwierzytelnianie użytkownika',
    omni_sign_in: 'Omni logowanie',
    built_in_email_connector: 'Wbudowany konektor e-mailowy',
    social_connectors: 'Konektory społecznościowe',
    standard_connectors: 'Standardowe konektory',
  },
  roles: {
    title: 'Role',
    roles: 'Role',
    scopes_per_role: 'Uprawnienia na rolę',
  },
  audit_logs: {
    title: 'Dzienniki audytu',
    retention: 'Zatrzymanie',
  },
  hooks: {
    title: 'Hooks',
    amount: 'Liczba',
  },
  support: {
    title: 'Wsparcie',
    community: 'Społeczność',
    customer_ticket: 'Bilet klienta',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* Nasze ceny jednostkowe mogą się różnić w zależności od faktycznie zużywanych zasobów, a Logto zastrzega sobie prawo do wyjaśnienia ewentualnych zmian cen jednostkowych.',
  unlimited: 'Bez ograniczeń',
  contact: 'Kontakt',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/mc',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} dzień',
  days_other: '{{count, number}} dni',
  add_on: 'Dodatkowy',
};

export default quota_table;
