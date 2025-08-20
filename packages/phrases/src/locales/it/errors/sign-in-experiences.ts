const sign_in_experiences = {
  empty_content_url_of_terms_of_use:
    'URL di contenuto "Termini di utilizzo" vuoto. Si prega di aggiungere l\'URL del contenuto se "Termini di utilizzo" è abilitato.',
  empty_social_connectors:
    'Connettori social vuoti. Si prega di aggiungere connettori social abilitati quando il metodo di accesso social è abilitato.',
  enabled_connector_not_found: '{{type}} conettore abilitato non trovato.',
  not_one_and_only_one_primary_sign_in_method:
    "Deve esserci un solo metodo di accesso principale. Si prega di verificare l'input.",
  username_requires_password:
    "Deve abilitare impostazione di una password per l'identificatore di registrazione dell'username.",
  passwordless_requires_verify:
    "Deve abilitare la verifica per l'identificatore di registrazione tramite email/telefono.",
  miss_sign_up_identifier_in_sign_in:
    "I metodi di accesso devono contenere l'identificatore di registrazione.",
  password_sign_in_must_be_enabled:
    'Il metodo di accesso con password deve essere abilitato quando è richiesta la creazione di una password nella registrazione.',
  code_sign_in_must_be_enabled:
    'Il metodo di accesso con codice di verifica deve essere abilitato quando non è richiesta una password nella registrazione.',
  unsupported_default_language: 'Questa lingua - {{language}} non è supportata al momento.',
  at_least_one_authentication_factor: 'Devi selezionare almeno un fattore di autenticazione.',
  backup_code_cannot_be_enabled_alone: 'Il codice di backup non può essere abilitato da solo.',
  duplicated_mfa_factors: 'Fattori MFA duplicati.',
  email_verification_code_cannot_be_used_for_mfa:
    "Il codice di verifica email non può essere utilizzato per MFA quando la verifica email è abilitata per l'accesso.",
  phone_verification_code_cannot_be_used_for_mfa:
    "Il codice di verifica SMS non può essere utilizzato per MFA quando la verifica SMS è abilitata per l'accesso.",
  email_verification_code_cannot_be_used_for_sign_in:
    "Il codice di verifica email non può essere utilizzato per l'accesso quando è abilitato per MFA.",
  phone_verification_code_cannot_be_used_for_sign_in:
    "Il codice di verifica SMS non può essere utilizzato per l'accesso quando è abilitato per MFA.",
  duplicated_sign_up_identifiers: 'Sono stati rilevati identificatori di registrazione duplicati.',
  missing_sign_up_identifiers: "L'identificatore di registrazione principale non può essere vuoto.",
  invalid_custom_email_blocklist_format:
    'Formato non valido per gli elementi della lista bloccata delle email personalizzate: {{items, list(type:conjunction)}}. Ogni elemento deve essere un indirizzo email o un dominio email valido, ad es., foo@example.com o @example.com.',
  forgot_password_method_requires_connector:
    'Il metodo di recupero della password richiede che sia configurato un connettore {{method}} corrispondente.',
};

export default Object.freeze(sign_in_experiences);
