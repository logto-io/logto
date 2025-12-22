const application = {
  invalid_type: 'Solo le applicazioni da macchina a macchina possono avere ruoli associati.',
  role_exists: "L'ID ruolo {{roleId}} è già stato aggiunto a questa applicazione.",
  invalid_role_type:
    "Impossibile assegnare un ruolo di tipo utente all'applicazione da macchina a macchina.",
  invalid_third_party_application_type:
    'Solo le applicazioni web tradizionali, single-page e native possono essere contrassegnate come applicazioni di terze parti.',
  third_party_application_only:
    'La funzionalità è disponibile solo per le applicazioni di terze parti.',
  user_consent_scopes_not_found: 'Scopi di consenso utente non validi.',
  consent_management_api_scopes_not_allowed: 'I Management API scopes non sono consentiti.',
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
  no_legacy_secret_found: "L'applicazione non ha un segreto legacy.",
  secret_name_exists: 'Il nome del segreto esiste già.',
  saml: {
    use_saml_app_api: "Usa l'API `[METHOD] /saml-applications(/.*)?` per operare sull'app SAML.",
    saml_application_only: "L'API è disponibile solo per le applicazioni SAML.",
    reach_oss_limit:
      'Non puoi creare più app SAML poiché è stato raggiunto il limite di {{limit}}.',
    acs_url_binding_not_supported:
      'Solo il binding HTTP-POST è supportato per ricevere assertion SAML.',
    can_not_delete_active_secret: 'Non è possibile eliminare il segreto attivo.',
    no_active_secret: 'Non è stato trovato alcun segreto attivo.',
    entity_id_required: 'È richiesto un Entity ID per generare i metadati.',
    name_id_format_required: 'È richiesto un formato Name ID.',
    unsupported_name_id_format: 'Formato Name ID non supportato.',
    missing_email_address: "L'utente non ha un indirizzo email.",
    email_address_unverified: "L'indirizzo email dell'utente non è verificato.",
    invalid_certificate_pem_format: 'Formato del certificato PEM non valido',
    acs_url_required: "È richiesto l'URL del servizio consumatore di assertion.",
    private_key_required: 'È richiesta una chiave privata.',
    certificate_required: 'È richiesto un certificato.',
    invalid_saml_request: 'Richiesta di autenticazione SAML non valida.',
    auth_request_issuer_not_match:
      "L'emittente della richiesta di autenticazione SAML non corrisponde all'Entity ID del fornitore di servizi.",
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'ID sessione SSO SAML iniziato dal fornitore di servizi non trovato nei cookie.',
    sp_initiated_saml_sso_session_not_found:
      'Sessione SSO SAML iniziata dal fornitore di servizi non trovata.',
    state_mismatch: 'Discrepanza nel `state`.',
  },
};

export default Object.freeze(application);
