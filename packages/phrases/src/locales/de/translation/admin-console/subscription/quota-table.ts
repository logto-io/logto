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
    sso: 'Unternehmens-SSO',
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
  organizations: {
    title: 'Organisation',
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
