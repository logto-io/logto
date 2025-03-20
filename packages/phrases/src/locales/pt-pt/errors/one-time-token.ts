const one_time_token = {
  token_not_found: '无法使用提供的电子邮件和令牌找到活动令牌。',
  email_mismatch: '电子邮件与提供的令牌不匹配。',
  token_expired: '令牌已过期。',
  token_consumed: '令牌已被使用。',
  token_revoked: '令牌已被撤销。',
  cannot_reactivate_token: '无法重新激活令牌。',
};

export default Object.freeze(one_time_token);
