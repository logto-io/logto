const api_resources = {
  page_title: 'Recursos da API',
  title: 'Recursos da API',
  subtitle: 'Defina APIs que você pode consumir de seus aplicativos autorizados',
  create: 'Criar recurso de API',
  api_name: 'Nome da API',
  api_name_placeholder: 'Digite o nome da sua API',
  api_identifier: 'Identificador da API',
  api_identifier_placeholder: 'https://seu-identificador-de-api/',
  api_identifier_tip:
    'O identificador exclusivo para o recurso da API. Deve ser um URI absoluto e não ter nenhum componente de fragmento (#). Igual ao <a>parâmetro de recurso</a> em OAuth 2.0.',
  default_api: 'API padrão',
  default_api_label:
    'Apenas uma API padrão pode ser definida por locatário. Quando uma API padrão é definida, o parâmetro de recurso pode ser omitido na solicitação de autenticação. As trocas de token subsequentes usarão essa API como audiência por padrão, resultando na emissão de JWTs. <a>Saiba mais</a>',
  api_resource_created: 'O recurso da API {{name}} foi criado com sucesso',
  invalid_resource_indicator_format: 'O indicador da API deve ser um URI absoluto válido.',
};

export default Object.freeze(api_resources);
