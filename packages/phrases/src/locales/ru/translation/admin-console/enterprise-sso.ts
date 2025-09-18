const enterprise_sso = {
  page_title: 'Единый вход в предприятие',
  title: 'Единый вход в предприятие',
  subtitle: 'Подключите корпоративного поставщика удостоверений и включите единый вход.',
  create: 'Добавить предприятий коннектор',
  col_connector_name: 'Имя коннектора',
  col_type: 'Тип',
  col_email_domain: 'Домен электронной почты',
  placeholder_title: 'Коннектор предприятия',
  placeholder_description:
    'Logto предоставляет множество встроенных поставщиков идентичности предприятия для подключения, в то же время вы можете создать собственного поставщика с использованием протоколов SAML и OIDC.',
  create_modal: {
    title: 'Добавить коннектор предприятия',
    text_divider: 'Или вы можете настроить свой коннектор по стандартному протоколу.',
    connector_name_field_title: 'Имя коннектора',
    connector_name_field_placeholder: 'Например, {corp. name} - {identity provider name}',
    create_button_text: 'Создать коннектор',
  },
  guide: {
    subtitle: 'Пошаговое руководство по подключению поставщика идентичности предприятия.',
    finish_button_text: 'Продолжить',
  },
  basic_info: {
    title: 'Настройка вашего сервиса в IdP',
    description:
      'Создайте новую интеграцию приложения с помощью SAML 2.0 в вашем провайдере идентичности {{name}}. Затем вставьте следующее значение в него.',
    saml: {
      acs_url_field_name: 'URL потребителя утверждений (URL ответа)',
      audience_uri_field_name: 'URI аудитории (идентификатор сущности SP)',
      entity_id_field_name: 'Идентификатор сущности поставщика услуг (SP)',
      entity_id_field_tooltip:
        'Идентификатор сущности SP может иметь любую строку, обычно используемая форма URI или URL как идентификатор, но это не обязательно.',
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: 'URI перенаправления (URL обратного вызова)',
      redirect_uri_field_description:
        'URI перенаправления — это адрес, куда пользователи попадают после SSO-аутентификации. Добавьте этот URI в конфигурацию вашего IdP.',
      redirect_uri_field_custom_domain_description:
        'Если вы используете в Logto несколько <a>пользовательских доменов</a>, обязательно добавьте все соответствующие URI обратного вызова в IdP, чтобы SSO работал на каждом домене.\n\nДомен Logto по умолчанию (*.logto.app) всегда действителен — включайте его только если хотите поддерживать SSO и на этом домене.',
    },
  },
  attribute_mapping: {
    title: 'Сопоставление атрибутов',
    description:
      '`id` и `email` обязательны для синхронизации профиля пользователя из IdP. Введите следующее имя и значение утверждения в своем IdP.',
    col_sp_claims: 'Значение поставщика услуг (Logto)',
    col_idp_claims: 'Имя утверждения поставщика идентичности',
    idp_claim_tooltip: 'Имя утверждения поставщика идентичности',
  },
  metadata: {
    title: 'Настройка метаданных IdP',
    description: 'Настройте метаданные от провайдера идентичности',
    dropdown_trigger_text: 'Использовать другой метод конфигурации',
    dropdown_title: 'выберите метод конфигурации',
    metadata_format_url: 'Введите URL метаданных',
    metadata_format_xml: 'Загрузить файл метаданных XML',
    metadata_format_manual: 'Ввести детали метаданных вручную',
    saml: {
      metadata_url_field_name: 'URL метаданных',
      metadata_url_description:
        'Динамически извлекать данные из URL метаданных и поддерживать сертификат в актуальном состоянии.',
      metadata_xml_field_name: 'Файл метаданных IdP',
      metadata_xml_uploader_text: 'Загрузить файл метаданных XML',
      sign_in_endpoint_field_name: 'URL входа',
      idp_entity_id_field_name: 'IdP идентификатор сущности (Издатель)',
      certificate_field_name: 'Сертификат подписи',
      certificate_placeholder: 'Скопируйте и вставьте сертификат x509',
      certificate_required: 'Сертификат подписи обязателен.',
    },
    oidc: {
      client_id_field_name: 'Идентификатор клиента',
      client_secret_field_name: 'Секрет клиента',
      issuer_field_name: 'Издатель',
      scope_field_name: 'Область',
      scope_field_placeholder: 'Введите области (разделенные пробелом)',
    },
  },
};

export default Object.freeze(enterprise_sso);
