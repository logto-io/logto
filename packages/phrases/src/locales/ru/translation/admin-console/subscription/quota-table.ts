const quota_table = {
  quota: {
    title: 'Основы',
    base_price: 'Базовая цена',
    mau_limit: 'Лимит MAU',
    included_tokens: 'Включенные токены',
  },
  application: {
    title: 'Приложения',
    total: 'Всего приложений',
    m2m: 'Приложения "машина-машина"',
    third_party: 'Приложения третьих сторон',
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
    logo_and_favicon: 'Логотип и значок',
    bring_your_ui: 'Используйте свой UI',
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
    mfa: 'Многофакторная аутентификация',
    sso: 'Единый вход в корпоративные системы',

    impersonation: 'Имперсонация',
  },
  user_management: {
    title: 'Управление пользователями',
    user_management: 'Управление пользователями',
    roles: 'Роли',
    machine_to_machine_roles: 'Роли машины-машины',
    scopes_per_role: 'Разрешения на роль',
  },
  organizations: {
    title: 'Организация',
    organizations: 'Организации',
    organization: 'Организация',
    organization_count: 'Количество организаций',
    allowed_users_per_org: 'Пользователей на организацию',
    invitation: 'Приглашение (Management API)',
    org_roles: 'Роли организации',
    org_permissions: 'Права организации',
    just_in_time_provisioning: 'Пакетная настройка по запросу',
  },
  support: {
    /** UNTRANSLATED */
    title: 'Support',
    community: 'Сообщество',
    customer_ticket: 'Техническая поддержка',
    premium: 'Премиум',
    email_ticket_support: 'Поддержка по электронной почте',
    soc2_report: 'Отчет SOC2',
    hipaa_or_baa_report: 'Отчет HIPAA/BAA',
  },
  developers_and_platform: {
    title: 'Разработчики и платформа',
    hooks: 'Webhooks',
    audit_logs_retention: 'Сохранение журналов аудита',
    jwt_claims: 'JWT утверждения',
    tenant_members: 'Члены арендаторов',
  },
  unlimited: 'Неограниченно',
  contact: 'Связаться',
  monthly_price: '$ {{value, number}} /мес.',
  days_one: '{{count, number}} день',
  days_other: '{{count, number}} дней',
  add_on: 'Дополнительно',
  tier: 'Уровень {{value, number}}: ',

  million: '{{value, number}} миллионов',
  mau_tip:
    'MAU (месячно активные пользователи) означает количество уникальных пользователей, которые обменивались как минимум одним токеном с Logto в биллинговом цикле.',
  tokens_tip:
    'Все виды токенов, выпущенных Logto, включая токены доступа, токены обновления и т. д.',
  mao_tip:
    'MAO (ежемесячно активная организация) означает количество уникальных организаций, у которых есть хотя бы один MAU (ежемесячно активный пользователь) в биллинговом цикле.',
  third_party_tip:
    'Используйте Logto в качестве поставщика идентификации OIDC для входа в сторонние приложения и предоставления разрешений.',
  included: 'включено {{value, number}}',
  included_mao: '{{value, number}} MAO включено',
  extra_quota_price: 'Затем $ {{value, number}} в месяц / за каждый после',
  per_month_each: '$ {{value, number}} в месяц / за каждый',
  extra_mao_price: 'Затем $ {{value, number}} за MAO',
  per_month: '$ {{value, number}} в месяц',
  per_member: 'Затем $ {{value, number}} за участника',
};

export default Object.freeze(quota_table);
