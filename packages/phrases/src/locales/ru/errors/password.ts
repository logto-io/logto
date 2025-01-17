const password = {
  unsupported_encryption_method: 'Метод шифрования {{name}} не поддерживается.',
  pepper_not_found: 'Не найден пепер пароля. Пожалуйста, проверьте ваши основные envs.',
  rejected: 'Пароль отклонен. Пожалуйста, проверьте, соответствует ли ваш пароль требованиям.',
  invalid_legacy_password_format: 'Неверный формат устаревшего пароля.',
  unsupported_legacy_hash_algorithm:
    'Неподдерживаемый устаревший алгоритм хеширования: {{algorithm}}.',
};

export default Object.freeze(password);
