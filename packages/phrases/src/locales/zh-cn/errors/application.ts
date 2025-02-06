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
  no_legacy_secret_found: '该应用程序没有旧版密钥。',
  secret_name_exists: '密钥名称已存在。',
  saml: {
    /** UNTRANSLATED */
    use_saml_app_api: 'Use `[METHOD] /saml-applications(/.*)?` API to operate SAML app.',
    /** UNTRANSLATED */
    saml_application_only: 'The API is only available for SAML applications.',
    /** UNTRANSLATED */
    reach_oss_limit: 'You CAN NOT create more SAML apps since the limit of {{limit}} is hit.',
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
