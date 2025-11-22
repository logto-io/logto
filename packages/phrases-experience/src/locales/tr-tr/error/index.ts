import password_rejected from './password-rejected.js';

const error = {
  general_required: '{{types, list(type: disjunction;)}} gerekli',
  general_invalid: '{{types, list(type: disjunction;)}} geçersiz',
  invalid_min_max_input: 'Girdi değeri {{minValue}} ile {{maxValue}} arasında olmalı',
  invalid_min_max_length:
    'Girdi değerinin uzunluğu {{minLength}} ile {{maxLength}} arasında olmalı',
  username_required: 'Kullanıcı adı gerekli.',
  password_required: 'Şifre gerekli.',
  username_exists: 'Kullanıcı adı mevcut.',
  username_should_not_start_with_number: 'Kullanıcı adı sayı ile başlayamaz.',
  username_invalid_charset: 'Kullanıcı adı yalnızca harf,sayı veya alt çizgi içermeli.',
  invalid_email: 'E-posta adresi geçersiz',
  invalid_phone: 'Telefon numarası geçersiz',
  passwords_do_not_match: 'Şifreler eşleşmiyor',
  invalid_passcode: 'Doğrulama kodu geçersiz.',
  invalid_connector_auth: 'Yetki geçersiz',
  invalid_connector_request: 'Bağlayıcı veri geçersiz',
  unknown: 'Bilinmeyen hata. Lütfen daha sonra tekrar deneyiniz.',
  invalid_session: 'Oturum bulunamadı. Lütfen geri dönüp tekrar giriş yapınız.',
  timeout: 'Oturum zaman aşımına uğradı. Lütfen geri dönüp tekrar giriş yapınız.',
  password_rejected,
  sso_not_enabled: 'Bu e-posta hesabı için tek oturum açma etkin değil.',
  invalid_link: 'Geçersiz bağlantı',
  invalid_link_description:
    'Tek kullanımlık belirtecin süresi dolmuş olabilir veya artık geçerli değil.',
  captcha_verification_failed: 'Captcha doğrulama hatası.',
  terms_acceptance_required: 'Şartların kabulü gerekli',
  terms_acceptance_required_description:
    'Devam etmek için şartları kabul etmelisiniz. Lütfen tekrar deneyin.',
  something_went_wrong: 'Bir şeyler yanlış gitti.',
  feature_not_enabled: 'Bu özellik etkinleştirilmedi.',
};

export default Object.freeze(error);
