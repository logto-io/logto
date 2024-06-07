const webhooks = {
  page_title: 'Webhooklar',
  title: 'Webhooklar',
  subtitle:
    'Belirli olaylarla ilgili gerçek zamanlı güncellemeler almak için webhooklar oluşturun.',
  create: 'Webhook Oluştur',
  schemas: {
    interaction: 'Kullanıcı etkileşimi',
    user: 'Kullanıcı',
    organization: 'Kuruluş',
    role: 'Rol',
    scope: 'İzin',
    organization_role: 'Kuruluş rolü',
    organization_scope: 'Kuruluş izni',
  },
  table: {
    name: 'Adı',
    events: 'Olaylar',
    success_rate: 'Başarı Oranı (24s)',
    requests: 'İstekler (24s)',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'POST istekleri aracılığıyla uç nokta URL\'nıza gerçek zamanlı güncellemeler almak için bir webhook oluşturun. "Hesap Oluşturma", "Oturum Açma" ve "Şifre Sıfırlama" gibi olayların etkinliklerini takip edin ve hemen harekete geçin.',
    create_webhook: 'Webhook Oluştur',
  },
  create_form: {
    title: 'Webhook Oluştur',
    subtitle:
      'Webhook ekleyerek, Logto’nun kullanıcı eylemlerinin ayrıntılarını POST isteğiyle uç nokta URL’nıza göndermesini sağlayabilirsiniz.',
    events: 'Olaylar',
    events_description: 'Logto’nun POST isteğini göndermesi için tetikleyici olayları seçin.',
    name: 'Adı',
    name_placeholder: 'Webhook adını girin',
    endpoint_url: 'Uç Nokta URL’si',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip:
      'Enter the URL of your endpoint where a webhook’s payload is sent to when the event occurs.',
    create_webhook: 'Webhook Oluştur',
    missing_event_error: 'En az bir olay seçmeniz gerekiyor.',
  },
  webhook_created: 'Webhook {{name}} başarıyla oluşturuldu.',
};

export default Object.freeze(webhooks);
