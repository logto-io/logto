const application_details = {
  page_title: 'Детали приложения',
  back_to_applications: 'Вернуться к приложениям',
  check_guide: 'Проверить гид',
  settings: 'Настройки',
  settings_description:
    '«Приложение» — это зарегистрированное программное обеспечение или сервис, которое может получать доступ к информации пользователя либо действовать от его имени. Приложения помогают узнавать, кто запрашивает какие данные у Logto и обрабатывать вход и разрешения. Заполните необходимые поля для аутентификации.',
  integration: 'Интеграция',
  integration_description:
    'Развертывайте защищенные рабочие процессы Logto, работающие на сети реберного узла Cloudflare, для обеспечения высочайшей производительности и нулевого времени запуска в любой точке мира.',
  service_configuration: 'Конфигурация службы',
  service_configuration_description: 'Завершите необходимые настройки в своем сервисе.',
  session: 'Сессия',
  endpoints_and_credentials: 'Конечные точки и учетные данные',
  endpoints_and_credentials_description:
    'Используйте следующие конечные точки и учетные данные для настройки соединения OIDC в своем приложении.',
  refresh_token_settings: 'Обновить токен',
  refresh_token_settings_description:
    'Управляйте правилами обновления токенов для этого приложения.',
  application_roles: 'Роли',
  machine_logs: 'Машинные журналы',
  application_name: 'Название приложения',
  application_name_placeholder: 'Мое приложение',
  description: 'Описание',
  description_placeholder: 'Введите описание своего приложения',
  config_endpoint: 'Конечная точка конфигурации OpenID Provider',
  authorization_endpoint: 'Конечная точка авторизации',
  authorization_endpoint_tip:
    'Конечная точка для аутентификации и авторизации. Он используется для аутентификации <a>OpenID Connect</a>.',
  show_endpoint_details: 'Показать подробности конечной точки',
  hide_endpoint_details: 'Скрыть подробности конечной точки',
  logto_endpoint: 'Конечная точка Logto',
  application_id: 'ID приложения',
  application_id_tip:
    'Уникальный идентификатор приложения, обычно генерируемый Logto. Он также означает «<a>client_id</a>» в OpenID Connect.',
  application_secret: 'Секрет приложения',
  redirect_uri: 'URI перенаправления',
  redirect_uris: 'URI перенаправления',
  redirect_uri_placeholder: 'https://ваш.вебсайт.com/приложение',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'URI перенаправляется после входа пользователя (успешного или нет). См. OpenID Connect <a>AuthRequest</a> для получения дополнительной информации.',
  post_sign_out_redirect_uri: 'URI перенаправления после выхода из системы',
  post_sign_out_redirect_uris: 'URI перенаправления после выхода из системы',
  post_sign_out_redirect_uri_placeholder: 'https://ваш.вебсайт.com/домашняя страница',
  post_sign_out_redirect_uri_tip:
    'URI перенаправляется после выхода пользователя (необязательно). Это может не иметь практического эффекта в некоторых типах приложений.',
  cors_allowed_origins: 'Разрешенные источники CORS',
  cors_allowed_origins_placeholder: 'https://ваш.вебсайт.com',
  cors_allowed_origins_tip:
    'По умолчанию разрешены все источники URI перенаправления. Обычно для этого поля не требуется никаких действий. См. <a>Документацию MDN</a> для получения подробной информации.',
  token_endpoint: 'Конечная точка токена',
  user_info_endpoint: 'Конечная точка информации о пользователе',
  enable_admin_access: 'Включить доступ администратора',
  enable_admin_access_label:
    'Включить или отключить доступ к API управления. После включения вы можете использовать токены доступа для вызова API управления от имени этого приложения.',
  always_issue_refresh_token: 'Всегда выдавать Refresh Token',
  always_issue_refresh_token_label:
    'Включение этой настройки позволит Logto всегда выдавать Refresh Tokens, независимо от того, была ли в запросе на аутентификацию предложена команда `prompt=consent`. Однако данная практика не рекомендуется, если это необходимо, поскольку она несовместима с OpenID Connect и может вызвать проблемы.',
  refresh_token_ttl: 'Time to Live (TTL) Refresh Token в днях',
  refresh_token_ttl_tip:
    'Продолжительность, на протяжении которой Refresh Token может использоваться для запроса новых токенов доступа, прежде чем он истечет и станет недействительным. Запросы токенов будут продлевать TTL Refresh Token до этого значения.',
  rotate_refresh_token: 'Поворот Refresh Token',
  rotate_refresh_token_label:
    'При включении Logto будет выдавать новый Refresh Token для запросов токенов, когда пройдет 70% изначального Time to Live (TTL) или будут выполнены определенные условия. <a>Узнать больше</a>',
  delete_description:
    'Это действие нельзя отменить. Оно навсегда удалит приложение. Введите название приложения <span> {{name}} </span>, чтобы подтвердить.',
  enter_your_application_name: 'Введите название своего приложения',
  application_deleted: 'Приложение {{name}} успешно удалено',
  redirect_uri_required: 'Вы должны ввести по крайней мере один URI перенаправления',
  app_domain_description_1:
    'Не стесняйтесь использовать ваш домен с {{domain}}, под управлением Logto, который имеет постоянную действительность.',
  app_domain_description_2:
    'Смело используйте ваш домен <domain>{{domain}}</domain>, который имеет постоянную действительность.',
  custom_rules: 'Пользовательские правила аутентификации',
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  custom_rules_description:
    'Установите правила с использованием регулярных выражений для требуемых маршрутов, требующих аутентификации. По умолчанию: защита всего сайта, если оставить пустым.',
  authentication_routes: 'Маршруты аутентификации',
  custom_rules_tip:
    "Вот два варианта сценариев:<ol><li>Для защиты только маршрутов '/admin' и '/privacy' аутентификацией: ^/(admin|privacy)/.*</li><li>Для исключения из аутентификации изображений JPG: ^(?!.*\\.jpg$).*$</li></ol>",
  authentication_routes_description:
    'Перенаправьте вашу кнопку аутентификации, используя указанные маршруты. Примечание: Эти маршруты незаменяемы.',
  protect_origin_server: 'Защита вашего исходного сервера',
  protect_origin_server_description:
    'Обеспечьте защиту вашего исходного сервера от прямого доступа. Обратитесь к руководству для получения более <a>подробных инструкций</a>.',
  session_duration: 'Продолжительность сеанса (дни)',
  try_it: 'Попробуйте',
  branding: {
    name: 'Брендинг',
    description: 'Настройте отображаемое имя и логотип вашего приложения на экране согласия.',
    more_info: 'Дополнительная информация',
    more_info_description:
      'Предлагайте пользователям больше информации о вашем приложении на экране согласия.',
    display_name: 'Отображаемое имя',
    display_logo: 'Отображаемый логотип',
    display_logo_dark: 'Отображаемый логотип (темный)',
    terms_of_use_url: 'URL условий использования приложения',
    privacy_policy_url: 'URL политики конфиденциальности приложения',
  },
  permissions: {
    name: 'Разрешения',
    description:
      'Выберите разрешения, которые требуются стороннему приложению для получения авторизации пользователя на доступ к определенным типам данных.',
    user_permissions: 'Персональные данные пользователя',
    organization_permissions: 'Доступ организации',
    table_name: 'Предоставление разрешений',
    field_name: 'Разрешение',
    field_description: 'Отображается на экране согласия',
    delete_text: 'Удалить разрешение',
    permission_delete_confirm:
      'Это действие отозвет предоставленные разрешения стороннему приложению, препятствуя запросу пользователя на авторизацию к определенным типам данных. Вы уверены, что хотите продолжить?',
    permissions_assignment_description:
      'Выберите разрешения, которые стороннее приложение запрашивает для авторизации пользователя к определенным типам данных.',
    user_profile: 'Данные пользователя',
    api_permissions: 'API-разрешения',
    organization: 'Разрешения организации',
    user_permissions_assignment_form_title: 'Добавить разрешения на профиль пользователя',
    organization_permissions_assignment_form_title: 'Добавить разрешения на организацию',
    api_resource_permissions_assignment_form_title: 'Добавить разрешения на ресурс API',
    user_data_permission_description_tips:
      'Вы можете изменить описание персональных данных пользователя через "Опыт входа -> Содержание -> Управление языком".',
    permission_description_tips:
      'Когда Logto используется в качестве поставщика идентификации (IdP) для аутентификации в сторонних приложениях, и пользователи запрашивают авторизацию, данное описание отображается на экране согласия.',
    user_title: 'Пользователь',
    user_description:
      'Выберите разрешения, запрошенные сторонним приложением для доступа к определенным данным пользователя.',
    grant_user_level_permissions: 'Предоставить разрешения на данные пользователя',
    organization_title: 'Организация',
    organization_description:
      'Выберите разрешения, которые запрашиваются сторонним приложением для доступа к определенным данным организации.',
    grant_organization_level_permissions: 'Предоставить разрешения на данные организации',
  },
  roles: {
    name_column: 'Роль',
    description_column: 'Описание',
    assign_button: 'Назначить роли',
    delete_description:
      'Это действие удалит эту роль из этого приложения. Сама роль останется, но больше не будет связана с этим приложением.',
    deleted: '{{name}} успешно удалено у этого пользователя.',
    assign_title: 'Назначить роли для {{name}}',
    assign_subtitle: 'Авторизовать {{name}} одну или несколько ролей',
    assign_role_field: 'Назначить роли',
    role_search_placeholder: 'Поиск по названию роли',
    added_text: '{{value, number}} добавлено',
    assigned_app_count: '{{value, number}} приложений',
    confirm_assign: 'Назначить роли',
    role_assigned: 'Роль(и) успешно назначены',
    search: 'Поиск по названию роли, описанию или ID',
    empty: 'Нет доступных ролей',
  },
};

export default Object.freeze(application_details);
