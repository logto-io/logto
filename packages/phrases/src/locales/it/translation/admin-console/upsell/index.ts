import add_on from './add-on.js';
import featured_plan_content from './featured-plan-content.js';
import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'Aggiorna piano',
  compare_plans: 'Confronta i piani',
  view_plans: 'Visualizza piani',
  create_tenant: {
    title: 'Seleziona il piano del tenant',
    description:
      'Logto offre opzioni competitive di piani con una struttura dei prezzi innovativa e conveniente progettata per le aziende in crescita. <a>Scopri di più</a>',
    base_price: 'Prezzo base',
    monthly_price: '{{value, number}}/mese',
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
  token_exceeded_modal: {
    title: 'Utilizzo dei token ha superato il limite. Aggiorna il tuo piano.',
    notification:
      'Hai superato il limite di utilizzo dei token <planName/>. Gli utenti non saranno in grado di accedere correttamente al servizio Logto. Si prega di aggiornare tempestivamente il proprio piano a premium per evitare qualsiasi inconveniente.',
  },
  payment_overdue_modal: {
    title: 'Pagamento della fattura in ritardo',
    notification:
      "Oops! Il pagamento della fattura dell'affittuario <span>{{name}}</span> è fallito. Si prega di pagare tempestivamente la fattura per evitare la sospensione del servizio Logto.",
    unpaid_bills: 'Fatture non pagate',
    update_payment: 'Aggiorna pagamento',
  },
  add_on_quota_item: {
    api_resource: 'Risorsa API',
    machine_to_machine: 'applicazione macchina-macchina',
    tokens: '{{limit}}M token',
    tenant_member: 'membro del tenant',
  },
  charge_notification_for_quota_limit:
    "Hai superato il limite di quota {{item}}. Logto aggiungerà addebiti per l'uso oltre il limite di quota. La fatturazione inizierà il giorno in cui verrà rilasciato il nuovo design dei prezzi dell'addon. <a>Ulteriori informazioni</a>",
  paywall,
  featured_plan_content,
  add_on,
  convert_to_production_modal: {
    title: 'Stai per cambiare il tuo tenant di sviluppo in tenant di produzione',
    description:
      'Pronto per il lancio? Convertire questo tenant di sviluppo in un tenant di produzione sblocca tutte le funzionalità',
    benefits: {
      stable_environment: "Per gli utenti finali: Un ambiente stabile per l'uso reale.",
      keep_pro_features:
        'Mantieni le funzionalità Pro: Stai per abbonarti al piano Pro. <a>Visualizza funzionalità Pro.</a>',
      no_dev_restrictions:
        'Nessuna restrizione di sviluppo: Rimuove i limiti del sistema di entità e risorse e il banner di accesso.',
    },
    cards: {
      dev_description: 'Per scopi di test',
      prod_description: 'Produzione reale',
      convert_label: 'convertire',
    },
    button: 'Converti al tenant di produzione',
  },
};

export default Object.freeze(upsell);
