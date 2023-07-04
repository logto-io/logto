const subscription = {
  free_plan: 'Piano gratuito',
  free_plan_description:
    'Per progetti collaterali e prove iniziali di Logto. Senza carta di credito.',
  hobby_plan: 'Piano Hobby',
  hobby_plan_description: 'Per sviluppatori individuali o ambienti di sviluppo.',
  pro_plan: 'Piano Pro',
  pro_plan_description: 'Per le imprese che traggono beneficio da Logto senza preoccupazioni.',
  enterprise: 'Enterprise',
  current_plan: 'Piano attuale',
  current_plan_description:
    "Questo è il tuo piano attuale. Puoi visualizzare l'uso del piano, la tua prossima fattura e passare a un piano di livello superiore se desideri.",
  plan_usage: 'Uso del piano',
  plan_cycle: "Ciclo del piano: {{period}}. L'uso si rinnova il {{renewDate}}.",
  next_bill: 'La tua prossima fattura',
  next_bill_hint: 'Per saperne di più sul calcolo, consulta questo <a>articolo</a>.',
  next_bill_tip:
    "La tua prossima fattura include il prezzo base del tuo piano per il mese successivo, oltre al costo del tuo utilizzo moltiplicato per il prezzo dell'unità MAU nelle varie fasce.",
  manage_payment: 'Gestisci il pagamento',
  overfill_quota_warning:
    'Hai raggiunto il limite della tua quota. Per evitare problemi, aggiorna il piano.',
  upgrade_pro: 'Passa a Pro',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Rilevato problema di pagamento. Impossibile elaborare ${{price, number}} per il ciclo precedente. Aggiorna il pagamento per evitare la sospensione del servizio Logto.',
  downgrade: 'Passa a una versione precedente',
  current: 'Attuale',
  buy_now: 'Acquista ora',
  contact_us: 'Contattaci',
  quota_table: {
    quota: {
      title: 'Quota',
      tenant_limit: 'Limite tenant',
      base_price: 'Prezzo base',
      mau_unit_price: '* Prezzo unitario MAU',
      mau_limit: 'Limite MAU',
    },
    application: {
      title: 'Applicazioni',
      total: 'Totale',
      m2m: 'Da macchina a macchina',
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
      omni_sign_in: 'Accesso onnicomprensivo',
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
      title: 'Log di revisione',
      retention: 'Conservazione',
    },
    hooks: {
      title: 'Hooks',
      amount: 'Montante',
    },
    support: {
      title: 'Supporto',
      community: 'Comunità',
      customer_ticket: 'Ticket cliente',
      premium: 'Premium',
    },
    mau_unit_price_footnote:
      '* I nostri prezzi unitari possono variare in base alle risorse effettive consumate e Logto si riserva il diritto di spiegare eventuali variazioni dei prezzi unitari.',
    unlimited: 'Illimitato',
    contact: 'Contatto',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '${{value, number}}/mese',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '${{value, number}}/MAU',
    days_one: '{{count, number}} giorno',
    days_other: '{{count, number}} giorni',
    add_on: 'Componente aggiuntivo',
  },
  downgrade_form: {
    allowed_title: 'Sei sicuro di voler tornare a una versione precedente?',
    allowed_description:
      'Passando alla versione del piano {{plan}}, non avrai più accesso ai seguenti vantaggi.',
    not_allowed_title: 'Non sei idoneo per il downgrade',
    not_allowed_description:
      'Assicurati di soddisfare i seguenti requisiti prima di passare alla versione del piano {{plan}}. Una volta che hai conciliato e soddisfatto i requisiti, sarai idoneo per il downgrade.',
    confirm_downgrade: 'Effettua comunque il downgrade',
  },
};

export default subscription;
