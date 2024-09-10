import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'Piano gratuito',
  free_plan_description:
    'Per progetti secondari e prove iniziali di Logto. Nessuna carta di credito.',
  pro_plan: 'Piano Pro',
  pro_plan_description: 'Per aziende che beneficiano di Logto senza preoccupazioni.',
  enterprise: 'Azienda',
  /** UNTRANSLATED */
  enterprise_description:
    'For large-scale organizations requiring advanced features, full customization, and dedicated support to power mission-critical applications. Tailored to your needs for ultimate security, compliance, and performance.',
  /** UNTRANSLATED */
  admin_plan: 'Admin plan',
  /** UNTRANSLATED */
  dev_plan: 'Development plan',
  current_plan: 'Piano attuale',
  current_plan_description:
    "Ecco il tuo piano attuale. Puoi facilmente visualizzare l'utilizzo del tuo piano, controllare la tua prossima fattura e apportare modifiche al piano, se necessario.",
  plan_usage: 'Utilizzo del piano',
  plan_cycle: "Ciclo del piano: {{period}}. L'utilizzo si rinnova il {{renewDate}}.",
  /** UNTRANSLATED */
  next_bill: 'Your upcoming bill',
  next_bill_hint: 'Per saperne di più sul calcolo, consulta questo <a>articolo</a>.',
  /** UNTRANSLATED */
  next_bill_tip:
    'The prices displayed here are tax-exclusive and may be subject to a slight delay in updates. The tax amount will be calculated based on the information you provide and your local regulatory requirements, and will be shown in your invoices.',
  manage_payment: 'Gestisci pagamento',
  overfill_quota_warning:
    "Hai raggiunto il limite del tuo contingente. Per evitare eventuali problemi, esegui l'upgrade del piano.",
  upgrade_pro: "Esegui l'upgrade a Pro",
  update_payment: 'Aggiorna pagamento',
  payment_error:
    'Rilevato un problema di pagamento. Impossibile elaborare ${{price, number}} per il ciclo precedente. Aggiorna il pagamento per evitare la sospensione del servizio Logto.',
  downgrade: 'Degrado',
  current: 'Attuale',
  upgrade: 'Aggiornamento',
  quota_table,
  billing_history: {
    invoice_column: 'Fatture',
    status_column: 'Stato',
    amount_column: 'Importo',
    invoice_created_date_column: 'Data di creazione fattura',
    invoice_status: {
      void: 'Annullata',
      paid: 'Pagata',
      open: 'Aperta',
      uncollectible: 'Scaduta',
    },
  },
  quota_item,
  downgrade_modal: {
    title: 'Sei sicuro di voler effettuare il degrado?',
    description:
      'Se scegli di passare a <targetName/>, tieni presente che non avrai più accesso al contingente e alle funzionalità che erano presenti in <currentName/>.',
    before: 'Prima: <name/>',
    after: 'Dopo: <name />',
    downgrade: 'Degrado',
  },
  not_eligible_modal: {
    downgrade_title: 'Non sei idoneo per il degrado',
    downgrade_description:
      'Assicurati di soddisfare i seguenti criteri prima di eseguire il degrado al piano <name/>.',
    downgrade_help_tip: 'Hai bisogno di aiuto per il degrado? <a>Contattaci</a>.',
    upgrade_title: 'Promemoria amichevole per i nostri apprezzati early adopter',
    upgrade_description:
      "Attualmente stai utilizzando più di quanto consentito da <name />. Logto è ora ufficiale, con funzionalità personalizzate per ciascun piano. Prima di considerare l'aggiornamento al <name />, assicurati di soddisfare i seguenti criteri prima dell'aggiornamento.",
    upgrade_pro_tip: " Oppure valuta l'aggiornamento al Piano Pro.",
    upgrade_help_tip: "Hai bisogno di aiuto per l'aggiornamento? <a>Contattaci</a>.",
    a_maximum_of: 'Un massimo di <item/>',
  },
  upgrade_success: 'Aggiornamento effettuato con successo a <name/>',
  downgrade_success: 'Degrado effettuato con successo a <name/>',
  subscription_check_timeout:
    "Il controllo dell'abbonamento è scaduto. Si prega di riprovare più tardi.",
  no_subscription: 'Nessuna sottoscrizione',
};

export default Object.freeze(subscription);
