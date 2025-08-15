const custom_profile_fields = {
  entity_not_exists_with_names: 'Impossibile trovare le entità con i nomi forniti: {{names}}',
  invalid_min_max_input: 'Input minimo e massimo non valido.',
  invalid_default_value: 'Valore predefinito non valido.',
  invalid_options: 'Opzioni del campo non valide.',
  invalid_regex_format: 'Formato regex non valido.',
  invalid_address_components: "Componenti dell'indirizzo non validi.",
  invalid_fullname_components: 'Componenti del nome completo non validi.',
  invalid_sub_component_type: 'Tipo di sottocomponente non valido.',
  name_exists: 'Esiste già un campo con il nome fornito.',
  conflicted_sie_order: "Valore dell'ordine del campo in conflitto per Sign-in Experience.",
  invalid_name:
    'Nome del campo non valido, sono consentite solo lettere o numeri, sensibili alle maiuscole.',
  name_conflict_sign_in_identifier:
    'Nome del campo non valido. Chiavi di identificatore di accesso riservate: {{name}}.',
  name_conflict_built_in_prop:
    'Nome del campo non valido. Nomi di proprietà integrate del profilo utente riservati: {{name}}.',
  name_conflict_custom_data:
    'Nome del campo non valido. Chiavi di dati personalizzati riservate: {{name}}.',
  name_required: 'Il nome del campo è obbligatorio.',
};

export default Object.freeze(custom_profile_fields);
