const application_details = {
  page_title: 'Детали приложения',
  back_to_applications: 'Вернуться к приложениям',
  check_guide: 'Проверить гид',
  settings: 'Настройки',
  settings_description:
    'Приложения используются для идентификации ваших приложений в Logto для OIDC, опыта входа, аудита и т. Д.',
  /** UNTRANSLATED */
  advanced_settings: 'Advanced settings',
  advanced_settings_description:
    'Расширенные настройки включают связанные с OIDC термины. Вы можете проверить конечную точку токена для получения дополнительной информации.',
  /** UNTRANSLATED */
  application_roles: 'Roles',
  /** UNTRANSLATED */
  machine_logs: 'Machine logs',
  application_name: 'Название приложения',
  application_name_placeholder: 'Мое приложение',
  description: 'Описание',
  description_placeholder: 'Введите описание своего приложения',
  config_endpoint: 'Конечная точка конфигурации OpenID Provider',
  authorization_endpoint: 'Конечная точка авторизации',
  authorization_endpoint_tip:
    'Конечная точка для аутентификации и авторизации. Он используется для аутентификации <a> OpenID Connect </a>.',
  logto_endpoint: 'Logto endpoint',
  application_id: 'ID приложения',
  application_id_tip:
    'Уникальный идентификатор приложения, обычно генерируемый Logto. Он также означает «<a> client_id </a>» в OpenID Connect.',
  application_secret: 'Секрет приложения',
  redirect_uri: 'URI перенаправления',
  redirect_uris: 'URI перенаправления',
  redirect_uri_placeholder: 'https://ваш.вебсайт.com/приложение',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'URI перенаправляется после входа пользователя (успешного или нет). См. OpenID Connect <a> AuthRequest </a> для получения дополнительной информации.',
  post_sign_out_redirect_uri: 'URI перенаправления после выхода из системы',
  post_sign_out_redirect_uris: 'URI перенаправления после выхода из системы',
  post_sign_out_redirect_uri_placeholder: 'https://ваш.вебсайт.com/домашняя страница',
  post_sign_out_redirect_uri_tip:
    'URI перенаправляется после выхода пользователя (необязательно). Это может не иметь практического эффекта в некоторых типах приложений.',
  cors_allowed_origins: 'Разрешенные источники CORS',
  cors_allowed_origins_placeholder: 'https://ваш.вебсайт.com',
  cors_allowed_origins_tip:
    'По умолчанию разрешены все источники URI перенаправления. Обычно для этого поля не требуется никаких действий. См. <a> Документацию MDN </a> для получения подробной информации.',
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
  roles: {
    /** UNTRANSLATED */
    name_column: 'Role',
    /** UNTRANSLATED */
    description_column: 'Description',
    /** UNTRANSLATED */
    assign_button: 'Assign Roles',
    /** UNTRANSLATED */
    delete_description:
      'This action will remove this role from this machine-to-machine app. The role itself will still exist, but it will no longer be associated with this machine-to-machine app.',
    /** UNTRANSLATED */
    deleted: '{{name}} was successfully removed from this user.',
    /** UNTRANSLATED */
    assign_title: 'Assign roles to {{name}}',
    /** UNTRANSLATED */
    assign_subtitle: 'Authorize {{name}} one or more roles',
    /** UNTRANSLATED */
    assign_role_field: 'Assign roles',
    /** UNTRANSLATED */
    role_search_placeholder: 'Search by role name',
    /** UNTRANSLATED */
    added_text: '{{value, number}} added',
    /** UNTRANSLATED */
    assigned_user_count: '{{value, number}} users',
    /** UNTRANSLATED */
    confirm_assign: 'Assign roles',
    /** UNTRANSLATED */
    role_assigned: 'Successfully assigned role(s)',
    /** UNTRANSLATED */
    search: 'Search by role name, description or ID',
    /** UNTRANSLATED */
    empty: 'No role available',
  },
};

export default Object.freeze(application_details);
