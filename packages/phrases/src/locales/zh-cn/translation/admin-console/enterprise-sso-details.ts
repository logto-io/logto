const enterprise_sso_details = {
  back_to_sso_connectors: '返回企业SSO',
  page_title: '企业SSO连接器详情',
  readme_drawer_title: '企业SSO',
  readme_drawer_subtitle: '设置企业SSO连接器以启用最终用户SSO',
  tab_experience: 'SSO体验',
  tab_connection: '连接',
  /** UNTRANSLATED */
  tab_idp_initiated_auth: 'IdP-initiated SSO',
  general_settings_title: '常规',
  custom_branding_title: '显示',
  custom_branding_description:
    '自定义在最终用户单点登录流程中显示的名称和标识。如果为空，则使用默认值。',
  email_domain_field_name: '企业电子邮件域',
  email_domain_field_description:
    '拥有此电子邮件域的用户可以使用SSO进行身份验证。请验证该域名属于企业。',
  email_domain_field_placeholder: '邮箱域',
  sync_profile_field_name: '从身份提供者同步个人资料信息',
  sync_profile_option: {
    register_only: '仅在首次登录时同步',
    each_sign_in: '每次登录时始终同步',
  },
  connector_name_field_name: '连接器名称',
  display_name_field_name: '显示名称',
  connector_logo_field_name: '显示标识',
  connector_logo_field_description: '每个图像应不超过500KB，仅支持SVG、PNG、JPG、JPEG。',
  branding_logo_context: '上传标识',
  branding_logo_error: '上传标识错误：{{error}}',
  branding_light_logo_context: '上传浅色主题标识',
  branding_light_logo_error: '上传浅色主题标识错误：{{error}}',
  branding_logo_field_name: '标识',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: '上传深色主题标识',
  branding_dark_logo_error: '上传深色主题标识错误：{{error}}',
  branding_dark_logo_field_name: '标识（深色主题）',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_connection_guide: '连接指南',
  enterprise_sso_deleted: '企业SSO连接器已成功删除',
  delete_confirm_modal_title: '删除企业SSO连接器',
  delete_confirm_modal_content:
    '您确定要删除此企业连接器吗？来自身份提供者的用户将不能使用单点登录。',
  upload_idp_metadata_title_saml: '上传元数据',
  upload_idp_metadata_description_saml: '配置从身份提供者复制的元数据。',
  upload_idp_metadata_title_oidc: '上传凭证',
  upload_idp_metadata_description_oidc: '配置从身份提供者复制的凭证和OIDC令牌信息。',
  upload_idp_metadata_button_text: '上传元数据XML文件',
  upload_signing_certificate_button_text: '上传签名证书文件',
  configure_domain_field_info_text: '添加电子邮件域以指导企业用户到其身份提供者进行单点登录。',
  email_domain_field_required: '必须提供电子邮件域以启用企业SSO。',
  upload_saml_idp_metadata_info_text_url: '粘贴从身份提供者获取的元数据URL进行连接。',
  upload_saml_idp_metadata_info_text_xml: '粘贴从身份提供者获取的元数据进行连接。',
  upload_saml_idp_metadata_info_text_manual: '填写从身份提供者获取的元数据进行连接。',
  upload_oidc_idp_info_text: '填写来自身份提供者的信息进行连接。',
  service_provider_property_title: '在IdP中配置',
  service_provider_property_description:
    '在您的身份提供者中使用{{protocol}}设置应用程序集成。输入Logto提供的详细信息。',
  attribute_mapping_title: '属性映射',
  attribute_mapping_description:
    '通过在身份提供者或Logto端配置用户属性映射，从身份提供者同步用户配置文件。',
  saml_preview: {
    sign_on_url: '登录URL',
    entity_id: '发行者',
    x509_certificate: '签名证书',
    certificate_content: '将于{{date}}到期',
  },
  oidc_preview: {
    authorization_endpoint: '授权端点',
    token_endpoint: '令牌端点',
    userinfo_endpoint: '用户信息端点',
    jwks_uri: 'JSON Web Key集端点',
    issuer: '发行者',
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
