const auth = {
  authorization_header_missing: 'Authorizationヘッダーがありません。',
  authorization_token_type_not_supported: '認証タイプはサポートされていません。',
  unauthorized: '未承認です。資格情報とそのスコープを確認してください。',
  forbidden: 'アクセスが拒否されました。ユーザーの役割と権限を確認してください。',
  expected_role_not_found:
    '期待される役割が見つかりませんでした。ユーザーの役割と権限を確認してください。',
  jwt_sub_missing: 'JWT内に`sub`がありません。',
  require_re_authentication: '保護されたアクションを実行するには再認証が必要です。',
};

export default auth;
