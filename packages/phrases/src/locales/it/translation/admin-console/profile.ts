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
    enter_password: 'Inserisci la tua password',
    enter_password_subtitle: 'Verifica che sia tu per proteggere la sicurezza del tuo account.',
    set_password: 'Imposta password',
    verify_via_password: 'Verifica tramite password',
    show_password: 'Mostra password',
    required: 'La password è obbligatoria',
    min_length: 'La password deve contenere almeno {{min}} caratteri',
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
    dialog_paragraph_1:
      "Ci dispiace sapere che desideri eliminare il tuo account. L'eliminazione dell'account rimuoverà permanentemente tutti i dati, inclusi le informazioni utente, i log e le impostazioni, e questa azione non può essere annullata. Quindi assicurati di eseguire il backup di eventuali dati importanti prima di procedere.",
    dialog_paragraph_2:
      "Per procedere con il processo di eliminazione dell'account, invia un'email al nostro team di supporto all'indirizzo <a>{{mail}}</a> con l'oggetto \"Richiesta di eliminazione account\". Ti assisteremo e ci assicureremo che tutti i tuoi dati siano correttamente eliminati dal nostro sistema.",
    dialog_paragraph_3:
      'Grazie per aver scelto Logto Cloud. Se hai ulteriori domande o dubbi, non esitare a contattarci.',
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
  email_changed: 'Email modificata!',
  password_changed: 'Password modificata!',
  updated: '{{target}} aggiornato!',
  linked: '{{target}} collegato!',
  unlinked: '{{target}} scollegato!',
  email_exists_reminder:
    "Questa email {{email}} è associata a un account esistente. Collega un'altra email qui.",
  unlink_confirm_text: 'Sì, scollega',
  unlink_reminder:
    "Gli utenti non potranno più accedere tramite l'account <span></span> se lo scolleghi. Sicuro di procedere?",
};

export default profile;
