const one_time_token = {
  token_not_found: 'ไม่พบโทเคน {{token}}',
  email_mismatch: 'อีเมลไม่ตรงกับโทเคนที่ให้มา',
  interaction_event_mismatch: 'ไม่สามารถใช้โทเคนนี้กับการโต้ตอบนี้ได้',
  token_expired: 'โทเคนนี้หมดอายุแล้ว',
  token_consumed: 'โทเคนนี้ถูกใช้ไปแล้ว',
  token_revoked: 'โทเคนนี้ถูกเพิกถอนแล้ว',
  cannot_reactivate_token: 'ไม่สามารถเปิดใช้งานโทเคนนี้ใหม่ได้',
};

export default Object.freeze(one_time_token);
