const oidc = {
  aborted: '用户终止了交互。',
  /** UNTRANSLATED */
  invalid_scope: 'Invalid scope: {{error_description}}.',
  invalid_token: 'Token 无效',
  invalid_client_metadata: '无效的客户端元数据',
  /** UNTRANSLATED */
  insufficient_scope: 'Token missing scope `{{scope}}`.',
  invalid_request: '请求无效',
  invalid_grant: '授权请求无效',
  invalid_redirect_uri: '无效返回链接, 该 redirect_uri 未被此应用注册。',
  access_denied: '拒绝访问',
  invalid_target: '请求资源无效',
  unsupported_grant_type: '不支持的 grant_type',
  unsupported_response_mode: '不支持的 response_mode',
  unsupported_response_type: '不支持的 response_type',
  provider_error: 'OIDC 内部错误: {{message}}',
  /** UNTRANSLATED */
  server_error: 'An unknown OIDC error occurred. Please try again later.',
  /** UNTRANSLATED */
  provider_error_fallback: 'An OIDC error occurred: {{code}}.',
  /** UNTRANSLATED */
  key_required: 'At least one key is required.',
  /** UNTRANSLATED */
  key_not_found: 'Key with ID {{id}} is not found.',
};

export default Object.freeze(oidc);
