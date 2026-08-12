const auth = {
  authorization_header_missing: 'Отсутствует заголовок авторизации.',
  authorization_token_type_not_supported: 'Тип авторизации не поддерживается.',
  unauthorized: 'Не авторизованы. Пожалуйста, проверьте учетные данные и его область действия.',
  forbidden: 'Запрещено. Пожалуйста, проверьте свои роли и разрешения пользователей.',
  expected_role_not_found:
    'Ожидаемая роль не найдена. Пожалуйста, проверьте свои роли и разрешения пользователей.',
  jwt_sub_missing: 'Отсутствует `sub` в JWT.',
  require_re_authentication:
    'Для выполнения защищенного действия требуется повторная аутентификация.',
  exceed_token_limit: 'Превышен лимит токенов. Пожалуйста, свяжитесь с администратором.',
  third_party_application_forbidden:
    'Сторонние приложения не могут изменять данные учётной записи через этот API.',
};

export default Object.freeze(auth);
