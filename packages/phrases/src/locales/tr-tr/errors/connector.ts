const connector = {
  general: 'Bağdaştırıcıda bir hata oluştu: {{errorDescription}}',
  not_found: '{{type}} tipi icin uygun bağlayıcı bulunamadı.',
  not_enabled: 'Bağlayıcı etkin değil.',
  invalid_metadata: 'Bağlayıcının meta verileri geçersizdir.',
  invalid_config_guard: 'Bağlayıcının yapılandırma koruyucusu geçersizdir.',
  unexpected_type: 'Bağlayıcının türü beklenmedik.',
  invalid_request_parameters: 'İstek yanlış girdi parametreleri ile gönderildi.',
  insufficient_request_parameters: 'İstek, bazı input parametrelerini atlayabilir.',
  invalid_config: 'Bağlayıcının ayarları geçersiz.',
  invalid_response: 'Bağlayıcının yanıtı geçersiz.',
  template_not_found: 'Bağlayıcı yapılandırmasında doğru şablon bulunamıyor.',
  not_implemented: '{{method}}: henüz uygulanmadı.',
  social_invalid_access_token: 'Bağlayıcının erişim tokenı geçersiz.',
  invalid_auth_code: 'Bağlayıcının yetki kodu geçersiz.',
  social_invalid_id_token: 'Bağlayıcının idsi geçersiz.',
  authorization_failed: 'Kullanıcının yetkilendirme işlemi başarısız oldu.',
  social_auth_code_invalid: 'Erişim tokenı alınamıyor, lütfen yetkilendirme kodunu kontrol edin.',
  more_than_one_sms: 'SMS bağlayıcılarının sayısı 1den fazla.',
  more_than_one_email: 'E-posta adresi bağlayıcılarının sayısı 1den fazla.',
  db_connector_type_mismatch: 'Dbde türle eşleşmeyen bir bağlayıcı var.',
  more_than_one_connector_factory:
    'Birden fazla bağlayıcı fabrikası bulundu ({{connectorIds}} ID numarasıyla), gereksiz olanları kaldırabilirsiniz.',
  not_found_with_connector_id: 'Belirtilen standart bağlayıcı kimliğiyle bağlayıcı bulunamadı.',
  multiple_instances_not_supported:
    'Seçilen standart bağlayıcı ile birden fazla örnek oluşturulamaz.',
  invalid_type_for_syncing_profile:
    'Kullanıcı profili yalnızca sosyal bağlayıcılarla senkronize edilebilir.',
  can_not_modify_target: "'Hedef' bağlayıcı değiştirilemez.",
  should_specify_target: "'Hedef' belirtilmelidir.",
  multiple_target_with_same_platform:
    'Aynı hedefe ve platforma sahip birden fazla sosyal bağlayıcıya sahip olamazsınız.',
  cannot_overwrite_metadata_for_non_standard_connector:
    "Bu bağlayıcının 'metadata'sı üzerine yazılamaz.",
};

export default connector;
