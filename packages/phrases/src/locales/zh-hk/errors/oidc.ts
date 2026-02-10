const oidc = {
  aborted: '用戶終止了交互。',
  invalid_scope: '無效範圍: {{error_description}}.',
  invalid_token: 'Token 無效',
  invalid_client_metadata: '無效的客戶端元數據',
  insufficient_scope: '缺少權限範圍 `{{scope}}`。',
  invalid_request: '請求無效',
  invalid_grant: '授權請求無效',
  invalid_issuer: '無效的發行者。',
  invalid_redirect_uri: '無效返回鏈接, 該 redirect_uri 未被此應用注冊。',
  access_denied: '拒絶訪問',
  invalid_target: '請求資源無效',
  unsupported_grant_type: '不支持的 grant_type',
  unsupported_response_mode: '不支持的 response_mode',
  unsupported_response_type: '不支持的 response_type',
  provider_error: 'OIDC 內部錯誤: {{message}}',
  server_error: '發生了未知的 OIDC 錯誤。請稍後重試。',
  provider_error_fallback: '發生了 OIDC 錯誤: {{code}}.',
  key_required: '至少需要一個金鑰。',
  key_not_found: '未找到 ID 為 {{id}} 的金鑰。',
  /** UNTRANSLATED */
  invalid_session_payload: 'Invalid session payload.',
  /** UNTRANSLATED */
  session_not_found: 'Session not found.',
  /** UNTRANSLATED */
  invalid_session_account_id: 'Session accountId mismatch.',
};

export default Object.freeze(oidc);
