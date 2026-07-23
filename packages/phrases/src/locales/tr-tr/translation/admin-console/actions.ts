const actions = {
  page_title: 'Actions',
  title: 'Actions',
  subtitle:
    'Logto davranışını genişletmek için kimlik doğrulama akışının belirli noktalarında özel kod çalıştırın.',
  status: {
    not_configured: 'Yapılandırılmadı',
    configured: 'Yapılandırıldı',
    enabled: 'Etkin',
    disabled: 'Devre dışı',
  },
  types: {
    post_first_factor_verification: {
      name: 'İlk faktör doğrulamasından sonra',
      description:
        'Oturum açma sırasında yerel parola doğrulaması başarısız olduktan sonra özel mantık çalıştırın.',
    },
    post_sign_in: {
      name: 'Oturum açma sonrası',
      description: 'Bir kullanıcı başarıyla oturum açtıktan sonra özel mantık çalıştırın.',
    },
  },
  data_source_tab: 'Veri kaynağı',
  test_tab: 'Test bağlamı',
  settings_tab: 'Ayarlar',
  event_data: {
    title: 'Olay yükü',
    subtitle: 'Kimlik doğrulama olayı verileri için `event` giriş parametresini kullanın.',
  },
  result_data: {
    title: 'Eylem sonucu',
    subtitle: 'Bu eylem türü için Logto’nun anlayacağı bir sonuç nesnesi döndürün.',
  },
  environment_variables: {
    title: 'Ortam değişkenlerini ayarla',
    subtitle: 'Hassas bilgileri saklamak için ortam değişkenlerini kullanın.',
    input_field_title: 'Ortam değişkenleri ekle',
    sample_code: 'Eylem işleyicisinde ortam değişkenlerine erişim. Örnek:',
  },
  fetch_external_data: {
    title: 'Harici veri getir',
    subtitle: 'Eylem betiğinizden harici API’leri çağırın.',
    description:
      'Harici API’lerinizi çağırmak ve verileri eylem sonucuna eklemek için `fetch` işlevini kullanın. Örnek:',
  },
  settings: {
    title: 'Ayarlar',
    subtitle:
      'Eylemin etkin olup olmadığını ve çalışma zamanı hatalarının nasıl ele alınacağını kontrol edin.',
    enabled: {
      title: 'Eylemi etkinleştir',
      description: 'Kimlik doğrulama olayı tetiklendiğinde bu betiği çalıştırın.',
    },
    on_execution_error: {
      title: 'Betik hatasında',
      description:
        'Betik çalışma zamanında başarısız olduğunda Logto’nun nasıl davranacağını seçin.',
      block: 'Kimlik doğrulama akışını engelle',
      allow: 'Kimlik doğrulama akışının devam etmesine izin ver',
      post_first_factor_description:
        'Bu betik başarısız olduğunda Logto her zaman geçersiz kimlik bilgilerini reddeder; böylece parola doğrulaması atlanamaz.',
    },
  },
  test_context: {
    subtitle: 'Testler çalıştırılırken kullanılan sahte olay yükünü ayarlayın.',
    input_field_title: 'Olay örneği JSON',
  },
  script: {
    title: 'Betik',
    restore: 'Varsayılanları geri yükle',
    restored: 'Geri yüklendi',
  },
  tester: {
    run_button: 'Testi çalıştır',
    result_title: 'Test sonucu',
  },
  form_error: {
    invalid_json: 'Geçersiz JSON biçimi',
  },
  security_warning: {
    title: 'Güvenlik uyarısı',
    description:
      'Bu eylem yalnızca yerel parola doğrulaması başarısız olduktan sonra çalışır. Yalnızca gönderilen parolayı bağımsız olarak doğruladıktan sonra `passwordVerified: true` döndürün. Bu eylem tarafından sağlanan kullanıcılar, e-posta engel listesi, yalnızca SSO alan adı, kayıt devre dışı modu ve kayıt zorunlu profil kontrolleri dahil olmak üzere yalnızca kayda özel korumaları atlar. Mevcut kullanıcıların profil ve parola yazımları da MFA tamamlanmadan önce gerçekleşir.',
  },
  delete_modal_title: 'Eylemi sil',
  delete_modal_content:
    'Bu eylemi silmek istediğinizden emin misiniz? Kimlik doğrulama akışı artık bu betiği çalıştırmayacaktır.',
  deleted: 'Eylem silindi',
  created: 'Eylem oluşturuldu',
  saved: 'Eylem kaydedildi',
};

export default Object.freeze(actions);
