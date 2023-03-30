const oidc = {
  aborted: 'Конечный пользователь прервал взаимодействие.',
  invalid_scope: 'Scope {{scope}} не поддерживается.',
  invalid_scope_plural: 'Scope {{scopes}} не поддерживаются.',
  invalid_token: 'Недействительный токен.',
  invalid_client_metadata: 'Недопустимые метаданные клиента.',
  insufficient_scope: 'Отсутствует токен доступа для запрошенного scope {{scopes}}.',
  invalid_request: 'Недопустимый запрос.',
  invalid_grant: 'Недопустимый запрос на предоставление прав.',
  invalid_redirect_uri:
    'redirect_uri не соответствует ни одному зарегистрированному redirect_uris клиента.',
  access_denied: 'Доступ запрещен.',
  invalid_target: 'Недопустимый указатель ресурса.',
  unsupported_grant_type: 'Запрошенный grant_type не поддерживается.',
  unsupported_response_mode: 'Запрошенный response_mode не поддерживается.',
  unsupported_response_type: 'Запрошенный response_type не поддерживается.',
  provider_error: 'Внутренняя ошибка OIDC: {{message}}.',
};

export default oidc;
