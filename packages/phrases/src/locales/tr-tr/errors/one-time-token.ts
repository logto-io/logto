const one_time_token = {
  token_not_found: 'Sağlanan e-posta ve token ile eşleşen aktif bir token bulunamadı.',
  email_mismatch: 'E-posta, sağlanan token ile eşleşmiyor.',
  token_expired: "Token'ın süresi doldu.",
  token_consumed: 'Token zaten kullanılmış.',
  token_revoked: 'Token iptal edilmiş.',
  cannot_reactivate_token: 'Token yeniden etkinleştirilemez.',
};

export default Object.freeze(one_time_token);
