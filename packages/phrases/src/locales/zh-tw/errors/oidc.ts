const oidc = {
  aborted: '使用者終止了互動。',
  invalid_scope: '不支援的 scope: {{scopes}}',
  invalid_scope_plural: '不支援的 scope: {{scopes}}',
  invalid_token: 'Token 無效',
  invalid_client_metadata: '無效的用戶端元數據',
  insufficient_scope: '請求 token 缺少權限: {{scopes}}',
  invalid_request: '請求無效',
  invalid_grant: '授權請求無效',
  invalid_redirect_uri: '無效返回連結, 该 redirect_uri 未被此應用註冊。',
  access_denied: '拒絕訪問',
  invalid_target: '請求資源無效',
  unsupported_grant_type: '不支援的 grant_type',
  unsupported_response_mode: '不支援的 response_mode',
  unsupported_response_type: '不支援的 response_type',
  provider_error: 'OIDC 內部錯誤: {{message}}',
};

export default oidc;
