const application_details = {
  page_title: '应用详情',
  back_to_applications: '返回全部应用',
  check_guide: '查看指南',
  settings: '设置',
  settings_description: '应用程序用于在 Logto OIDC、登录体验、审计日志等方面识别你的应用程序。',
  /** UNTRANSLATED */
  advanced_settings: 'Advanced settings',
  advanced_settings_description:
    '高级设置包括 OIDC 相关术语。你可以查看 Token Endpoint 以获取更多信息。',
  /** UNTRANSLATED */
  application_roles: 'Roles',
  /** UNTRANSLATED */
  machine_logs: 'Machine logs',
  application_name: '应用名称',
  application_name_placeholder: '我的应用',
  description: '描述',
  description_placeholder: '请输入应用描述',
  config_endpoint: 'OpenID Provider 配置端点',
  authorization_endpoint: '授权端点',
  authorization_endpoint_tip: '进行鉴权与授权的端点。用于 OpenID Connect 中的 <a>鉴权</a> 流程。',
  logto_endpoint: 'Logto endpoint',
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
  roles: {
    /** UNTRANSLATED */
    name_column: 'Role',
    /** UNTRANSLATED */
    description_column: 'Description',
    /** UNTRANSLATED */
    assign_button: 'Assign Roles',
    /** UNTRANSLATED */
    delete_description:
      'This action will remove this role from this machine-to-machine app. The role itself will still exist, but it will no longer be associated with this machine-to-machine app.',
    /** UNTRANSLATED */
    deleted: '{{name}} was successfully removed from this user.',
    /** UNTRANSLATED */
    assign_title: 'Assign roles to {{name}}',
    /** UNTRANSLATED */
    assign_subtitle: 'Authorize {{name}} one or more roles',
    /** UNTRANSLATED */
    assign_role_field: 'Assign roles',
    /** UNTRANSLATED */
    role_search_placeholder: 'Search by role name',
    /** UNTRANSLATED */
    added_text: '{{value, number}} added',
    /** UNTRANSLATED */
    assigned_user_count: '{{value, number}} users',
    /** UNTRANSLATED */
    confirm_assign: 'Assign roles',
    /** UNTRANSLATED */
    role_assigned: 'Successfully assigned role(s)',
    /** UNTRANSLATED */
    search: 'Search by role name, description or ID',
    /** UNTRANSLATED */
    empty: 'No role available',
  },
};

export default Object.freeze(application_details);
