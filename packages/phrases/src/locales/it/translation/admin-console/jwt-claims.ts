const jwt_claims = {
  title: 'JWT personalizzato',
  description:
    'Imposta richieste JWT personalizzate da includere nel token di accesso. Queste richieste possono essere utilizzate per passare informazioni aggiuntive alla tua applicazione.',
  user_jwt: {
    card_title: 'Per utente',
    card_field: 'Token di accesso utente',
    card_description:
      "Aggiungi dati specifici dell'utente durante l'emissione del token di accesso.",
    for: 'per utente',
  },
  machine_to_machine_jwt: {
    card_title: 'Per M2M',
    card_field: 'Token da macchina a macchina',
    card_description: "Aggiungi dati extra durante l'emissione del token da macchina a macchina.",
    for: 'per M2M',
  },
  code_editor_title: 'Personalizza le richieste {{token}}',
  custom_jwt_create_button: 'Aggiungi richieste personalizzate',
  custom_jwt_item: 'Richieste personalizzate {{for}}',
  delete_modal_title: 'Elimina richieste personalizzate',
  delete_modal_content: 'Sei sicuro di voler eliminare le richieste personalizzate?',
  clear: 'Pulisci',
  cleared: 'Pulito',
  restore: 'Ripristina predefiniti',
  restored: 'Ripristinato',
  data_source_tab: 'Sorgente dati',
  test_tab: 'Contesto di test',
  jwt_claims_description:
    'Le richieste predefinite sono incluse automaticamente nel JWT e non possono essere sovrascritte.',
  user_data: {
    title: 'Dati utente',
    subtitle:
      "Utilizza il parametro di input `data.user` per fornire informazioni vitali sull'utente.",
  },
  token_data: {
    title: 'Dati token',
    subtitle:
      'Utilizza il parametro di input `token` per il payload corrente del token di accesso. ',
  },
  fetch_external_data: {
    title: 'Recupera dati esterni',
    subtitle: 'Incorpora dati direttamente dai tuoi API esterni nelle richieste.',
    description:
      'Utilizza la funzione `fetch` per chiamare le tue API esterne e includere i dati nelle richieste personalizzate. Esempio: ',
  },
  environment_variables: {
    title: "Imposta variabili d'ambiente",
    subtitle: "Utilizza variabili d'ambiente per memorizzare informazioni sensibili.",
    input_field_title: "Aggiungi variabili d'ambiente",
    sample_code:
      "Accesso alle variabili d'ambiente nel gestore delle richieste JWT personalizzate. Esempio: ",
  },
  jwt_claims_hint:
    'Limita le richieste personalizzate a meno di 50KB. Le richieste JWT predefinite sono incluse automaticamente nel token e non possono essere sovrascritte.',
  tester: {
    subtitle: 'Regola il token fittizio e i dati utente per il test.',
    run_button: 'Esegui test',
    result_title: 'Risultato del test',
  },
  form_error: {
    invalid_json: 'Formato JSON non valido',
  },
};

export default Object.freeze(jwt_claims);
