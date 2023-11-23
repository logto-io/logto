const enterprise_sso_details = {
  back_to_sso_connectors: 'Вернуться к единому входу в систему предприятия',
  page_title: 'Детали коннектора единого входа в систему предприятия',
  readme_drawer_title: 'Единый вход в систему предприятия',
  readme_drawer_subtitle:
    'Настройте коннекторы единого входа в систему предприятия для включения единого входа для конечных пользователей',
  tab_settings: 'Настройки',
  tab_connection: 'Соединение',
  general_settings_title: 'Общие настройки',
  custom_branding_title: 'Настраиваемый брендинг',
  custom_branding_description:
    'Настройте отображение информации о предприятии для кнопки входа и других сценариев.',
  email_domain_field_name: 'Домен электронной почты предприятия',
  email_domain_field_description:
    'Пользователи с этим доменом электронной почты могут использовать единый вход для аутентификации. Пожалуйста, убедитесь, что домен принадлежит предприятию.',
  email_domain_field_placeholder: 'Домен электронной почты',
  sync_profile_field_name: 'Синхронизировать информацию профиля с поставщиком идентификации',
  sync_profile_option: {
    register_only: 'Синхронизировать только при первом входе',
    each_sign_in: 'Всегда синхронизировать при каждом входе',
  },
  connector_name_field_name: 'Имя коннектора',
  connector_logo_field_name: 'Логотип коннектора',
  branding_logo_context: 'Загрузить логотип',
  branding_logo_error: 'Ошибка загрузки логотипа: {{error}}',
  branding_logo_field_name: 'Логотип',
  branding_logo_field_placeholder: 'https://ваш.домен/логотип.png',
  branding_dark_logo_context: 'Загрузить логотип для темного режима',
  branding_dark_logo_error: 'Ошибка загрузки логотипа для темного режима: {{error}}',
  branding_dark_logo_field_name: 'Логотип (темный режим)',
  branding_dark_logo_field_placeholder: 'https://ваш.домен/логотип-темного-режима.png',
  check_readme: 'Проверить README',
  enterprise_sso_deleted: 'Коннектор единого входа в систему предприятия был успешно удален',
  delete_confirm_modal_title: 'Удалить коннектор единого входа в систему предприятия',
  delete_confirm_modal_content:
    'Вы уверены, что хотите удалить этот коннектор предприятия? Пользователи от поставщиков идентификации не смогут использовать единый вход в систему.',
  upload_idp_metadata_title: 'Загрузить метаданные поставщика идентификации',
  upload_idp_metadata_description:
    'Настройте метаданные, скопированные с поставщика идентификации.',
  upload_saml_idp_metadata_info_text_url:
    'Вставьте URL метаданных с поставщика идентификации для подключения.',
  upload_saml_idp_metadata_info_text_xml:
    'Вставьте метаданные с поставщика идентификации для подключения.',
  upload_saml_idp_metadata_info_text_manual:
    'Заполните метаданные с поставщика идентификации для подключения.',
  upload_oidc_idp_info_text: 'Заполните информацию с поставщика идентификации для подключения.',
  service_provider_property_title: 'Настройте свою службу в поставщике идентификации',
  service_provider_property_description:
    'Создайте новую интеграцию приложения по протоколу {{protocol}} в своей {{name}}. Затем вставьте следующие данные Службы предприятия для настройки {{protocol}}.',
  attribute_mapping_title: 'Сопоставление атрибутов',
  attribute_mapping_description:
    'Для синхронизации профиля пользователя с поставщика идентификации требуются `id` и `email` пользователя. Введите следующее имя и значение в {{name}}.',
  saml_preview: {
    sign_on_url: 'URL входа',
    entity_id: 'Издатель',
    x509_certificate: 'Сертификат подписи',
  },
  oidc_preview: {
    authorization_endpoint: 'Конечная точка авторизации',
    token_endpoint: 'Конечная точка токена',
    userinfo_endpoint: 'Конечная точка информации о пользователе',
    jwks_uri: 'Конечная точка набора ключей JSON веб-токенов',
    issuer: 'Издатель',
  },
};

export default Object.freeze(enterprise_sso_details);
