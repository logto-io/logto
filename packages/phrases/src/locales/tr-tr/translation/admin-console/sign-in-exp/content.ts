const content = {
  terms_of_use: {
    title: 'TERMS',
    description: 'Uyumluluk gereksinimlerini karşılamak için Şartlar ve Gizlilik ekleyin.',
    terms_of_use: "Kullanım şartları URL'si",
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: "Gizlilik politikası URL'si",
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: 'Şartları kabul et',
    agree_policies: {
      automatic: 'Şartları otomatik olarak kabul etmeye devam et',
      manual_registration_only: 'Sadece kayıt sırasında onay kutusu ile onay gerektirir',
      manual: 'Kayıt ve giriş sırasında onay kutusu ile onay gerektirir',
    },
  },
  languages: {
    title: 'DİLLER',
    enable_auto_detect: 'Otomatik algılamayı etkinleştir',
    description:
      'Yazılımınız kullanıcının yerel ayarını algılar ve yerel dile geçer. İngilizce arayüzü başka bir dile çevirerek yeni diller ekleyebilirsiniz.',
    manage_language: 'Dili yönet',
    default_language: 'Varsayılan dil',
    default_language_description_auto:
      'Algılanan kullanıcı dili mevcut dil kitaplığında yoksa varsayılan dil kullanılır.',
    default_language_description_fixed:
      'Otomatik algılama kapalıyken yazılımınız yalnızca varsayılan dili gösterir. Dil seçeneklerini genişletmek için otomatik algılamayı açın.',
  },
  support: {
    title: 'DESTEK',
    subtitle: 'Hızlı kullanıcı yardımı için hata sayfalarında destek kanallarınızı gösterin.',
    support_email: 'Destek e-posta',
    support_email_placeholder: 'support@email.com',
    support_website: 'Destek web sitesi',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: 'Dili yönet',
    subtitle:
      'Diller ve çeviriler ekleyerek ürün deneyimini yerelleştirin. Katkınız varsayılan dil olarak ayarlanabilir.',
    add_language: 'Dil ekle',
    logto_provided: 'Logto tarafından sağlandı',
    key: 'Anahtar',
    logto_source_values: 'Logto kaynak değerleri',
    custom_values: 'Özel değerler',
    clear_all_tip: 'Tüm değerleri temizle',
    unsaved_description: 'Kaydetmeden bu sayfadan ayrılırsanız değişiklikler kaydedilmez.',
    deletion_tip: 'Dili sil',
    deletion_title: 'Eklenen dili silmek istiyor musunuz?',
    deletion_description: 'Silindikten sonra kullanıcılar bu dilde gezinemez.',
    default_language_deletion_title: 'Varsayılan dil silinemez.',
    default_language_deletion_description:
      '{{language}} varsayılan dil olarak ayarlandı ve silinemez.',
  },
};

export default Object.freeze(content);
