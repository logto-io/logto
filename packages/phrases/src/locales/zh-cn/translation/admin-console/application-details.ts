const application_details = {
  back_to_applications: '返回全部应用',
  check_guide: '查看指南',
  settings: '设置',
  settings_description: '应用程序用于在 Logto OIDC、登录体验、审计日志等方面识别你的应用程序。',
  advanced_settings: '高级设置',
  advanced_settings_description:
    '高级设置包括 OIDC 相关术语。你可以查看 Token Endpoint 以获取更多信息。',
  application_name: '应用名称',
  application_name_placeholder: '我的应用',
  description: '描述',
  description_placeholder: '请输入应用描述',
  authorization_endpoint: '授权端点',
  authorization_endpoint_tip: '进行鉴权与授权的端点。用于 OpenID Connect 中的 <a>鉴权</a> 流程。',
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
  id_token_expiration: 'ID Token 过期时间',
  refresh_token_expiration: 'Refresh Token 过期时间',
  token_endpoint: 'Token Endpoint',
  user_info_endpoint: '用户信息端点',
  enable_admin_access: '启用管理访问',
  enable_admin_access_label:
    '启用或禁用对管理 API 的访问。启用后，你可以使用访问令牌代表该应用程序调用管理 API。',
  delete_description: '本操作会永久性地删除该应用，且不可撤销。输入 <span>{{name}}</span> 确认。',
  enter_your_application_name: '输入你的应用名称',
  application_deleted: '应用 {{name}} 成功删除。',
  redirect_uri_required: '至少需要输入一个重定向 URL。',
};

export default application_details;
