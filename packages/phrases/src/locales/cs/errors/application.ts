const application = {
  invalid_type: 'Only machine to machine applications can have associated roles.',
  role_exists: 'The role id {{roleId}} is already been added to this application.',
  invalid_role_type: 'Can not assign user type role to machine to machine application.',
  invalid_third_party_application_type:
    'Only traditional web, single-page, and native applications can be marked as third-party apps.',
  third_party_application_only: 'The feature is only available for third-party applications.',
  user_consent_scopes_not_found: 'Invalid user consent scopes.',
  consent_management_api_scopes_not_allowed: 'Management API scopes are not allowed.',
  protected_app_metadata_is_required: 'Protected app metadata is required.',
  protected_app_not_configured:
    'Protected app provider is not configured. This feature is not available for open source version.',
  cloudflare_unknown_error: 'Got unknown error when requesting Cloudflare API',
  protected_application_only: 'The feature is only available for protected applications.',
  protected_application_misconfigured: 'Protected application is misconfigured.',
  protected_application_subdomain_exists:
    'The subdomain of Protected application is already in use.',
  invalid_subdomain: 'Invalid subdomain.',
  custom_domain_not_found: 'Custom domain not found.',
  should_delete_custom_domains_first: 'Should delete custom domains first.',
  no_legacy_secret_found: 'The application does not have a legacy secret.',
  secret_name_exists: 'Secret name already exists.',
  saml: {
    use_saml_app_api: 'Use `[METHOD] /saml-applications(/.*)?` API to operate SAML app.',
    saml_application_only: 'The API is only available for SAML applications.',
    reach_oss_limit: 'You CAN NOT create more SAML apps since the limit of {{limit}} is hit.',
    acs_url_binding_not_supported:
      'Only HTTP-POST binding is supported for receiving SAML assertions.',
    can_not_delete_active_secret: 'Can not delete the active secret.',
    no_active_secret: 'No active secret found.',
    entity_id_required: 'Entity ID is required to generate metadata.',
    name_id_format_required: 'Name ID format is required.',
    unsupported_name_id_format: 'Unsupported name ID format.',
    missing_email_address: 'User does not have an email address.',
    email_address_unverified: 'User email address is not verified.',
    invalid_certificate_pem_format: 'Invalid PEM certificate format',
    acs_url_required: 'Assertion Consumer Service URL is required.',
    private_key_required: 'Private key is required.',
    certificate_required: 'Certificate is required.',
    invalid_saml_request: 'Invalid SAML authentication request.',
    auth_request_issuer_not_match:
      'The issuer of the SAML authentication request mismatch with service provider entity ID.',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'Service provider initiated SAML SSO session ID not found in cookies.',
    sp_initiated_saml_sso_session_not_found:
      'Service provider initiated SAML SSO session not found.',
    state_mismatch: '`state` mismatch.',
  },
};

export default Object.freeze(application);
