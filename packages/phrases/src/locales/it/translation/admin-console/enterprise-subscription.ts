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
  user_subscriptions: {
    description:
      'Visualizza gli abbonamenti personali e la copertura Enterprise contrattuale, indipendentemente dal tenant selezionato.',
    personal_title: 'Abbonamenti personali',
    personal_description: 'Abbonamenti fatturati al tuo account, inclusi quelli passati.',
    price: 'Prezzo',
    billing_period: 'Periodo di fatturazione',
    list_price_note:
      'I prezzi escludono imposte e sconti. Le modifiche vengono calcolate in modo proporzionale nella prossima fattura.',
    overdue_note:
      'Il pagamento è scaduto. Se resta non pagato, l’abbonamento può essere sospeso e le sue funzionalità a pagamento rimosse.',
    cancel_on: 'Annullamento previsto per {{date}}',
    other_product: 'Altro abbonamento',
    enterprise_invoices_description:
      'Fatture del tuo contratto Enterprise. Seleziona una fattura per visualizzarla e scaricare la fattura o la ricevuta.',
    personal_invoices_description:
      'Fatture degli abbonamenti addebitati al tuo account, inclusi gli abbonamenti passati. Seleziona una fattura per visualizzarla e scaricare la fattura o la ricevuta.',
    credit_note:
      'I crediti derivanti da rimozioni o ripartizioni proporzionali riducono le fatture successive e non vengono necessariamente rimborsati subito sul tuo metodo di pagamento.',
    invoice_link_unavailable:
      'La pagina di questa fattura non è disponibile. Contattaci se ti serve una copia.',
    status: {
      active: 'Attivo',
      trialing: 'In prova',
      past_due: 'Scaduto da pagare',
      unpaid: 'Non pagato',
      canceled: 'Annullato',
      incomplete: 'Incompleto',
      incomplete_expired: 'Scaduto',
      paused: 'In pausa',
    },
  },
};

export default Object.freeze(enterprise_subscription);
