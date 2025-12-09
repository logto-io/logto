const entity = {
  invalid_input: 'Geçersiz giriş. Değer listesi boş olmamalıdır.',
  value_too_long: 'Değer uzunluğu çok uzun ve sınırı aşıyor.',
  create_failed: '{{name}} oluşturulamadı.',
  db_constraint_violated: 'Veritabanı kısıtı ihlal edildi.',
  not_exists: '{{name}} mevcut değil.',
  not_exists_with_id: ' `{{id}}` id kimliğine sahip {{name}} mevcut değil.',
  not_found: 'Kaynak mevcut değil.',
  relation_foreign_key_not_found:
    'Bir veya daha fazla yabancı anahtar bulunamıyor. Lütfen girişi kontrol edin ve tüm referans edilen varlıkların var olduğundan emin olun.',
  unique_integrity_violation: 'Varlık zaten mevcut. Lütfen girişi kontrol edin ve tekrar deneyin.',
};

export default Object.freeze(entity);
