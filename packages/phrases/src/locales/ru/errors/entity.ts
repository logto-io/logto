const entity = {
  invalid_input: 'Неверный ввод. Список значений не должен быть пустым.',
  value_too_long: 'Длина значения слишком велика и превышает лимит.',
  create_failed: 'Не удалось создать {{name}}.',
  db_constraint_violated: 'Нарушено ограничение базы данных.',
  not_exists: '{{name}} не существует.',
  not_exists_with_id: "{{name}} с ID '{{id}}' не существует.",
  not_found: 'Ресурс не существует.',
  relation_foreign_key_not_found:
    'Не удается найти один или несколько внешних ключей. Пожалуйста, проверьте ввод и убедитесь, что все ссылочные сущности существуют.',
  unique_integrity_violation:
    'Сущность уже существует. Пожалуйста, проверьте ввод и попробуйте снова.',
};

export default Object.freeze(entity);
