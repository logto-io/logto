const entity = {
  invalid_input: 'Geçersiz giriş. Değer listesi boş olmamalıdır.',
  create_failed: '{{name}} oluşturulamadı.',
  db_constraint_violated: 'Veritabanı kısıtı ihlal edildi.',
  not_exists: '{{name}} mevcut değil.',
  not_exists_with_id: ' `{{id}}` id kimliğine sahip {{name}} mevcut değil.',
  not_found: 'Kaynak mevcut değil.',
  /** UNTRANSLATED */
  duplicate_value_of_unique_field: 'The value of the unique field `{{field}}` is duplicated.',
};

export default Object.freeze(entity);
