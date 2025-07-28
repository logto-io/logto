const user_details = {
  page_title: 'Dettagli utente',
  back_to_users: 'Torna alla gestione utenti',
  created_title: 'Questo utente è stato creato con successo',
  created_guide: "Ecco le informazioni per aiutare l'utente con il processo di accesso.",
  created_email: 'Indirizzo email:',
  created_phone: 'Numero di telefono:',
  created_username: 'Nome utente:',
  created_password: 'Password:',
  menu_delete: 'Elimina',
  delete_description:
    "Questa azione non può essere annullata. Eliminerai l'utente in modo permanente.",
  deleted: "L'utente è stato eliminato con successo",
  reset_password: {
    reset_title: 'Sei sicuro di voler reimpostare la password?',
    generate_title: 'Sei sicuro di voler generare una password?',
    content:
      "Questa azione non può essere annullata. Questo reimposterà le informazioni di accesso dell'utente.",
    reset_complete: "L'utente è stato reimpostato",
    generate_complete: 'La password è stata generata',
    new_password: 'Nuova password:',
    password: 'Password:',
  },
  tab_settings: 'Impostazioni',
  tab_roles: 'Ruoli utente',
  tab_logs: 'Log utente',
  tab_organizations: 'Organizzazioni',
  authentication: 'Autenticazione',
  authentication_description:
    "Ogni utente ha un profilo contenente tutte le informazioni dell'utente. È composto da dati di base, identità sociali e dati personalizzati.",
  user_profile: 'Profilo utente',
  field_email: 'Indirizzo email',
  field_phone: 'Numero di telefono',
  field_username: 'Nome utente',
  field_password: 'Password',
  field_name: 'Nome',
  field_avatar: "URL dell'immagine dell'avatar",
  field_avatar_placeholder: 'https://il-tuo-dominio.cdn/avatar.png',
  field_custom_data: 'Dati personalizzati',
  field_custom_data_tip:
    "Ulteriori informazioni sull'utente non elencate nelle proprietà utente predefinite, come il colore e la lingua preferiti dall'utente.",
  field_profile: 'Profilo',
  field_profile_tip:
    "Ulteriori dichiarazioni standard OpenID Connect che non sono incluse nelle proprietà dell'utente. Si noti che tutte le proprietà sconosciute verranno eliminate. Fare riferimento a <a>riferimento delle proprietà del profilo</a> per ulteriori informazioni.",
  field_connectors: 'Connessioni sociali',
  field_sso_connectors: 'Connessioni enterprise',
  custom_data_invalid: 'I dati personalizzati devono essere un oggetto JSON valido',
  profile_invalid: 'Il profilo deve essere un oggetto JSON valido',
  password_already_set: 'Password già impostata',
  no_password_set: 'Nessuna password impostata',
  connectors: {
    connectors: 'Connettori',
    user_id: 'ID utente',
    remove: 'Rimuovi',
    connected: 'Questo utente è connesso con più connettori sociali.',
    not_connected: "L'utente non è connesso a nessun connettore sociale",
    deletion_confirmation:
      "Stai rimuovendo l'identità esistente <name/>. Sei sicuro di voler continuare?",
  },
  sso_connectors: {
    connectors: 'Connettori',
    enterprise_id: 'ID enterprise',
    connected:
      'Questo utente è connesso a più fornitori di identità enterprise per il Single Sign-On.',
    not_connected:
      "L'utente non è connesso a nessun fornitore di identità enterprise per il Single Sign-On.",
  },
  mfa: {
    field_name: 'Autenticazione a due fattori',
    field_description: 'Questo utente ha abilitato fattori di autenticazione a 2 passaggi.',
    name_column: 'Autenticazione a due fattori',
    field_description_empty:
      'Questo utente non ha abilitato fattori di autenticazione a due fattori.',
    deletion_confirmation:
      "Stai rimuovendo l'esistente <name/> per la verifica in due passaggi. Sei sicuro di voler continuare?",
  },
  suspended: 'Sospeso',
  suspend_user: 'Sospendi utente',
  suspend_user_reminder:
    "Sei sicuro di voler sospendere questo utente? L'utente non potrà accedere alla tua app e non sarà in grado di ottenere un nuovo token di accesso dopo la scadenza di quello corrente. Inoltre, qualsiasi richiesta API effettuata da questo utente non avrà esito.",
  suspend_action: 'Sospendi',
  user_suspended: "L'utente è stato sospeso.",
  reactivate_user: 'Riattiva l’utente',
  reactivate_user_reminder:
    'Sei sicuro di voler riattivare questo utente? Ciò consentirà eventuali tentativi di accesso per questo utente.',
  reactivate_action: 'Riattiva',
  user_reactivated: "L'utente è stato riattivato.",
  roles: {
    name_column: 'Ruolo utente',
    description_column: 'Descrizione',
    assign_button: 'Assegna ruoli',
    delete_description:
      'Questa azione rimuoverà questo ruolo da questo utente. Il ruolo stesso esisterà ancora, ma non sarà più associato a questo utente.',
    deleted: '{{nome}} è stato rimosso con successo da questo utente.',
    assign_title: 'Assegna ruoli a {{name}}',
    assign_subtitle: 'Trova i ruoli utente appropriati cercando per nome, descrizione o ID ruolo.',
    assign_role_field: 'Assegna ruoli',
    role_search_placeholder: 'Cerca per nome ruolo',
    added_text: '{{value, number}} aggiunti',
    assigned_user_count: '{{value, number}} utenti',
    confirm_assign: 'Assegna ruoli',
    role_assigned: 'Ruolo(ruoli) assegnati con successo',
    search: 'Cerca per nome ruolo, descrizione o ID',
    empty: 'Nessun ruolo disponibile',
  },
  warning_no_sign_in_identifier:
    "L'utente deve avere almeno uno degli identificatori di accesso (nome utente, email, numero di telefono, o social) per accedere. Sei sicuro di voler continuare?",
  personal_access_tokens: {
    title: 'Token di accesso personale',
    title_other: 'Token di accesso personali',
    title_short: 'token',
    empty: "L'utente non ha token di accesso personali.",
    create: 'Crea nuovo token',
    tip: 'I token di accesso personali (PAT) forniscono un modo sicuro per consentire agli utenti di concedere token di accesso senza utilizzare le loro credenziali e il login interattivo. Questo è utile per CI/CD, script o applicazioni che necessitano di accedere alle risorse in modo programmatico.',
    value: 'Valore',
    created_at: 'Creato il',
    expires_at: 'Scade il',
    never: 'Mai',
    create_new_token: 'Crea nuovo token',
    delete_confirmation:
      'Questa azione non può essere annullata. Sei sicuro di voler eliminare questo token?',
    expired: 'Scaduto',
    expired_tooltip: 'Questo token è scaduto il {{date}}.',
    create_modal: {
      title: 'Crea token di accesso personale',
      expiration: 'Scadenza',
      expiration_description: 'Il token scadrà il {{date}}.',
      expiration_description_never:
        'Il token non scadrà mai. Si consiglia di impostare una data di scadenza per una maggiore sicurezza.',
      days: '{{count}} giorno',
      days_other: '{{count}} giorni',
      created: 'Il token {{name}} è stato creato con successo.',
    },
    edit_modal: {
      title: 'Modifica token di accesso personale',
      edited: 'Il token {{name}} è stato modificato con successo.',
    },
  },
  connections: {
    title: 'Connessione',
    description:
      "L'utente collega account di terze parti per l'accesso tramite social, SSO aziendale o accesso alle risorse.",
    token_status_column: 'Stato del token',
    token_status: {
      active: 'Attivo',
      expired: 'Scaduto',
      inactive: 'Inattivo',
      not_applicable: 'Non applicabile',
      available: 'Disponibile',
      not_available: 'Non disponibile',
    },
  },
};

export default Object.freeze(user_details);
