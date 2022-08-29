const errors = {
  auth: {
    authorization_header_missing: 'Yetkilendirme başlığı eksik.',
    authorization_token_type_not_supported: 'Yetkilendirme tipi desteklenmiyor.',
    unauthorized: 'Yetki yok. Lütfen kimlik bilgilerini ve kapsamını kontrol edin.',
    forbidden: 'Yasak. Lütfen kullanıcı rollerinizi ve izinlerinizi kontrol edin.',
    expected_role_not_found:
      'Expected role not found. Please check your user roles and permissions.',
    jwt_sub_missing: 'JWTde `sub` eksik.',
  },
  guard: {
    invalid_input: 'İstek {{type}} geçersiz.',
    invalid_pagination: 'İstenen sayfalandırma değeri geçersiz.',
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
    username_exists_register: 'Kullanıcı adı kaydedildi.',
    email_exists_register: 'E-posta adresi kaydedildi.',
    phone_exists_register: 'Telefon numarası kaydedildi.',
    invalid_email: 'Geçersiz e-posta adresi.',
    invalid_phone: 'Geçersiz telefon numarası.',
    email_not_exists: 'E-posta adresi henüz kaydedilmedi.',
    phone_not_exists: 'Telefon numarası henüz kaydedilmedi',
    identity_not_exists: 'Sosyal platform hesabı henüz kaydedilmedi.',
    identity_exists: 'Sosyal platform hesabı kaydedildi.',
    invalid_role_names: '({{roleNames}}) rol adları geçerli değil.',
    cannot_delete_self: 'You cannot delete yourself.',
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
    unauthorized: 'Lütfen önce oturum açın.',
    unsupported_prompt_name: 'Desteklenmeyen prompt adı.',
  },
  connector: {
    general: 'Bağlayıcıda beklenmeyen bir hata oldu.{{errorDescription}}',
    not_found: '{{type}} tipi icin uygun bağlayıcı bulunamadı.',
    not_enabled: 'Bağlayıcı etkin değil.',
    invalid_metadata: "The connector's metadata is invalid.", // TODO: need to check TR_TR translation
    invalid_config_guard: "The connector's config guard is invalid.",
    insufficient_request_parameters: 'İstek, bazı input parametrelerini atlayabilir.',
    invalid_config: 'Bağlayıcının ayarları geçersiz.',
    invalid_response: 'Bağlayıcının yanıtı geçersiz.',
    template_not_found: 'Bağlayıcı yapılandırmasında doğru şablon bulunamıyor.',
    not_implemented: '{{method}}: henüz uygulanmadı.',
    invalid_access_token: 'Bağlayıcının erişim tokenı geçersiz.',
    invalid_auth_code: 'Bağlayıcının yetki kodu geçersiz.',
    invalid_id_token: 'Bağlayıcının idsi geçersiz.',
    authorization_failed: 'Kullanıcının yetkilendirme işlemi başarısız oldu.',
    oauth_code_invalid: 'Erişim tokenı alınamıyor, lütfen yetkilendirme kodunu kontrol edin.',
    more_than_one_sms: 'SMS bağlayıcılarının sayısı 1den fazla.',
    more_than_one_email: 'E-posta adresi bağlayıcılarının sayısı 1den fazla.',
    db_connector_type_mismatch: 'Dbde türle eşleşmeyen bir bağlayıcı var.',
  },
  passcode: {
    phone_email_empty: 'Hem telefon hem de e-posta adresi yok.',
    not_found: 'Kod bulunamadı. Lütfen önce kodu gönderiniz.',
    phone_mismatch: 'Telefon numarası eşleşmedi. Lütfen yeni bir kod isteyiniz.',
    email_mismatch: 'E-posta adresi eşleşmedi. Lütfen yeni bir kod isteyiniz.',
    code_mismatch: 'Geçersiz kod.',
    expired: 'Kodun Süresi doldu. Lütfen yeni bir kod isteyiniz.',
    exceed_max_try: 'Kod doğrulama sınırı aşıldı. Lütfen yeni bir kod isteyiniz.',
  },
  sign_in_experiences: {
    empty_content_url_of_terms_of_use:
      '"Kullanım Koşulları" İçerik URLi yok. Lütfen "Kullanım Koşulları" etkinse içerik URLi ekleyiniz.',
    empty_logo: 'Lütfen logo URLini giriniz',
    empty_slogan:
      'Marka sloganı yok. Eğer UI stili slogan içeriyorsa, lütfen bir marka sloganı ekleyin.',
    empty_social_connectors:
      'Social connectors yok. Sosyal oturum açma yöntemi etkinleştirildiğinde lütfen etkin social connectorları ekleyiniz.',
    enabled_connector_not_found: 'Etkin {{type}} bağlayıcı bulunamadı.',
    not_one_and_only_one_primary_sign_in_method:
      'Yalnızca bir tane birincil oturum açma yöntemi olmalıdır. Lütfen inputu kontrol ediniz.',
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
};

export default errors;
