const password_policy = {
  password_requirements: 'Требования к паролю',
  minimum_length: 'Минимальная длина',
  /** UNTRANSLATED */
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error: 'Минимальная длина должна быть от {{min}} до {{max}} (включительно).',
  minimum_required_char_types: 'Минимальное количество типов символов',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: 'Отклонение пароля',
  compromised_passwords: 'Отклонить скомпрометированный пароль',
  breached_passwords: 'Сломанные пароли',
  breached_passwords_description: 'Отвергнуть пароли, найденные ранее в базах данных нарушений.',
  restricted_phrases: 'Ограничение низкобезопасных фраз',
  restricted_phrases_tooltip:
    'Пользователи не могут использовать пароли, которые полностью совпадают или состоят из перечисленных ниже фраз. Добавление 3 или более непоследовательных символов разрешено для увеличения сложности пароля.',
  repetitive_or_sequential_characters: 'Повторяющиеся или последовательные символы',
  repetitive_or_sequential_characters_description: 'Например, "AAAA", "1234" и "abcd".',
  user_information: 'Информация о пользователе',
  user_information_description:
    'Например, адрес электронной почты, номер телефона, имя пользователя и т.д.',
  custom_words: 'Пользовательские слова',
  custom_words_description:
    'Персонализируйте слова, специфичные для контекста, без учета регистра, одно на строку.',
  custom_words_placeholder: 'Имя вашей службы, название компании и т. д.',
};

export default Object.freeze(password_policy);
