const connector_details = {
  page_title: 'Детали подключения',
  back_to_connectors: 'Вернуться к подключениям',
  check_readme: 'Проверить README',
  settings: 'Общие настройки',
  settings_description:
    'Интегрируйте сторонних поставщиков для быстрого входа через социальные сети и связывания социальных аккаунтов',
  setting_description_with_token_storage_supported:
    'Интегрируйте сторонних поставщиков для быстрого входа через социальные сети, связывания социальных аккаунтов и доступа к API.',
  email_connector_settings_description:
    'Интегрируйтесь с вашим поставщиком доставки электронной почты, чтобы включить регистрацию и вход без пароля для конечных пользователей.',
  parameter_configuration: 'Конфигурация параметра',
  test_connection: 'Тестирование',
  save_error_empty_config: 'Пожалуйста, введите конфигурацию',
  send: 'Отправить',
  send_error_invalid_format: 'Неверный ввод',
  edit_config_label: 'Введите ваш JSON здесь',
  test_email_sender: 'Протестируйте ваш электронный коннектор',
  test_sms_sender: 'Протестируйте ваш SMS коннектор',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+1 555-123-4567',
  test_message_sent: 'Тестовое сообщение отправлено',
  test_sender_description:
    'Logto использует шаблон "Общий" для тестирования. Вы получите сообщение, если ваш коннектор правильно настроен.',
  options_change_email: 'Изменить электронный коннектор',
  options_change_sms: 'Изменить SMS коннектор',
  connector_deleted: 'Коннектор успешно удален',
  type_email: 'Электронный коннектор',
  type_sms: 'SMS коннектор',
  type_social: 'Социальный коннектор',
  in_used_social_deletion_description:
    'Этот коннектор используется в вашем опыте входа в систему. При удалении опыт входа в систему <name/> будет удален в настройках опыта входа в систему. Вы должны повторно настроить его, если решите добавить его обратно.',
  in_used_passwordless_deletion_description:
    'Этот {{name}} используется в вашем опыте входа в систему. При удалении опыт входа в систему не будет работать правильно, пока не будет решен конфликт. Вы должны повторно настроить его, если решите добавить его обратно.',
  deletion_description:
    'Вы удаляете этот коннектор. Он не может быть отменен, и вы должны повторно настроить его, если решите добавить его обратно.',
  logto_email: {
    total_email_sent: 'Всего отправлено электронных писем: {{value, number}}',
    total_email_sent_tip:
      'Logto использует SendGrid для безопасной и стабильной встроенной электронной почты. Полностью бесплатно. <a>Узнать больше</a>',
    email_template_title: 'Шаблон электронной почты',
    template_description:
      'Встроенная электронная почта использует шаблоны по умолчанию для безшовной доставки писем с подтверждением. Никакой дополнительной настройки не требуется, и вы можете настроить базовую информацию о бренде.',
    template_description_link_text: 'Просмотреть шаблоны',
    description_action_text: 'Просмотреть шаблоны',
    from_email_field: 'Отправитель',
    sender_name_field: 'Имя отправителя',
    sender_name_tip:
      'Настройте имя отправителя для электронных писем. Если оставить пустым, будет использоваться "Verification" в качестве имени по умолчанию.',
    sender_name_placeholder: 'Введите имя отправителя здесь',
    company_information_field: 'Информация о компании',
    company_information_description:
      'Отображайте имя вашей компании, адрес или почтовый код внизу электронных писем, чтобы улучшить подлинность.',
    company_information_placeholder: 'Основная информация о вашей компании',
    email_logo_field: 'Логотип электронной почты',
    email_logo_tip:
      'Отображайте логотип вашего бренда вверху писем. Используйте одно и то же изображение как для режима светлого, так и для режима темного.',
    urls_not_allowed: 'URL-адреса не разрешены',
    test_notes: 'Logto использует шаблон "Общий" для тестирования.',
  },
  google_one_tap: {
    title: 'Google One Tap',
    description:
      'Google One Tap — это безопасный и удобный способ для пользователей войти на ваш сайт.',
    enable_google_one_tap: 'Включить Google One Tap',
    enable_google_one_tap_description:
      'Включите Google One Tap в вашем опыте входа: Позвольте пользователям быстро зарегистрироваться или войти с помощью своей учетной записи Google, если они уже вошли в свою учетную запись на устройстве.',
    configure_google_one_tap: 'Настроить Google One Tap',
    auto_select: 'Автоматически выбирать учетные данные, если это возможно',
    close_on_tap_outside: 'Отменить подсказку, если пользователь кликнет/нажмет вне её',
    itp_support: 'Включить <a>улучшенный UX One Tap для ITP браузеров</a>',
  },
  sign_in_experience: {
    /** UNTRANSLATED */
    in_use: 'Enabled for sign-in ',
    /** UNTRANSLATED */
    not_in_use: 'Disabled for sign-in ',
  },
};

export default Object.freeze(connector_details);
