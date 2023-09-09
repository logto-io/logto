import paywall from './paywall.js';

const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: 'Aggiorna piano',
  compare_plans: 'Confronta i piani',
  get_started: {
    title: 'Inizia il tuo percorso di identità senza interruzioni con un piano gratuito!',
    description:
      "Il piano gratuito è perfetto per provare Logto nei tuoi progetti personali o test. Per sfruttare al massimo le capacità di Logto per il tuo team, esegui l'upgrade per ottenere l'accesso illimitato alle funzionalità premium: utilizzo illimitato di MAU, integrazione da macchina a macchina, gestione RBAC, registri di audit a lungo termine, ecc. <a>Visualizza tutti i piani</a>",
  },
  create_tenant: {
    title: 'Seleziona il piano del tenant',
    description:
      'Logto offre opzioni competitive di piani con una struttura dei prezzi innovativa e conveniente progettata per le aziende in crescita. <a>Scopri di più</a>',
    base_price: 'Prezzo base',
    monthly_price: '{{value, number}}/mese',
    mau_unit_price: 'Prezzo unitario MAU',
    view_all_features: 'Visualizza tutte le funzionalità',
    select_plan: 'Seleziona <name/>',
    free_tenants_limit: 'Fino a {{count, number}} tenant gratuito',
    free_tenants_limit_other: 'Fino a {{count, number}} tenant gratuiti',
    most_popular: 'Più popolare',
    upgrade_success: 'Aggiornamento a <name/> effettuato con successo',
  },
  mau_exceeded_modal: {
    title: 'MAU ha superato il limite. Aggiorna il tuo piano.',
    notification:
      'Il tuo MAU attuale ha superato il limite di <planName/>. Aggiorna al piano premium tempestivamente per evitare la sospensione del servizio Logto.',
    update_plan: 'Aggiorna piano',
  },
  payment_overdue_modal: {
    title: 'Pagamento della fattura in ritardo',
    notification:
      "Oops! Il pagamento della fattura dell'affittuario <span>{{name}}</span> è fallito. Si prega di pagare tempestivamente la fattura per evitare la sospensione del servizio Logto.",
    unpaid_bills: 'Fatture non pagate',
    update_payment: 'Aggiorna pagamento',
  },
  paywall,
};

export default Object.freeze(upsell);
