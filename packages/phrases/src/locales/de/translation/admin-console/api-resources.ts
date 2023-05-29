const api_resources = {
  page_title: 'API Ressourcen',
  title: 'API Ressourcen',
  subtitle: 'Lege APIs an, die du in deinen autorisierten Anwendungen verwenden kannst',
  create: 'Erstelle API Ressource',
  api_name: 'API Name',
  api_name_placeholder: 'Gib einen API Namen ein',
  api_identifier: 'API Identifikator',
  api_identifier_tip:
    'Der eindeutige Identifikator der API Ressource muss eine absolute URI ohne Fragmentbezeichner (#) sein. Entspricht dem <a>Ressourcen Parameter</a> in OAuth 2.0.',
  default_api: 'Default API', // UNTRANSLATED
  default_api_label:
    'If the current API Resource is set as the default API for the tenant, while each tenant can have either 0 or 1 default API. When a default API is designated, the resource parameter can be omitted in the auth request. Subsequent token exchanges will use that API as the audience by default, resulting in the issuance of JWTs.', // UNTRANSLATED
  api_resource_created: 'Die API Ressource {{name}} wurde erfolgreich angelegt',
  api_identifier_placeholder: 'https://dein-api-identifikator/',
};

export default api_resources;
