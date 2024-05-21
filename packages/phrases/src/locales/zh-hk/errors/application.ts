const application = {
  invalid_type: '只有機器對機器應用程式才能有相關職能。',
  role_exists: '角色 ID {{roleId}} 已經被添加到此應用程式中。',
  invalid_role_type: '無法將使用者類型的角色分配給機器對機器應用程式。',
  invalid_third_party_application_type: '只有傳統網頁應用程式才能被標記為第三方應用程式。',
  third_party_application_only: '此功能只適用於第三方應用程式。',
  user_consent_scopes_not_found: '無效的使用者同意範圍。',
  consent_management_api_scopes_not_allowed: '管理 API 範圍不被允許。',
  protected_app_metadata_is_required: '保護應用程式元數據是必需的。',
  protected_app_not_configured: '未配置保護應用程式提供商。此功能對開源版本不可用。',
  cloudflare_unknown_error: '請求 Cloudflare API 時發生未知錯誤',
  protected_application_only: '此功能僅適用於保護應用程式。',
  protected_application_misconfigured: '保護應用程式配置錯誤。',
  protected_application_subdomain_exists: '保護應用程式子域名已在使用中。',
  invalid_subdomain: '無效的子域名。',
  custom_domain_not_found: '自訂域名未找到。',
  should_delete_custom_domains_first: '應該先刪除自訂域名。',
};

export default Object.freeze(application);
