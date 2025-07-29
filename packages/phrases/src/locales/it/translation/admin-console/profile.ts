const profile = {
  page_title: 'Impostazioni Account',
  title: 'Impostazioni Account',
  description:
    'Cambia le tue impostazioni account e gestisci le tue informazioni personali qui per garantire la sicurezza del tuo account.',
  settings: {
    title: 'IMPOSTAZIONI PROFILO',
    profile_information: 'Informazioni profilo',
    avatar: 'Avatar',
    name: 'Nome',
    username: 'Nome utente',
  },
  link_account: {
    title: 'COLLEGA ACCOUNT',
    email_sign_in: 'Accesso con email',
    email: 'Email',
    social_sign_in: 'Accesso con social media',
    link_email: 'Collega email',
    link_email_subtitle: "Collega la tua email per accedere o per recuperare l'account.",
    email_required: "L'email è obbligatoria",
    invalid_email: 'Indirizzo email non valido',
    identical_email_address: "L'indirizzo email inserito è identico a quello corrente",
    anonymous: 'Anonimo',
  },
  password: {
    title: 'PASSWORD E SICUREZZA',
    password: 'Password',
    password_setting: 'Impostazione password',
    new_password: 'Nuova password',
    confirm_password: 'Conferma password',
    enter_password: 'Inserisci la password attuale',
    enter_password_subtitle:
      'Verifica che sei tu per proteggere la sicurezza del tuo account. Inserisci la tua password attuale prima di cambiarla.',
    set_password: 'Imposta password',
    verify_via_password: 'Verifica tramite password',
    show_password: 'Mostra password',
    required: 'La password è obbligatoria',
    do_not_match: 'Le password non corrispondono. Riprova.',
  },
  code: {
    enter_verification_code: 'Inserisci il codice di verifica',
    enter_verification_code_subtitle:
      'Il codice di verifica è stato inviato a <strong>{{target}}</strong>',
    verify_via_code: 'Verifica tramite codice di verifica',
    resend: 'Invia nuovamente il codice di verifica',
    resend_countdown: 'Invia nuovamente in {{countdown}} secondi',
  },
  delete_account: {
    title: 'ELIMINA ACCOUNT',
    label: 'Elimina account',
    description:
      'Eliminando il tuo account, verranno rimossi tutti i tuoi dati personali, le informazioni utente, la configurazione. Questa operazione non può essere annullata.',
    button: 'Elimina account',
    p: {
      has_issue:
        'Siamo spiacenti di sapere che vuoi eliminare il tuo account. Prima di poter eliminare il tuo account, devi risolvere i seguenti problemi.',
      after_resolved:
        'Una volta risolti i problemi, puoi eliminare il tuo account. Non esitare a contattarci se hai bisogno di assistenza.',
      check_information:
        'Siamo spiacenti di sapere che vuoi eliminare il tuo account. Per favore controlla attentamente le seguenti informazioni prima di procedere.',
      remove_all_data:
        'Eliminando il tuo account, verranno permanentemente rimossi tutti i dati su di te in Logto Cloud. Per favore assicurati di fare un backup dei dati importanti prima di procedere.',
      confirm_information:
        'Per favore conferma che le informazioni sopra sono quelle che ti aspettavi. Una volta eliminato il tuo account, non saremo in grado di recuperarlo.',
      has_admin_role:
        'Poiché hai il ruolo di amministratore nel seguente tenant, verrà eliminato insieme al tuo account:',
      has_admin_role_other:
        'Poiché hai il ruolo di amministratore nei seguenti tenant, verranno eliminati insieme al tuo account:',
      quit_tenant: 'Stai per lasciare il seguente tenant:',
      quit_tenant_other: 'Stai per lasciare i seguenti tenant:',
    },
    issues: {
      paid_plan:
        "Il seguente tenant ha un piano a pagamento, per favore annulla prima l'abbonamento:",
      paid_plan_other:
        "I seguenti tenant hanno piani a pagamento, per favore annulla prima l'abbonamento:",
      subscription_status: 'Il seguente tenant ha un problema di stato di abbonamento:',
      subscription_status_other: 'I seguenti tenant hanno problemi di stato di abbonamento:',
      open_invoice: 'Il seguente tenant ha una fattura aperta:',
      open_invoice_other: 'I seguenti tenant hanno fatture aperte:',
    },
    error_occurred: 'Si è verificato un errore',
    error_occurred_description:
      "Spiacenti, si è verificato un problema durante l'eliminazione del tuo account:",
    request_id: 'ID richiesta: {{requestId}}',
    try_again_later:
      "Per favore riprova più tardi. Se il problema persiste, contatta il team Logto con l'ID richiesta.",
    final_confirmation: 'Conferma finale',
    about_to_start_deletion:
      'Stai per iniziare il processo di eliminazione e questa azione non può essere annullata.',
    permanently_delete: 'Elimina definitivamente',
  },
  set: 'Imposta',
  change: 'Cambia',
  link: 'Collega',
  unlink: 'Scollega',
  not_set: 'Non impostato',
  change_avatar: 'Cambia avatar',
  change_name: 'Cambia nome',
  change_username: 'Cambia nome utente',
  set_name: 'Imposta nome',
  email_changed: 'Email modificata.',
  password_changed: 'Password modificata.',
  updated: '{{target}} aggiornato.',
  linked: '{{target}} collegato.',
  unlinked: '{{target}} scollegato.',
  email_exists_reminder:
    "Questa email {{email}} è associata a un account esistente. Collega un'altra email qui.",
  unlink_confirm_text: 'Sì, scollega',
  unlink_reminder:
    "Gli utenti non potranno più accedere tramite l'account <span></span> se lo scolleghi. Sicuro di procedere?",
  fields: {
    name: 'Nome',
    name_description:
      'Il nome completo dell\'utente in forma visualizzabile, includendo tutte le parti del nome (es. "Mario Rossi").',
    avatar: 'Avatar',
    avatar_description: "URL dell'immagine dell'avatar dell'utente.",
    familyName: 'Cognome',
    familyName_description: 'Il cognome dell\'utente (es. "Rossi").',
    givenName: 'Nome',
    givenName_description: 'Il nome dell\'utente (es. "Mario").',
    middleName: 'Secondo nome',
    middleName_description: 'Il secondo nome dell\'utente (es. "Luigi").',
    nickname: 'Soprannome',
    nickname_description:
      "Nome informale o familiare per l'utente, che può differire dal suo nome legale.",
    preferredUsername: 'Nome utente preferito',
    preferredUsername_description:
      "Identificatore abbreviato con cui l'utente desidera essere referenziato.",
    profile: 'Profilo',
    profile_description:
      "URL della pagina del profilo leggibile dall'uomo dell'utente (es. profilo social).",
    website: 'Sito web',
    website_description: "URL del sito web personale o blog dell'utente.",
    gender: 'Genere',
    gender_description:
      'Il genere auto-identificato dell\'utente (es. "Femmina", "Maschio", "Non-binario").',
    birthdate: 'Data di nascita',
    birthdate_description:
      'La data di nascita dell\'utente in un formato specificato (es. "GG-MM-AAAA").',
    zoneinfo: 'Fuso orario',
    zoneinfo_description:
      'Il fuso orario dell\'utente in formato IANA (es. "Europe/Rome" o "America/New_York").',
    locale: 'Lingua',
    locale_description: 'La lingua dell\'utente in formato IETF BCP 47 (es. "it-IT" o "en-US").',
    address: {
      formatted: 'Indirizzo',
      streetAddress: 'Indirizzo stradale',
      locality: 'Città',
      region: 'Stato/Provincia',
      postalCode: 'CAP',
      country: 'Paese',
    },
    address_description:
      "L'indirizzo completo dell'utente in forma visualizzabile, includendo tutte le parti dell'indirizzo (es. \"Via Roma 123, Milano, Italia 20100\").",
    fullname: 'Nome completo',
    fullname_description:
      'Combina flessibilmente cognome, nome e secondo nome in base alla configurazione.',
  },
};

export default Object.freeze(profile);
