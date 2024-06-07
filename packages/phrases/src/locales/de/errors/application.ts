const application = {
  invalid_type: 'Nur Maschinen-zu-Maschinen-Anwendungen können Rollen haben.',
  role_exists: 'Die Rolle mit der ID {{roleId}} wurde bereits dieser Anwendung hinzugefügt.',
  invalid_role_type:
    'Es ist nicht möglich, einer Maschinen-zu-Maschinen-Anwendung eine Benutzertyp-Rolle zuzuweisen.',
  invalid_third_party_application_type:
    'Nur traditionelle Webanwendungen können als Drittanbieter-App markiert werden.',
  third_party_application_only: 'Das Feature ist nur für Drittanbieter-Anwendungen verfügbar.',
  user_consent_scopes_not_found: 'Ungültige Benutzerzustimmungsbereiche.',
  consent_management_api_scopes_not_allowed: 'Management API scopes are not allowed.',
  protected_app_metadata_is_required: 'Geschützte App-Metadaten sind erforderlich.',
  protected_app_not_configured:
    'Geschützter App-Anbieter ist nicht konfiguriert. Dieses Feature ist in der Open-Source-Version nicht verfügbar.',
  cloudflare_unknown_error: 'Fehler unbekannt beim Abrufen der Cloudflare API',
  protected_application_only: 'Das Feature ist nur für geschützte Anwendungen verfügbar.',
  protected_application_misconfigured: 'Geschützte Anwendung falsch konfiguriert.',
  protected_application_subdomain_exists:
    'Die Subdomain der geschützten Anwendung wird bereits verwendet.',
  invalid_subdomain: 'Ungültige Subdomain.',
  custom_domain_not_found: 'Benutzerdefinierte Domain nicht gefunden.',
  should_delete_custom_domains_first: 'Benutzerdefinierte Domains sollten zuerst gelöscht werden.',
};

export default Object.freeze(application);
