const enterprise_sso_details = {
  back_to_sso_connectors: '返回企業SSO',
  page_title: '企業SSO連接器詳細資料',
  readme_drawer_title: '企業SSO',
  readme_drawer_subtitle: '設置企業SSO連接器以啟用最終用戶SSO',
  tab_experience: 'SSO體驗',
  tab_connection: '連接',
  tab_idp_initiated_auth: 'IdP 發起的 SSO',
  general_settings_title: '一般',
  general_settings_description: '配置最終用戶體驗並連結企業郵箱域以執行 SP 發起的 SSO 流程。',
  custom_branding_title: '顯示',
  custom_branding_description:
    '自定义在最终用户單點登錄流程中顯示的名稱和標識。 為空時，將使用默認值。',
  email_domain_field_name: '企業郵箱域',
  email_domain_field_description:
    '擁有此郵箱域的用戶可以使用SSO進行身份驗證。 請驗證該域是否屬於企業。',
  email_domain_field_placeholder: '郵箱域',
  sync_profile_field_name: '從身份提供者同步配置文件信息',
  sync_profile_option: {
    register_only: '僅在首次登錄時同步',
    each_sign_in: '每次登錄時都同步',
  },
  connector_name_field_name: '連接器名稱',
  display_name_field_name: '顯示名稱',
  connector_logo_field_name: '顯示標識',
  connector_logo_field_description: '每個圖像應該小於 500KB，僅支持 SVG、PNG、JPG、JPEG。',
  branding_logo_context: '上傳標識',
  branding_logo_error: '上傳標識錯誤: {{error}}',
  branding_light_logo_context: '上傳亮色模式標識',
  branding_light_logo_error: '上傳亮色模式標識錯誤: {{error}}',
  branding_logo_field_name: '標識',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: '上傳暗色模式標識',
  branding_dark_logo_error: '上傳暗色模式標識錯誤: {{error}}',
  branding_dark_logo_field_name: '標識（暗色模式）',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_connection_guide: '連接指南',
  enterprise_sso_deleted: '企業SSO連接器已成功刪除',
  delete_confirm_modal_title: '刪除企業SSO連接器',
  delete_confirm_modal_content: '你確定要刪除此企業連接器嗎？ 身份提供者的用戶將不會利用單點登錄。',
  upload_idp_metadata_title_saml: '上傳元數據',
  upload_idp_metadata_description_saml: '配置從身份提供者複製的元數據。',
  upload_idp_metadata_title_oidc: '上傳憑證',
  upload_idp_metadata_description_oidc: '配置從身份提供者複製的憑證和 OIDC 令牌信息。',
  upload_idp_metadata_button_text: '上傳元數據 XML 文件',
  upload_signing_certificate_button_text: '上傳簽名憑證文件',
  configure_domain_field_info_text: '添加郵箱域以指導企業用戶到其身份提供者進行單點登錄。',
  email_domain_field_required: '需要郵箱域以啟用企業SSO。',
  upload_saml_idp_metadata_info_text_url: '將身份提供者的元數據 URL 粘貼到此處以進行連接。',
  upload_saml_idp_metadata_info_text_xml: '粘貼來自身份提供者的元數據以進行連接。',
  upload_saml_idp_metadata_info_text_manual: '填寫來自身份提供者的元數據以進行連接。',
  upload_oidc_idp_info_text: '填寫來自身份提供者的信息以進行連接。',
  service_provider_property_title: '在 IdP 中進行配置',
  service_provider_property_description:
    '使用 {{protocol}} 在你的身份提供者中設置應用程序集成。輸入 Logto 提供的詳細信息。',
  attribute_mapping_title: '屬性映射',
  attribute_mapping_description:
    '通過在身份提供者或 Logto 端配置用戶屬性映射，從身份提供者同步用戶配置文件。',
  saml_preview: {
    sign_on_url: '登錄 URL',
    entity_id: '發行者',
    x509_certificate: '簽名憑證',
    certificate_content: '過期於 {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: '授權終點',
    token_endpoint: '令牌終點',
    userinfo_endpoint: '用戶信息終點',
    jwks_uri: 'JSON Web 金鑰集終點',
    issuer: '發行者',
  },
  idp_initiated_auth_config: {
    card_title: 'IdP 發起的 SSO',
    card_description:
      '用戶通常從你的應用程序使用 SP 發起的 SSO 流程開始身份驗證過程。除非絕對必要，否則不要啟用此功能。',
    enable_idp_initiated_sso: '啟用 IdP 發起的 SSO',
    enable_idp_initiated_sso_description:
      '允許企業用戶直接從身份提供者的入口網站開始身份驗證過程。在啟用此功能之前，請了解潛在的安全風險。',
    default_application: '默認應用程序',
    default_application_tooltip: '用戶身份驗證後將被重定向到的目標應用程序。',
    empty_applications_error: '未找到應用程序。請在 <a>應用程序</a> 部分添加一個。',
    empty_applications_placeholder: '沒有應用程序',
    authentication_type: '身份驗證類型',
    auto_authentication_disabled_title: '重定向到客戶端以進行 SP 發起的 SSO',
    auto_authentication_disabled_description:
      '推薦。將用戶重定向到客戶端應用程序以啟動安全的 SP 發起的 OIDC 身份驗證。這將防止 CSRF 攻擊。',
    auto_authentication_enabled_title: '直接使用 IdP 發起的 SSO 進行登錄',
    auto_authentication_enabled_description:
      '成功登錄後，用戶將被重定向到指定的重定向 URI，並帶有授權碼（無狀態和 PKCE 驗證）。',
    auto_authentication_disabled_app: '適用於傳統 Web 應用程序，單頁應用程序 (SPA)',
    auto_authentication_enabled_app: '適用於傳統 Web 應用程序',
    idp_initiated_auth_callback_uri: '客戶端回調 URI',
    idp_initiated_auth_callback_uri_tooltip:
      '客戶端回調 URI，用於啟動 SP 發起的 SSO 身份驗證流程。 將 ssoConnectorId 作為查詢參數附加到 URI 中。（例如，https://your.domain/sso/callback?connectorId={{ssoConnectorId}}）',
    redirect_uri: '登錄後重定向 URI',
    redirect_uri_tooltip:
      '成功登錄後重定向用戶的重定向 URI。 Logto 將使用此 URI 作為授權請求中的 OIDC 重定向 URI。為 IdP 發起的 SSO 身份驗證流程使用專用 URI 以提高安全性。',
    empty_redirect_uris_error: '該應用程序尚未註冊重定向 URI。請先添加一個。',
    redirect_uri_placeholder: '選擇登錄後重定向 URI',
    auth_params: '附加身份驗證參數',
    auth_params_tooltip:
      '授權請求中要傳遞的附加參數。 默認情況下，僅會請求（openid profile）範圍，您可以在此處指定附加範圍或獨佔狀態值。（例如，{ "scope": "organizations email", "state": "secret_state" }）',
  },
  trust_unverified_email: '信任未驗證的電子郵件',
  trust_unverified_email_label: '始終信任從身份提供者返回的未驗證的電子郵件地址',
  trust_unverified_email_tip:
    'Entra ID (OIDC) 連接器不返回 `email_verified` 聲明，這意味著來自 Azure 的電子郵件地址不一定被驗證。默認情況下，Logto 不會將未驗證的電子郵件地址同步到用戶配置文件中。如果你信任來自 Entra ID 目錄的所有電子郵件地址，僅需啟用此選項。',
  offline_access: {
    /** UNTRANSLATED */
    label: 'Enable offline access',
    /** UNTRANSLATED */
    description:
      'Set `access_type` to `offline` to allow the connector to request a refresh token from Google Workspace.',
    /** UNTRANSLATED */
    tooltip:
      'Unlike the standard OIDC connector, Google Workspace SSO does not support `offline_access` scope by default. It uses the `access_type=offline` parameter to request a refresh token. Enable this option to allow the connector to request a refresh token from Google Workspace.',
  },
};

export default Object.freeze(enterprise_sso_details);
