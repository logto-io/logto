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
    /** UNTRANSLATED */
    name: 'Name',
    /** UNTRANSLATED */
    name_description:
      "The user's full name in displayable form including all name parts (e.g., “Jane Doe”).",
    /** UNTRANSLATED */
    avatar: 'Avatar',
    /** UNTRANSLATED */
    avatar_description: "URL of the user's avatar image.",
    /** UNTRANSLATED */
    familyName: 'Family name',
    /** UNTRANSLATED */
    familyName_description: 'The user\'s surname(s) or last name(s) (e.g., "Doe").',
    /** UNTRANSLATED */
    givenName: 'Given name',
    /** UNTRANSLATED */
    givenName_description: 'The user\'s given name(s) or first name(s) (e.g., "Jane").',
    /** UNTRANSLATED */
    middleName: 'Middle name',
    /** UNTRANSLATED */
    middleName_description: 'The user\'s middle name(s) (e.g., "Marie").',
    /** UNTRANSLATED */
    nickname: 'Nickname',
    /** UNTRANSLATED */
    nickname_description:
      'Casual or familiar name for the user, which may differ from their legal name.',
    /** UNTRANSLATED */
    preferredUsername: 'Preferred username',
    /** UNTRANSLATED */
    preferredUsername_description:
      'Shorthand identifier by which the user wishes to be referenced.',
    /** UNTRANSLATED */
    profile: 'Profile',
    /** UNTRANSLATED */
    profile_description:
      "URL of the user's human-readable profile page (e.g., social media profile).",
    /** UNTRANSLATED */
    website: 'Website',
    /** UNTRANSLATED */
    website_description: "URL of the user's personal website or blog.",
    /** UNTRANSLATED */
    gender: 'Gender',
    /** UNTRANSLATED */
    gender_description: 'The user\'s self-identified gender (e.g., "Female", "Male", "Non-binary")',
    /** UNTRANSLATED */
    birthdate: 'Birthdate',
    /** UNTRANSLATED */
    birthdate_description: 'The user\'s date of birth in a specified format (e.g., "MM-dd-yyyy").',
    /** UNTRANSLATED */
    zoneinfo: 'Timezone',
    /** UNTRANSLATED */
    zoneinfo_description:
      'The user\'s timezone in IANA format (e.g., "America/New_York" or "Europe/Paris").',
    /** UNTRANSLATED */
    locale: 'Language',
    /** UNTRANSLATED */
    locale_description: 'The user\'s language in IETF BCP 47 format (e.g., "en-US" or "zh-CN").',
    address: {
      /** UNTRANSLATED */
      formatted: 'Address',
      /** UNTRANSLATED */
      streetAddress: 'Street address',
      /** UNTRANSLATED */
      locality: 'City',
      /** UNTRANSLATED */
      region: 'State',
      /** UNTRANSLATED */
      postalCode: 'Zip code',
      /** UNTRANSLATED */
      country: 'Country',
    },
    /** UNTRANSLATED */
    address_description:
      'The user\'s full address in displayable form including all address parts (e.g., "123 Main St, Anytown, USA 12345").',
    /** UNTRANSLATED */
    fullname: 'Fullname',
    /** UNTRANSLATED */
    fullname_description:
      'Flexibly combines familyName, givenName, and middleName based on configuration.',
  },
};

export default Object.freeze(profile);
