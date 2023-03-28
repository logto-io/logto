const sign_in_experiences = {
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
};

export default sign_in_experiences;
