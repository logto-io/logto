const quota_table = {
  quota: {
    title: 'Quota',
    tenant_limit: 'Limite del tenant',
    base_price: 'Prezzo base',
    mau_unit_price: '* Prezzo unitario MAU',
    mau_limit: 'Limite MAU',
  },
  application: {
    title: 'Applicazioni',
    total: 'Totale',
    m2m: 'Machine to machine',
  },
  resource: {
    title: 'Risorse API',
    resource_count: 'Conteggio risorse',
    scopes_per_resource: 'Permessi per risorsa',
  },
  branding: {
    title: 'Branding',
    custom_domain: 'Dominio personalizzato',
  },
  user_authn: {
    title: 'Autenticazione utente',
    omni_sign_in: 'Accesso omni',
    built_in_email_connector: 'Connettore email integrato',
    social_connectors: 'Connettori sociali',
    standard_connectors: 'Connettori standard',
  },
  roles: {
    title: 'Ruoli',
    roles: 'Ruoli',
    scopes_per_role: 'Permessi per ruolo',
  },
  audit_logs: {
    title: 'Log di audit',
    retention: 'Conservazione',
  },
  hooks: {
    title: 'Hooks',
    amount: 'Quantità',
  },
  support: {
    title: 'Supporto',
    community: 'Community',
    customer_ticket: 'Ticket per il cliente',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* I nostri prezzi unitari possono variare in base alle risorse effettivamente consumate e Logto si riserva il diritto di spiegare eventuali variazioni dei prezzi unitari.',
  unlimited: 'Illimitato',
  contact: 'Contatto',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/mese',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} giorno',
  days_other: '{{count, number}} giorni',
  add_on: 'Aggiungi',
};

export default quota_table;
