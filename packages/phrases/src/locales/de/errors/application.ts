const application = {
  invalid_type: 'Nur Maschinen-zu-Maschinen-Anwendungen können Rollen haben.',
  role_exists: 'Die Rolle mit der ID {{roleId}} wurde bereits dieser Anwendung hinzugefügt.',
  invalid_role_type:
    'Es ist nicht möglich, einer Maschinen-zu-Maschinen-Anwendung eine Benutzertyp-Rolle zuzuweisen.',
  invalid_third_party_application_type:
    'Nur traditionelle Web-, Single-Page- und native Anwendungen können als Drittanbieter-Apps markiert werden.',
  third_party_application_only: 'Das Feature ist nur für Drittanbieter-Anwendungen verfügbar.',
  user_consent_scopes_not_found: 'Ungültige Benutzerzustimmungsbereiche.',
  consent_management_api_scopes_not_allowed: 'Management API scopes sind nicht erlaubt.',
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
  no_legacy_secret_found: 'Die Anwendung hat kein altes Geheimnis.',
  secret_name_exists: 'Geheimnisname existiert bereits.',
  saml: {
    use_saml_app_api:
      'Nutze die `[METHOD] /saml-applications(/.*)?` API, um die SAML-App zu betreiben.',
    saml_application_only: 'Die API ist nur für SAML-Anwendungen verfügbar.',
    reach_oss_limit:
      'Du kannst keine weiteren SAML-Apps erstellen, da das Limit von {{limit}} erreicht wurde.',
    acs_url_binding_not_supported:
      'Nur HTTP-POST-Bindung wird für den Empfang von SAML-Aussagen unterstützt.',
    can_not_delete_active_secret: 'Das aktive Geheimnis kann nicht gelöscht werden.',
    no_active_secret: 'Kein aktives Geheimnis gefunden.',
    entity_id_required: 'Entity ID ist erforderlich, um Metadaten zu generieren.',
    name_id_format_required: 'Name ID Format ist erforderlich.',
    unsupported_name_id_format: 'Nicht unterstütztes Name ID Format.',
    missing_email_address: 'Der Benutzer hat keine E-Mail-Adresse.',
    email_address_unverified: 'Die E-Mail-Adresse des Benutzers ist nicht verifiziert.',
    invalid_certificate_pem_format: 'Ungültiges PEM-Zertifikatsformat',
    acs_url_required: 'Assertion Consumer Service URL ist erforderlich.',
    private_key_required: 'Privater Schlüssel ist erforderlich.',
    certificate_required: 'Zertifikat ist erforderlich.',
    invalid_saml_request: 'Ungültige SAML-Authentifizierungsanfrage.',
    auth_request_issuer_not_match:
      'Der Aussteller der SAML-Authentifizierungsanfrage stimmt nicht mit der Entity ID des Dienstanbieters überein.',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'Vom Dienstanbieter initiierte SAML-SSO-Sitzungs-ID nicht in Cookies gefunden.',
    sp_initiated_saml_sso_session_not_found:
      'Vom Dienstanbieter initiierte SAML-SSO-Sitzung nicht gefunden.',
    state_mismatch: '`state` stimmt nicht überein.',
  },
};

export default Object.freeze(application);
