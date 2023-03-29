const error = {
  general_required: '{{types, list(type: disjunction;)}} gerekli',
  general_invalid: '{{types, list(type: disjunction;)}} geçersiz',
  username_required: 'Kullanıcı adı gerekli.',
  password_required: 'Şifre gerekli.',
  username_exists: 'Kullanıcı adı mevcut.',
  username_should_not_start_with_number: 'Kullanıcı adı sayı ile başlayamaz.',
  username_invalid_charset: 'Kullanıcı adı yalnızca harf,sayı veya alt çizgi içermeli.',
  invalid_email: 'E-posta adresi geçersiz',
  invalid_phone: 'Telefon numarası geçersiz',
  password_min_length: 'Şifre en az {{min}} karakterden oluşmalıdır',
  passwords_do_not_match: 'Şifreler eşleşmiyor',
  invalid_password:
    'Şifre en az {{min}} karakter gerektirir ve harf, sayı ve sembol karışımı içerir.',
  invalid_passcode: 'Doğrulama kodu geçersiz',
  invalid_connector_auth: 'Yetki geçersiz',
  invalid_connector_request: 'Bağlayıcı veri geçersiz',
  unknown: 'Bilinmeyen hata. Lütfen daha sonra tekrar deneyiniz.',
  invalid_session: 'Oturum bulunamadı. Lütfen geri dönüp tekrar giriş yapınız.',
  timeout: 'Oturum zaman aşımına uğradı. Lütfen geri dönüp tekrar giriş yapınız.',
};

export default error;
