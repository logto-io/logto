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
    tenant_id: 'ID Tenant',
    tenant_name: 'Nome Tenant',
    environment_tag: 'Tag Ambiente',
    environment_tag_description:
      'I tag non alterano il servizio. Semplicemente ti guidano a distinguere vari ambienti.',
    environment_tag_development: 'Svil',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: "Le informazioni dell'inquilino sono state salvate correttamente.",
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
    subtitle: 'Crea un nuovo tenant per separare risorse e utenti.',
    create_button: 'Crea tenant',
    tenant_name_placeholder: 'Il mio tenant',
  },
  delete_modal: {
    title: 'Elimina tenant',
    description_line1:
      'Sei sicuro di voler eliminare il tuo tenant "<span>{{name}}</span>" con il tag di suffisso dell\'ambiente "<span>{{tag}}</span>"? Questa azione non può essere annullata e comporterà l\'eliminazione permanente di tutti i tuoi dati e le informazioni dell\'account.',
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
    /** UNTRANSLATED */
    title: 'SIGNING KEYS',
    /** UNTRANSLATED */
    description: 'Securely manage signing keys in your tenant.',
    type: {
      /** UNTRANSLATED */
      private_key: 'OIDC private keys',
      /** UNTRANSLATED */
      cookie_key: 'OIDC cookie keys',
    },
    /** UNTRANSLATED */
    private_keys_in_use: 'Private keys in use',
    /** UNTRANSLATED */
    rotate_private_keys: 'Rotate private keys',
    /** UNTRANSLATED */
    rotate_private_keys_description:
      'This will rotate the currently used private keys. Your {{entities}} with previous private keys will stay valid until you delete it.',
    /** UNTRANSLATED */
    select_private_key_algorithm: 'Select signing key algorithm for private keys',
    /** UNTRANSLATED */
    rotate_button: 'Rotate',
    table_column: {
      /** UNTRANSLATED */
      id: 'ID',
      /** UNTRANSLATED */
      status: 'Status',
      /** UNTRANSLATED */
      algorithm: 'Signing key algorithm',
    },
    status: {
      /** UNTRANSLATED */
      current: 'Current',
      /** UNTRANSLATED */
      previous: 'Previous',
    },
    reminder: {
      /** UNTRANSLATED */
      rotate:
        'Are you sure you want to rotate the <strong>{{key}}</strong>? This will require all your apps and APIs to use the new signing key. Existing {{entities}} stay valid until you rotate again.',
      /** UNTRANSLATED */
      delete:
        'Are you sure you want to delete the <strong>{{key}}</strong>? Existing {{entities}} signed with this signing key will no longer be valid.',
    },
    signed_entity: {
      /** UNTRANSLATED */
      tokens: 'JWT tokens',
      /** UNTRANSLATED */
      cookies: 'cookies',
    },
  },
};

export default Object.freeze(tenants);
