const oidc = {
  aborted: 'エンドユーザが操作を中止しました。',
  invalid_scope: 'スコープ{{scope}}はサポートされていません。',
  invalid_scope_plural: 'スコープ{{scopes}}はサポートされていません。',
  invalid_token: '提供されたトークンが無効です。',
  invalid_client_metadata: '提供されたクライアントメタデータが無効です。',
  insufficient_scope: 'アクセストークンに要求されたスコープ{{scopes}}が含まれていません。',
  invalid_request: 'リクエストが無効です。',
  invalid_grant: '付与要求が無効です。',
  invalid_redirect_uri:
    '`` `redirect_uri`` `は、クライアントの登録された一つにも一致しませんでした```redirect_uris`。',
  access_denied: 'アクセスが拒否されました。',
  invalid_target: '無効なリソース指示子です。',
  unsupported_grant_type: '要求された`grant_type`はサポートされていません。',
  unsupported_response_mode: '要求された`response_mode`はサポートされていません。',
  unsupported_response_type: '要求された`response_type`はサポートされていません。',
  provider_error: 'OIDC内部エラー:{{message}}。',
};

export default oidc;
