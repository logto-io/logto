const api_resources = {
  page_title: 'API resources',
  title: 'API resources',
  subtitle: 'Define APIs that your authorized applications can utilize',
  create: 'Create API resource',
  api_name: 'API name',
  api_name_placeholder: 'Enter your API name',
  api_identifier: 'API Identifier',
  api_identifier_placeholder: 'https://your-api-identifier/',
  api_identifier_tip:
    'The unique identifier to the API resource. It must be an absolute URI and has no fragment (#) component. Equals to the <a>resource parameter</a> in OAuth 2.0.',
  default_api: 'Default API',
  default_api_label:
    'Only zero or one default API can be set per tenant.\nWhen a default API is designated, the resource parameter can be omitted in the auth request. Subsequent token exchanges will use that API as the audience by default, resulting in the issuance of JWTs. <a>Learn more</a>',
  api_resource_created: 'The API resource {{name}} has been successfully created',
  invalid_resource_indicator_format: 'API indicator must be a valid absolute URI.',
};

export default Object.freeze(api_resources);
