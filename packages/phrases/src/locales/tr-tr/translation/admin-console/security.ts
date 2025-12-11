const security = {
  page_title: 'Güvenlik',
  title: 'Güvenlik',
  subtitle: 'Karmaşık saldırıları önlemek için gelişmiş korumaları yapılandırın.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Parola politikası',
    blocklist: 'Engellenen liste',
    general: 'Genel',
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
    domain: 'Domain (isteğe bağlı)',
    domain_placeholder: 'www.google.com (varsayılan) veya recaptcha.net',
    recaptcha_key_id: 'reCAPTCHA anahtar ID',
    recaptcha_api_key: 'Projenin API anahtarı',
    deletion_description: 'Bu CAPTCHA sağlayıcısını silmek istediğinizden emin misiniz?',
    captcha_deleted: 'CAPTCHA sağlayıcısı başarıyla silindi',
    setup_captcha: "CAPTCHA'yı ayarla",
    mode: 'Doğrulama modu',
    mode_invisible: 'Görünmez',
    mode_checkbox: 'Onay kutusu',
    mode_notice:
      "Doğrulama modu, Google Cloud Console'daki reCAPTCHA anahtar ayarlarında tanımlanır. Buradaki modu değiştirmek için eşleşen bir anahtar türü gerekir.",
  },
  password_policy: {
    password_requirements: 'Parola gereksinimleri',
    password_requirements_description:
      'Kimlik bilgisi doldurma ve zayıf parola saldırılarına karşı savunma yapmak için parola gereksinimlerini artırın.',
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
  sentinel_policy: {
    card_title: 'Kimlik kilitleme',
    card_description:
      'Tüm kullanıcılar için varsayılan ayarlarla kilitleme kullanılabilir, ancak daha fazla kontrol için özelleştirebilirsiniz.\n\nBirden fazla başarısız kimlik doğrulama denemesinden sonra (örneğin, ardışık yanlış parola veya doğrulama kodu) bir kimliğin geçici olarak kilitlenmesini sağlayarak kaba kuvvet erişimini önleyin.',
    enable_sentinel_policy: {
      title: 'Kilitleme deneyimini özelleştir',
      description:
        'Kilitlemeden önceki maksimum başarısız oturum açma deneme sayısını, kilitleme süresini ve anında manuel kilit açmayı özelleştirmeye izin ver.',
    },
    max_attempts: {
      title: 'Maksimum başarısız deneme',
      description:
        'Bir saat içinde maksimum başarısız oturum açma deneme sayısına ulaşıldığında bir kimliği geçici olarak kilitleyin.',
      error_message: "Maksimum başarısız deneme sayısı 0'dan büyük olmalıdır.",
    },
    lockout_duration: {
      title: 'Kilitleme süresi (dakika)',
      description:
        'Maksimum başarısız deneme sınırını aştıktan sonra belirli bir süre oturum açmayı engelleyin.',
      error_message: 'Kilitleme süresi en az 1 dakika olmalıdır.',
    },
    manual_unlock: {
      title: 'Manuel kilit açma',
      description:
        'Kullanıcının kimliğini doğrulayıp kimliklerini girdikten sonra anında kilidi açın.',
      unblock_by_identifiers: 'Kimlik ile engeli kaldır',
      modal_description_1:
        'Bir kimlik, birden fazla başarısız oturum açma/kayıt olma denemesi nedeniyle geçici olarak kilitlendi. Güvenliği korumak için, erişim kilitleme süresi bittikten sonra otomatik olarak geri yüklenecektir.',
      modal_description_2:
        'Kullanıcının kimliğini doğrulayıp yetkisiz erişim denemesi olmadığından emin olduysanız yalnızca manuel olarak kilidi açın.',
      placeholder: 'Kimlikleri girin (e-posta adresi / telefon numarası / kullanıcı adı)',
      confirm_button_text: 'Şimdi kilidini aç',
      success_toast: 'Başarıyla kilidi açıldı',
      duplicate_identifier_error: 'Kimlik zaten eklendi',
      empty_identifier_error: 'Lütfen en az bir kimlik girin',
    },
  },
  blocklist: {
    card_title: 'E-posta engelleme listesi',
    card_description:
      'Yüksek riskli veya istenmeyen e-posta adreslerini engelleyerek kullanıcı tabanınızı kontrol edin.',
    disposable_email: {
      title: 'Geçici e-posta adreslerini engelle',
      description:
        'Spamı önlemek ve kullanıcı kalitesini artırmak için geçici veya tek kullanımlık e-posta adresleri kullanılarak yapılan kayıt denemelerini reddetmek için etkinleştirin.',
    },
    email_subaddressing: {
      title: 'E-posta alt adlandırmasını engelle',
      description:
        'Artı işareti (+) ve ek karakterler ile e-posta alt adresleri kullanılarak yapılan kayıt girişimlerini reddetmek için etkinleştirin (örn., user+alias@foo.com).',
    },
    custom_email_address: {
      title: 'Özel e-posta adreslerini engelle',
      description:
        'Belirli e-posta alan adlarını veya kullanıcı arayüzü aracılığıyla kaydolamayacak veya bağlantı kuramayacak e-posta adreslerini ekleyin.',
      placeholder:
        'Engellenen e-posta adresini veya alan adını girin (örn., bar@example.com, @example.com)',
      duplicate_error: 'E-posta adresi veya alan adı zaten eklendi',
      invalid_format_error:
        'Geçerli bir e-posta adresi (bar@example.com) veya alan adı (@example.com) olmalıdır',
    },
  },
};

export default Object.freeze(security);
