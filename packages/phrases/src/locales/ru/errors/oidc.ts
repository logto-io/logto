const oidc = {
  aborted: 'Конечный пользователь прервал взаимодействие.',
  invalid_scope: 'Недопустимая область: {{error_description}}.',
  invalid_token: 'Недействительный токен.',
  invalid_client_metadata: 'Недопустимые метаданные клиента.',
  insufficient_scope: 'Отсутствует область токена `{{scope}}`.',
  invalid_request: 'Недопустимый запрос.',
  invalid_grant: 'Недопустимый запрос на предоставление прав.',
  invalid_issuer: 'Недействительный эмитент.',
  invalid_redirect_uri:
    'redirect_uri не соответствует ни одному зарегистрированному redirect_uris клиента.',
  access_denied: 'Доступ запрещен.',
  invalid_target: 'Недопустимый указатель ресурса.',
  unsupported_grant_type: 'Запрошенный grant_type не поддерживается.',
  unsupported_response_mode: 'Запрошенный response_mode не поддерживается.',
  unsupported_response_type: 'Запрошенный response_type не поддерживается.',
  provider_error: 'Внутренняя ошибка OIDC: {{message}}.',
  server_error: 'Произошла неизвестная ошибка OIDC. Пожалуйста, попробуйте снова позже.',
  provider_error_fallback: 'Произошла ошибка OIDC: {{code}}.',
  key_required: 'Требуется как минимум один ключ.',
  key_not_found: 'Ключ с идентификатором {{id}} не найден.',
  /** UNTRANSLATED */
  invalid_session_payload: 'Invalid session payload.',
};

export default Object.freeze(oidc);
