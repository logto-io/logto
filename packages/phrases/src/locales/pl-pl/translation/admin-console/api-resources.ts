const api_resources = {
  page_title: 'Zasoby API',
  title: 'Zasoby API',
  subtitle: 'Definiuj API, z których korzystać mogą twoje autoryzowane aplikacje',
  create: 'Utwórz zasób API',
  api_name: 'Nazwa API',
  api_name_placeholder: 'Wprowadź nazwę swojego API',
  api_identifier: 'Identyfikator API',
  api_identifier_tip:
    'Unikalny identyfikator zasobu API. Musi to być bezwzględny adres URI bez składnika fragmentu (#). Jest równy <a>parametrowi zasobu</a> w standardzie OAuth 2.0.',
  default_api: 'Default API', // UNTRANSLATED
  default_api_label:
    'If the current API Resource is set as the default API for the tenant, while each tenant can have either 0 or 1 default API. When a default API is designated, the resource parameter can be omitted in the auth request. Subsequent token exchanges will use that API as the audience by default, resulting in the issuance of JWTs.', // UNTRANSLATED
  api_resource_created: 'Zasób API {{name}} został pomyślnie utworzony',
  api_identifier_placeholder: 'https://identyfikator-twojego-api/',
};

export default api_resources;
