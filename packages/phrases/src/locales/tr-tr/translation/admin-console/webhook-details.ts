const webhook_details = {
  page_title: 'Webhook ayrıntıları',
  back_to_webhooks: 'Webhooklara geri dön',
  not_in_use: 'Kullanılmıyor',
  success_rate: 'başarı oranı',
  requests: '24 saatte {{value, number}} istek',
  disable_webhook: 'Webhooku devre dışı bırak',
  disable_reminder:
    'Bu webhooku yeniden etkinleştirmek istediğinizden emin misiniz? Böyle yapmak, HTTP isteğini uç nokta URL’ye göndermeyecektir.',
  webhook_disabled: 'Webhook devre dışı bırakıldı.',
  webhook_reactivated: 'Webhook tekrar etkinleştirildi.',
  reactivate_webhook: 'Webhooku yeniden etkinleştir',
  delete_webhook: 'Webhooku sil',
  deletion_reminder:
    'Bu webhook’u kaldırıyorsunuz. Silindikten sonra, HTTP isteği uç nokta URL’ye gönderilmeyecektir.',
  deleted: 'Webhook başarıyla silindi.',
  settings_tab: 'Ayarlar',
  recent_requests_tab: 'Son istekler (24s)',
  settings: {
    settings: 'Ayarlar',
    settings_description:
      'Webhooklar, belirli olaylarla ilgili gerçek zamanlı güncellemeleri almanızı sağlar, sağladıkları POST isteği Logto’daki uç nokta URL’nize göndererek. Bu, yeni alınan bilgilere dayalı hemen harekete geçmenizi sağlar.',
    events: 'Olaylar',
    events_description: 'Logto’nun POST isteğini göndereceği tetikleyici olayları seçin.',
    name: 'İsim',
    endpoint_url: 'Uç nokta URL’si',
    endpoint_url_tip: 'Olay gerçekleştiğinde webhook’un yükü gönderilen HTTPS URL’sini girin.',
    signing_key: 'İmza anahtarı',
    signing_key_tip:
      'Webhook’un yükü için kimliğinin doğruluğunu sağlamak için Logto tarafından sağlanan gizli anahtarın istek başlığı olarak uç noktanızda ekleyin.',
    regenerate: 'Yeniden oluştur',
    regenerate_key_title: 'İmza anahtarını yeniden oluştur',
    regenerate_key_reminder:
      'İmza anahtarını değiştirmek istediğinizden emin misiniz? Yeniden oluşturmak hemen etki edecektir. Lütfen uç noktanızdaki imza anahtarını senkronize olarak değiştirmeyi unutmayın.',
    regenerated: 'İmza anahtarı yeniden oluşturuldu.',
    custom_headers: 'Özel başlıklar',
    custom_headers_tip:
      'İsteğin bir parçası olarak webhook’un yüküne isteğin bağlamı veya meta verileri sağlamak için isteğe bağlı olarak özel başlıklar ekleyebilirsiniz.',
    key_duplicated_error: 'Anahtarlar tekrarlanamaz.',
    key_missing_error: 'Anahtar gereklidir.',
    value_missing_error: 'Değer gereklidir.',
    test: 'Test',
    test_webhook: 'Webhook’unuzu test edin',
    test_webhook_description:
      'Webhook’u yapılandırın ve her seçilen olay için yük örnekleriyle test ederek doğru alma ve işleme işlemini doğrulayın.',
    send_test_payload: 'Test yükünü gönder',
    test_payload_sent: 'Yük başarıyla gönderildi.',
  },
};

export default webhook_details;
