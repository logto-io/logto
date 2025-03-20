const one_time_token = {
  token_not_found: '指定されたメールとトークンでアクティブなトークンが見つかりません。',
  email_mismatch: '指定されたトークンとメールが一致しません。',
  token_expired: 'トークンの有効期限が切れています。',
  token_consumed: 'トークンが既に使用されています。',
  token_revoked: 'トークンが取り消されました。',
  cannot_reactivate_token: 'トークンを再アクティブ化できません。',
};

export default Object.freeze(one_time_token);
