const user_details = {
  page_title: 'Dettagli utente',
  back_to_users: 'Torna alla gestione utenti',
  created_title: 'Questo utente è stato creato con successo',
  created_guide: 'Ecco le informazioni per aiutare l’utente con il processo di accesso.',
  created_email: 'Indirizzo email:',
  created_phone: 'Numero di telefono:',
  created_username: 'Nome utente:',
  created_password: 'Password:',
  menu_delete: 'Elimina',
  delete_description:
    "Questa azione non può essere annullata. Eliminerai l'utente in modo permanente.",
  deleted: "L'utente è stato eliminato con successo",
  reset_password: {
    reset_password: 'Resetta la password',
    title: 'Sei sicuro di voler reimpostare la password?',
    content:
      "Questa azione non può essere annullata. Questo reimposterà le informazioni di accesso dell'utente.",
    congratulations: "L'utente è stato reimpostato",
    new_password: 'Nuova password:',
  },
  tab_settings: 'Impostazioni',
  tab_roles: 'Ruoli',
  tab_logs: 'Log utente',
  settings: 'Impostazioni',
  settings_description:
    "Ogni utente ha un profilo contenente tutte le informazioni dell'utente. È composto da dati di base, identità sociali e dati personalizzati.",
  field_email: 'Email principale',
  field_phone: 'Telefono principale',
  field_username: 'Nome utente',
  field_name: 'Nome',
  field_avatar: "URL dell'immagine dell'avatar",
  field_avatar_placeholder: 'https://il-tuo-dominio.cdn/avatar.png',
  field_custom_data: 'Dati personalizzati',
  field_custom_data_tip:
    "Ulteriori informazioni sull'utente non elencate nelle proprietà utente predefinite, come il colore e la lingua preferiti dall'utente.",
  field_connectors: 'Connessioni sociali',
  custom_data_invalid: 'I dati personalizzati devono essere un oggetto JSON valido',
  connectors: {
    connectors: 'Connettori',
    user_id: 'ID utente',
    remove: 'Rimuovi',
    not_connected: "L'utente non è connesso a nessun connettore sociale",
    deletion_confirmation:
      "Stai rimuovendo l'identità esistente <name/>. Sei sicuro di voler procedere?",
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
    name_column: 'Ruolo',
    description_column: 'Descrizione',
    assign_button: 'Assegna ruoli',
    delete_description:
      'Questa azione rimuoverà questo ruolo da questo utente. Il ruolo stesso esisterà ancora, ma non sarà più associato a questo utente.',
    deleted: '{{nome}} è stato rimosso con successo da questo utente.',
    assign_title: 'Assegna ruoli a {{nome}}',
    assign_subtitle: 'Autorizza {{nome}} uno o più ruoli',
    assign_role_field: 'Assegna ruoli',
    role_search_placeholder: 'Cerca per nome ruolo',
    added_text: '{{value, number}} aggiunti',
    assigned_user_count: '{{value, number}} utenti',
    confirm_assign: 'Assegna ruoli',
    role_assigned: 'Ruolo(ruoli) assegnati con successo',
    search: 'Cerca per nome ruolo, descrizione o ID',
    empty: 'Nessun ruolo disponibile',
  },
};

export default user_details;
