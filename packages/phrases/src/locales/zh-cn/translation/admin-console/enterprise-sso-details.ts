const enterprise_sso_details = {
  back_to_sso_connectors: '返回企业SSO',
  page_title: '企业SSO连接器详情',
  readme_drawer_title: '企业SSO',
  readme_drawer_subtitle: '设置企业SSO连接器以启用最终用户SSO',
  tab_experience: 'SSO体验',
  tab_connection: '连接',
  tab_idp_initiated_auth: 'IdP 发起的 SSO',
  general_settings_title: '常规',
  general_settings_description: '配置最终用户体验并链接企业电子邮件域以启动 SP 发起的 SSO 流程。',
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
    '你确定要删除此企业连接器吗？来自身份提供者的用户将不能使用单点登录。',
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
    '在你的身份提供者中使用{{protocol}}设置应用程序集成。输入 Logto 提供的详细信息。',
  attribute_mapping_title: '属性映射',
  attribute_mapping_description:
    '通过在身份提供者或 Logto 端配置用户属性映射，从身份提供者同步用户配置文件。',
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
    jwks_uri: 'JSON Web Key 集端点',
    issuer: '发行者',
  },
  idp_initiated_auth_config: {
    card_title: 'IdP 发起的 SSO',
    card_description:
      '用户通常会通过 SP 发起的 SSO 流程从你的应用开始认证流程。除非绝对必要，否则不要启用此功能。',
    enable_idp_initiated_sso: '启用 IdP 发起的 SSO',
    enable_idp_initiated_sso_description:
      '允许企业用户直接从身份提供者的门户开始认证流程。请在启用此功能前了解潜在的安全风险。',
    default_application: '默认应用程序',
    default_application_tooltip: '用户进行认证后将被重定向到的目标应用程序。',
    empty_applications_error: '未找到应用程序。请在<a>应用程序</a>部分添加一个。',
    empty_applications_placeholder: '没有应用程序',
    authentication_type: '认证类型',
    auto_authentication_disabled_title: '为 SP 发起的 SSO 重定向到客户端',
    auto_authentication_disabled_description:
      '推荐。将用户重定向到客户端应用程序以启动安全的 SP 发起的 OIDC 认证。这样可以防止 CSRF 攻击。',
    auto_authentication_enabled_title: '通过 IdP 发起的 SSO 直接登录',
    auto_authentication_enabled_description:
      '成功登录后，用户将被重定向到指定的重定向 URI，并携带授权码（无状态和 PKCE 验证）。',
    auto_authentication_disabled_app: '适用于传统 Web 应用、单页应用（SPA）',
    auto_authentication_enabled_app: '适用于传统 Web 应用',
    idp_initiated_auth_callback_uri: '客户端回调 URI',
    idp_initiated_auth_callback_uri_tooltip:
      '客户端回调 URI 用于启动 SP 发起的 SSO 认证流程。一个 ssoConnectorId 将作为查询参数附加到 URI。（例如，https://your.domain/sso/callback?connectorId={{ssoConnectorId}}）',
    redirect_uri: '登录后重定向 URI',
    redirect_uri_tooltip:
      '用户成功登录后将被重定向的 URI。Logto 将在授权请求中使用此 URI 作为 OIDC 重定向 URI。为 IdP 发起的 SSO 认证流程使用专用 URI 以获得更好的安全性。',
    empty_redirect_uris_error: '应用程序没有注册重定向 URI。请先添加一个。',
    redirect_uri_placeholder: '选择一个登录后重定向 URI',
    auth_params: '附加认证参数',
    auth_params_tooltip:
      '在授权请求中传递的附加参数。默认情况下将仅请求（openid profile）作用域，你可以在此指定附加作用域或一个独占的状态值。（例如，{ "scope": "organizations email", "state": "secret_state" }）',
  },
  trust_unverified_email: '信任未验证的电子邮件',
  trust_unverified_email_label: '始终信任身份提供者返回的未验证电子邮件地址',
  trust_unverified_email_tip:
    'Entra ID（OIDC）连接器不返回 `email_verified` 声明，这意味着来自 Azure 的电子邮件地址不一定经过验证。默认情况下，Logto 将不会将未验证的电子邮件地址同步到用户配置文件。只有在你信任来自 Entra ID 目录的所有电子邮件地址时才启用此选项。',
  offline_access: {
    label: '刷新访问令牌',
    description:
      '启用 Google `offline` 访问以请求刷新令牌，允许你的应用在不重新授权用户的情况下刷新访问令牌。',
  },
};

export default Object.freeze(enterprise_sso_details);
