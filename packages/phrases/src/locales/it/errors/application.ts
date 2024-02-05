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
  /** UNTRANSLATED */
  consent_management_api_scopes_not_allowed: 'Management API scopes are not allowed.',
  protected_app_metadata_is_required: 'Protected app metadata is required.',
  /** UNTRANSLATED */
  protected_app_not_configured:
    'Protected app provider is not configured. This feature is not available for open source version.',
  /** UNTRANSLATED */
  cloudflare_unknown_error: 'Got unknown error when requesting Cloudflare API',
  /** UNTRANSLATED */
  protected_application_only: 'The feature is only available for protected applications.',
  /** UNTRANSLATED */
  protected_application_misconfigured: 'Protected application is misconfigured.',
  /** UNTRANSLATED */
  protected_application_subdomain_exists:
    'The subdomain of Protected application is already in use.',
  /** UNTRANSLATED */
  invalid_subdomain: 'Invalid subdomain.',
  /** UNTRANSLATED */
  custom_domain_not_found: 'Custom domain not found.',
  /** UNTRANSLATED */
  should_delete_custom_domains_first: 'Should delete custom domains first.',
};

export default Object.freeze(application);
