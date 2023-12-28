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
    machine_to_machine_roles: 'Ruoli machine-to-machine',
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
  unlimited: 'Illimitato',
  contact: 'Contatta',
  monthly_price: '${{value, number}}/mese',
  days_one: '{{count, number}} giorno',
  days_other: '{{count, number}} giorni',
  add_on: 'Aggiuntiva',
  tier: 'Livello{{value, number}}: ',
  free_token_limit_tip: 'Gratuito per {{value}}M token rilasciati.',
  paid_token_limit_tip:
    'Gratuito per {{value}}M token rilasciati. Potremmo aggiungere costi se superi {{value}}M token una volta che finalizziamo i prezzi.',
  paid_quota_limit_tip:
    'Potremmo aggiungere costi per funzionalità che superano il limite di quota come componenti aggiuntivi una volta che finalizziamo i prezzi.',
  beta_feature_tip:
    'Gratuito durante la fase beta. Inizieremo a addebitare una volta che finalizziamo i prezzi delle componenti aggiuntive.',
  usage_based_beta_feature_tip:
    "Gratuito durante la fase beta. Inizieremo a addebitare una volta che finalizziamo i prezzi basati sull'utilizzo dell'org.",
  beta: 'Beta',
  add_on_beta: 'Componente Aggiuntivo (Beta)',
  million: '{{value, number}} milioni',
  mau_tip:
    'MAU (utente attivo mensile) significa il numero di utenti unici che hanno scambiato almeno un token con Logto in un mese di fatturazione.',
  tokens_tip:
    'Tutti i tipi di token emessi da Logto, inclusi token di accesso, token di aggiornamento, ecc.',
};

export default Object.freeze(quota_table);
