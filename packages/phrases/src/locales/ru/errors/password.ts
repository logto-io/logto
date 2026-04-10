const password = {
  unsupported_encryption_method: 'Метод шифрования {{name}} не поддерживается.',
  pepper_not_found: 'Не найден пепер пароля. Пожалуйста, проверьте ваши основные envs.',
  rejected: 'Пароль отклонен. Пожалуйста, проверьте, соответствует ли ваш пароль требованиям.',
  invalid_legacy_password_format: 'Неверный формат устаревшего пароля.',
  unsupported_legacy_hash_algorithm:
    'Неподдерживаемый устаревший алгоритм хеширования: {{algorithm}}.',
  expired: 'Срок действия вашего пароля истек. Пожалуйста, сбросьте пароль, чтобы продолжить.',
  expiration_reminder:
    'Срок действия вашего пароля истечет через {{daysUntilExpiration}} дн. Пожалуйста, подумайте о его сбросе.',
};

export default Object.freeze(password);
