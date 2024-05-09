const application_details = {
  page_title: 'Детали приложения',
  back_to_applications: 'Вернуться к приложениям',
  check_guide: 'Проверить гид',
  settings: 'Настройки',
  /** UNTRANSLATED */
  settings_description:
    'An "Application" is a registered software or service that can access user info or act for a user. Applications help recognize who’s asking for what from Logto and handle the sign-in and permission. Fill in the required fields for authentication.',
  /** UNTRANSLATED */
  integration: 'Integration',
  /** UNTRANSLATED */
  integration_description:
    "Deploy with Logto secure workers, powered by Cloudflare's edge network for top-tier performance and 0ms cold starts worldwide.",
  /** UNTRANSLATED */
  service_configuration: 'Service configuration',
  /** UNTRANSLATED */
  service_configuration_description: 'Complete the necessary configurations in your service.',
  /** UNTRANSLATED */
  session: 'Session',
  /** UNTRANSLATED */
  endpoints_and_credentials: 'Endpoints & Credentials',
  /** UNTRANSLATED */
  endpoints_and_credentials_description:
    'Use the following endpoints and credentials to set up the OIDC connection in your application.',
  /** UNTRANSLATED */
  refresh_token_settings: 'Refresh token',
  /** UNTRANSLATED */
  refresh_token_settings_description: 'Manage the refresh token rules for this application.',
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
  /** UNTRANSLATED */
  show_endpoint_details: 'Show endpoint details',
  /** UNTRANSLATED */
  hide_endpoint_details: 'Hide endpoint details',
  logto_endpoint: 'Logto endpoint',
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
  /** UNTRANSLATED */
  app_domain_description_1:
    'Feel free to use your domain with {{domain}} powered by Logto, which is permanently valid.',
  /** UNTRANSLATED */
  app_domain_description_2:
    'Feel free to utilize your domain <domain>{{domain}}</domain> which is permanently valid.',
  /** UNTRANSLATED */
  custom_rules: 'Custom authentication rules',
  /** UNTRANSLATED */
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  /** UNTRANSLATED */
  custom_rules_description:
    'Set rules with regular expressions for authentication-required routes. Default: full-site protection if left blank.',
  /** UNTRANSLATED */
  authentication_routes: 'Authentication routes',
  /** UNTRANSLATED */
  custom_rules_tip:
    "Here are two case scenarios:<ol><li>To only protect routes '/admin' and '/privacy' with authentication: ^/(admin|privacy)/.*</li><li>To exclude JPG images from authentication: ^(?!.*\\.jpg$).*$</li></ol>",
  /** UNTRANSLATED */
  authentication_routes_description:
    'Redirect your authentication button using the specified routes. Note: These routes are irreplaceable.',
  /** UNTRANSLATED */
  protect_origin_server: 'Protect your origin server',
  /** UNTRANSLATED */
  protect_origin_server_description:
    'Ensure to protect your origin server from direct access. Refer to the guide for more <a>detailed instructions</a>.',
  /** UNTRANSLATED */
  session_duration: 'Session duration (days)',
  /** UNTRANSLATED */
  try_it: 'Try it',
  branding: {
    /** UNTRANSLATED */
    name: 'Branding',
    /** UNTRANSLATED */
    description: "Customize your application's display name and logo on the consent screen.",
    /** UNTRANSLATED */
    more_info: 'More info',
    /** UNTRANSLATED */
    more_info_description: 'Offer users more details about your application on the consent screen.',
    /** UNTRANSLATED */
    display_name: 'Display name',
    /** UNTRANSLATED */
    display_logo: 'Display logo',
    /** UNTRANSLATED */
    display_logo_dark: 'Display logo (dark)',
    /** UNTRANSLATED */
    terms_of_use_url: 'Application terms of use URL',
    /** UNTRANSLATED */
    privacy_policy_url: 'Application privacy policy URL',
  },
  permissions: {
    /** UNTRANSLATED */
    name: 'Permissions',
    /** UNTRANSLATED */
    description:
      'Select the permissions that the third-party application requires for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_permissions: 'Personal user data',
    /** UNTRANSLATED */
    organization_permissions: 'Organization access',
    /** UNTRANSLATED */
    table_name: 'Grant permissions',
    /** UNTRANSLATED */
    field_name: 'Permission',
    /** UNTRANSLATED */
    field_description: 'Displayed in the consent screen',
    /** UNTRANSLATED */
    delete_text: 'Remove permission',
    /** UNTRANSLATED */
    permission_delete_confirm:
      'This action will withdraw the permissions granted to the third-party app, preventing it from requesting user authorization for specific data types. Are you sure you want to continue?',
    /** UNTRANSLATED */
    permissions_assignment_description:
      'Select the permissions the third-party application requests for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_profile: 'User data',
    /** UNTRANSLATED */
    api_permissions: 'API permissions',
    /** UNTRANSLATED */
    organization: 'Organization permissions',
    /** UNTRANSLATED */
    user_permissions_assignment_form_title: 'Add the user profile permissions',
    /** UNTRANSLATED */
    organization_permissions_assignment_form_title: 'Add the organization permissions',
    /** UNTRANSLATED */
    api_resource_permissions_assignment_form_title: 'Add the API resource permissions',
    /** UNTRANSLATED */
    user_data_permission_description_tips:
      'You can modify the description of the personal user data permissions via "Sign-in Experience > Content > Manage Language"',
    /** UNTRANSLATED */
    permission_description_tips:
      'When Logto is used as an Identity Provider (IdP) for authentication in third-party apps, and users are asked for authorization, this description appears on the consent screen.',
    /** UNTRANSLATED */
    user_title: 'User',
    /** UNTRANSLATED */
    user_description:
      'Select the permissions requested by the third-party app for accessing specific user data.',
    /** UNTRANSLATED */
    grant_user_level_permissions: 'Grant permissions of user data',
    /** UNTRANSLATED */
    organization_title: 'Organization',
    /** UNTRANSLATED */
    organization_description:
      'Select the permissions requested by the third-party app for accessing specific organization data.',
    /** UNTRANSLATED */
    grant_organization_level_permissions: 'Grant permissions of organization data',
    /** UNTRANSLATED */
    add_permissions_for_organization:
      'Add the API resource permissions used in the "Organization template"',
  },
  roles: {
    name_column: 'Роль',
    description_column: 'Описание',
    assign_button: 'Назначить роли',
    delete_description:
      'This action will remove this role from this machine-to-machine app. The role itself will still exist, but it will no longer be associated with this machine-to-machine app.',
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
