const tenants = {
  title: 'Impostazioni',
  description:
    "Gestisci efficacemente le impostazioni dell'inquilino e personalizza il tuo dominio.",
  tabs: {
    settings: 'Impostazioni',
    domains: 'Domini',
    subscription: 'Piano e fatturazione',
    billing_history: 'Storico fatturazione',
  },
  settings: {
    title: 'IMPOSTAZIONI',
    description:
      "Imposta il nome del tenant e visualizza la tua regione di hosting e l'etichetta dell'ambiente.",
    tenant_id: 'ID Tenant',
    tenant_name: 'Nome Tenant',
    tenant_region: 'Regione di hosting',
    tenant_region_tip: 'I tuoi risorse inquilino sono ospitate in {{region}}. <a>Scopri di più</a>',
    environment_tag: 'Tag Ambiente',
    environment_tag_description:
      'I tag non alterano il servizio. Semplicemente ti guidano a distinguere vari ambienti.',
    environment_tag_development: 'Svil',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    development_description:
      "L'ambiente di sviluppo viene principalmente utilizzato per i test e include tutte le funzionalità professionali, ma presenta filigrane durante l'esperienza di accesso. <a>Scopri di più</a>",
    tenant_info_saved: "Le informazioni dell'inquilino sono state salvate correttamente.",
  },
  full_env_tag: {
    development: 'Sviluppo',
    production: 'Produzione',
  },
  deletion_card: {
    title: 'ELIMINA',
    tenant_deletion: 'Elimina tenant',
    tenant_deletion_description:
      "L'eliminazione del tenant comporterà la rimozione permanente di tutti i dati utente e le configurazioni associate. Procedere con cautela.",
    tenant_deletion_button: 'Elimina tenant',
  },
  create_modal: {
    title: 'Crea nuovo tenant',
    subtitle_deprecated: 'Crea un nuovo tenant per separare risorse e utenti.',
    subtitle:
      'Crea un nuovo inquilino con risorse e utenti isolati. Le regioni dei dati ospitati e i tipi di inquilino non possono essere modificati dopo la creazione.',
    tenant_usage_purpose: 'Per cosa desideri utilizzare questo tenant?',
    development_description:
      "L'ambiente di sviluppo viene principalmente utilizzato per i test e non dovrebbe essere utilizzato nell'ambiente di produzione.",
    development_hint:
      "L'ambiente di sviluppo viene principalmente utilizzato per i test e non deve essere utilizzato nell'ambiente di produzione.",
    production_description:
      'La produzione è dove il software in uso dagli utenti finali e potrebbe richiedere un abbonamento a pagamento.',
    available_plan: 'Piano disponibile:',
    create_button: 'Crea tenant',
    tenant_name_placeholder: 'Il mio tenant',
  },
  notification: {
    allow_pro_features_title:
      'Ora puoi accedere a <span>tutte le funzionalità di Logto Pro</span> nel tuo tenant di sviluppo!',
    allow_pro_features_description: 'È completamente gratuito, senza periodo di prova, per sempre!',
    explore_all_features: 'Esplora tutte le funzionalità',
    impact_title: 'Questo ha un impatto su di me?',
    staging_env_hint:
      'L\'etichetta del tuo inquilino è stata aggiornata da "<strong>Staging</strong>" a "<strong>Produzione</strong>", ma questa modifica non influenzerà la tua configurazione attuale.',
    paid_tenant_hint_1:
      'Con l\'iscrizione al piano Logto Hobby, l\'etichetta precedente dell\'inquilino "<strong>Sviluppo</strong>" passerà a "<strong>Produzione</strong>", senza alcun effetto sulla configurazione esistente.',
    paid_tenant_hint_2:
      'Se sei ancora nella fase di sviluppo, puoi creare un nuovo tenant di sviluppo per accedere a più funzionalità professionali.',
    paid_tenant_hint_3:
      "Se sei nella fase di produzione o in un ambiente di produzione, è necessario sottoscrivere un piano specifico, quindi non c'è nulla che devi fare in questo momento.",
    paid_tenant_hint_4:
      'Non esitare a contattarci se hai bisogno di aiuto! Grazie per aver scelto Logto!',
  },
  delete_modal: {
    title: 'Elimina tenant',
    description_line1:
      'Sei sicuro di voler eliminare il tuo tenant "<span>{{name}}</span>" con l\'etichetta di suffisso dell\'ambiente "<span>{{tag}}</span>"? Questa azione non può essere annullata e comporterà l\'eliminazione permanente di tutti i tuoi dati e le informazioni dell\'account.',
    description_line2:
      "Prima di eliminare l'account, forse possiamo aiutarti. <span><a>Contattaci via e-mail</a></span>",
    description_line3:
      'Se vuoi procedere, inserisci il nome del tenant "<span>{{name}}</span>" per confermare.',
    delete_button: 'Elimina definitivamente',
    cannot_delete_title: 'Impossibile eliminare questo locatario',
    cannot_delete_description:
      'Spiacente, al momento non è possibile eliminare questo locatario. Verifica di essere nel Piano Gratuito e di aver saldato tutte le fatture pendenti.',
  },
  tenant_landing_page: {
    title: 'Non hai ancora creato un tenant',
    description:
      'Per iniziare a configurare il tuo progetto con Logto, crea un nuovo tenant. Se hai bisogno di uscire o eliminare il tuo account, clicca sul pulsante avatar in alto a destra.',
    create_tenant_button: 'Crea tenant',
  },
  status: {
    mau_exceeded: 'MAU Superato',
    suspended: 'Sospeso',
    overdue: 'Scaduto',
  },
  tenant_suspended_page: {
    title: "Tenant sospeso. Contattaci per ripristinare l'accesso.",
    description_1:
      'Ci dispiace molto informarti che il tuo account tenant è stato temporaneamente sospeso a causa di un utilizzo improprio, inclusi superamenti dei limiti di MAU, pagamenti in ritardo o altre azioni non autorizzate.',
    description_2:
      'Se necessiti ulteriori chiarimenti, hai qualche preoccupazione o desideri ripristinare la funzionalità completa e sbloccare i tuoi tenant, ti preghiamo di contattarci immediatamente.',
  },
  signing_keys: {
    title: 'CHIAVI DI FIRMA',
    description: 'Gestisci in modo sicuro le chiavi di firma nel tuo inquilino.',
    type: {
      private_key: 'Chiavi private OIDC',
      cookie_key: 'Chiavi dei cookie OIDC',
    },
    private_keys_in_use: 'Chiavi private in uso',
    cookie_keys_in_use: 'Chiavi dei cookie in uso',
    rotate_private_keys: 'Ruota le chiavi private',
    rotate_cookie_keys: 'Ruota le chiavi dei cookie',
    rotate_private_keys_description:
      'Questa azione creerà una nuova chiave di firma privata, ruoterà la chiave attuale e rimuoverà la chiave precedente. I tuoi token JWT firmati con la chiave attuale rimarranno validi fino alla cancellazione o a un altro ciclo di rotazione.',
    rotate_cookie_keys_description:
      'Questa azione creerà una nuova chiave dei cookie, ruoterà la chiave attuale e rimuoverà la chiave precedente. I tuoi cookie con la chiave attuale rimarranno validi fino alla cancellazione o a un altro ciclo di rotazione.',
    select_private_key_algorithm: "Seleziona l'algoritmo di firma per la nuova chiave privata",
    rotate_button: 'Ruota',
    table_column: {
      id: 'ID',
      status: 'Stato',
      algorithm: 'Algoritmo di firma della chiave',
    },
    status: {
      current: 'Attuale',
      previous: 'Precedente',
    },
    reminder: {
      rotate_private_key:
        'Sei sicuro di voler ruotare le <strong>chiavi private OIDC</strong>? I nuovi token JWT emessi saranno firmati dalla nuova chiave. I token JWT esistenti rimarranno validi finché non ruoti nuovamente.',
      rotate_cookie_key:
        'Sei sicuro di voler ruotare le <strong>chiavi dei cookie OIDC</strong>? I nuovi cookie generati nelle sessioni di accesso saranno firmati dalla nuova chiave dei cookie. I cookie esistenti rimarranno validi finché non ruoti nuovamente.',
      delete_private_key:
        'Sei sicuro di voler eliminare la <strong>chiave privata OIDC</strong>? I token JWT esistenti firmati con questa chiave privata non saranno più validi.',
      delete_cookie_key:
        'Sei sicuro di voler eliminare la <strong>chiave dei cookie OIDC</strong>? Le sessioni di accesso precedenti con i cookie firmati con questa chiave dei cookie non saranno più valide. È richiesta una nuova autenticazione per questi utenti.',
    },
    messages: {
      rotate_key_success: 'Chiavi di firma ruotate con successo.',
      delete_key_success: 'Chiave eliminata con successo.',
    },
  },
};

export default Object.freeze(tenants);
