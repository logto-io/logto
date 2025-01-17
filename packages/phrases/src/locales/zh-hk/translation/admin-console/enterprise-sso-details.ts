const enterprise_sso_details = {
  back_to_sso_connectors: '返回企業SSO',
  page_title: '企業SSO連接器詳細信息',
  readme_drawer_title: '企業SSO',
  readme_drawer_subtitle: '設置企業SSO連接器以啟用終端用戶SSO',
  tab_experience: 'SSO體驗',
  tab_connection: '連接',
  /** UNTRANSLATED */
  tab_idp_initiated_auth: 'IdP-initiated SSO',
  general_settings_title: '一般',
  custom_branding_title: '顯示',
  custom_branding_description:
    '自定義在終端用戶單點登錄流程中顯示的名稱和圖標。 當為空時，將使用默認值。',
  email_domain_field_name: '企業郵箱域',
  email_domain_field_description:
    '使用此郵箱域的用戶可以使用SSO進行身份驗證。 請驗證該域是否屬於企業。',
  email_domain_field_placeholder: '郵箱域',
  sync_profile_field_name: '將配置文件信息從身份提供者同步',
  sync_profile_option: {
    register_only: '僅在首次登錄時同步',
    each_sign_in: '每次登錄時始終同步',
  },
  connector_name_field_name: '連接器名稱',
  display_name_field_name: '顯示名稱',
  connector_logo_field_name: '顯示圖標',
  connector_logo_field_description: '每個圖像應小於500KB，僅支援SVG，PNG，JPG，JPEG。',
  branding_logo_context: '上傳圖標',
  branding_logo_error: '上傳圖標錯誤：{{error}}',
  branding_light_logo_context: '上傳淺色模式圖標',
  branding_light_logo_error: '上傳淺色模式圖標錯誤：{{error}}',
  branding_logo_field_name: '圖標',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: '上傳深色模式圖標',
  branding_dark_logo_error: '上傳深色模式圖標錯誤：{{error}}',
  branding_dark_logo_field_name: '圖標（深色模式）',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_connection_guide: '連接指南',
  enterprise_sso_deleted: '企業SSO連接器已成功刪除',
  delete_confirm_modal_title: '刪除企業SSO連接器',
  delete_confirm_modal_content: '您確定要刪除此企業連接器嗎？ 身份提供者的用戶將無法使用單點登錄。',
  upload_idp_metadata_title_saml: '上傳元數據',
  upload_idp_metadata_description_saml: '配置從身份提供者複製的元數據。',
  upload_idp_metadata_title_oidc: '上傳憑證',
  upload_idp_metadata_description_oidc: '配置從身份提供者複製的憑證和OIDC令牌信息。',
  upload_idp_metadata_button_text: '上傳元數據XML文件',
  upload_signing_certificate_button_text: '上傳簽名憑證文件',
  configure_domain_field_info_text: '添加電子郵件域以引導企業用戶到其身份提供者進行單點登錄。',
  email_domain_field_required: '需要填寫電子郵件域以啟用企業SSO。',
  upload_saml_idp_metadata_info_text_url: '粘貼來自身份提供者的元數據URL以進行連接。',
  upload_saml_idp_metadata_info_text_xml: '粘貼來自身份提供者的元數據以進行連接。',
  upload_saml_idp_metadata_info_text_manual: '填寫來自身份提供者的元數據以進行連接。',
  upload_oidc_idp_info_text: '填寫來自身份提供者的信息以進行連接。',
  service_provider_property_title: '在IdP中配置',
  service_provider_property_description:
    '使用{{protocol}}在身份提供者中設置應用程序集成。 輸入Logto提供的詳細信息。',
  attribute_mapping_title: '屬性映射',
  attribute_mapping_description:
    '通過在身份提供者或Logto端配置用戶屬性映射來從身份提供者同步用戶配置文件。',
  saml_preview: {
    sign_on_url: '登錄URL',
    entity_id: '發行者',
    x509_certificate: '簽名憑證',
    certificate_content: '到期{{date}}',
  },
  oidc_preview: {
    authorization_endpoint: '授權端點',
    token_endpoint: '令牌端點',
    userinfo_endpoint: '用戶信息端點',
    jwks_uri: 'JSON Web鍵集端點',
    issuer: '發行者',
  },
  idp_initiated_auth_config: {
    /** UNTRANSLATED */
    card_title: 'IdP-initiated SSO',
    /** UNTRANSLATED */
    card_description:
      'User typically start the authentication process from your app using the SP-initiated SSO flow. DO NOT enable this feature unless absolutely necessary.',
    /** UNTRANSLATED */
    enable_idp_initiated_sso: 'Enable IdP-initiated SSO',
    /** UNTRANSLATED */
    enable_idp_initiated_sso_description:
      "Allow enterprise users to start the authentication process directly from the identity provider's portal. Please understand the potential security risks before enabling this feature.",
    /** UNTRANSLATED */
    default_application: 'Default application',
    /** UNTRANSLATED */
    default_application_tooltip:
      'Target application the user will be redirected to after authentication.',
    /** UNTRANSLATED */
    empty_applications_error:
      'No applications found. Please add one in the <a>Applications</a> section.',
    /** UNTRANSLATED */
    empty_applications_placeholder: 'No applications',
    /** UNTRANSLATED */
    authentication_type: 'Authentication type',
    /** UNTRANSLATED */
    auto_authentication_disabled_title: 'Redirect to client for SP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_disabled_description:
      'Recommended. Redirect users to the client-side application to initiate a secure SP-initiated OIDC authentication.  This will prevent the CSRF attacks.',
    /** UNTRANSLATED */
    auto_authentication_enabled_title: 'Directly sign in using the IdP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_enabled_description:
      'After successful sign-in, users will be redirected to the specified Redirect URI with the authorization code (Without state and PKCE validation).',
    /** UNTRANSLATED */
    auto_authentication_disabled_app: 'For traditional web app, single-page app (SPA)',
    /** UNTRANSLATED */
    auto_authentication_enabled_app: 'For traditional web app',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri: 'Client callback URI',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri_tooltip:
      'The client callback URI to initiate a SP-initiated SSO authentication flow. An ssoConnectorId will be appended to the URI as a query parameter. (e.g., https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    /** UNTRANSLATED */
    redirect_uri: 'Post sign-in redirect URI',
    /** UNTRANSLATED */
    redirect_uri_tooltip:
      'The redirect URI to redirect users after successful sign-in. Logto will use this URI as the OIDC redirect URI in the authorization request. Use a dedicated URI for the IdP-initiated SSO authentication flow for better security.',
    /** UNTRANSLATED */
    empty_redirect_uris_error:
      'No redirect URI has been registered for the application. Please add one first.',
    /** UNTRANSLATED */
    redirect_uri_placeholder: 'Select a post sign-in redirect URI',
    /** UNTRANSLATED */
    auth_params: 'Additional authentication parameters',
    /** UNTRANSLATED */
    auth_params_tooltip:
      'Additional parameters to be passed in the authorization request. By default only (openid profile) scopes will be requested, you can specify additional scopes or a exclusive state value here. (e.g., { "scope": "organizations email", "state": "secret_state" }).',
  },
  /** UNTRANSLATED */
  trust_unverified_email: 'Trust unverified email',
  /** UNTRANSLATED */
  trust_unverified_email_label:
    'Always trust the unverified email addresses returned from the identity provider',
  /** UNTRANSLATED */
  trust_unverified_email_tip:
    'The Entra ID (OIDC) connector does not return the `email_verified` claim, meaning that email addresses from Azure are not guaranteed to be verified. By default, Logto will not sync unverified email addresses to the user profile. Enable this option only if you trust all the email addresses from the Entra ID directory.',
};

export default Object.freeze(enterprise_sso_details);
