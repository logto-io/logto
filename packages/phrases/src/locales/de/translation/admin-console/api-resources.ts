const api_resources = {
  page_title: 'API-Ressourcen',
  title: 'API-Ressourcen',
  subtitle: 'Lege APIs an, die du in deinen autorisierten Anwendungen verwenden kannst',
  create: 'API-Ressource erstellen',
  api_name: 'API-Name',
  api_name_placeholder: 'Gib einen API-Namen ein',
  api_identifier: 'API-Identifier',
  api_identifier_placeholder: 'https://your-api-identifier/',
  api_identifier_tip:
    'Der eindeutige Identifikator der API-Ressource muss eine absolute URI ohne Fragmentbezeichner (#) sein. Entspricht dem <a>Ressourcenparameter</a> in OAuth 2.0.',
  default_api: 'Standard-API',
  default_api_label:
    'Pro Mandant kann nur eine Standard-API festgelegt werden. Wenn eine Standard-API festgelegt ist, kann der Ressourcenparameter in der Authentifizierungsanfrage weggelassen werden. Folgende Token-Austauschvorgänge verwenden standardmäßig die API als Publikum, was zur Ausgabe von JWTs führt. <a>Erfahren Sie mehr</a>',
  api_resource_created: 'Die API-Ressource {{name}} wurde erfolgreich erstellt',
  invalid_resource_indicator_format: 'API-Indikator muss eine gültige absolute URI sein.',
};

export default Object.freeze(api_resources);
