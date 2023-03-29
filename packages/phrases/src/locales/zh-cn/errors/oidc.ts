const oidc = {
  aborted: '用户终止了交互。',
  invalid_scope: '不支持的 scope: {{scopes}}',
  invalid_scope_plural: '不支持的 scope: {{scopes}}',
  invalid_token: 'Token 无效',
  invalid_client_metadata: '无效的客户端元数据',
  insufficient_scope: '请求 token 缺少权限: {{scopes}}',
  invalid_request: '请求无效',
  invalid_grant: '授权请求无效',
  invalid_redirect_uri: '无效返回链接, 该 redirect_uri 未被此应用注册。',
  access_denied: '拒绝访问',
  invalid_target: '请求资源无效',
  unsupported_grant_type: '不支持的 grant_type',
  unsupported_response_mode: '不支持的 response_mode',
  unsupported_response_type: '不支持的 response_type',
  provider_error: 'OIDC 内部错误: {{message}}',
};
export default oidc;
