const enterprise_sso = {
  page_title: 'Единый вход в предприятие',
  title: 'Единый вход в предприятие',
  subtitle:
    'Подключите поставщика идентификации предприятия и включите одностороннюю аутентификацию с инициацией службы.',
  create: 'Добавить предприятий коннектор',
  col_connector_name: 'Имя коннектора',
  col_type: 'Тип',
  col_email_domain: 'Домен электронной почты',
  col_status: 'Статус',
  col_status_in_use: 'Используется',
  col_status_invalid: 'Недопустимый',
  placeholder_title: 'Коннектор предприятия',
  placeholder_description:
    'Logto предоставил множество встроенных поставщиков идентификации предприятия для подключения, тем временем вы можете создать своего с использованием стандартных протоколов.',
  create_modal: {
    title: 'Добавить коннектор предприятия',
    text_divider: 'Или вы можете настроить свой коннектор по стандартному протоколу.',
    connector_name_field_title: 'Имя коннектора',
    connector_name_field_placeholder: 'Имя для поставщика идентификации предприятия',
    create_button_text: 'Создать коннектор',
  },
  guide: {
    subtitle: 'Пошаговое руководство по подключению поставщика идентификации предприятия.',
    finish_button_text: 'Продолжить',
  },
  basic_info: {
    title: 'Настройка вашего сервиса в IdP',
    description:
      'Создайте новую интеграцию приложения с помощью SAML 2.0 в вашем провайдере идентификации {{name}}. Затем вставьте следующее значение в него.',
    saml: {
      acs_url_field_name: 'URL службы потребителя утверждения (URL ответа)',
      audience_uri_field_name: 'URI аудитории (SP Entity ID)',
    },
    oidc: {
      redirect_uri_field_name: 'URL перенаправления (URL обратного вызова)',
    },
  },
  attribute_mapping: {
    title: 'Отображения атрибутов',
    description:
      '`id` и `email` обязательны для синхронизации профиля пользователя из IdP. Введите следующее имя и значение утверждения в вашем IdP.',
    col_sp_claims: 'Имя утверждения Logto',
    col_idp_claims: 'Имя утверждения провайдера идентификации',
    idp_claim_tooltip: 'Имя утверждения провайдера идентификации',
  },
  metadata: {
    title: 'Настройка метаданных IdP',
    description: 'Настройте метаданные от провайдера идентификации',
    dropdown_trigger_text: 'Использовать другой метод конфигурации',
    dropdown_title: 'выберите ваш метод конфигурации',
    metadata_format_url: 'Введите URL метаданных',
    metadata_format_xml: 'Загрузить файл метаданных XML',
    metadata_format_manual: 'Ввести детали метаданных вручную',
    saml: {
      metadata_url_field_name: 'URL метаданных',
      metadata_url_description:
        'Динамически извлекать данные из URL метаданных и поддерживать сертификат в актуальном состоянии.',
      metadata_xml_field_name: 'Файл метаданных XML',
      metadata_xml_uploader_text: 'Загрузить файл метаданных XML',
      sign_in_endpoint_field_name: 'URL входа',
      idp_entity_id_field_name: 'Идентификатор сущности IdP (Издатель)',
      certificate_field_name: 'Сертификат подписи',
      certificate_placeholder: 'Скопируйте и вставьте сертификат x509',
    },
    oidc: {
      client_id_field_name: 'Идентификатор клиента',
      client_secret_field_name: 'Секрет клиента',
      issuer_field_name: 'Издатель',
      scope_field_name: 'Текущий область применения',
    },
  },
};

export default Object.freeze(enterprise_sso);
