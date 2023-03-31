const connector = {
  general: 'Si è verificato un errore nel connettore: {{errorDescription}}',
  not_found: 'Impossibile trovare un connettore disponibile per il tipo: {{type}}.',
  not_enabled: 'Il connettore non è abilitato.',
  invalid_metadata: 'I metadati del connettore non sono validi.',
  invalid_config_guard: 'La guardia di configurazione del connettore non è valida.',
  unexpected_type: 'Il tipo di connettore è inaspettato.',
  invalid_request_parameters: 'La richiesta contiene parametri di input errati.',
  insufficient_request_parameters: 'La richiesta potrebbe mancare di alcuni parametri di input.',
  invalid_config: 'La configurazione del connettore non è valida.',
  invalid_response: 'La risposta del connettore non è valida.',
  template_not_found:
    'Impossibile trovare il modello corretto nella configurazione del connettore.',
  not_implemented: '{{method}}: non è stato ancora implementato.',
  social_invalid_access_token: 'Il token di accesso del connettore non è valido.',
  invalid_auth_code: 'Il codice di autenticazione del connettore non è valido.',
  social_invalid_id_token: 'Il token ID del connettore non è valido.',
  authorization_failed: "Il processo di autorizzazione dell'utente non è riuscito.",
  social_auth_code_invalid:
    'Impossibile ottenere il token di accesso, controllare il codice di autorizzazione.',
  more_than_one_sms: 'Il numero di connettori SMS è maggiore di 1.',
  more_than_one_email: 'Il numero di connettori email è maggiore di 1.',
  more_than_one_connector_factory:
    'Trovate più fabbriche di connettori (con id {{connectorIds}}), è possibile disinstallare quelle non necessarie.',
  db_connector_type_mismatch: "C'è un connettore nel DB che non corrisponde al tipo.",
  not_found_with_connector_id:
    "Impossibile trovare il connettore con l'id connettore standard fornito.",
  multiple_instances_not_supported:
    "Non è possibile creare più di un'istanza con il connettore standard selezionato.",
  invalid_type_for_syncing_profile:
    'È possibile sincronizzare solo il profilo utente con i connettori social.',
  can_not_modify_target: "Non è possibile modificare il 'target' del connettore.",
  should_specify_target: "Si dovrebbe specificare il 'target'.",
  multiple_target_with_same_platform:
    'Non è possibile avere più connettori social con lo stesso target e piattaforma.',
  cannot_overwrite_metadata_for_non_standard_connector:
    "I 'metadati' di questo connettore non possono essere sovrascritti.",
};

export default connector;
