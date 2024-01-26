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
      "Imposta il nome dell'inquilino e visualizza la regione in cui sono ospitati i tuoi dati e il tipo di inquilino.",
    tenant_id: 'ID Inquilino',
    tenant_name: 'Nome Inquilino',
    tenant_region: 'Regione di hosting',
    tenant_region_tip:
      'Le risorse del tuo inquilino sono ospitate in {{region}}. <a>Scopri di più</a>',
    environment_tag_development: 'Svil',
    environment_tag_production: 'Prod',
    tenant_type: 'Tipo inquilino',
    development_description:
      'Solo per scopi di test e non dovrebbe essere utilizzato in produzione. Non è richiesto alcun abbonamento. Ha tutte le funzionalità professionale ma ha delle limitazioni come un banner di accesso. <a>Per saperne di più</a>',
    production_description:
      'Destinato alle app utilizzate dagli utenti finali e potrebbe richiedere un abbonamento a pagamento. <a>Per saperne di più</a>',
    tenant_info_saved: "Le informazioni dell'inquilino sono state salvate correttamente.",
  },
  full_env_tag: {
    development: 'Sviluppo',
    production: 'Produzione',
  },
  deletion_card: {
    title: 'ELIMINA',
    tenant_deletion: 'Elimina inquilino',
    tenant_deletion_description:
      "L'eliminazione dell'inquilino comporterà la rimozione permanente di tutti i dati utente e le configurazioni associate. Procedere con cautela.",
    tenant_deletion_button: 'Elimina inquilino',
  },
  create_modal: {
    title: 'Crea nuovo inquilino',
    subtitle:
      'Crea un nuovo inquilino con risorse e utenti isolati. Le regioni dei dati ospitati e i tipi di inquilino non possono essere modificati dopo la creazione.',
    tenant_usage_purpose: 'Per cosa desideri utilizzare questo inquilino?',
    development_description:
      'Solo per scopi di test e non dovrebbe essere utilizzato in produzione. Non è richiesto alcun abbonamento.',
    development_hint:
      'Ha tutte le funzionalità professionale ma ha delle limitazioni come un banner di accesso.',
    production_description:
      'Utilizzato dagli utenti finali e potrebbe richiedere un abbonamento a pagamento.',
    available_plan: 'Piano disponibile:',
    create_button: 'Crea inquilino',
    tenant_name_placeholder: 'Il mio inquilino',
  },
  dev_tenant_migration: {
    title:
      'Ora puoi provare gratuitamente le nostre funzionalità Pro creando un nuovo "Inquilino di sviluppo"!',
    affect_title: 'Come ti influisce questo?',
    hint_1:
      'Stiamo sostituendo le vecchie <strong>etichette di ambiente</strong> con due nuovi tipi di inquilino: <strong>“Sviluppo”</strong> e <strong>“Produzione”</strong>.',
    hint_2:
      'Per garantire una transizione senza soluzione di continuità e un funzionamento ininterrotto, tutti gli inquilini creati in precedenza saranno elevati al tipo di inquilino <strong>Produzione</strong> insieme al tuo abbonamento precedente.',
    hint_3: 'Niente paura, tutte le altre impostazioni rimarranno invariate.',
    about_tenant_type: 'Informazioni sul tipo di inquilino',
  },
  delete_modal: {
    title: 'Elimina inquilino',
    description_line1:
      "Sei sicuro di voler eliminare il tuo inquilino \"<span>{{name}}</span>\" con l'etichetta di suffisso dell'ambiente \"<span>{{tag}}</span>\"? Quest'azione non può essere annullata e comporterà l'eliminazione permanente di tutti i tuoi dati e le informazioni dell'account.",
    description_line2:
      "Prima di eliminare l'account, forse possiamo aiutarti. <span><a>Contattaci via e-mail</a></span>",
    description_line3:
      'Se vuoi procedere, inserisci il nome dell\'inquilino "<span>{{name}}</span>" per confermare.',
    delete_button: 'Elimina definitivamente',
    cannot_delete_title: 'Impossibile eliminare questo locatario',
    cannot_delete_description:
      'Spiacente, al momento non è possibile eliminare questo inquilino. Verifica di essere nel Piano Gratuito e di aver saldato tutte le fatture pendenti.',
  },
  tenant_landing_page: {
    title: 'Non hai ancora creato un inquilino',
    description:
      'Per iniziare a configurare il tuo progetto con Logto, crea un nuovo inquilino. Se hai bisogno di uscire o eliminare il tuo account, clicca sul pulsante avatar in alto a destra.',
    create_tenant_button: 'Crea inquilino',
  },
  status: {
    mau_exceeded: 'MAU Superato',
    suspended: 'Sospeso',
    overdue: 'Scaduto',
  },
  tenant_suspended_page: {
    title: "Inquilino sospeso. Contattaci per ripristinare l'accesso.",
    description_1:
      'Ci dispiace molto informarti che il tuo account inquilino è stato temporaneamente sospeso a causa di un utilizzo improprio, inclusi superamenti dei limiti di MAU, pagamenti in ritardo o altre azioni non autorizzate.',
    description_2:
      'Se necessiti ulteriori chiarimenti, hai qualche preoccupazione o desideri ripristinare la funzionalità completa e sbloccare i tuoi inquilini, ti preghiamo di contattarci immediatamente.',
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
