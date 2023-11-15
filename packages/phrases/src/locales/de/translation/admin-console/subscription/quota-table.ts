const quota_table = {
  quota: {
    title: 'Kontingent',
    tenant_limit: 'Tenant-Limit',
    base_price: 'Grundpreis',
    mau_unit_price: '* MAU-Einheitspreis',
    mau_limit: 'MAU-Limit',
  },
  application: {
    title: 'Anwendungen',
    total: 'Gesamtzahl der Anwendungen',
    m2m: 'Maschine-zu-Maschine',
  },
  resource: {
    title: 'API-Ressourcen',
    resource_count: 'Ressourcenanzahl',
    scopes_per_resource: 'Berechtigungen pro Ressource',
  },
  branding: {
    title: 'Benutzeroberfläche und Branding',
    custom_domain: 'Benutzerdefinierte Domain',
    custom_css: 'Benutzerdefiniertes CSS',
    app_logo_and_favicon: 'App-Logo und Favicon',
    dark_mode: 'Dunkler Modus',
    i18n: 'Internationalisierung',
  },
  user_authn: {
    title: 'Benutzerauthentifizierung',
    omni_sign_in: 'Omni-Anmeldung',
    password: 'Passwort',
    passwordless: 'Passwortlos - E-Mail und SMS',
    email_connector: 'E-Mail-Connector',
    sms_connector: 'SMS-Connector',
    social_connectors: 'Social-Connectors',
    standard_connectors: 'Standard-Connectors',
    built_in_email_connector: 'Integrierter E-Mail-Connector',
    mfa: 'MFA',
    sso: 'Unternehmens-SSO (Q4, 2023)',
  },
  user_management: {
    title: 'Benutzerverwaltung',
    user_management: 'Benutzerverwaltung',
    roles: 'Rollen',
    scopes_per_role: 'Berechtigungen pro Rolle',
  },
  audit_logs: {
    title: 'Prüfprotokolle',
    retention: 'Aufbewahrungsdauer',
  },
  hooks: {
    title: 'Webhooks',
    hooks: 'Webhooks',
  },
  organization: {
    title: 'Organisation',
    organization: 'Organisation (Q4, 2023)',
  },
  support: {
    title: 'Support',
    community: 'Community',
    customer_ticket: 'Support-Ticket',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* Ihre monatlich aktiven Benutzer (MAU) werden in 3 Stufen unterteilt, basierend darauf, wie oft sie sich während des Abrechnungszeitraums anmelden. Jede Stufe hat einen anderen Preis pro MAU-Einheit.',
  unlimited: 'Unbegrenzt',
  contact: 'Kontakt',
  monthly_price: '${{value, number}}/mo',
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} Tag',
  days_other: '{{count, number}} Tage',
  add_on: 'Zusatzleistung',
  tier: 'Stufe{{value, number}}: ',
};

export default Object.freeze(quota_table);
