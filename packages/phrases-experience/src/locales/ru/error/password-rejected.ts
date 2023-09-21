const password_rejected = {
  too_short: 'Минимальная длина {{min}} символов.',
  too_long: 'Максимальная длина {{max}} символов.',
  character_types: 'Требуется как минимум {{min}} типов символов.',
  unsupported_characters: 'Найден неподдерживаемый символ.',
  pwned: 'Избегайте использования простых паролей, которые легко угадать.',
  restricted_found: 'Избегайте чрезмерного использования {{list,list}}.',
  restricted_repetition: 'повторяющиеся символы',
  restricted_sequence: 'последовательные символы',
  restricted_userinfo: 'ваши личные данные',
  restricted_words: 'контекст продукта',
};

export default Object.freeze(password_rejected);
