const application = {
  invalid_type: '只有机器对机器应用程序可以有关联角色。',
  role_exists: '角色 ID {{roleId}} 已添加到此应用程序。',
  invalid_role_type: '无法将用户类型角色分配给机器对机器应用程序。',
  invalid_third_party_application_type: '只有传统网络应用程序可以标记为第三方应用。',
  third_party_application_only: '该功能仅适用于第三方应用程序。',
  user_consent_scopes_not_found: '无效的用户同意范围。',
  consent_management_api_scopes_not_allowed: '管理 API 范围不允许。',
  protected_app_metadata_is_required: '需要保护的应用程序元数据。',
  protected_app_not_configured: '受保护的应用程序提供程序未配置。 此功能不适用于开源版本。',
  cloudflare_unknown_error: '请求 Cloudflare API 时发生未知错误',
  protected_application_only: '该功能仅适用于受保护的应用程序。',
  protected_application_misconfigured: '受保护的应用程序配置不正确。',
  protected_application_subdomain_exists: '受保护的应用程序子域名已在使用中。',
  invalid_subdomain: '无效的子域名。',
  custom_domain_not_found: '未找到自定义域。',
  should_delete_custom_domains_first: '应先删除自定义域。',
};

export default Object.freeze(application);
