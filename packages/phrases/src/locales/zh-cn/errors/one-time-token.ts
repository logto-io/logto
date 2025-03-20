const one_time_token = {
  token_not_found: '找不到与给定电子邮件和令牌匹配的有效令牌。',
  email_mismatch: '电子邮件与给定令牌不匹配。',
  token_expired: '令牌已过期。',
  token_consumed: '令牌已被使用。',
  token_revoked: '令牌已被撤销。',
  cannot_reactivate_token: '无法重新激活令牌。',
};

export default Object.freeze(one_time_token);
