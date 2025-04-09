const security = {
  page_title: 'Güvenlik',
  title: 'Güvenlik',
  subtitle: 'Karmaşık saldırıları önlemek için gelişmiş korumaları yapılandırın.',
  bot_protection: {
    title: 'Bot Koruması',
    description:
      "Otomatik tehditleri engellemek için kayıt, giriş ve şifre kurtarma işlemlerinde CAPTCHA'yı etkinleştirin.",
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'Bir CAPTCHA sağlayıcısı seçin ve entegrasyonu ayarlayın.',
      add: 'CAPTCHA ekle',
    },
    settings: 'Ayarlar',
    enable_captcha: "CAPTCHA'yı Etkinleştir",
    enable_captcha_description:
      'Kayıt olma, giriş yapma ve şifre kurtarma işlemleri için CAPTCHA doğrulamasını etkinleştirin.',
  },
  create_captcha: {
    setup_captcha: "CAPTCHA'yı ayarla",
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        "Google'ın kurumsal CAPTCHA çözümü, web sitenizi sahtekarlık faaliyetlerinden korumak için gelişmiş tehdit algılama ve detaylı güvenlik analizleri sunar.",
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        "Cloudflare'in akıllı CAPTCHA alternatifi, görsel bulmaca olmadan kullanıcı dostu bir deneyim sunarken aynı zamanda bot koruması sağlar.",
    },
  },
  captcha_details: {
    back_to_security: 'Güvenliğe dön',
    page_title: 'CAPTCHA Detayları',
    check_readme: "README'i görüntüle",
    options_change_captcha: 'CAPTCHA sağlayıcısını değiştir',
    connection: 'Bağlantı',
    description: 'CAPTCHA bağlantınızı yapılandırın.',
    site_key: 'Site anahtarı',
    secret_key: 'Gizli anahtar',
    project_id: 'Proje ID',
    recaptcha_key_id: 'reCAPTCHA anahtar ID',
    recaptcha_api_key: 'Projenin API anahtarı',
    deletion_description: 'Bu CAPTCHA sağlayıcısını silmek istediğinizden emin misiniz?',
    captcha_deleted: 'CAPTCHA sağlayıcısı başarıyla silindi',
    setup_captcha: "CAPTCHA'yı ayarla",
  },
};

export default Object.freeze(security);
