const application = {
  invalid_type: 'Tylko aplikacje maszyna-do-maszyny mogą mieć przypisane role.',
  role_exists: 'Rola o identyfikatorze {{roleId}} została już dodana do tej aplikacji.',
  invalid_role_type: 'Nie można przypisać roli typu użytkownika do aplikacji maszyna-do-maszyny.',
  invalid_third_party_application_type:
    'Tylko tradycyjne aplikacje internetowe mogą być oznaczone jako aplikacja zewnętrzna.',
  third_party_application_only: 'Ta funkcja jest dostępna tylko dla aplikacji zewnętrznych.',
  user_consent_scopes_not_found: 'Nieprawidłowe zakresy zgody użytkownika.',
  consent_management_api_scopes_not_allowed: 'Nie są dozwolone zakresy API zarządzania.',
  protected_app_metadata_is_required: 'Wymagane jest zabezpieczone metadane aplikacji.',
  protected_app_not_configured:
    'Dostawca aplikacji zabezpieczonej nie jest skonfigurowany. Ta funkcja nie jest dostępna dla wersji open source.',
  cloudflare_unknown_error: 'Wystąpił nieznany błąd podczas żądania interfejsu API Cloudflare',
  protected_application_only: 'Ta funkcja jest dostępna tylko dla aplikacji chronionych.',
  protected_application_misconfigured: 'Aplikacja chroniona jest źle skonfigurowana.',
  protected_application_subdomain_exists: 'Subdomena aplikacji chronionej jest już w użyciu.',
  invalid_subdomain: 'Nieprawidłowa subdomena.',
  custom_domain_not_found: 'Nie znaleziono niestandardowej domeny.',
  should_delete_custom_domains_first: 'Należy najpierw usunąć niestandardowe domeny.',
  no_legacy_secret_found: 'Aplikacja nie ma starszego sekretu.',
  secret_name_exists: 'Nazwa sekretu już istnieje.',
  saml: {
    /** UNTRANSLATED */
    use_saml_app_api: 'Use `[METHOD] /saml-applications(/.*)?` API to operate SAML app.',
    /** UNTRANSLATED */
    saml_application_only: 'The API is only available for SAML applications.',
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
