const quota_table = {
  quota: {
    title: 'Quota',
    tenant_limit: 'Limite tenant',
    base_price: 'Prezzo base',
    mau_unit_price: '* Prezzo unitario MAU',
    mau_limit: 'Limite MAU',
  },
  application: {
    title: 'Applicazioni',
    total: 'Totale applicazioni',
    m2m: 'Machine-to-machine',
  },
  resource: {
    title: 'Risorse API',
    resource_count: 'Numero di risorse',
    scopes_per_resource: 'Permessi per risorsa',
  },
  branding: {
    title: 'UI e branding',
    custom_domain: 'Dominio personalizzato',
    custom_css: 'CSS personalizzato',
    app_logo_and_favicon: "Logo e favicon dell'applicazione",
    dark_mode: 'Modalità scura',
    i18n: 'Internazionalizzazione',
  },
  user_authn: {
    title: 'Autenticazione utente',
    omni_sign_in: 'Accesso onnicomprensivo',
    password: 'Password',
    passwordless: 'Senza password - E-mail e SMS',
    email_connector: 'Connettore e-mail',
    sms_connector: 'Connettore SMS',
    social_connectors: 'Connettori sociali',
    standard_connectors: 'Connettori standard',
    built_in_email_connector: 'Connettore e-mail integrato',
    mfa: 'MFA',
    sso: 'SSO aziendale',
  },
  user_management: {
    title: 'Gestione utenti',
    user_management: 'Gestione utenti',
    roles: 'Ruoli',
    scopes_per_role: 'Permessi per ruolo',
  },
  audit_logs: {
    title: 'Log di audit',
    retention: 'Conservazione',
  },
  hooks: {
    title: 'Webhooks',
    hooks: 'Webhooks',
  },
  organizations: {
    title: 'Organizzazione',
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
    title: 'Assistenza',
    community: 'Community',
    customer_ticket: 'Ticket di assistenza',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    "* I vostri utenti attivi mensili (MAU) sono divisi in 3 livelli in base a quante volte effettuano l'accesso durante il ciclo di fatturazione. Ogni livello ha un prezzo diverso per unità MAU.",
  unlimited: 'Illimitato',
  contact: 'Contatta',
  monthly_price: '${{value, number}}/mese',
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} giorno',
  days_other: '{{count, number}} giorni',
  add_on: 'Aggiuntiva',
  tier: 'Livello{{value, number}}: ',
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
  usage_based_beta_feature_tip:
    'Free to use during the beta phase. We will begin charging once we finalize the org usage-based pricing.',
  /** UNTRANSLATED */
  beta: 'Beta',
  /** UNTRANSLATED */
  add_on_beta: 'Add-on (Beta)',
};

export default Object.freeze(quota_table);
