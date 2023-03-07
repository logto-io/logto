const errors = {
  something_went_wrong: 'Hata! Bir şeyler yanlış gitti.',
  page_not_found: 'Sayfa bulunamadı',
  unknown_server_error: 'Bilinmeyen sunucu hatası oluştu',
  empty: 'Veri yok',
  missing_total_number: 'Yanıt başlıklarında Toplam Sayı bulunamadı',
  invalid_uri_format: 'Geçersiz URI biçimi',
  invalid_origin_format: 'Geçersiz URI kaynak biçimi',
  invalid_json_format: 'Geçersiz JSON biçimi',
  invalid_error_message_format: 'Hata mesajı biçimi geçersiz.',
  required_field_missing: 'Lütfen {{field}} giriniz',
  required_field_missing_plural: 'En az bir {{field}} girmek zorundasınız.',
  more_details: 'Daha çok detay',
  username_pattern_error:
    'Kullanıcı adı yalnızca harf, sayı veya alt çizgi içermeli ve bir sayı ile başlamamalıdır.',
  password_pattern_error:
    'Password requires a minimum of {{min}} characters and contains a mix of letters, numbers, and symbols.', // UNTRANSLATED
  insecure_contexts: 'Güvenli olmayan bağlamlar (HTTPS olmayan) desteklenmez.',
  unexpected_error: 'Beklenmedik bir hata oluştu',
  not_found: '404 not found', // UNTRANSLATED
};

export default errors;
