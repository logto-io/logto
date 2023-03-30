const application_details = {
  page_title: 'Детали приложения',
  back_to_applications: 'Вернуться к приложениям',
  check_guide: 'Проверить гид',
  settings: 'Настройки',
  settings_description:
    'Приложения используются для идентификации ваших приложений в Logto для OIDC, опыта входа, аудита и т. Д.',
  advanced_settings: 'Расширенные настройки',
  advanced_settings_description:
    'Расширенные настройки включают связанные с OIDC термины. Вы можете проверить конечную точку токена для получения дополнительной информации.',
  application_name: 'Название приложения',
  application_name_placeholder: 'Мое приложение',
  description: 'Описание',
  description_placeholder: 'Введите описание своего приложения',
  authorization_endpoint: 'Конечная точка авторизации',
  authorization_endpoint_tip:
    'Конечная точка для аутентификации и авторизации. Он используется для аутентификации <a> OpenID Connect </a>.',
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
  id_token_expiration: 'Истечение срока действия токена ID',
  refresh_token_expiration: 'Истечение срока действия обновления токена',
  token_endpoint: 'Конечная точка токена',
  user_info_endpoint: 'Конечная точка информации о пользователе',
  enable_admin_access: 'Включить доступ администратора',
  enable_admin_access_label:
    'Включить или отключить доступ к API управления. После включения вы можете использовать токены доступа для вызова API управления от имени этого приложения.',
  delete_description:
    'Это действие нельзя отменить. Оно навсегда удалит приложение. Введите название приложения <span> {{name}} </span>, чтобы подтвердить.',
  enter_your_application_name: 'Введите название своего приложения',
  application_deleted: 'Приложение {{name}} успешно удалено',
  redirect_uri_required: 'Вы должны ввести по крайней мере один URI перенаправления',
};

export default application_details;
