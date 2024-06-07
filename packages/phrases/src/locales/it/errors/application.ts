const application = {
  invalid_type: 'Solo le applicazioni da macchina a macchina possono avere ruoli associati.',
  role_exists: "L'ID ruolo {{roleId}} è già stato aggiunto a questa applicazione.",
  invalid_role_type:
    "Impossibile assegnare un ruolo di tipo utente all'applicazione da macchina a macchina.",
  invalid_third_party_application_type:
    'Solo le applicazioni web tradizionali possono essere contrassegnate come applicazione di terze parti.',
  third_party_application_only:
    'La funzionalità è disponibile solo per le applicazioni di terze parti.',
  user_consent_scopes_not_found: 'Scopi di consenso utente non validi.',
  consent_management_api_scopes_not_allowed: 'I management API scopes non sono consentiti.',
  protected_app_metadata_is_required: "I metadati dell'applicazione protetta sono obbligatori.",
  protected_app_not_configured:
    "Il provider dell'applicazione protetta non è configurato. Questa funzionalità non è disponibile nella versione open source.",
  cloudflare_unknown_error:
    "Si è verificato un errore sconosciuto durante la richiesta all'API di Cloudflare",
  protected_application_only: 'La funzionalità è disponibile solo per le applicazioni protette.',
  protected_application_misconfigured: "L'applicazione protetta è configurata in modo errato.",
  protected_application_subdomain_exists:
    "Il sottodominio dell'applicazione protetta è già in uso.",
  invalid_subdomain: 'Sottodominio non valido.',
  custom_domain_not_found: 'Dominio personalizzato non trovato.',
  should_delete_custom_domains_first: 'Dovresti eliminare prima i domini personalizzati.',
};

export default Object.freeze(application);
