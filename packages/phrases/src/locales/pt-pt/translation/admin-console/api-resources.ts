const api_resources = {
  page_title: 'Recursos API',
  title: 'Recursos API',
  subtitle: 'Defina APIs que pode consumir nos aplicações autorizadas',
  create: 'Criar recurso API',
  api_name: 'Nome da API',
  api_name_placeholder: 'Introduza o nome da sua API',
  api_identifier: 'identificador da API',
  api_identifier_tip:
    'O identificador exclusivo para o recurso API. Deve ser um URI absoluto e não tem componente de fragmento (#). Igual ao <a>resource parameter</a> no OAuth 2.0.',
  default_api: 'Default API', // UNTRANSLATED
  default_api_label:
    'If the current API Resource is set as the default API for the tenant, while each tenant can have either 0 or 1 default API. When a default API is designated, the resource parameter can be omitted in the auth request. Subsequent token exchanges will use that API as the audience by default, resulting in the issuance of JWTs.', // UNTRANSLATED
  api_resource_created: 'O recurso API {{name}} foi criado com sucesso',
  api_identifier_placeholder: 'https://your-api-identifier/',
};

export default api_resources;
