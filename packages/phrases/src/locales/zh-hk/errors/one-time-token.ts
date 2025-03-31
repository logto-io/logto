const one_time_token = {
  token_not_found: '找不到與指定電郵和令牌匹配的有效令牌。',
  email_mismatch: '電郵與指定令牌不匹配。',
  token_expired: '令牌已過期。',
  token_consumed: '令牌已被使用。',
  token_revoked: '令牌已被撤銷。',
  cannot_reactivate_token: '無法重新激活令牌。',
};

export default Object.freeze(one_time_token);
