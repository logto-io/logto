const password_rejected = {
  too_short: 'Минимальная длина {{min}} символов.',
  too_long: 'Максимальная длина {{max}} символов.',
  character_types: 'Требуется как минимум {{min}} типов символов.',
  unsupported_characters: 'Найден неподдерживаемый символ.',
  pwned: 'Избегайте использования простых паролей, которые легко угадать.',
  restricted_found: 'Избегайте чрезмерного использования {{list,list}}.',
  restricted: {
    repetition: 'повторяющиеся символы',
    sequence: 'последовательные символы',
    user_info: 'ваши личные данные',
    words: 'контекст продукта',
  },
};

export default Object.freeze(password_rejected);
