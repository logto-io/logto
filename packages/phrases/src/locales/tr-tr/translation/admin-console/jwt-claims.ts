const jwt_claims = {
  title: 'Özel JWT',
  description:
    'Erişim belgesini veya kimlik belgesini özelleştirerek uygulamanıza ek bilgi sağlayın.',
  access_token: {
    card_title: 'Erişim belgesi',
    card_description:
      "Erişim belgesi, API'ler tarafından istekleri yetkilendirmek için kullanılan kimlik bilgisidir ve yalnızca erişim kararları için gerekli iddialari içerir.",
  },
  user_jwt: {
    card_field: 'Kullanıcı erişim belgesi',
    card_description: 'Erişim belgesi verilirken kullanıcıya özgü veri ekleyin.',
    for: 'kullanıcı için',
  },
  machine_to_machine_jwt: {
    card_field: 'Makine-makine erişim belgesi',
    card_description: 'Makine-makine belgesi verilirken ek veri ekleyin.',
    for: 'M2M için',
  },
  id_token: {
    card_title: 'Kimlik belgesi',
    card_description:
      'Kimlik belgesi, oturum açma sonrasında alınan bir kimlik ifadesidir ve istemcinin görüntüleme veya oturum oluşturma için kullanabileceği kullanıcı kimlik iddialarını içerir.',
    card_field: 'Kullanıcı kimlik belgesi',
    card_field_description:
      "'sub', 'email', 'phone', 'profile' ve 'address' iddiaları her zaman kullanılabilir. Diğer iddiaların önce burada etkinleştirilmesi gerekir. Tüm durumlarda, uygulamanız bunları almak için entegrasyon sırasında eşleşen kapsamları talep etmelidir.",
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
  interaction_data: {
    title: 'Kullanıcı etkileşim bağlamı',
    subtitle:
      'Kullanıcının etkileşim ayrıntılarına, mevcut kimlik doğrulama oturumu için `context.interaction` parametresini kullanarak erişin, `interactionEvent`, `userId` ve `verificationRecords` dahil.',
  },
  application_data: {
    title: 'Uygulama bağlamı',
    subtitle:
      'Token ile ilişkili uygulama bilgilerini sağlamak için `context.application` giriş parametresini kullanın.',
  },
  token_data: {
    title: 'Belge verisi',
    subtitle: '`belge` giriş parametresini mevcut erişim belgesi yükü için kullanın. ',
  },
  api_context: {
    title: 'API bağlamı: erişim kontrolü',
    subtitle: '`api.denyAccess` yöntemini kullanarak belge isteğini reddedin.',
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
