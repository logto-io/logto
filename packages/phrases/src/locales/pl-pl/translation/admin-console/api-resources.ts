const api_resources = {
  page_title: 'Zasoby API',
  title: 'Zasoby API',
  subtitle: 'Definiuj API, z których korzystać mogą twoje autoryzowane aplikacje',
  create: 'Utwórz zasób API',
  api_name: 'Nazwa API',
  api_name_placeholder: 'Wprowadź nazwę swojego API',
  api_identifier: 'Identyfikator API',
  api_identifier_placeholder: 'https://twój-identyfikator-api/',
  api_identifier_tip:
    'Unikalny identyfikator zasobu API. Musi to być bezwzględny adres URI bez składnika fragmentu (#). Jest równy <a>parametrowi zasobu</a> w standardzie OAuth 2.0.',
  default_api: 'Domyślne API',
  default_api_label:
    'Tylko jedno API domyślne może być ustawione na jeden najem. Kiedy określone zostanie API domyślne, parametr zasobu może zostać pominięty w żądaniu autoryzacji. Następujące procesy wymiany tokenu będą domyślnie korzystać z tego API, co umożliwi wydanie JWT. <a>Dowiedz się więcej</a>',
  api_resource_created: 'Zasób API {{name}} został pomyślnie utworzony',
  invalid_resource_indicator_format:
    'Identyfikator API musi być poprawnym bezwzględnym adresem URI.',
};

export default Object.freeze(api_resources);
