const application = {
  invalid_type: 'Nur Maschinen-zu-Maschinen-Anwendungen können Rollen haben.',
  role_exists: 'Die Rolle mit der ID {{roleId}} wurde bereits dieser Anwendung hinzugefügt.',
  invalid_role_type:
    'Es ist nicht möglich, einer Maschinen-zu-Maschinen-Anwendung eine Benutzertyp-Rolle zuzuweisen.',
  invalid_third_party_application_type:
    'Nur traditionelle Webanwendungen können als Drittanbieter-App markiert werden.',
  third_party_application_only: 'Das Feature ist nur für Drittanbieter-Anwendungen verfügbar.',
  user_consent_scopes_not_found: 'Ungültige Benutzerzustimmungsbereiche.',
  /** UNTRANSLATED */
  consent_management_api_scopes_not_allowed: 'Management API scopes are not allowed.',
  protected_app_metadata_is_required: 'Geschützte App-Metadaten sind erforderlich.',
  /** UNTRANSLATED */
  protected_app_not_configured: 'Protected app provider is not configured.',
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
};

export default Object.freeze(application);
