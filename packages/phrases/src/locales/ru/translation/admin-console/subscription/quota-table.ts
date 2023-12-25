const quota_table = {
  quota: {
    title: 'Квота',
    tenant_limit: 'Лимит арендатора',
    base_price: 'Базовая цена',
    mau_unit_price: '* Цена за активного пользователя (MAU)',
    mau_limit: 'Лимит активных пользователей (MAU)',
  },
  application: {
    title: 'Приложения',
    total: 'Всего приложений',
    m2m: 'Приложения "машина-машина"',
  },
  resource: {
    title: 'Ресурсы API',
    resource_count: 'Количество ресурсов',
    scopes_per_resource: 'Разрешения на ресурс',
  },
  branding: {
    title: 'Интерфейс и брендинг',
    custom_domain: 'Пользовательский домен',
    custom_css: 'Пользовательский CSS',
    app_logo_and_favicon: 'Логотип и фавикон приложения',
    dark_mode: 'Темный режим',
    i18n: 'Интернационализация',
  },
  user_authn: {
    title: 'Проверка подлинности пользователя',
    omni_sign_in: 'Многочисленные входы',
    password: 'Пароль',
    passwordless: 'Без пароля - Электронная почта и SMS',
    email_connector: 'Подключение электронной почты',
    sms_connector: 'Подключение SMS',
    social_connectors: 'Социальные подключения',
    standard_connectors: 'Стандартные подключения',
    built_in_email_connector: 'Встроенное подключение электронной почты',
    mfa: 'MFA',
    sso: 'Единый вход в корпоративные системы',
  },
  user_management: {
    title: 'Управление пользователями',
    user_management: 'Управление пользователями',
    roles: 'Роли',
    machine_to_machine_roles: 'Роли машины-машины',
    scopes_per_role: 'Разрешения на роль',
  },
  audit_logs: {
    title: 'Аудит журналов',
    retention: 'Сохранение',
  },
  hooks: {
    title: 'Вебхуки',
    hooks: 'Вебхуки',
  },
  organizations: {
    title: 'Организация',
    organizations: 'Организации',
    monthly_active_organization: 'Активная организация в месяц',
    allowed_users_per_org: 'Разрешенные пользователи в организации',
    invitation: 'Приглашение (Скоро)',
    org_roles: 'Роли организации',
    org_permissions: 'Права организации',
    just_in_time_provisioning: 'Пакетная настройка по запросу',
  },
  support: {
    /** UNTRANSLATED */
    title: 'Compliance and support',
    community: 'Сообщество',
    customer_ticket: 'Техническая поддержка',
    premium: 'Премиум',
    /** UNTRANSLATED */
    email_ticket_support: 'Email ticket support',
    /** UNTRANSLATED */
    soc2_report: 'SOC2 report (Coming soon)',
    /** UNTRANSLATED */
    hipaa_or_baa_report: 'HIPAA/BAA report (Coming soon)',
  },
  mau_unit_price_footnote:
    '* Ваши активные пользователи в месяц (MAU) разделены на 3 уровня в зависимости от того, как часто они входят в систему в течение биллингового периода. Каждый уровень имеет свою стоимость за единицу MAU.',
  unlimited: 'Неограниченно',
  contact: 'Связаться',
  monthly_price: '${{value, number}}/мес.',
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} день',
  days_other: '{{count, number}} дней',
  add_on: 'Дополнительно',
  tier: 'Уровень{{value, number}}: ',
  free_token_limit_tip: 'Бесплатно для выданных токенов: {{value}} млн.',
  paid_token_limit_tip:
    'Бесплатно для выданных токенов: {{value}} млн. Мы можем начислить плату, если вы превысите {{value}} млн. токенов, когда мы окончательно установим цены.',
  paid_quota_limit_tip:
    'Мы можем начислить плату за функции, выходящие за пределы вашей квоты, как дополнительные услуги, когда мы окончательно установим цены.',
  beta_feature_tip:
    'Бесплатно во время бета-тестирования. Мы начнем взимать плату, как только установим цены на дополнительные услуги.',
  usage_based_beta_feature_tip:
    'Бесплатно во время бета-тестирования. Мы начнем взимать плату, как только установим цены на использование по организации.',
  beta: 'Бета-тестирование',
  add_on_beta: 'Дополнение (бета-тестирование)',
};

export default Object.freeze(quota_table);
