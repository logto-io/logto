const application = {
  invalid_type: 'Only machine to machine applications can have associated roles.',
  role_exists: 'The role id {{roleId}} is already been added to this application.',
  invalid_role_type: 'Can not assign user type role to machine to machine application.',
  invalid_third_party_application_type:
    'Only traditional web applications can be marked as a third-party app.',
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
};

export default Object.freeze(application);
