const oidc = {
  aborted: '用戶終止了交互。',
  /** UNTRANSLATED */
  invalid_scope: 'Invalid scope: {{error_description}}.',
  invalid_token: 'Token 無效',
  invalid_client_metadata: '無效的客戶端元數據',
  /** UNTRANSLATED */
  insufficient_scope: 'Token missing scope `{{scope}}`.',
  invalid_request: '請求無效',
  invalid_grant: '授權請求無效',
  invalid_redirect_uri: '無效返回鏈接, 該 redirect_uri 未被此應用注冊。',
  access_denied: '拒絶訪問',
  invalid_target: '請求資源無效',
  unsupported_grant_type: '不支持的 grant_type',
  unsupported_response_mode: '不支持的 response_mode',
  unsupported_response_type: '不支持的 response_type',
  provider_error: 'OIDC 內部錯誤: {{message}}',
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
