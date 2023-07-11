const quota_item = {
  tenant_limit: {
    name: 'Арендаторы',
    limited: '{{count, number}} арендатор',
    limited_other: '{{count, number}} арендаторы',
    unlimited: 'Неограниченное количество арендаторов',
  },
  mau_limit: {
    name: 'Ежемесячно активные пользователи',
    limited: '{{count, number}} MAU',
    unlimited: 'Неограниченное количество MAU',
  },
  applications_limit: {
    name: 'Приложения',
    limited: '{{count, number}} приложение',
    limited_other: '{{count, number}} приложения',
    unlimited: 'Неограниченное количество приложений',
  },
  machine_to_machine_limit: {
    name: 'Machine to machine',
    limited: '{{count, number}} приложение для machine to machine',
    limited_other: '{{count, number}} приложения для machine to machine',
    unlimited: 'Неограниченное количество приложений для machine to machine',
  },
  resources_limit: {
    name: 'API-ресурсы',
    limited: '{{count, number}} API-ресурс',
    limited_other: '{{count, number}} API-ресурсы',
    unlimited: 'Неограниченное количество API-ресурсов',
  },
  scopes_per_resource_limit: {
    name: 'Разрешения для ресурсов',
    limited: '{{count, number}} разрешение на ресурс',
    limited_other: '{{count, number}} разрешения на ресурс',
    unlimited: 'Неограниченное количество разрешений на ресурс',
  },
  custom_domain_enabled: {
    name: 'Пользовательский домен',
    limited: 'Пользовательский домен',
    unlimited: 'Пользовательский домен',
  },
  omni_sign_in_enabled: {
    name: 'Вход через множество систем',
    limited: 'Вход через множество систем',
    unlimited: 'Вход через множество систем',
  },
  built_in_email_connector_enabled: {
    name: 'Встроенный коннектор электронной почты',
    limited: 'Встроенный коннектор электронной почты',
    unlimited: 'Встроенный коннектор электронной почты',
  },
  social_connectors_limit: {
    name: 'Социальные коннекторы',
    limited: '{{count, number}} социальный коннектор',
    limited_other: '{{count, number}} социальные коннекторы',
    unlimited: 'Неограниченное количество социальных коннекторов',
  },
  standard_connectors_limit: {
    name: 'Бесплатные стандартные коннекторы',
    limited: '{{count, number}} бесплатный стандартный коннектор',
    limited_other: '{{count, number}} бесплатные стандартные коннекторы',
    unlimited: 'Неограниченное количество стандартных коннекторов',
  },
  roles_limit: {
    name: 'Роли',
    limited: '{{count, number}} роль',
    limited_other: '{{count, number}} роли',
    unlimited: 'Неограниченное количество ролей',
  },
  scopes_per_role_limit: {
    name: 'Разрешения на роли',
    limited: '{{count, number}} разрешение на роль',
    limited_other: '{{count, number}} разрешения на роль',
    unlimited: 'Неограниченное количество разрешений на роль',
  },
  hooks_limit: {
    name: 'Хуки',
    limited: '{{count, number}} хук',
    limited_other: '{{count, number}} хуки',
    unlimited: 'Неограниченное количество хуков',
  },
  audit_logs_retention_days: {
    name: 'Срок хранения журналов аудита',
    limited: 'Срок хранения журналов аудита: {{count, number}} день',
    limited_other: 'Срок хранения журналов аудита: {{count, number}} дня',
    unlimited: 'Неограниченное количество дней',
  },
  community_support_enabled: {
    name: 'Поддержка сообщества',
    limited: 'Поддержка сообщества',
    unlimited: 'Поддержка сообщества',
  },
  customer_ticket_support: {
    name: 'Техническая поддержка для клиентов',
    limited: '{{count, number}} часов технической поддержки для клиентов',
    limited_other: '{{count, number}} часов технической поддержки для клиентов',
    unlimited: 'Техническая поддержка для клиентов',
  },
};

export default quota_item;
