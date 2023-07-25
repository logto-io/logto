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
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/mese',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} giorno',
  days_other: '{{count, number}} giorni',
  add_on: 'Aggiuntiva',
};

export default quota_table;
