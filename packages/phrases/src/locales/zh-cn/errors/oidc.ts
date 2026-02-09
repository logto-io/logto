const oidc = {
  aborted: '用户终止了交互。',
  invalid_scope: '无效的范围: {{error_description}}。',
  invalid_token: 'Token 无效',
  invalid_client_metadata: '无效的客户端元数据',
  insufficient_scope: 'Token 缺少范围 `{{scope}}`.',
  invalid_request: '请求无效',
  invalid_grant: '授权请求无效',
  invalid_issuer: '无效的发行者。',
  invalid_redirect_uri: '无效返回链接, 该 redirect_uri 未被此应用注册。',
  access_denied: '访问被拒绝',
  invalid_target: '请求资源无效',
  unsupported_grant_type: '不支持的 grant_type',
  unsupported_response_mode: '不支持的 response_mode',
  unsupported_response_type: '不支持的 response_type',
  provider_error: 'OIDC 内部错误: {{message}}',
  server_error: '发生了未知的 OIDC 错误。请稍后再试。',
  provider_error_fallback: '发生了 OIDC 错误: {{code}}。',
  key_required: '至少需要一个密钥。',
  key_not_found: '未找到 ID 为 {{id}} 的密钥。',
  /** UNTRANSLATED */
  invalid_session_payload: 'Invalid session payload.',
};

export default Object.freeze(oidc);
