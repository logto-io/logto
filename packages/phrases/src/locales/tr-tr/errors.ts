const errors = {
  request: {
    invalid_input: 'Girdi geçersiz. {{details}}',
    general: 'İstek hatası oluştu.',
  },
  auth: {
    authorization_header_missing: 'Yetkilendirme başlığı eksik.',
    authorization_token_type_not_supported: 'Yetkilendirme tipi desteklenmiyor.',
    unauthorized: 'Yetki yok. Lütfen kimlik bilgilerini ve kapsamını kontrol edin.',
    forbidden: 'Yasak. Lütfen kullanıcı rollerinizi ve izinlerinizi kontrol edin.',
    expected_role_not_found:
      'Expected role not found. Please check your user roles and permissions.',
    jwt_sub_missing: 'JWTde `sub` eksik.',
    require_re_authentication:
      'Korumalı bir işlem gerçekleştirmek için yeniden doğrulama gereklidir.',
  },
  guard: {
    invalid_input: 'İstek {{type}} geçersiz.',
    invalid_pagination: 'İstenen sayfalandırma değeri geçersiz.',
    can_not_get_tenant_id: 'İstekten kiracı kimliği alınamadı.',
    file_size_exceeded: 'Dosya boyutu aşıldı.',
    mime_type_not_allowed: 'MIME türü izin verilmiyor.',
  },
  oidc: {
    aborted: 'Son kullanıcı etkileşimi iptal etti.',
    invalid_scope: '{{scope}} kapsamı desteklenmiyor.',
    invalid_scope_plural: '{{scopes}} kapsamları desteklenmiyor.',
    invalid_token: 'Sağlanan token geçersiz.',
    invalid_client_metadata: 'Sağlanan müşteri metadatası geçersiz.',
    insufficient_scope: 'Erişim tokenı istenen {{scopes}} kapsamında eksik.',
    invalid_request: 'İstek geçersiz.',
    invalid_grant: 'Hibe talebi geçersiz.',
    invalid_redirect_uri:
      '`redirect_uri` müşterilerin kayıtlı `redirect_uris` Lerinin hiçbiri ile eşleşmedi',
    access_denied: 'Erişim engellendi.',
    invalid_target: 'Geçersiz kaynak göstergesi.',
    unsupported_grant_type: 'Desteklenmeyen `grant_type` istendi.',
    unsupported_response_mode: 'Desteklenmeye `response_mode` istendi.',
    unsupported_response_type: 'Desteklenmeyen `response_type` istendi.',
    provider_error: 'Dahili OIDC Hatası: {{message}}.',
  },
  user: {
    username_already_in_use: 'Bu kullanıcı adı zaten kullanımda.',
    email_already_in_use: 'Bu e-posta mevcut bir hesapla ilişkilendirilmiştir.',
    phone_already_in_use: 'Bu telefon numarası mevcut bir hesapla ilişkilendirilmiştir.',
    invalid_email: 'Geçersiz e-posta adresi.',
    invalid_phone: 'Geçersiz telefon numarası.',
    email_not_exist: 'E-posta adresi henüz kaydedilmedi.',
    phone_not_exist: 'Telefon numarası henüz kaydedilmedi',
    identity_not_exist: 'Sosyal platform hesabı henüz kaydedilmedi.',
    identity_already_in_use: 'Sosyal platform hesabı kaydedildi.',
    social_account_exists_in_profile: 'Bu sosyal hesap zaten ilişkilendirilmiş.',
    cannot_delete_self: 'Kendinizi silemezsiniz.',
    sign_up_method_not_enabled: 'Bu kayıt yöntemi etkin değil.',
    sign_in_method_not_enabled: 'Bu oturum açma yöntemi etkin değil.',
    same_password: 'Yeni şifre, eski şifrenizle aynı olamaz.',
    password_required_in_profile: 'Oturum açmadan önce bir şifre belirlemeniz gerekiyor.',
    new_password_required_in_profile: 'Yeni bir şifre belirlemeniz gerekiyor.',
    password_exists_in_profile: 'Şifre profilinizde zaten mevcut.',
    username_required_in_profile: 'Oturum açmadan önce bir kullanıcı adı belirlemeniz gerekiyor.',
    username_exists_in_profile: 'Kullanıcı adı profilinizde zaten mevcut.',
    email_required_in_profile: 'Oturum açmadan önce bir e-posta adresi eklemeniz gerekiyor.',
    email_exists_in_profile: 'Profiliniz zaten bir e-posta adresi ile ilişkilendirilmiştir.',
    phone_required_in_profile: 'Oturum açmadan önce bir telefon numarası eklemeniz gerekiyor.',
    phone_exists_in_profile: 'Profiliniz zaten bir telefon numarası ile ilişkilendirilmiştir.',
    email_or_phone_required_in_profile:
      'Oturum açmadan önce bir e-posta adresi veya telefon numarası eklemeniz gerekiyor.',
    suspended: 'Bu hesap askıya alındı.',
    user_not_exist: '{{identifier}} kimliğine sahip kullanıcı mevcut değil.',
    missing_profile: 'Oturum açmadan önce ek bilgi sağlamanız gerekiyor.',
    role_exists: '{{roleId}} rol kimliği bu kullanıcıya zaten eklenmiştir.',
  },
  password: {
    unsupported_encryption_method: '{{name}} şifreleme metodu desteklenmiyor.',
    pepper_not_found: 'Şifre pepperı bulunamadı. Lütfen core envs.i kontrol edin.',
  },
  session: {
    not_found: 'Oturum bulunamadı. Lütfen geri dönüp giriş yapınız.',
    invalid_credentials: 'Geçersiz kimlik bilgileri. Lütfen girdinizi kontrol ediniz.',
    invalid_sign_in_method: 'Geçerli oturum açma yöntemi kullanılamıyor.',
    invalid_connector_id: '{{connectorId}} idsi ile kullanılabilir bağlayıcı bulunamıyor.',
    insufficient_info: 'Yetersiz oturum açma bilgisi.',
    connector_id_mismatch: 'connectorId, oturum kaydı ile eşleşmiyor.',
    connector_session_not_found:
      'Bağlayıcı oturum bulunamadı. Lütfen geri dönüp tekrardan giriş yapınız.',
    verification_session_not_found:
      'Doğrulama başarısız oldu. Lütfen doğrulama işlemini yeniden başlatın ve tekrar deneyin.',
    verification_expired:
      'Bağlantı zaman aşımına uğradı. Hesap güvenliğiniz için yeniden doğrulama yapın.',
    unauthorized: 'Lütfen önce oturum açın.',
    unsupported_prompt_name: 'Desteklenmeyen prompt adı.',
    forgot_password_not_enabled: 'Parolamı unuttum özelliği etkin değil.',
    verification_failed:
      'Doğrulama başarısız oldu. Lütfen doğrulama işlemini yeniden başlatın ve tekrar deneyin.',
    connector_validation_session_not_found: 'Token doğrulama için bağlayıcı oturumu bulunamadı.',
    identifier_not_found: 'Kullanıcı kimliği bulunamadı. Lütfen geri gidin ve yeniden giriş yapın.',
    interaction_not_found:
      'Etkileşim oturumu bulunamadı. Lütfen geri gidin ve oturumu yeniden başlatın.',
  },
  connector: {
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
  },
  verification_code: {
    phone_email_empty: 'Telefon ve e-posta alanları boş.',
    not_found: 'Doğrulama kodu bulunamadı. Lütfen önce doğrulama kodu gönderin.',
    phone_mismatch: 'Telefon eşleşmiyor. Lütfen yeni bir doğrulama kodu isteyin.',
    email_mismatch: 'E-posta eşleşmiyor. Lütfen yeni bir doğrulama kodu isteyin.',
    code_mismatch: 'Geçersiz doğrulama kodu.',
    expired: 'Doğrulama kodu süresi dolmuştur. Lütfen yeni bir doğrulama kodu isteyin.',
    exceed_max_try: 'Doğrulama kodu deneme sınırı aşıldı. Lütfen yeni bir doğrulama kodu isteyin.',
  },
  sign_in_experiences: {
    empty_content_url_of_terms_of_use:
      '"Kullanım Koşulları" İçerik URLi yok. Lütfen "Kullanım Koşulları" etkinse içerik URLi ekleyiniz.',
    empty_social_connectors:
      'Social connectors yok. Sosyal oturum açma yöntemi etkinleştirildiğinde lütfen etkin social connectorları ekleyiniz.',
    enabled_connector_not_found: 'Etkin {{type}} bağlayıcı bulunamadı.',
    not_one_and_only_one_primary_sign_in_method:
      'Yalnızca bir tane birincil oturum açma yöntemi olmalıdır. Lütfen inputu kontrol ediniz.',
    username_requires_password: 'Kullanıcı adı kayıt kimliği için bir şifre belirlemek zorunludur.',
    passwordless_requires_verify:
      'E-posta/telefon kayıt kimliği için doğrulama etkinleştirilmelidir.',
    miss_sign_up_identifier_in_sign_in: 'Oturum açma yöntemleri, kayıt kimliğini içermelidir.',
    password_sign_in_must_be_enabled:
      'Kayıtta şifre belirleme zorunlu olduğunda şifreyle oturum açma etkinleştirilmelidir.',
    code_sign_in_must_be_enabled:
      'Kayıtta şifre belirleme zorunlu olmadığında doğrulama koduyla oturum açma etkinleştirilmelidir.',
    unsupported_default_language: 'Bu dil - {{language}}, şu anda desteklenmemektedir.',
    at_least_one_authentication_factor: 'En az bir doğrulama faktörü seçmelisiniz.',
  },
  localization: {
    cannot_delete_default_language:
      '{{languageTag}} varsayılan dil olarak ayarlanmıştır ve silinemez.',
    invalid_translation_structure:
      'Geçersiz veri şemaları. Lütfen girdilerinizi kontrol edin ve tekrar deneyin.',
  },
  swagger: {
    invalid_zod_type:
      'Geçersiz Zod tipi. Lütfen yönlendirici koruma yapılandırmasını kontrol ediniz.',
    not_supported_zod_type_for_params:
      'Parametreler için desteklenmeyen Zod tipi. Lütfen yönlendirici koruma yapılandırmasını kontrol ediniz.',
  },
  entity: {
    create_failed: '{{name}} oluşturulamadı.',
    not_exists: '{{name}} mevcut değil.',
    not_exists_with_id: ' `{{id}}` id kimliğine sahip {{name}} mevcut değil.',
    not_found: 'Kaynak mevcut değil.',
  },
  log: {
    invalid_type: 'Geçersiz günlük türü.',
  },
  role: {
    name_in_use: 'Bu rol adı {{name}} zaten kullanımda',
    scope_exists: 'Bu kapsam kimliği {{scopeId}} zaten bu role eklendi',
    user_exists: 'Bu kullanıcı kimliği {{userId}} zaten bu role eklendi',
    default_role_missing:
      'Varsayılan rol adlarından bazıları veritabanında mevcut değil, lütfen önce rolleri oluşturduğunuzdan emin olun',
    internal_role_violation:
      'Logto tarafından yasaklanan dahili bir rolü güncelleme veya silmeye çalışıyor olabilirsiniz. Yeni bir rol oluşturuyorsanız, "#internal:" ile başlamayan başka bir isim deneyin.',
  },
  scope: {
    name_exists: 'Bu kapsam adı {{name}} zaten kullanımda',
    name_with_space: 'Kapsam adı boşluk içeremez.',
  },
  storage: {
    not_configured: 'Depolama sağlayıcısı yapılandırılmamış.',
    missing_parameter: 'Depolama sağlayıcısı için eksik parametre {{parameter}}.',
    upload_error: 'Dosya yüklenemedi.',
  },
};

export default errors;
