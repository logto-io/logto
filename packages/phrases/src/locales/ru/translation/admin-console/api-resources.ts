const api_resources = {
  page_title: 'Ресурсы API',
  title: 'Ресурсы API',
  subtitle: 'Определите API, которые могут использовать ваши авторизованные приложения',
  create: 'Создать ресурс API',
  api_name: 'Название API',
  api_name_placeholder: 'Введите название вашего API',
  api_identifier: 'Идентификатор API',
  api_identifier_placeholder: 'https://your-api-identifier/',
  api_identifier_tip:
    'Уникальный идентификатор для ресурса API. Он должен быть абсолютным URI и не иметь фрагмента (#). Равен параметру <a>resource</a> в OAuth 2.0.',
  default_api: 'API по умолчанию',
  default_api_label:
    'В каждом арендаторе может быть только один API по умолчанию. Когда устанавливается API по умолчанию, можно опустить параметр <a>resource</a> в запросе на аутентификацию. Последующие запросы на обмен токенами будут использовать указанное API в качестве аудитории по умолчанию, что приведет к выдаче JWT. <a>Узнать больше</a>',
  api_resource_created: 'Ресурс API {{name}} был успешно создан',
  invalid_resource_indicator_format: 'Формат индикатора API должен быть допустимым абсолютным URI.',
};

export default Object.freeze(api_resources);
