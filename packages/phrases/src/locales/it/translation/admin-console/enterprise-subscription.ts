const enterprise_subscription = {
  page_title: 'Abbonamento',
  title: 'Gestisci il tuo abbonamento',
  subtitle:
    'Questo serve per gestire il tuo abbonamento multi-tenant e la cronologia delle fatturazioni',
  tab: {
    subscription: 'Abbonamento',
    billing_history: 'Storico fatturazioni',
  },
  subscription: {
    title: 'Abbonamento',
    description:
      'Tieni facilmente traccia del tuo utilizzo, vedi la prossima fattura e rivedi il tuo contratto originale.',
    enterprise_plan_title: 'Piano Enterprise',
    enterprise_plan_description:
      "Questo è il tuo abbonamento al piano Enterprise e questa quota è condivisa tra i tenant. L'utilizzo potrebbe essere soggetto a un leggero ritardo negli aggiornamenti.",
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
