const tenants = {
  title: 'Impostazioni',
  description:
    "Gestisci efficacemente le impostazioni dell'inquilino e personalizza il tuo dominio.",
  oss_description:
    'Modifica qui le impostazioni del tuo account e gestisci le tue informazioni personali per garantire la sicurezza del tuo account.',
  tabs: {
    settings: 'Impostazioni',
    members: 'Membri',
    domains: 'Domini',
    oidc_configs: 'Configurazioni OIDC',
    subscription: 'Piano e fatturazione',
    billing_history: 'Storico fatturazione',
    license: 'Licenza',
  },
  license: {
    purchase_title: 'PIANI SELF-HOSTED',
    purchase_description:
      'I piani Pro e Azienda self-hosted sbloccano funzionalità a pagamento sulla tua istanza, come nascondere il branding Logto, usare la tua UI, il SSO avviato dall’IdP, la collaborazione nella console e applicazioni SAML illimitate. Acquista un piano per ottenere la tua chiave di licenza.',
    purchase_button: 'Vedi i piani self-hosted',
    install_title: 'INSTALLA LICENZA',
    install_description:
      'Incolla la chiave di licenza che hai ricevuto dopo aver acquistato un piano self-hosted.',
    install_button: 'Installa licenza',
    key_field: 'Chiave di licenza',
    key_field_description:
      'La chiave viene verificata sulla tua istanza e non la lascia mai. Ottieni una chiave nuova dal tuo account Logto se quella che hai è scaduta.',
    key_placeholder: 'Incolla qui la tua chiave di licenza',
    installed_toast: 'Licenza installata con successo.',
    details_title: 'LICENZA',
    details_description: 'La licenza installata su questa istanza e ciò che concede.',
    plan_field: 'Piano',
    environment_field: 'Ambiente',
    environment_production: 'Produzione',
    environment_non_production: 'Non di produzione',
    expires_at_field: 'Scade il',
    installed_at_field: 'Installata il',
    last_refreshed_at_field: 'Ultimo aggiornamento il',
    grace_ends_at_field: 'Il periodo di tolleranza termina il',
    refresh_expired_description:
      'La chiave di licenza è scaduta il {{expiresAt}}. Le funzionalità con licenza restano disponibili fino al {{graceEndsAt}} mentre Logto tenta di aggiornarla.',
    refresh_refused_description:
      'L’aggiornamento della licenza è stato rifiutato perché la licenza è {{reason}}. Le funzionalità con licenza restano disponibili fino al {{graceEndsAt}}.',
    refusal_reason_canceled: 'annullata',
    refusal_reason_unpaid: 'non pagata',
    refusal_reason_expired: 'scaduta',
    refusal_reason_revoked: 'revocata',
    refusal_reason_unknown: 'non disponibile',
    grace_expired_description:
      'Il periodo di tolleranza della licenza è terminato il {{graceEndsAt}}. Questa istanza è tornata ai valori predefiniti OSS. Ottieni una nuova chiave da Logto Cloud e installala di nuovo.',
    get_fresh_key_button: 'Ottieni una nuova chiave',
    replace_button: 'Sostituisci licenza',
  },
  members: {
    card_title: 'Gestisci i tenant in modo più sicuro con Logto Cloud',
    card_description:
      'Aggiungi amministratori o collaboratori al tuo tenant senza condividere un unico account amministratore.',
    card_action: 'Esplora Logto Cloud',
    self_hosted_card_title: 'Gestisci i tenant in modo più sicuro con i piani self-hosted',
    self_hosted_card_description:
      'Aggiungi amministratori o collaboratori al tuo tenant senza condividere un unico account amministratore.',
    self_hosted_card_action: 'Esplora i piani self-hosted',
  },
  settings: {
    title: 'IMPOSTAZIONI',
    description:
      "Imposta il nome dell'inquilino e visualizza la regione in cui sono ospitati i tuoi dati e il tipo di inquilino.",
    tenant_id: 'ID Inquilino',
    tenant_name: 'Nome Inquilino',
    tenant_instance: 'Seleziona la tua istanza',
    tenant_instance_description:
      "Seleziona dove sarà ospitato il tuo inquilino. Scegli Logto Cloud per un'infrastruttura condivisa pubblica o un'istanza privata per risorse dedicate.",
    tenant_region: 'Regione di hosting',
    tenant_region_description:
      'La posizione fisica in cui sono ospitate le risorse del tuo inquilino (utenti, app, ecc.). Questo non può essere cambiato dopo la creazione.',
    tenant_region_tip:
      'Le risorse del tuo inquilino sono ospitate in {{region}}. <a>Scopri di più</a>',
    environment_tag_development: 'Svil',
    environment_tag_production: 'Prod',
    tenant_type: 'Tipo inquilino',
    development_description:
      'Solo per scopi di test e non dovrebbe essere utilizzato in produzione. Non è richiesto alcun abbonamento. Ha tutte le funionalità professionali ma ha delle limitazioni come un banner di accesso.',
    production_description:
      'Destinato alle app utilizzate dagli utenti finali e potrebbe richiedere un abbonamento a pagamento.',
    tenant_info_saved: "Le informazioni dell'inquilino sono state salvate correttamente.",
    tenant_mfa: 'Autenticazione a più fattori',
    tenant_mfa_description:
      "Richiedi ai tuoi membri di configurare l'autenticazione a più fattori per accedere a questo inquilino.",
    enterprise_sso: 'Enterprise SSO',
    enterprise_sso_description:
      'Disponibile nei piani a pagamento. Contattaci per abilitare Enterprise SSO in modo che tutti i membri possano accedere alla console Logto Cloud utilizzando il provider di identità della tua organizzazione.',
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
  leave_tenant_card: {
    title: 'LASCIARE',
    leave_tenant: 'Lascia locatario',
    leave_tenant_description:
      "Eventuali risorse nell'inquilino rimarranno ma non avrai più accesso a questo inquilino.",
    last_admin_note:
      'Per lasciare questo inquilino, assicurati che almeno un altro membro abbia il ruolo di Amministratore.',
  },
  create_modal: {
    title: 'Crea nuovo inquilino',
    subtitle: 'Crea un nuovo inquilino che ha risorse e utenti isolati.',
    tenant_id: 'ID Inquilino',
    tenant_usage_purpose: 'Per cosa desideri utilizzare questo inquilino?',
    development_description:
      'Solo per scopi di test e non dovrebbe essere utilizzato in produzione. Non è richiesto alcun abbonamento.',
    development_description_for_private_regions:
      'Solo per scopi di test e non dovrebbe essere utilizzato in produzione.',
    development_hint:
      'Ha tutte le funzionalità professionali ma ha delle limitazioni come un banner di accesso.',
    production_description:
      'Utilizzato dagli utenti finali e potrebbe richiedere un abbonamento a pagamento.',
    available_plan: 'Piano disponibile:',
    create_button: 'Crea inquilino',
    tenant_name_placeholder: 'Il mio inquilino',
    tenant_created: 'Inquilino creato con successo.',
    invitation_failed:
      'Alcuni inviti non sono riusciti a essere inviati. Prova di nuovo in Impostazioni -> Membri più tardi.',
    tenant_type_description: 'Questo non può essere cambiato dopo la creazione.',
    tenant_id_invalid:
      "L'ID del tenant può contenere solo lettere minuscole, numeri e trattini e non deve superare {{max}} caratteri.",
    tenant_id_placeholder: 'Il tuo ID tenant',
    tenant_id_tip:
      "Personalizza l'ID tenant. Se lasciato vuoto, Logto genererà un ID predefinito. L'ID tenant non può essere modificato dopo la creazione.",
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
    title: 'Elimina locatario',
    description_line1:
      'Sei sicuro di voler eliminare il tuo inquilino "<span>{{name}}</span>" con etichetta di ambiente "<span>{{tag}}</span>"? Questa azione non può essere annullata e comporterà l\'eliminazione permanente di tutti i tuoi dati e informazioni sull\'inquilino.',
    description_line2:
      "Prima di eliminare l'inquilino, forse possiamo aiutarti. <span><a>Contattaci via Email</a></span>",
    description_line3:
      'Se desideri procedere, inserisci il nome dell\'inquilino "<span>{{name}}</span>" per confermare.',
    delete_button: 'Elimina definitivamente',
    cannot_delete_title: 'Impossibile eliminare questo locatario',
    cannot_delete_description:
      'Spiacente, al momento non è possibile eliminare questo inquilino. Verifica di essere nel Piano Gratuito e di aver saldato tutte le fatture pendenti.',
  },
  leave_tenant_modal: {
    description: 'Sei sicuro di voler lasciare questo inquilino?',
    leave_button: 'Lasciare',
  },
  tenant_landing_page: {
    title: 'Non hai ancora creato un inquilino',
    description:
      'Per iniziare a configurare il tuo progetto con Logto, crea un nuovo inquilino. Se hai bisogno di uscire o eliminare il tuo account, clicca sul pulsante avatar in alto a destra.',
    create_tenant_button: 'Crea inquilino',
  },
  status: {
    mau_exceeded: 'MAU Superato',
    token_exceeded: 'Token superato',
    suspended: 'Sospeso',
    overdue: 'Scaduto',
  },
  tenant_suspended_page: {
    title: "Locatario sospeso. Contattaci per ripristinare l'accesso.",
    description_1:
      'Ci dispiace molto informarti che il tuo account inquilino è stato temporaneamente sospeso a causa di un utilizzo improprio, inclusi superamenti dei limiti di MAU, pagamenti in ritardo o altre azioni non autorizzate.',
    description_2:
      'Se necessiti ulteriori chiarimenti, hai qualche preoccupazione o desideri ripristinare la funzionalità completa e sbloccare i tuoi inquilini, ti preghiamo di contattarci immediatamente.',
  },
  production_tenant_notification: {
    text: 'Sei in un inquilino di sviluppo per test gratuiti. Crea un inquilino di produzione per andare in diretta.',
    action: 'Crea inquilino',
  },
};

export default Object.freeze(tenants);
