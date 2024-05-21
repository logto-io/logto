const api_resources = {
  page_title: 'Recursos de API',
  title: 'Recursos de API',
  subtitle: 'Define APIs que las aplicaciones autorizadas pueden utilizar',
  create: 'Crear recurso de API',
  api_name: 'Nombre de la API',
  api_name_placeholder: 'Ingrese el nombre de su API',
  api_identifier: 'Identificador de API',
  api_identifier_placeholder: 'https://su-api-identificador/',
  api_identifier_tip:
    'El identificador único para el recurso de API. Debe ser una URI absoluta y no tiene componente de fragmento (#). Es igual al <a>parámetro de recurso</a> en OAuth 2.0.',
  default_api: 'API por defecto',
  default_api_label:
    'Sólo se puede establecer cero o una API por defecto por inquilino. Cuando se designa una API por defecto, el parámetro de recurso se puede omitir en la solicitud de autenticación. Las posteriores intercambios de tokens utilizarán esa API como audiencia por defecto, lo que dará lugar a la emisión de JWTs. <a>Obtener más información</a>',
  api_resource_created: 'El recurso de API {{name}} se ha creado correctamente',
  invalid_resource_indicator_format: 'El indicador de API debe ser una URI absoluta válida.',
};

export default Object.freeze(api_resources);
