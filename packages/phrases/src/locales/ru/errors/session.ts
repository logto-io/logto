const session = {
  not_found: 'Сессия не найдена. Вернитесь и войдите в систему снова.',
  invalid_credentials: 'Неправильный аккаунт или пароль. Проверьте ввод.',
  invalid_sign_in_method: 'Текущий метод входа в систему недоступен.',
  invalid_connector_id: 'Не удалось найти доступный коннектор с идентификатором {{connectorId}}.',
  insufficient_info: 'Недостаточно информации для входа в систему.',
  connector_id_mismatch: 'Идентификатор коннектора не соответствует записи сессии.',
  connector_session_not_found: 'Сессия коннектора не найдена. Вернитесь и войдите в систему снова.',
  verification_session_not_found:
    'Верификация не прошла успешно. Перезапустите процесс верификации и попробуйте еще раз.',
  verification_expired:
    'Соединение истекло. Повторите верификацию, чтобы обеспечить безопасность вашей учетной записи.',
  verification_blocked_too_many_attempts:
    'Слишком много попыток за короткое время. Пожалуйста, попробуйте снова {{relativeTime}}.',
  unauthorized: 'Сначала войдите в систему.',
  unsupported_prompt_name: 'Неподдерживаемое имя подсказки.',
  forgot_password_not_enabled: 'Забыли пароль не включен.',
  verification_failed:
    'Верификация не прошла успешно. Перезапустите процесс верификации и попробуйте еще раз.',
  connector_validation_session_not_found: 'Сеанс коннектора для проверки токена не найден.',
  csrf_token_mismatch: 'Несоответствие CSRF-токена.',
  identifier_not_found:
    'Идентификатор пользователя не найден. Вернитесь и войдите в систему снова.',
  interaction_not_found: 'Сессия взаимодействия не найдена. Вернитесь и начните сессию заново.',
  not_supported_for_forgot_password: 'Эта операция не поддерживается для забытого пароля.',
  identity_conflict:
    'Обнаружено несоответствие личности. Пожалуйста, начните новую сессию для продолжения с другой личностью.',
  mfa: {
    require_mfa_verification: 'Требуется проверка MFA для входа в систему.',
    mfa_sign_in_only: 'Mfa доступен только для взаимодействия при входе в систему.',
    pending_info_not_found:
      'Информация о ожидающем MFA не найдена, пожалуйста, сначала инициируйте MFA.',
    invalid_totp_code: 'Недействительный код TOTP.',
    webauthn_verification_failed: ' Проверка WebAuthn не удалась.',
    webauthn_verification_not_found: 'Проверка WebAuthn не найдена.',
    bind_mfa_existed: 'MFA уже существует.',
    backup_code_can_not_be_alone: 'Резервный код не может быть единственным MFA.',
    backup_code_required: 'Требуется резервный код.',
    invalid_backup_code: 'Недействительный резервный код.',
    mfa_policy_not_user_controlled:
      'Политика многофакторной аутентификации не контролируется пользователем.',
  },
  sso_enabled:
    'Единый вход в систему включен для этого указанного адреса электронной почты. Войдите в систему с помощью SSO.',
};

export default Object.freeze(session);
