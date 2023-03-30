const connector = {
  general: 'Ошибка произошла в коннекторе: {{errorDescription}}',
  not_found: 'Не найден доступный коннектор для типа: {{type}}.',
  not_enabled: 'Коннектор не включен.',
  invalid_metadata: 'Метаданные коннектора недействительны.',
  invalid_config_guard: 'Защита конфигурации коннектора недействительна.',
  unexpected_type: 'Тип коннектора неожиданный.',
  invalid_request_parameters: 'Запрос содержит неверный входной параметр (ы).',
  insufficient_request_parameters: 'В запросе может не хватать некоторых входных параметров.',
  invalid_config: 'Конфигурация коннектора недействительна.',
  invalid_response: 'Ответ коннектора недействителен.',
  template_not_found: 'Невозможно найти правильный шаблон в конфигурации коннектора.',
  not_implemented: '{{method}}: еще не реализован.',
  social_invalid_access_token: 'Токен доступа коннектора недействителен.',
  invalid_auth_code: 'Код аутентификации коннектора недействителен.',
  social_invalid_id_token: 'Токен идентификатора коннектора недействителен.',
  authorization_failed: 'Процесс авторизации пользователя неудачный.',
  social_auth_code_invalid: 'Не удалось получить токен доступа, проверьте код авторизации.',
  more_than_one_sms: 'Количество SMS-коннекторов больше 1.',
  more_than_one_email: 'Количество email-коннекторов больше 1.',
  more_than_one_connector_factory:
    'Обнаружено несколько фабрик коннекторов (с идентификаторами {{connectorIds}}), можно удалить ненужные.',
  db_connector_type_mismatch: 'В базе данных есть коннектор, не соответствующий типу.',
  not_found_with_connector_id:
    'Не удается найти коннектор с заданным стандартным идентификатором коннектора.',
  multiple_instances_not_supported:
    'Нельзя создавать несколько экземпляров с выбранным стандартным коннектором.',
  invalid_type_for_syncing_profile:
    'Вы можете синхронизировать профиль пользователя только с социальными коннекторами.',
  can_not_modify_target: 'Цель коннектора не может быть изменена.',
  should_specify_target: "Вы должны указать 'target'.",
  multiple_target_with_same_platform:
    'Вы не можете иметь несколько социальных коннекторов с одной и той же целью и платформой.',
  cannot_overwrite_metadata_for_non_standard_connector:
    'Метаданные этого коннектора не могут быть перезаписаны.',
};
export default connector;
