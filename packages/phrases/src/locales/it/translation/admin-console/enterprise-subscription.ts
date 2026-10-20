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
    enterprise_description:
      'La quota Console SSO è definita dal contratto e condivisa tra gli amministratori autorizzati. Gli abbonamenti personali vengono fatturati separatamente.',
    allowance: 'Quota contrattuale',
    quantity_price: 'Quantità × prezzo unitario',
    billing_period: 'Periodo di fatturazione',
    connectors: 'Connettori Console SSO',
    no_connectors: 'Nessun connettore',
    list_price_note:
      'I prezzi unitari di listino escludono imposte, sconti e rettifiche proporzionali. Non rappresentano una fattura futura o un importo dovuto.',
    proration_note:
      'Le aggiunte e rimozioni Console SSO sono ripartite proporzionalmente nella fattura ordinaria. Eliminare l’ultimo connettore a pagamento annulla e salda l’abbonamento.',
    overdue_note:
      'Dopo tre periodi di fatturazione consecutivi non pagati e l’esaurimento dei tentativi, la riscossione viene sospesa e i connettori Console SSO a pagamento vengono rimossi. Aggiornare il pagamento non ripristina la configurazione. Contattaci per assistenza.',
    cancel_on: 'Annullamento previsto per {{date}}',
    other_product: 'Altro abbonamento',
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
