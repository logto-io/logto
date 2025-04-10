const password_policy = {
  password_requirements: 'Требования к паролю',
  minimum_length: 'Минимальная длина',
  minimum_length_description:
    'NIST предлагает использовать <a>не менее 8 символов</a> для веб-продуктов.',
  minimum_length_error: 'Минимальная длина должна быть от {{min}} до {{max}} (включительно).',
  minimum_required_char_types: 'Минимальное количество типов символов',
  minimum_required_char_types_description:
    'Типы символов: прописные (A-Z), строчные (a-z), цифры (0-9) и специальные символы ({{symbols}}).',
  password_rejection: 'Отклонение пароля',
  compromised_passwords: 'Отклонить скомпрометированный пароль',
  breached_passwords: 'Сломанные пароли',
  breached_passwords_description: 'Отвергнуть пароли, найденные ранее в базах данных нарушений.',
  restricted_phrases: 'Ограничение низкобезопасных фраз',
  restricted_phrases_tooltip:
    'Ваш пароль должен избегать эти фразы, если не сопровождаются еще 3 или более символами.',
  repetitive_or_sequential_characters: 'Повторяющиеся или последовательные символы',
  repetitive_or_sequential_characters_description: 'Например, "AAAA", "1234" и "abcd".',
  user_information: 'Информация пользователя',
  user_information_description:
    'Например, адрес электронной почты, номер телефона, имя пользователя и т.д.',
  custom_words: 'Пользовательские слова',
  custom_words_description:
    'Персонализируйте слова, специфичные для контекста, без учета регистра, одно на строку.',
  custom_words_placeholder: 'Имя вашей службы, название компании и т. д.',
};

const security = {
  page_title: 'Безопасность',
  title: 'Безопасность',
  subtitle: 'Настройте расширенную защиту от сложных атак.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Политика паролей',
  },
  bot_protection: {
    title: 'Защита от ботов',
    description:
      'Включите CAPTCHA для регистрации, входа в систему и восстановления пароля, чтобы блокировать автоматические угрозы.',
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'Выберите поставщика CAPTCHA и настройте интеграцию.',
      add: 'Добавить CAPTCHA',
    },
    settings: 'Настройки',
    enable_captcha: 'Включить CAPTCHA',
    enable_captcha_description:
      'Включите проверку CAPTCHA для регистрации, входа в систему и восстановления пароля.',
  },
  create_captcha: {
    setup_captcha: 'Настройка CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'Предложение CAPTCHA уровня предприятия от Google, которое обеспечивает передовое обнаружение угроз и детальную аналитику безопасности для защиты вашего сайта от мошеннических действий.',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'Альтернатива CAPTCHA от Cloudflare, которая обеспечивает ненавязчивую защиту от ботов, гарантируя при этом беспрепятственный пользовательский опыт без визуальных головоломок.',
    },
  },
  captcha_details: {
    back_to_security: 'Назад к безопасности',
    page_title: 'Детали CAPTCHA',
    check_readme: 'Проверить README',
    options_change_captcha: 'Изменить поставщика CAPTCHA',
    connection: 'Подключение',
    description: 'Настройте соединения с CAPTCHA.',
    site_key: 'Ключ сайта',
    secret_key: 'Секретный ключ',
    project_id: 'ID проекта',
    recaptcha_key_id: 'ID ключа reCAPTCHA',
    recaptcha_api_key: 'API-ключ проекта',
    deletion_description: 'Вы уверены, что хотите удалить этого поставщика CAPTCHA?',
    captcha_deleted: 'Поставщик CAPTCHA успешно удалён',
    setup_captcha: 'Настройка CAPTCHA',
  },
  password_policy,
};

export default Object.freeze(security);
