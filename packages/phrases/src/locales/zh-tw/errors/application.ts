const application = {
  invalid_type: '僅允許機器對機器應用程式附加角色。',
  role_exists: '該角色 ID {{roleId}} 已被添加至此應用程式。',
  invalid_role_type: '無法將使用者類型的角色指派給機器對機器應用程式。',
  invalid_third_party_application_type: '僅傳統網路應用程式可以標記為第三方應用程式。',
  third_party_application_only: '該功能僅適用於第三方應用程式。',
  user_consent_scopes_not_found: '無效的使用者同意範圍。',
  /** UNTRANSLATED */
  consent_management_api_scopes_not_allowed: 'Management API scopes are not allowed.',
  protected_app_metadata_is_required: '需要保護應用程式元數據。',
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
};

export default Object.freeze(application);
