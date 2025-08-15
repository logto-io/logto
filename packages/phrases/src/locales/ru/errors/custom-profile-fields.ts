const custom_profile_fields = {
  entity_not_exists_with_names: 'Не удается найти сущности с указанными именами: {{names}}',
  invalid_min_max_input: 'Некорректный ввод min и max.',
  invalid_default_value: 'Некорректное значение по умолчанию.',
  invalid_options: 'Некорректные параметры поля.',
  invalid_regex_format: 'Неверный формат регулярного выражения.',
  invalid_address_components: 'Некорректные компоненты адреса.',
  invalid_fullname_components: 'Некорректные компоненты полного имени.',
  invalid_sub_component_type: 'Некорректный тип подкомпонента.',
  name_exists: 'Поле с таким именем уже существует.',
  conflicted_sie_order: 'Конфликт значения порядка поля для опыта входа.',
  invalid_name: 'Неверное имя поля, допускаются только буквы или цифры, чувствительно к регистру.',
  name_conflict_sign_in_identifier:
    'Недопустимое имя поля. Зарезервированные ключи идентификатора входа: {{name}}.',
  name_conflict_built_in_prop:
    'Недопустимое имя поля. Зарезервированные названия встроенных свойств профиля пользователя: {{name}}.',
  name_conflict_custom_data:
    'Недопустимое имя поля. Зарезервированные ключи пользовательских данных: {{name}}.',
  name_required: 'Имя поля обязательно.',
};

export default Object.freeze(custom_profile_fields);
