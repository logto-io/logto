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
    /** UNTRANSLATED */
    use_saml_app_api: 'Use `[METHOD] /saml-applications(/.*)?` API to operate SAML app.',
    /** UNTRANSLATED */
    saml_application_only: 'The API is only available for SAML applications.',
    /** UNTRANSLATED */
    reach_oss_limit: 'You CAN NOT create more SAML apps since the limit of {{limit}} is hit.',
    /** UNTRANSLATED */
    acs_url_binding_not_supported:
      'Only HTTP-POST binding is supported for receiving SAML assertions.',
    /** UNTRANSLATED */
    can_not_delete_active_secret: 'Can not delete the active secret.',
    /** UNTRANSLATED */
    no_active_secret: 'No active secret found.',
    /** UNTRANSLATED */
    entity_id_required: 'Entity ID is required to generate metadata.',
    /** UNTRANSLATED */
    name_id_format_required: 'Name ID format is required.',
    /** UNTRANSLATED */
    unsupported_name_id_format: 'Unsupported name ID format.',
    /** UNTRANSLATED */
    missing_email_address: 'User does not have an email address.',
    /** UNTRANSLATED */
    email_address_unverified: 'User email address is not verified.',
    /** UNTRANSLATED */
    invalid_certificate_pem_format: 'Invalid PEM certificate format',
    /** UNTRANSLATED */
    acs_url_required: 'Assertion Consumer Service URL is required.',
    /** UNTRANSLATED */
    private_key_required: 'Private key is required.',
    /** UNTRANSLATED */
    certificate_required: 'Certificate is required.',
    /** UNTRANSLATED */
    invalid_saml_request: 'Invalid SAML authentication request.',
    /** UNTRANSLATED */
    auth_request_issuer_not_match:
      'The issuer of the SAML authentication request mismatch with service provider entity ID.',
    /** UNTRANSLATED */
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'Service provider initiated SAML SSO session ID not found in cookies.',
    /** UNTRANSLATED */
    sp_initiated_saml_sso_session_not_found:
      'Service provider initiated SAML SSO session not found.',
    /** UNTRANSLATED */
    state_mismatch: '`state` mismatch.',
  },
};

export default Object.freeze(application);
