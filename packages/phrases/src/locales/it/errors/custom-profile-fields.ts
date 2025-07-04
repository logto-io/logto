const custom_profile_fields = {
  entity_not_exists_with_names: 'Impossibile trovare le entità con i nomi forniti: {{names}}',
  invalid_min_max_input: 'Input minimo e massimo non valido.',
  invalid_options: 'Opzioni del campo non valide.',
  invalid_regex_format: 'Formato regex non valido.',
  invalid_address_parts: "Parti dell'indirizzo non valide.",
  invalid_fullname_parts: 'Parti del nome completo non valide.',
  name_exists: 'Esiste già un campo con il nome fornito.',
  conflicted_sie_order: "Valore dell'ordine del campo in conflitto per Sign-in Experience.",
  invalid_name:
    'Nome del campo non valido, sono consentite solo lettere o numeri, sensibili alle maiuscole.',
  name_conflict_sign_in_identifier:
    'Nome del campo non valido. {{name}} è una chiave riservata di identificatore di accesso.',
  name_conflict_custom_data:
    'Nome del campo non valido. {{name}} è una chiave riservata per i dati personalizzati.',
};

export default Object.freeze(custom_profile_fields);
