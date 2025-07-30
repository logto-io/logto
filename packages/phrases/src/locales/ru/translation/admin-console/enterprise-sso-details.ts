const enterprise_sso_details = {
  back_to_sso_connectors: 'Вернуться к единой системе аутентификации предприятия',
  page_title: 'Подробности коннектора единой системы аутентификации предприятия',
  readme_drawer_title: 'Единая система аутентификации предприятия',
  readme_drawer_subtitle:
    'Настройте коннекторы единой системы аутентификации предприятия для включения единого входа пользователей',
  tab_experience: 'Опыт единого входа',
  tab_connection: 'Подключение',
  tab_idp_initiated_auth: 'SSO, инициированное IdP',
  general_settings_title: 'Общие настройки',
  general_settings_description:
    'Настройте пользовательский интерфейс и привяжите домен электронной почты предприятия для потока SSO, инициированного SP.',
  custom_branding_title: 'Отображение',
  custom_branding_description:
    'Настройте имя и логотип, отображаемые в потоке единого входа для конечных пользователей. При пустом значении используются значения по умолчанию.',
  email_domain_field_name: 'Домен электронной почты предприятия',
  email_domain_field_description:
    'Пользователи с этим доменом электронной почты могут использовать единую систему аутентификации для аутентификации. Пожалуйста, убедитесь, что домен принадлежит предприятию.',
  email_domain_field_placeholder: 'Домен электронной почты',
  sync_profile_field_name: 'Синхронизация профиля информации из поставщика идентичности',
  sync_profile_option: {
    register_only: 'Синхронизировать только при первом входе',
    each_sign_in: 'Всегда синхронизировать при каждом входе',
  },
  connector_name_field_name: 'Имя коннектора',
  display_name_field_name: 'Отображаемое имя',
  connector_logo_field_name: 'Отображаемый логотип',
  connector_logo_field_description:
    'Каждое изображение должно быть не более 500KB в форматах SVG, PNG, JPG, JPEG.',
  branding_logo_context: 'Загрузить логотип',
  branding_logo_error: 'Ошибка загрузки логотипа: {{error}}',
  branding_light_logo_context: 'Загрузить логотип в светлом режиме',
  branding_light_logo_error: 'Ошибка загрузки логотипа в светлом режиме: {{error}}',
  branding_logo_field_name: 'Логотип',
  branding_logo_field_placeholder: 'https://ваш.домен/логотип.png',
  branding_dark_logo_context: 'Загрузить логотип в темном режиме',
  branding_dark_logo_error: 'Ошибка загрузки логотипа в темном режиме: {{error}}',
  branding_dark_logo_field_name: 'Логотип (темный режим)',
  branding_dark_logo_field_placeholder: 'https://ваш.домен/логотип-темного-режима.png',
  check_connection_guide: 'Руководство по подключению',
  enterprise_sso_deleted: 'Коннектор единой системы аутентификации предприятия успешно удален',
  delete_confirm_modal_title: 'Удалить коннектор единой системы аутентификации предприятия',
  delete_confirm_modal_content:
    'Вы уверены, что хотите удалить этот коннектор предприятия? Пользователи от поставщиков идентичности не будут использовать единую систему аутентификации.',
  upload_idp_metadata_title_saml: 'Загрузить метаданные',
  upload_idp_metadata_description_saml:
    'Настройте метаданные, скопированные из поставщика идентичности.',
  upload_idp_metadata_title_oidc: 'Загрузить учетные данные',
  upload_idp_metadata_description_oidc:
    'Настройте учетные данные и информацию об OIDC-токене, скопированные из поставщика идентичности.',
  upload_idp_metadata_button_text: 'Загрузить файл метаданных XML',
  upload_signing_certificate_button_text: 'Загрузить файл сертификата подписи',
  configure_domain_field_info_text:
    'Добавьте домен электронной почты, чтобы направить предприятия запросы к поставщику идентичности для единого входа.',
  email_domain_field_required:
    'Требуется домен электронной почты для включения единой системы аутентификации предприятия.',
  upload_saml_idp_metadata_info_text_url:
    'Вставьте URL метаданных от поставщика идентичности для подключения.',
  upload_saml_idp_metadata_info_text_xml:
    'Вставьте метаданные от поставщика идентичности для подключения.',
  upload_saml_idp_metadata_info_text_manual:
    'Заполните метаданные от поставщика идентичности для подключения.',
  upload_oidc_idp_info_text: 'Заполните информацию от поставщика идентичности для подключения.',
  service_provider_property_title: 'Настройка в поставщике идентичности',
  service_provider_property_description:
    'Настройте интеграцию приложения, используя {{protocol}} в вашем поставщике идентичности. Введите детали, предоставленные Logto.',
  attribute_mapping_title: 'Отображение атрибутов',
  attribute_mapping_description:
    'Синхронизация профилей пользователей из поставщика идентичности путем настройки отображения атрибутов пользователя либо на стороне поставщика идентичности, либо на стороне Logto.',
  saml_preview: {
    sign_on_url: 'URL входа',
    entity_id: 'Издатель',
    x509_certificate: 'Сертификат подписи',
    certificate_content: 'Истекает {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: 'Конечная точка авторизации',
    token_endpoint: 'Конечная точка токена',
    userinfo_endpoint: 'Конечная точка информации о пользователе',
    jwks_uri: 'Конечная точка набора ключей JSON Web',
    issuer: 'Издатель',
  },
  idp_initiated_auth_config: {
    card_title: 'SSO, инициированное IdP',
    card_description:
      'Пользователь обычно начинает процесс аутентификации из вашего приложения, используя поток SSO, инициированный SP. НЕ включайте эту функцию, если это не абсолютно необходимо.',
    enable_idp_initiated_sso: 'Включить SSO, инициированное IdP',
    enable_idp_initiated_sso_description:
      'Разрешить пользователям предприятия начинать процесс аутентификации непосредственно с портала поставщика идентичности. Пожалуйста, разберитесь с потенциальными рисками безопасности перед включением этой функции.',
    default_application: 'Приложение по умолчанию',
    default_application_tooltip:
      'Целевое приложение, на которое пользователь будет перенаправлен после аутентификации.',
    empty_applications_error:
      'Приложения не найдены. Пожалуйста, добавьте одно в разделе <a>Приложения</a>.',
    empty_applications_placeholder: 'Нет приложений',
    authentication_type: 'Тип аутентификации',
    auto_authentication_disabled_title: 'Перенаправить на клиента для SP-инициированного SSO',
    auto_authentication_disabled_description:
      'Рекомендуется. Перенаправляйте пользователей на клиентское приложение, чтобы инициировать безопасную SP-инициированную OIDC-аутентификацию. Это предотвратит атаки CSRF.',
    auto_authentication_enabled_title: 'Войти непосредственно с помощью SSO, инициированного IdP',
    auto_authentication_enabled_description:
      'После успешного входа пользователи будут перенаправлены на указанный URI перенаправления с авторизационным кодом (без валидации state и PKCE).',
    auto_authentication_disabled_app:
      'Для традиционного веб-приложения, одностраничного приложения (SPA)',
    auto_authentication_enabled_app: 'Для традиционного веб-приложения',
    idp_initiated_auth_callback_uri: 'URI обратного вызова клиента',
    idp_initiated_auth_callback_uri_tooltip:
      'URI обратного вызова клиента для инициации потока аутентификации SSO, инициированного SP. Параметр ssoConnectorId будет добавлен к URI в виде параметра запроса. (например, https://ваш.домен/sso/callback?connectorId={{ssoConnectorId}})',
    redirect_uri: 'URI перенаправления после входа',
    redirect_uri_tooltip:
      'URI перенаправления для перенаправления пользователей после успешного входа. Logto будет использовать этот URI в качестве OIDC URI перенаправления в запросе авторизации. Используйте выделенный URI для потока аутентификации SSO, инициированного IdP, для повышения безопасности.',
    empty_redirect_uris_error:
      'Для приложения не зарегистрировано URI перенаправления. Пожалуйста, добавьте один.',
    redirect_uri_placeholder: 'Выберите URI перенаправления после входа',
    auth_params: 'Дополнительные параметры аутентификации',
    auth_params_tooltip:
      'Дополнительные параметры, передаваемые в запросе авторизации. По умолчанию будут запрошены только области (openid profile), здесь можно указать дополнительные области или эксклюзивное значение state. (например, { "scope": "organizations email", "state": "secret_state" }).',
  },
  trust_unverified_email: 'Доверять непроверенным адресам электронной почты',
  trust_unverified_email_label:
    'Всегда доверять непроверенным адресам электронной почты, возвращаемым от поставщика идентичности',
  trust_unverified_email_tip:
    'Коннектор Entra ID (OIDC) не возвращает утверждение `email_verified`, что означает, что адреса электронной почты из Azure не гарантированно проверены. По умолчанию Logto не будет синхронизировать неподтвержденные адреса электронной почты с профилем пользователя. Включайте эту опцию только если вы доверяете всем адресам электронной почты из директории Entra ID.',
  offline_access: {
    label: 'Обновить токен доступа',
    description:
      'Включите `offline` доступ Google для запроса обновляющего токена, позволяя вашему приложению обновлять токен доступа без повторной авторизации пользователя.',
  },
};

export default Object.freeze(enterprise_sso_details);
