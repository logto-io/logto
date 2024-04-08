const quota_table = {
  quota: {
    title: 'Principi',
    base_price: 'Prezzo base',
    mau_limit: 'Limite di MAU',
    included_tokens: 'Token inclusi',
  },
  application: {
    title: 'Applicazioni',
    total: 'Totale applicazioni',
    m2m: 'Machine-to-machine',
    /** UNTRANSLATED */
    third_party: 'Third-party apps',
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
    mfa: 'Autenticazione a più fattori',
    sso: 'SSO aziendale',
    adaptive_mfa: 'MFA adattativa',
  },
  user_management: {
    title: 'Gestione utenti',
    user_management: 'Gestione utenti',
    roles: 'Ruoli',
    machine_to_machine_roles: 'Ruoli machine-to-machine',
    scopes_per_role: 'Permessi per ruolo',
  },
  organizations: {
    title: 'Organizzazione',
    organizations: 'Organizzazioni',
    monthly_active_organization: 'Organizzazione attive mensili',
    allowed_users_per_org: 'Utenti permessi per org',
    invitation: 'Invito',
    org_roles: 'Ruoli org',
    org_permissions: 'Permessi org',
    just_in_time_provisioning: 'Provisioning just-in-time',
  },
  support: {
    title: 'Conformità e supporto',
    community: 'Community',
    customer_ticket: 'Ticket di assistenza',
    premium: 'Premium',
    email_ticket_support: 'Supporto tramite ticket e-mail',
    soc2_report: 'Rapporto SOC2',
    hipaa_or_baa_report: 'Rapporto HIPAA/BAA',
  },
  developers_and_platform: {
    /** UNTRANSLATED */
    title: 'Developers and platform',
    /** UNTRANSLATED */
    hooks: 'Webhooks',
    /** UNTRANSLATED */
    audit_logs_retention: 'Audit logs retention',
    /** UNTRANSLATED */
    jwt_claims: 'JWT claims',
    /** UNTRANSLATED */
    tenant_members: 'Tenant members',
  },
  unlimited: 'Illimitato',
  contact: 'Contatta',
  monthly_price: '${{value, number}}/mese',
  days_one: '{{count, number}} giorno',
  days_other: '{{count, number}} giorni',
  add_on: 'Aggiuntiva',
  tier: 'Livello{{value, number}}: ',
  paid_token_limit_tip:
    'Logto addebiterà tariffe per le funzionalità che superano il limite della tua quota. Puoi usarlo gratuitamente fino a quando inizieremo a addebitare circa nel secondo trimestre del 2024. Se hai bisogno di più token, ti preghiamo di contattarci. Per default, addebitiamo $80 al mese per ogni milione di token.',
  paid_quota_limit_tip:
    'Logto addebiterà costi per le funzionalità che superano il limite della tua quota. Puoi usarlo gratuitamente fino a quando inizieremo a addebitare circa nel secondo trimestre del 2024.',
  paid_add_on_feature_tip:
    'Questa è una funzionalità aggiuntiva. Puoi usarla gratuitamente fino a quando inizieremo a addebitare circa nel secondo trimestre del 2024.',
  million: '{{value, number}} milioni',
  mau_tip:
    'MAU (utenti attivi mensili) significa il numero di utenti unici che hanno scambiato almeno un token con Logto in un ciclo di fatturazione.',
  tokens_tip:
    'Tutti i tipi di token emessi da Logto, inclusi token di accesso, token di aggiornamento, ecc.',
  mao_tip:
    'MAO (Organizzazione attiva mensile) indica il numero di organizzazioni uniche che hanno almeno un MAU (utente attivo mensile) in un ciclo di fatturazione.',
  /** UNTRANSLATED */
  third_party_tip:
    'Use Logto as your OIDC identity provider for third-party app sign-ins and permission grants.',
  included: '{{value, number}} incluso',
  included_mao: '{{value, number}} MAO inclusi',
  extra_quota_price: 'Quindi ${{value, number}} al mese / ognuno dopo',
  per_month_each: '${{value, number}} al mese / ognuno',
  extra_mao_price: 'Quindi ${{value, number}} per MAO',
  per_month: '${{value, number}} al mese',
  /** UNTRANSLATED */
  per_member: 'Then ${{value, number}} per member',
};

export default Object.freeze(quota_table);
