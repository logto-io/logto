const api_resources = {
  page_title: 'Ресурсы API',
  title: 'Ресурсы API',
  subtitle: 'Определите API, которые могут использовать ваши авторизованные приложения',
  create: 'Создать ресурс API',
  api_name: 'Название API',
  api_name_placeholder: 'Введите название вашего API',
  api_identifier: 'Идентификатор API',
  api_identifier_tip:
    'Уникальный идентификатор для ресурса API. Он должен быть абсолютным URI и не иметь фрагмента (#). Равен параметру <a>resource</a> в OAuth 2.0.',
  default_api: 'Default API', // UNTRANSLATED
  default_api_label:
    'If the current API Resource is set as the default API for the tenant, while each tenant can have either 0 or 1 default API. When a default API is designated, the resource parameter can be omitted in the auth request. Subsequent token exchanges will use that API as the audience by default, resulting in the issuance of JWTs.', // UNTRANSLATED
  api_resource_created: 'Ресурс API {{name}} был успешно создан',
  api_identifier_placeholder: 'https://your-api-identifier/',
};

export default api_resources;
