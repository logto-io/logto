const one_time_token = {
  token_not_found: 'トークン {{token}} が見つかりません。',
  email_mismatch: '指定されたトークンとメールが一致しません。',
  interaction_event_mismatch: 'このトークンはこのインタラクションには使用できません。',
  token_expired: 'トークンの有効期限が切れています。',
  token_consumed: 'トークンが既に使用されています。',
  token_revoked: 'トークンが取り消されました。',
  cannot_reactivate_token: 'トークンを再アクティブ化できません。',
};

export default Object.freeze(one_time_token);
