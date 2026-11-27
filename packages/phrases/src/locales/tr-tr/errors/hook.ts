const hook = {
  missing_events: 'En az bir etkinlik sağlamanız gerekiyor.',
  send_test_payload_failed: 'Test yükü gönderilemedi: {{message}}',
  endpoint_responded_with_error: 'Nokta yanıt verdi hatayla.',
  disabled: 'Hook devre dışı olduğu için olayları yeniden teslim edemez.',
  log_not_permanently_failed:
    'Yalnızca kalıcı olarak başarısız olan webhook teslimleri yeniden teslim edilebilir.',
  invalid_log_payload: 'Webhook günlük kaydı yeniden teslim için geçerli bir istek yükü içermiyor.',
  redelivery_in_progress:
    'Bu webhook olayı için zaten bir teslim veya yeniden teslim devam ediyor.',
};

export default Object.freeze(hook);
