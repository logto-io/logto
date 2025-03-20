const security = {
  page_title: 'Безопасность',
  title: 'Безопасность',
  subtitle: 'Настройте расширенную защиту от сложных атак.',
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
    captcha_required_flows: 'Требуемые потоки CAPTCHA',
    sign_up: 'Регистрация',
    sign_in: 'Вход',
    forgot_password: 'Забыли пароль',
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
    deletion_description: 'Вы уверены, что хотите удалить этого поставщика CAPTCHA?',
    captcha_deleted: 'Поставщик CAPTCHA успешно удалён',
    setup_captcha: 'Настройка CAPTCHA',
  },
};

export default Object.freeze(security);
