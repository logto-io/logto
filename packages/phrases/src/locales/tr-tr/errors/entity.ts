const entity = {
  invalid_input: 'Geçersiz giriş. Değer listesi boş olmamalıdır.',
  create_failed: '{{name}} oluşturulamadı.',
  db_constraint_violated: 'Veritabanı kısıtı ihlal edildi.',
  not_exists: '{{name}} mevcut değil.',
  not_exists_with_id: ' `{{id}}` id kimliğine sahip {{name}} mevcut değil.',
  not_found: 'Kaynak mevcut değil.',
  /** UNTRANSLATED */
  relation_foreign_key_not_found:
    'Cannot find one or more foreign keys. Please check the input and ensure that all referenced entities exist.',
  /** UNTRANSLATED */
  unique_integrity_violation: 'The entity already exists. Please check the input and try again.',
};

export default Object.freeze(entity);
