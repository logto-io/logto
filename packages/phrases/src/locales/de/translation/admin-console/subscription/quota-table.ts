const quota_table = {
  quota: {
    title: 'Quota',
    tenant_limit: 'Mietergrenze',
    base_price: 'Grundpreis',
    mau_unit_price: '* MAU-Einheitspreis',
    mau_limit: 'MAU-Grenze',
  },
  application: {
    title: 'Anwendungen',
    total: 'Insgesamt',
    m2m: 'Maschine zu Maschine',
  },
  resource: {
    title: 'API-Ressourcen',
    resource_count: 'Anzahl der Ressourcen',
    scopes_per_resource: 'Berechtigungen pro Ressource',
  },
  branding: {
    title: 'Branding',
    custom_domain: 'Benutzerdefinierte Domain',
  },
  user_authn: {
    title: 'Benutzerauthentifizierung',
    omni_sign_in: 'Omni-Anmeldung',
    built_in_email_connector: 'Eingebauter E-Mail-Connector',
    social_connectors: 'Soziale Connectoren',
    standard_connectors: 'Standard-Connectoren',
  },
  roles: {
    title: 'Rollen',
    roles: 'Rollen',
    scopes_per_role: 'Berechtigungen pro Rolle',
  },
  audit_logs: {
    title: 'Prüfprotokolle',
    retention: 'Aufbewahrung',
  },
  hooks: {
    title: 'Hooks',
    amount: 'Menge',
  },
  support: {
    title: 'Support',
    community: 'Community',
    customer_ticket: 'Kundenticket',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* Unsere Einheitspreise können je nach tatsächlichem Ressourcenverbrauch variieren und Logto behält sich das Recht vor, Änderungen der Einheitspreise zu erläutern.',
  unlimited: 'Unbegrenzt',
  contact: 'Kontakt',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/mo',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} Tag',
  days_other: '{{count, number}} Tage',
  add_on: 'Zusatz',
};

export default quota_table;
