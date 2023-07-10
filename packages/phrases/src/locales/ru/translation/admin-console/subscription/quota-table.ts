const quota_table = {
  quota: {
    title: 'Квота',
    tenant_limit: 'Лимит арендатора',
    base_price: 'Базовая цена',
    mau_unit_price: '* Цена за MAU',
    mau_limit: 'Лимит MAU',
  },
  application: {
    title: 'Приложения',
    total: 'Всего',
    m2m: 'Машина к машине',
  },
  resource: {
    title: 'API ресурсы',
    resource_count: 'Количество ресурсов',
    scopes_per_resource: 'Разрешения на ресурс',
  },
  branding: {
    title: 'Брендинг',
    custom_domain: 'Пользовательский домен',
  },
  user_authn: {
    title: 'Аутентификация пользователя',
    omni_sign_in: 'Omni вход',
    built_in_email_connector: 'Встроенный электронный коннектор',
    social_connectors: 'Социальные коннекторы',
    standard_connectors: 'Стандартные коннекторы',
  },
  roles: {
    title: 'Роли',
    roles: 'Роли',
    scopes_per_role: 'Разрешения на роль',
  },
  audit_logs: {
    title: 'Аудит',
    retention: 'Хранение',
  },
  hooks: {
    title: 'Хуки',
    amount: 'Количество',
  },
  support: {
    title: 'Поддержка',
    community: 'Сообщество',
    customer_ticket: 'Техническая заявка',
    premium: 'Премиум',
  },
  mau_unit_price_footnote:
    '* Цены наших единиц могут изменяться в зависимости от фактически используемых ресурсов, и Logto оставляет за собой право объяснить любые изменения в ценах за единицу.',
  unlimited: 'Неограниченный',
  contact: 'Связаться с нами',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/месяц',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} день',
  days_other: '{{count, number}} дней',
  add_on: 'Дополнительный',
};

export default quota_table;
