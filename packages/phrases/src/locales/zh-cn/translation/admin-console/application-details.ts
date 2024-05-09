const application_details = {
  page_title: '应用详情',
  back_to_applications: '返回全部应用',
  check_guide: '查看指南',
  settings: '设置',
  /** UNTRANSLATED */
  settings_description:
    'An "Application" is a registered software or service that can access user info or act for a user. Applications help recognize who’s asking for what from Logto and handle the sign-in and permission. Fill in the required fields for authentication.',
  /** UNTRANSLATED */
  integration: 'Integration',
  /** UNTRANSLATED */
  integration_description:
    "Deploy with Logto secure workers, powered by Cloudflare's edge network for top-tier performance and 0ms cold starts worldwide.",
  /** UNTRANSLATED */
  service_configuration: 'Service configuration',
  /** UNTRANSLATED */
  service_configuration_description: 'Complete the necessary configurations in your service.',
  /** UNTRANSLATED */
  session: 'Session',
  /** UNTRANSLATED */
  endpoints_and_credentials: 'Endpoints & Credentials',
  /** UNTRANSLATED */
  endpoints_and_credentials_description:
    'Use the following endpoints and credentials to set up the OIDC connection in your application.',
  /** UNTRANSLATED */
  refresh_token_settings: 'Refresh token',
  /** UNTRANSLATED */
  refresh_token_settings_description: 'Manage the refresh token rules for this application.',
  application_roles: '角色',
  machine_logs: '机器日志',
  application_name: '应用名称',
  application_name_placeholder: '我的应用',
  description: '描述',
  description_placeholder: '请输入应用描述',
  config_endpoint: 'OpenID Provider 配置端点',
  authorization_endpoint: '授权端点',
  authorization_endpoint_tip: '进行鉴权与授权的端点。用于 OpenID Connect 中的 <a>鉴权</a> 流程。',
  /** UNTRANSLATED */
  show_endpoint_details: 'Show endpoint details',
  /** UNTRANSLATED */
  hide_endpoint_details: 'Hide endpoint details',
  logto_endpoint: 'Logto 端点',
  application_id: '应用 ID',
  application_id_tip:
    '应用的唯一标识，通常由 Logto 生成。等价于 OpenID Connect 中的 <a>client_id</a>。',
  application_secret: '应用密钥',
  redirect_uri: '重定向 URI',
  redirect_uris: '重定向 URIs',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    '在用户登录完成（不论成功与否）后重定向的目标 URI。参见 OpenID Connect <a>AuthRequest</a> 以了解更多。',
  post_sign_out_redirect_uri: '退出登录后重定向 URI',
  post_sign_out_redirect_uris: '退出登录后重定向 URIs',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    '在用户退出登录后重定向的目标 URI（可选）。在某些应用类型中可能无实质作用。',
  cors_allowed_origins: 'CORS 允许的来源',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    '所有重定向 URI 的来源将默认被允许。通常不需要对此字段进行操作。参见 <a>MDN 文档</a> 以了解更多。',
  token_endpoint: 'Token Endpoint',
  user_info_endpoint: '用户信息端点',
  enable_admin_access: '启用管理访问',
  enable_admin_access_label:
    '启用或禁用对管理 API 的访问。启用后，你可以使用访问令牌代表该应用程序调用管理 API。',
  always_issue_refresh_token: '总是颁发 Refresh Token',
  always_issue_refresh_token_label:
    '启用此配置将允许 Logto 始终颁发 Refresh Token，无论身份验证请求中是否呈现 `prompt=consent`。 然而，除非必要，否则不推荐这样做，因为它与 OpenID Connect 不兼容，可能会导致问题。',
  refresh_token_ttl: 'Refresh Token 有效期（天）',
  refresh_token_ttl_tip:
    '可用于请求新访问令牌的 Refresh Token 在过期之前的时间段。访问令牌请求将把 Refresh Token 的时效延长到此值。',
  rotate_refresh_token: '轮换 Refresh Token',
  rotate_refresh_token_label:
    '启用后，当原先的 Refresh Token 的时效已经过去 70%，或者满足一定条件时，Logto 将会为访问令牌请求发放新的 Refresh Token。<a>了解更多</a>',
  delete_description: '本操作会永久性地删除该应用，且不可撤销。输入 <span>{{name}}</span> 确认。',
  enter_your_application_name: '输入你的应用名称',
  application_deleted: '应用 {{name}} 成功删除。',
  redirect_uri_required: '至少需要输入一个重定向 URI。',
  /** UNTRANSLATED */
  app_domain_description_1:
    'Feel free to use your domain with {{domain}} powered by Logto, which is permanently valid.',
  /** UNTRANSLATED */
  app_domain_description_2:
    'Feel free to utilize your domain <domain>{{domain}}</domain> which is permanently valid.',
  /** UNTRANSLATED */
  custom_rules: 'Custom authentication rules',
  /** UNTRANSLATED */
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  /** UNTRANSLATED */
  custom_rules_description:
    'Set rules with regular expressions for authentication-required routes. Default: full-site protection if left blank.',
  /** UNTRANSLATED */
  authentication_routes: 'Authentication routes',
  /** UNTRANSLATED */
  custom_rules_tip:
    "Here are two case scenarios:<ol><li>To only protect routes '/admin' and '/privacy' with authentication: ^/(admin|privacy)/.*</li><li>To exclude JPG images from authentication: ^(?!.*\\.jpg$).*$</li></ol>",
  /** UNTRANSLATED */
  authentication_routes_description:
    'Redirect your authentication button using the specified routes. Note: These routes are irreplaceable.',
  /** UNTRANSLATED */
  protect_origin_server: 'Protect your origin server',
  /** UNTRANSLATED */
  protect_origin_server_description:
    'Ensure to protect your origin server from direct access. Refer to the guide for more <a>detailed instructions</a>.',
  /** UNTRANSLATED */
  session_duration: 'Session duration (days)',
  /** UNTRANSLATED */
  try_it: 'Try it',
  branding: {
    /** UNTRANSLATED */
    name: 'Branding',
    /** UNTRANSLATED */
    description: "Customize your application's display name and logo on the consent screen.",
    /** UNTRANSLATED */
    more_info: 'More info',
    /** UNTRANSLATED */
    more_info_description: 'Offer users more details about your application on the consent screen.',
    /** UNTRANSLATED */
    display_name: 'Display name',
    /** UNTRANSLATED */
    display_logo: 'Display logo',
    /** UNTRANSLATED */
    display_logo_dark: 'Display logo (dark)',
    /** UNTRANSLATED */
    terms_of_use_url: 'Application terms of use URL',
    /** UNTRANSLATED */
    privacy_policy_url: 'Application privacy policy URL',
  },
  permissions: {
    /** UNTRANSLATED */
    name: 'Permissions',
    /** UNTRANSLATED */
    description:
      'Select the permissions that the third-party application requires for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_permissions: 'Personal user data',
    /** UNTRANSLATED */
    organization_permissions: 'Organization access',
    /** UNTRANSLATED */
    table_name: 'Grant permissions',
    /** UNTRANSLATED */
    field_name: 'Permission',
    /** UNTRANSLATED */
    field_description: 'Displayed in the consent screen',
    /** UNTRANSLATED */
    delete_text: 'Remove permission',
    /** UNTRANSLATED */
    permission_delete_confirm:
      'This action will withdraw the permissions granted to the third-party app, preventing it from requesting user authorization for specific data types. Are you sure you want to continue?',
    /** UNTRANSLATED */
    permissions_assignment_description:
      'Select the permissions the third-party application requests for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_profile: 'User data',
    /** UNTRANSLATED */
    api_permissions: 'API permissions',
    /** UNTRANSLATED */
    organization: 'Organization permissions',
    /** UNTRANSLATED */
    user_permissions_assignment_form_title: 'Add the user profile permissions',
    /** UNTRANSLATED */
    organization_permissions_assignment_form_title: 'Add the organization permissions',
    /** UNTRANSLATED */
    api_resource_permissions_assignment_form_title: 'Add the API resource permissions',
    /** UNTRANSLATED */
    user_data_permission_description_tips:
      'You can modify the description of the personal user data permissions via "Sign-in Experience > Content > Manage Language"',
    /** UNTRANSLATED */
    permission_description_tips:
      'When Logto is used as an Identity Provider (IdP) for authentication in third-party apps, and users are asked for authorization, this description appears on the consent screen.',
    /** UNTRANSLATED */
    user_title: 'User',
    /** UNTRANSLATED */
    user_description:
      'Select the permissions requested by the third-party app for accessing specific user data.',
    /** UNTRANSLATED */
    grant_user_level_permissions: 'Grant permissions of user data',
    /** UNTRANSLATED */
    organization_title: 'Organization',
    /** UNTRANSLATED */
    organization_description:
      'Select the permissions requested by the third-party app for accessing specific organization data.',
    /** UNTRANSLATED */
    grant_organization_level_permissions: 'Grant permissions of organization data',
    /** UNTRANSLATED */
    add_permissions_for_organization:
      'Add the API resource permissions used in the "Organization template"',
  },
  roles: {
    name_column: '角色',
    description_column: '描述',
    assign_button: '分配角色',
    delete_description: '此操作将会从此应用中移除此角色。角色本身仍然存在，但不再与此应用关联。',
    deleted: '成功从此用户中移除 {{name}}。',
    assign_title: '为 {{name}} 分配角色',
    assign_subtitle: '授权 {{name}} 一个或多个角色',
    assign_role_field: '分配角色',
    role_search_placeholder: '按角色名称搜索',
    added_text: '{{value, number}}个已添加',
    assigned_app_count: '{{value, number}}个应用',
    confirm_assign: '分配角色',
    role_assigned: '成功分配角色',
    search: '按角色名称、描述或 ID 搜索',
    empty: '没有可用的角色',
  },
};

export default Object.freeze(application_details);
