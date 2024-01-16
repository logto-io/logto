const application = {
  invalid_type: '只有機器對機器應用程式才能有相關職能。',
  role_exists: '角色 ID {{roleId}} 已經被添加到此應用程式中。',
  invalid_role_type: '無法將使用者類型的角色分配給機器對機器應用程式。',
  invalid_third_party_application_type: '只有傳統網頁應用程式才能被標記為第三方應用程式。',
  third_party_application_only: '此功能只適用於第三方應用程式。',
  user_consent_scopes_not_found: '無效的使用者同意範圍。',
  protected_app_metadata_is_required: '保護應用程式元數據是必需的。',
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
