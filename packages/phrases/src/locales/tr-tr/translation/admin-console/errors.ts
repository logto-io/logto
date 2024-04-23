const errors = {
  something_went_wrong: 'Hata! Bir şeyler yanlış gitti.',
  page_not_found: 'Sayfa bulunamadı',
  unknown_server_error: 'Bilinmeyen sunucu hatası oluştu',
  empty: 'Veri yok',
  missing_total_number: 'Yanıt başlıklarında Toplam Sayı bulunamadı',
  invalid_uri_format: 'Geçersiz URI biçimi',
  invalid_origin_format: 'Geçersiz URI kaynak biçimi',
  invalid_json_format: 'Geçersiz JSON biçimi',
  invalid_regex: 'Geçersiz düzenli ifade',
  invalid_error_message_format: 'Hata mesajı biçimi geçersiz.',
  required_field_missing: 'Lütfen {{field}} giriniz',
  required_field_missing_plural: 'En az bir {{field}} girmek zorundasınız.',
  more_details: 'Daha çok detay',
  username_pattern_error:
    'Kullanıcı adı yalnızca harf, sayı veya alt çizgi içermeli ve bir sayı ile başlamamalıdır.',
  email_pattern_error: 'E-posta adresi geçersiz.',
  phone_pattern_error: 'Telefon numarası geçersiz.',
  insecure_contexts: 'Güvenli olmayan bağlamlar (HTTPS olmayan) desteklenmez.',
  unexpected_error: 'Beklenmedik bir hata oluştu',
  not_found: '404 bulunamadı',
  create_internal_role_violation:
    'Yeni bir dahili rol oluşturuyorsunuz, bu Logto tarafından yasaklanmıştır. "#internal:" ile başlamayan başka bir ad deneyin.',
  should_be_an_integer: 'Tamsayı olmalıdır.',
  number_should_be_between_inclusive:
    'Sayı {{min}} ve {{max}} arasında (her ikisi de dahil) olmalıdır.',
};

export default Object.freeze(errors);
