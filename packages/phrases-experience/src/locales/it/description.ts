const description = {
  email: 'email',
  phone_number: 'numero di telefono',
  username: 'username',
  reminder: 'Promemoria',
  not_found: '404 Non trovato',
  agree_with_terms: 'Ho letto e accetto i ',
  agree_with_terms_modal: 'Per procedere, si prega di accettare i <link></link>.',
  terms_of_use: 'Termini di utilizzo',
  sign_in: 'Accedi',
  privacy_policy: 'Informativa sulla privacy',
  create_account: 'Crea account',
  switch_account: 'Cambia account',
  or: 'o',
  and: 'e',
  enter_passcode: 'Il codice di verifica è stato inviato alla tua {{address}} {{target}}',
  passcode_sent: 'Il codice di verifica è stato inviato di nuovo',
  resend_after_seconds: 'Non ricevuto? Invia di nuovo dopo <span>{{seconds}}</span> secondi',
  resend_passcode: 'Non ricevuto? <a>Invia di nuovo il codice di verifica</a>',
  create_account_id_exists: "L'account con {{type}} {{value}} già esiste, vuoi accedere?",
  link_account_id_exists: "L'account con {{type}} {{value}} è già esistente. Vuoi collegarlo?",
  sign_in_id_does_not_exist:
    "L'account con {{type}} {{value}} non esiste, vuoi creare un nuovo account?",
  sign_in_id_does_not_exist_alert: "L'account con {{type}} {{value}} non esiste.",
  create_account_id_exists_alert:
    "L'account {{type}} {{value}} è collegato ad un altro account. Prova con un altro {{type}}.",
  social_identity_exist:
    "L'{{type}} {{value}} è collegato ad un altro account. Prova con un altro {{type}}.",
  bind_account_title: 'Collega o crea un account',
  social_create_account: 'Puoi creare un nuovo account.',
  social_link_email: "Puoi collegare un'altra email",
  social_link_phone: 'Puoi collegare un altro telefono',
  social_link_email_or_phone: "Puoi collegare un'altra email o telefono",
  social_bind_with_existing:
    'Abbiamo trovato un account correlato che era già stato registrato, e puoi collegarlo direttamente.',
  skip_social_linking: "Saltare il collegamento all'account esistente?",
  reset_password: 'Resetta la password',
  reset_password_description:
    'Inserisci il {{types, list(type: disjunction;)}} associato al tuo account, e ti invieremo il codice di verifica per resettare la password.',
  new_password: 'Nuova password',
  set_password: 'Imposta una password',
  password_changed: 'Password cambiata',
  no_account: 'Ancora nessun account? ',
  have_account: 'Hai già un account?',
  enter_password: 'Inserisci la password',
  enter_password_for: 'Accedi con la password per {{method}} {{value}}',
  enter_username: 'Imposta username',
  enter_username_description:
    "L'username è un'alternativa per l'accesso. L'username deve contenere solo lettere, numeri e trattini bassi.",
  link_email: 'Collega emails',
  link_phone: 'Collega telefono',
  link_email_or_phone: 'Collega email o telefono',
  link_email_description: "Per maggiore sicurezza, collega la tua email all'account.",
  link_phone_description: "Per maggiore sicurezza, collega il tuo telefono all'account.",
  link_email_or_phone_description:
    "Per maggiore sicurezza, collega la tua email o il tuo telefono all'account.",
  continue_with_more_information:
    "Per maggiore sicurezza, completa i dettagli dell'account qui sotto.",
  create_your_account: 'Crea il tuo account',
  sign_in_to_your_account: 'Accedi al tuo account',
  no_region_code_found: 'Nessun codice di regione trovato',
  verify_email: 'Verifica la tua email',
  verify_phone: 'Verifica il tuo numero di telefono',
  password_requirements: 'Password {{items, list}}.',
  password_requirement: {
    length_one: 'richiede almeno {{count}} carattere',
    length_two: 'richiede almeno {{count}} caratteri',
    length_few: 'richiede almeno {{count}} caratteri',
    length_many: 'richiede almeno {{count}} caratteri',
    length_other: 'richiede almeno {{count}} caratteri',
    character_types_one:
      'dovrebbe contenere almeno {{count}} tipo di lettere maiuscole, lettere minuscole, numeri e simboli',
    character_types_two:
      'dovrebbe contenere almeno {{count}} tipi di lettere maiuscole, lettere minuscole, numeri e simboli',
    character_types_few:
      'dovrebbe contenere almeno {{count}} tipi di lettere maiuscole, lettere minuscole, numeri e simboli',
    character_types_many:
      'dovrebbe contenere almeno {{count}} tipi di lettere maiuscole, lettere minuscole, numeri e simboli',
    character_types_other:
      'dovrebbe contenere almeno {{count}} tipi di lettere maiuscole, lettere minuscole, numeri e simboli',
  },
  use: 'Utilizzare',
  single_sign_on_email_form: 'Inserisci il tuo indirizzo email aziendale',
  single_sign_on_connectors_list:
    "La tua azienda ha abilitato il Single Sign-On per l'account email {{email}}. Puoi continuare ad accedere con i seguenti fornitori di SSO.",
  single_sign_on_enabled: 'Il Single Sign-On è abilitato per questo account',
  authorize_title: 'Autorizza {{name}}',
  request_permission: '{{name}} sta richiedendo accesso a:',
  grant_organization_access: "Concedi accesso all'organizzazione:",
  authorize_personal_data_usage: "Autorizza l'utilizzo dei tuoi dati personali:",
  authorize_organization_access: "Autorizza l'accesso all'organizzazione specifica:",
  user_scopes: 'Dati utente personali',
  organization_scopes: "Accesso all'organizzazione",
  authorize_agreement: "Autorizzando l'accesso, accetti i <link></link> di {{name}}.",
  authorize_agreement_with_redirect:
    "Autorizzando l'accesso, accetti i <link></link> di {{name}}, e sarai reindirizzato a {{uri}}.",
  not_you: 'Non sei tu?',
  user_id: 'ID utente: {{id}}',
  redirect_to: 'Sarai reindirizzato a {{name}}.',
  auto_agreement: 'Continuando, accetti i <link></link>.',
  identifier_sign_in_description:
    'Inserisci il tuo {{types, list(type: disjunction;)}} per accedere.',
  all_sign_in_options: 'Tutte le opzioni di accesso',
  identifier_register_description:
    'Inserisci il tuo {{types, list(type: disjunction;)}} per creare un nuovo account.',
  all_account_creation_options: 'Tutte le opzioni di creazione account',
  back_to_sign_in: 'Torna al login',
  support_email: 'Email di supporto: <link></link>',
  support_website: 'Sito web di supporto: <link></link>',
  switch_account_title: 'Attualmente sei connesso come {{account}}',
  switch_account_description:
    "Per continuare, verrai disconnesso dall'account attuale e passerai automaticamente al nuovo account.",
};

export default Object.freeze(description);
