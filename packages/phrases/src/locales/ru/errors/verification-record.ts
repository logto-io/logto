const verification_record = {
  not_found: 'Запись подтверждения не найдена.',
  permission_denied: 'Доступ запрещён, пожалуйста, повторно пройдите аутентификацию.',
  not_supported_for_google_one_tap: 'Этот API не поддерживает Google One Tap.',
  social_verification: {
    invalid_target:
      'Недопустимая запись подтверждения. Ожидалось {{expected}}, но получено {{actual}}.',
    token_response_not_found:
      'Ответ с токеном не найден. Пожалуйста, убедитесь, что хранение токенов поддерживается и включено для социального коннектора.',
  },
};

export default Object.freeze(verification_record);
