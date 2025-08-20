const sign_in_experiences = {
  empty_content_url_of_terms_of_use:
    "Kullanım Koşulları İçerik URL'i yok. Lütfen Kullanım Koşulları etkinse içerik URL'i ekleyiniz.",
  empty_social_connectors:
    'Sosyal bağlayıcılar yok. Sosyal oturum açma yöntemi etkinleştirildiğinde lütfen etkin sosyal bağlayıcıları ekleyiniz.',
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
  backup_code_cannot_be_enabled_alone: 'Yedek kod yalnız başına etkinleştirilemez.',
  duplicated_mfa_factors: 'Yinelenen MFA faktörleri.',
  email_verification_code_cannot_be_used_for_mfa:
    'E-posta doğrulama kodu, oturum açma için e-posta doğrulama etkinleştirildiğinde MFA için kullanılamaz.',
  phone_verification_code_cannot_be_used_for_mfa:
    'SMS doğrulama kodu, oturum açma için SMS doğrulama etkinleştirildiğinde MFA için kullanılamaz.',
  email_verification_code_cannot_be_used_for_sign_in:
    'E-posta doğrulama kodu, MFA için etkinleştirildiğinde oturum açma için kullanılamaz.',
  phone_verification_code_cannot_be_used_for_sign_in:
    'SMS doğrulama kodu, MFA için etkinleştirildiğinde oturum açma için kullanılamaz.',
  duplicated_sign_up_identifiers: 'Yinelenen kayıt kimlikleri tespit edildi.',
  missing_sign_up_identifiers: 'Birincil kayıt kimliği boş olamaz.',
  invalid_custom_email_blocklist_format:
    'Geçersiz özel e-posta engelleme listesi öğeleri: {{items, list(type:conjunction)}}. Her öğe, geçerli bir e-posta adresi veya e-posta alan adı olmalıdır, örneğin, foo@example.com veya @example.com.',
  forgot_password_method_requires_connector:
    'Şifremi unuttum yöntemi, yapılandırılması gereken ilgili bir {{method}} bağlayıcı gerektirir.',
};

export default Object.freeze(sign_in_experiences);
