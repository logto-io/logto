const errors = {
  something_went_wrong: 'Oops! Si è verificato un errore.',
  page_not_found: 'Pagina non trovata',
  unknown_server_error: 'Si è verificato un errore del server sconosciuto',
  empty: 'Nessun dato',
  missing_total_number: 'Impossibile trovare Total-Number negli header di risposta',
  invalid_uri_format: 'Formato URI non valido',
  invalid_origin_format: 'Formato origine URI non valido',
  invalid_json_format: 'Formato JSON non valido',
  invalid_regex: 'Espressione regolare non valida',
  invalid_error_message_format: 'Il formato del messaggio di errore non è valido.',
  required_field_missing: 'Inserisci {{field}}',
  required_field_missing_plural: 'Devi inserire almeno un {{field}}',
  more_details: 'Ulteriori dettagli',
  username_pattern_error:
    'Il nome utente dovrebbe contenere solo lettere, numeri, o trattini bassi e non dovrebbe iniziare con un numero.',
  email_pattern_error: "L'indirizzo email non è valido.",
  phone_pattern_error: 'Il numero di telefono non è valido.',
  insecure_contexts: 'I contesti non sicuri (non HTTPS) non sono supportati.',
  unexpected_error: 'Si è verificato un errore inaspettato.',
  not_found: '404 non trovato',
  create_internal_role_violation:
    "Stai creando un nuovo ruolo interno che è proibito da Logto. Prova un altro nome che non inizi con '#internal:'.",
  should_be_an_integer: 'Deve essere un numero intero.',
  number_should_be_between_inclusive:
    'Il numero deve essere compreso tra {{min}} e {{max}} (inclusi).',
};

export default Object.freeze(errors);
