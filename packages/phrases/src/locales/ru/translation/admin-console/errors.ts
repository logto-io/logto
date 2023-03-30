const errors = {
  something_went_wrong: 'Упс! Что-то пошло не так.',
  page_not_found: 'Страница не найдена',
  unknown_server_error: 'Произошла неизвестная ошибка сервера',
  empty: 'Нет данных',
  missing_total_number: 'Не удалось найти Total-Number в заголовках ответа',
  invalid_uri_format: 'Неверный формат URI',
  invalid_origin_format: 'Неверный формат URI-оригинала',
  invalid_json_format: 'Неверный формат JSON',
  invalid_error_message_format: 'Неверный формат сообщения об ошибке.',
  required_field_missing: 'Пожалуйста, введите {{field}}',
  required_field_missing_plural: 'Вы должны ввести хотя бы одно {{field}}',
  more_details: 'Больше информации',
  username_pattern_error:
    'Имя пользователя должно состоять только из букв, цифр или подчеркивания и не должно начинаться с цифры.',
  password_pattern_error:
    'Пароль должен содержать не менее {{min}} символов и состоять из букв, цифр и символов.',
  insecure_contexts: 'Небезопасные контексты (нет HTTPS) не поддерживаются.',
  unexpected_error: 'Произошла непредвиденная ошибка.',
  not_found: '404 не найдено',
  create_internal_role_violation:
    'Вы создаете новую внутреннюю роль, что запрещено Logto. Попробуйте другое имя, которое не начинается с "#internal:".',
};

export default errors;
