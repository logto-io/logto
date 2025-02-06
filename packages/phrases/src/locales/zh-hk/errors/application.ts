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
  no_legacy_secret_found: '此應用程式沒有傳統密鑰。',
  secret_name_exists: '密鑰名稱已存在。',
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
