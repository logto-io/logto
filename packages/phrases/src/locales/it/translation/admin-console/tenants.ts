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
    /** UNTRANSLATED */
    description: 'Set the tenant name and view your data hosted region and tenant type.',
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
    /** UNTRANSLATED */
    tenant_type: 'Tenant type',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required. It has all the pro features but has limitations like a sign-in banner. <a>Learn more</a>",
    /** UNTRANSLATED */
    production_description:
      'Intended for apps that are being used by end-users and may require a paid subscription. <a>Learn more</a>',
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
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required.",
    /** UNTRANSLATED */
    development_hint: 'It has all the pro features but has limitations like a sign-in banner.',
    /** UNTRANSLATED */
    production_description: 'For use by end-users and may require a paid subscription.',
    available_plan: 'Piano disponibile:',
    create_button: 'Crea tenant',
    tenant_name_placeholder: 'Il mio tenant',
  },
  dev_tenant_migration: {
    /** UNTRANSLATED */
    title:
      'You can now try our Hobby and Pro features for free by creating a new "Development tenant"!',
    /** UNTRANSLATED */
    affect_title: 'How does this affect you?',
    /** UNTRANSLATED */
    hint_1:
      'We are replacing the old <strong>environment tags</strong> with two new tenant types: <strong>“Development”</strong> and <strong>“Production”</strong>.',
    /** UNTRANSLATED */
    hint_2:
      'To ensure a seamless transition and uninterrupted functionality, all early-created tenants will be elevated to the <strong>Production</strong> tenant type along with your previous subscription.',
    /** UNTRANSLATED */
    hint_3: "Don't worry, all your other settings will remain the same.",
    /** UNTRANSLATED */
    about_tenant_type: 'About tenant type',
  },
  dev_tenant_notification: {
    /** UNTRANSLATED */
    title:
      'You can now access <a>all features of Logto Hobby and Pro</a> in your development tenant!',
    /** UNTRANSLATED */
    description: "It's completely free, with no trial period – forever!",
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
