const jwt_claims = {
  title: 'Özel JWT',
  description:
    'Erişim belgesine dahil edilecek özel JWT iddialarını ayarlayın. Bu iddialar, uygulamanıza ek bilgi iletmek için kullanılabilir.',
  user_jwt: {
    card_title: 'Kullanıcı İçin',
    card_field: 'Kullanıcı erişim belgesi',
    card_description: 'Erişim belgesi verilirken kullanıcıya özgü veri ekleyin.',
    for: 'kullanıcı için',
  },
  machine_to_machine_jwt: {
    card_title: 'Makine için',
    card_field: 'Makine-makine belgesi',
    card_description: 'Makine-makine belgesi verilirken ek veri ekleyin.',
    for: 'M2M için',
  },
  code_editor_title: 'Özel {{token}} iddialarını özelleştirin',
  custom_jwt_create_button: 'Özel iddialar ekle',
  custom_jwt_item: 'Özel iddialar {{for}}',
  delete_modal_title: 'Özel iddiaları sil',
  delete_modal_content: 'Özel iddiaları silmek istediğinizden emin misiniz?',
  clear: 'Temizle',
  cleared: 'Temizlendi',
  restore: 'Varsayılanları geri yükle',
  restored: 'Geri yüklendi',
  data_source_tab: 'Veri kaynağı',
  test_tab: 'Test bağlamı',
  jwt_claims_description:
    "Varsayılan iddialar JWT'de otomatik olarak dahil edilir ve geçersiz kılınabilir.",
  user_data: {
    title: 'Kullanıcı verisi',
    subtitle:
      '`veri.kullanıcı` giriş parametresini kullanarak önemli kullanıcı bilgilerini sağlayın.',
  },
  grant_data: {
    title: 'Yetki verisi',
    subtitle:
      '`veri.yetki` giriş parametresini kullanarak önemli yetki bilgilerini sağlayın, sadece belge değişimi için kullanılabilir.',
  },
  token_data: {
    title: 'Belge verisi',
    subtitle: '`belge` giriş parametresini mevcut erişim belgesi yükü için kullanın. ',
  },
  fetch_external_data: {
    title: 'Harici veri al',
    subtitle: "Harici API'larınızdan verileri doğrudan iddialara dahil edin.",
    description:
      "`fetch` işlevini kullanarak harici API'larınızı çağırın ve verileri özel iddialarınıza dahil edin. Örnek: ",
  },
  environment_variables: {
    title: 'Ortam değişkenlerini ayarla',
    subtitle: 'Hassas bilgileri depolamak için ortam değişkenlerini kullanın.',
    input_field_title: 'Ortam değişkenleri ekle',
    sample_code: 'Özel JWT iddialarınızı ele alan ortam değişkenlerine erişim. Örnek: ',
  },
  jwt_claims_hint:
    "Özel iddiaları 50KB'ın altında tutun. Varsayılan JWT iddiaları otomatik olarak belgeye dahil edilir ve geçersiz kılınamazlar.",
  tester: {
    subtitle: 'Test için sahte belge ve kullanıcı verilerini ayarlayın.',
    run_button: 'Testi Çalıştır',
    result_title: 'Test sonucu',
  },
  form_error: {
    invalid_json: 'Geçersiz JSON biçimi',
  },
};

export default Object.freeze(jwt_claims);
