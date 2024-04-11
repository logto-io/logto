const api_resources = {
  page_title: 'Recursos de API',
  title: 'Recursos de API',
  subtitle: 'Defina as APIs que podem ser consumidas ​​pelas aplicações autorizadas',
  create: 'Criar recurso de API',
  api_name: 'Nome da API',
  api_name_placeholder: 'Insira o nome da sua API',
  api_identifier: 'API Identifier',
  api_identifier_placeholder: 'https://your-api-identifier/',
  api_identifier_tip:
    'O identificador exclusivo para o recurso de API. Deve ser um URI absoluto e não ter um componente de fragmento (#). Igual ao <a>parâmetro resource</a> no OAuth 2.0.',
  default_api: 'API padrão',
  default_api_label:
    'Somente uma API padrão pode ser definida por inquilino. Quando uma API padrão é definida, o parâmetro de recurso pode ser omitido na solicitação de autorização. Subsequentes trocas de token usarão essa API como audiência por padrão, resultando na emissão de JWTs. <a>Saiba mais</a>',
  api_resource_created: 'O recurso de API {{name}} foi criado com sucesso',
  /** UNTRANSLATED */
  invalid_resource_indicator_format: 'API indicator must be a valid absolute URI.',
};

export default Object.freeze(api_resources);
