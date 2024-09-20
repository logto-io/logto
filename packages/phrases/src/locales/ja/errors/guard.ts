const guard = {
  invalid_input: 'リクエスト{{type}}が無効です。',
  invalid_pagination: 'リクエストのページネーション値が無効です。',
  can_not_get_tenant_id: 'リクエストからテナントIDを取得できません。',
  file_size_exceeded: 'ファイルサイズが超過しました。',
  mime_type_not_allowed: 'MIMEタイプが許可されていません。',
  not_allowed_for_admin_tenant: '管理テナントでは許可されていません。',
};

export default Object.freeze(guard);
