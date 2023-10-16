const entity = {
  invalid_input: 'Неверный ввод. Список значений не должен быть пустым.',
  create_failed: 'Не удалось создать {{name}}.',
  db_constraint_violated: 'Нарушено ограничение базы данных.',
  not_exists: '{{name}} не существует.',
  not_exists_with_id: '{{name}} с ID `{{id}}` не существует.',
  not_found: 'Ресурс не существует.',
  /** UNTRANSLATED */
  relation_foreign_key_not_found:
    'Cannot find one or more foreign keys. Please check the input and ensure that all referenced entities exist.',
  /** UNTRANSLATED */
  duplicate_value_of_unique_field: 'The value of the unique field `{{field}}` is duplicated.',
};

export default Object.freeze(entity);
