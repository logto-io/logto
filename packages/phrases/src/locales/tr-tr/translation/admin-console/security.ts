const security = {
  page_title: 'Güvenlik',
  title: 'Güvenlik',
  subtitle: 'Karmaşık saldırıları önlemek için gelişmiş korumaları yapılandırın.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Parola politikası',
  },
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
  password_policy: {
    password_requirements: 'Parola gereksinimleri',
    minimum_length: 'Minimum uzunluk',
    minimum_length_description:
      'NIST önerilerine göre, web ürünleri için en az <a>8 karakter</a> kullanın.',
    minimum_length_error: 'Minimum uzunluk {{min}} ile {{max}} (dahil) arasında olmalıdır.',
    minimum_required_char_types: 'Minimum gereken karakter tipleri',
    minimum_required_char_types_description:
      'Karakter tipleri: büyük harfler (A-Z), küçük harfler (a-z), sayılar (0-9) ve özel semboller ({{symbols}}).',
    password_rejection: 'Parola reddi',
    compromised_passwords: 'Etkilenen şifreleri reddet',
    breached_passwords: 'Veri tabanında yer alan şifreleri reddet',
    breached_passwords_description: 'Daha önceki ihlal veritabanlarında bulunan şifreleri reddet.',
    restricted_phrases: 'Düşük güvenlikli ifadeleri kısıtla',
    restricted_phrases_tooltip:
      'Parolanız 3 ya da daha fazla karakterle birleştirilmediği sürece bu ifadelerden kaçınmalıdır.',
    repetitive_or_sequential_characters: 'Tekrarlayan veya ardışık karakterler',
    repetitive_or_sequential_characters_description: 'Örn., "AAAA", "1234" ve "abcd".',
    user_information: 'Kullanıcı bilgisi',
    user_information_description: 'Örn., e-posta adresi, telefon numarası, kullanıcı adı vb.',
    custom_words: 'Özel kelimeler',
    custom_words_description:
      'Bağlamla ilgili kelimeleri kişiselleştirin, küçük/büyük harf duyarsız ve satır başına bir kelime olacak şekilde.',
    custom_words_placeholder: 'Servis adınız, şirket adınız, vb.',
  },
};

export default Object.freeze(security);
