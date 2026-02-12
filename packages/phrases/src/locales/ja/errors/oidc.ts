const oidc = {
  aborted: 'エンドユーザが操作を中止しました。',
  invalid_scope: 'スコープが無効です: {{error_description}}。',
  invalid_token: '提供されたトークンが無効です。',
  invalid_client_metadata: '提供されたクライアントメタデータが無効です。',
  insufficient_scope: 'トークンにスコープ `{{scope}}` が含まれていません。',
  invalid_request: 'リクエストが無効です。',
  invalid_grant: '付与リクエストが無効です。',
  invalid_issuer: '無効な発行者です。',
  invalid_redirect_uri:
    '`` `redirect_uri`` `は、クライアントが登録したいずれのものとも一致しませんでした```redirect_uris`。',
  access_denied: 'アクセスが拒否されました。',
  invalid_target: '無効なリソース指示子です。',
  unsupported_grant_type: '要求された`grant_type`はサポートされていません。',
  unsupported_response_mode: '要求された`response_mode`はサポートされていません。',
  unsupported_response_type: '要求された`response_type`はサポートされていません。',
  provider_error: 'OIDC内部エラー:{{message}}。',
  server_error: '不明なOIDCエラーが発生しました。後でもう一度お試しください。',
  provider_error_fallback: 'OIDCエラーが発生しました: {{code}}。',
  key_required: '少なくとも1つのキーが必要です。',
  key_not_found: 'IDが{{id}}のキーが見つかりません。',
  /** UNTRANSLATED */
  invalid_session_payload: 'Invalid session payload.',
};

export default Object.freeze(oidc);
