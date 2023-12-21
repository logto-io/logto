const enterprise_sso_details = {
  back_to_sso_connectors: 'Вернуться к единой системе аутентификации предприятия',
  page_title: 'Подробности коннектора единой системы аутентификации предприятия',
  readme_drawer_title: 'Единая система аутентификации предприятия',
  readme_drawer_subtitle:
    'Настройте коннекторы единой системы аутентификации предприятия для включения единого входа пользователей',
  tab_experience: 'Опыт единого входа',
  tab_connection: 'Подключение',
  general_settings_title: 'Общие настройки',
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
    'Добавьте домен электронной почты, чтобы направить предприятийзапросы к поставщику идентичности для единого входа.',
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
};

export default Object.freeze(enterprise_sso_details);
