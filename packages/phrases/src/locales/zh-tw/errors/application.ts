const application = {
  invalid_type: '僅允許機器對機器應用程式附加角色。',
  role_exists: '該角色 ID {{roleId}} 已被添加至此應用程式。',
  invalid_role_type: '無法將使用者類型的角色指派給機器對機器應用程式。',
  invalid_third_party_application_type: '僅傳統網路應用程式可以標記為第三方應用程式。',
  third_party_application_only: '該功能僅適用於第三方應用程式。',
  user_consent_scopes_not_found: '無效的使用者同意範圍。',
  consent_management_api_scopes_not_allowed: '管理 API 範圍不被允許。',
  protected_app_metadata_is_required: '需要保護應用程式元數據。',
  protected_app_not_configured: '保護應用程式提供者未配置。此功能不適用於開源版本。',
  cloudflare_unknown_error: '在請求 Cloudflare API 時發生未知錯誤',
  protected_application_only: '該功能僅適用於受保護的應用程式。',
  protected_application_misconfigured: '受保護的應用程式配置錯誤。',
  protected_application_subdomain_exists: '受保護應用程式的子域名已被使用。',
  invalid_subdomain: '無效的子域名。',
  custom_domain_not_found: '找不到自訂域名。',
  should_delete_custom_domains_first: '應先刪除自訂域名。',
};

export default Object.freeze(application);
