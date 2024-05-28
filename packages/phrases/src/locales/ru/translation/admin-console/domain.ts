const domain = {
  status: {
    connecting: 'Соединение...',
    in_use: 'Используется',
    failed_to_connect: 'Не удалось соединиться',
  },
  update_endpoint_notice:
    'Не забудьте обновить домен для обратного вызова социального коннектора и конечной точки Logto в вашем приложении, если вы хотите использовать пользовательский домен для функций. <a>{{link}}</a>',
  error_hint:
    'Убедитесь, что вы обновили свои DNS записи. Мы будем проверять каждые {{value}} секунд.',
  custom: {
    custom_domain: 'Пользовательский домен',
    custom_domain_description:
      'Улучшите свой брендинг, используя пользовательский домен. Этот домен будет использоваться в вашем процессе входа.',
    custom_domain_field: 'Пользовательский домен',
    custom_domain_placeholder: 'Ваш.домен.com',
    add_domain: 'Добавить домен',
    invalid_domain_format:
      'Please provide a valid domain URL with a minimum of three parts, e.g. "your.domain.com."',
    verify_domain: 'Проверить домен',
    enable_ssl: 'Включить SSL',
    checking_dns_tip:
      'После настройки DNS, процесс запустится автоматически и может занять до 24-х часов. Вы можете выйти из этого интерфейса во время его работы.',
    enable_ssl_tip:
      'Включение SSL запустится автоматически и может занять до 24-х часов. Вы можете выйти из этого интерфейса во время его работы.',
    generating_dns_records: 'Генерация DNS записей...',
    add_dns_records: 'Пожалуйста, добавьте следующие DNS-записи в Ваш DNS-провайдер.',
    dns_table: {
      type_field: 'Тип',
      name_field: 'Имя',
      value_field: 'Значение',
    },
    deletion: {
      delete_domain: 'Удалить домен',
      reminder: 'Удалить пользовательский домен',
      description: 'Вы уверены, что хотите удалить этот пользовательский домен?',
      in_used_description:
        'Вы уверены, что хотите удалить этот пользовательский домен "<span>{{domain}}</span>"?',
      in_used_tip:
        'Если ранее вы настраивали этот пользовательский домен в своём провайдере социальных коннекторов или конечной точке приложения, вам нужно сначала изменить URI на домен по умолчанию Logto "<span>{{domain}}</span>". Это необходимо для правильной работы кнопки социальной авторизации.',
      deleted: 'Пользовательский домен успешно удалён!',
    },
  },
  default: {
    default_domain: 'Домен по умолчанию',
    default_domain_description:
      'Logto предлагает предварительно настроенный домен по умолчанию, готовый к использованию без дополнительной настройки. Этот домен по умолчанию служит как резервный вариант, даже если вы включили пользовательский домен.',
    default_domain_field: 'Домен по умолчанию Logto',
  },
  custom_endpoint_note:
    'Вы можете настроить имя домена этих конечных точек по своему усмотрению. Выберите "{{custom}}" или "{{default}}".',
  custom_social_callback_url_note:
    'Вы можете настроить имя домена этого URI, чтобы соответствовать конечной точке вашего приложения. Выберите "{{custom}}" или "{{default}}".',
  custom_acs_url_note:
    'You can customize the domain name of this URI to match your identity provider assertion consumer service URL. Choose either "{{custom}}" or "{{default}}".',
};

export default Object.freeze(domain);
