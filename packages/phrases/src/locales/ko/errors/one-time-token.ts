const one_time_token = {
  token_not_found: '주어진 이메일과 토큰으로 활성 토큰을 찾을 수 없습니다.',
  email_mismatch: '주어진 토큰과 이메일이 일치하지 않습니다.',
  token_expired: '토큰이 만료되었습니다.',
  token_consumed: '토큰이 이미 사용되었습니다.',
  token_revoked: '토큰이 취소되었습니다.',
  cannot_reactivate_token: '토큰을 재활성화할 수 없습니다.',
};

export default Object.freeze(one_time_token);
