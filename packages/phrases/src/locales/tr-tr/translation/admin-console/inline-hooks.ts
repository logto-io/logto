const inline_hooks = {
  page_title: 'Satır içi kancalar',
  title: 'Satır içi kancalar',
  subtitle:
    'Logto davranışını genişletmek için kimlik doğrulama akışının belirli noktalarında özel kod çalıştırın.',
  details_page_title: '{{name}}',
  status: {
    not_configured: 'Yapılandırılmadı',
    configured: 'Yapılandırıldı',
    enabled: 'Etkin',
    disabled: 'Devre dışı',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'İlk faktör doğrulamasından sonra',
      description:
        'İlk kimlik doğrulama faktörü doğrulandıktan sonra ve oturum açma devam etmeden önce özel mantık çalıştırın.',
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
    title: 'Kanca sonucu',
    subtitle: 'Bu kanca türü için Logto’nun anlayacağı bir sonuç nesnesi döndürün.',
  },
  environment_variables: {
    title: 'Ortam değişkenlerini ayarla',
    subtitle: 'Hassas bilgileri saklamak için ortam değişkenlerini kullanın.',
    input_field_title: 'Ortam değişkenleri ekle',
    sample_code: 'Satır içi kanca işleyicisinde ortam değişkenlerine erişim. Örnek:',
  },
  fetch_external_data: {
    title: 'Harici veri getir',
    subtitle: 'Kanca betiğinizden harici API’leri çağırın.',
    description:
      'Harici API’lerinizi çağırmak ve verileri kanca sonucuna eklemek için `fetch` işlevini kullanın. Örnek:',
  },
  settings: {
    title: 'Ayarlar',
    subtitle:
      'Kancanın etkin olup olmadığını ve çalışma zamanı hatalarının nasıl ele alınacağını kontrol edin.',
    enabled: {
      title: 'Kancayı etkinleştir',
      description: 'Kimlik doğrulama olayı tetiklendiğinde bu betiği çalıştırın.',
    },
    on_execution_error: {
      title: 'Betik hatasında',
      description:
        'Betik çalışma zamanında başarısız olduğunda Logto’nun nasıl davranacağını seçin.',
      block: 'Kimlik doğrulama akışını engelle',
      allow: 'Kimlik doğrulama akışının devam etmesine izin ver',
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
      'Bu kanca tarafından sağlanan kullanıcılar, e-posta engel listesi, yalnızca SSO alan adı, kayıt devre dışı modu ve kayıt zorunlu profil kontrolleri dahil olmak üzere yalnızca kayda özel korumaları atlar. Mevcut kullanıcıların profil ve parola yazımları da MFA tamamlanmadan önce gerçekleşir.',
  },
  delete_modal_title: 'Satır içi kancayı sil',
  delete_modal_content:
    'Bu satır içi kancayı silmek istediğinizden emin misiniz? Kimlik doğrulama akışı artık bu betiği çalıştırmayacaktır.',
  deleted: 'Satır içi kanca silindi',
  created: 'Satır içi kanca oluşturuldu',
  saved: 'Satır içi kanca kaydedildi',
};

export default Object.freeze(inline_hooks);
