const api_resources = {
  page_title: 'Recursos de API',
  title: 'Recursos de API',
  subtitle: 'Define APIs que las aplicaciones autorizadas pueden utilizar',
  create: 'Crear recurso de API',
  api_name: 'Nombre de la API',
  api_name_placeholder: 'Ingrese el nombre de su API',
  api_identifier: 'Identificador de API',
  api_identifier_tip:
    'El identificador único para el recurso de API. Debe ser una URI absoluta y no tiene componente de fragmento (#). Es igual al <a>parámetro de recurso</a> en OAuth 2.0.',
  default_api: 'Default API', // UNTRANSLATED
  default_api_label:
    'If the current API Resource is set as the default API for the tenant, while each tenant can have either 0 or 1 default API. When a default API is designated, the resource parameter can be omitted in the auth request. Subsequent token exchanges will use that API as the audience by default, resulting in the issuance of JWTs.', // UNTRANSLATED
  api_resource_created: 'El recurso de API {{name}} se ha creado correctamente',
  api_identifier_placeholder: 'https://su-identificador-de-api/',
};

export default api_resources;
