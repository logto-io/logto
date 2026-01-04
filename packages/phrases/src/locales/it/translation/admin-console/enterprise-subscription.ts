const enterprise_subscription = {
  page_title: 'Abbonamento',
  title: 'Gestisci il tuo abbonamento',
  subtitle:
    'Visualizza e gestisci i dettagli del tuo abbonamento multi-tenant e le informazioni di fatturazione.',
  tab: {
    subscription: 'Abbonamento',
    billing_history: 'Storico fatturazioni',
  },
  subscription: {
    title: 'Abbonamento',
    description:
      'Rivedi i dettagli di utilizzo del tuo attuale piano di abbonamento e le informazioni di fatturazione.',
    enterprise_plan_title: 'Piano Enterprise',
    enterprise_plan_description:
      'Questo è il tuo abbonamento al Piano Enterprise e questa quota è condivisa tra tutti i tenant sotto il tuo abbonamento aziendale.',
    add_on_title: 'Componenti aggiuntivi a consumo',
    add_on_description:
      'Questi sono componenti aggiuntivi a consumo basati sul tuo contratto o sulle tariffe standard a consumo di Logto. Ti verrà addebitato in base al tuo utilizzo effettivo.',
    included: 'Incluso',
    over_quota: 'Fuori quota',
    basic_plan_column_title: {
      product: 'Prodotto',
      usage: 'Utilizzo',
      quota: 'Quota',
    },
    add_on_column_title: {
      product: 'Prodotto',
      unit_price: 'Prezzo unitario',
      quantity: 'Quantità',
      total_price: 'Totale',
    },
    add_on_sku_price: '${{price}}/mese',
    private_region_title: 'Istanza cloud privata ({{regionName}})',
    shared_cross_tenants: 'Tra tenant',
  },
};

export default Object.freeze(enterprise_subscription);
