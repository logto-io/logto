const application_details = {
  back_to_applications: '返回全部应用',
  check_guide: '查看指南',
  settings: '设置',
  settings_description:
    'Applications are used to identify your applications in Logto for OIDC, sign-in experience, audit logs, etc.', // UNTRANSLATED
  advanced_settings: '高级设置',
  advanced_settings_description:
    'Advanced settings include OIDC related terms. You can check out the Token Endpoint for more information.', // UNTRANSLATED
  application_name: '应用名称',
  application_name_placeholder: '我的应用',
  description: '描述',
  description_placeholder: '请输入应用描述',
  authorization_endpoint: 'Authorization Endpoint',
  authorization_endpoint_tip:
    '进行鉴权与授权的端点 endpoint。用于 OpenID Connect 中的 <a>鉴权</a> 流程。',
  application_id: 'App ID',
  application_id_tip:
    '应用的唯一标识，通常由 Logto 生成。等价于 OpenID Connect 中的 <a>client_id</a>。',
  application_secret: 'App Secret',
  redirect_uri: 'Redirect URI',
  redirect_uris: 'Redirect URIs',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    '在用户登录完成（不论成功与否）后重定向的目标 URI。参见 OpenID Connect <a>AuthRequest</a> 以了解更多。',
  post_sign_out_redirect_uri: 'Post Sign-out Redirect URI',
  post_sign_out_redirect_uris: 'Post sign out redirect URIs',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    '在用户退出登录后重定向的目标 URI（可选）。在某些应用类型中可能无实质作用。',
  cors_allowed_origins: 'CORS Allowed Origins',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    '所有 Redirect URI 的 origin 将默认被允许。通常不需要对此字段进行操作。参见 <a>MDN 文档</a>以了解更多',
  add_another: '新增',
  id_token_expiration: 'ID Token 过期时间',
  refresh_token_expiration: 'Refresh Token 过期时间',
  token_endpoint: 'Token Endpoint',
  user_info_endpoint: 'UserInfo Endpoint',
  enable_admin_access: 'Enable admin access', // UNTRANSLATED
  enable_admin_access_label:
    'Enable or disable the access to Management API. Once enabled, you can use access tokens to call Management API on behalf on this application.', // UNTRANSLATED
  delete_description: '本操作会永久性地删除该应用，且不可撤销。输入 <span>{{name}}</span> 确认。',
  enter_your_application_name: '输入你的应用名称',
  application_deleted: '应用 {{name}} 成功删除.',
  redirect_uri_required: '至少需要输入一个 Redirect URL',
};

export default application_details;
