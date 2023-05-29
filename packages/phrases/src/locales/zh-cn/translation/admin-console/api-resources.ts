const api_resources = {
  page_title: 'API 资源',
  title: 'API 资源',
  subtitle: '定义可以从已授权的应用程序中使用的 API',
  create: '创建 API 资源',
  api_name: 'API 名称',
  api_name_placeholder: '输入API名称',
  api_identifier: 'API Identifier',
  api_identifier_placeholder: 'https://your-api-identifier/',
  api_identifier_tip:
    '对于 API 资源的唯一标识符。它必须是一个绝对 URI 并没有 fragment (#) 组件。等价于 OAuth 2.0 中的 <a>resource parameter</a>。',
  api_resource_created: ' API 资源 {{name}} 已成功创建。',
  default_api: 'Default API', // UNTRANSLATED
  default_api_label:
    'If the current API Resource is set as the default API for the tenant, while each tenant can have either 0 or 1 default API. When a default API is designated, the resource parameter can be omitted in the auth request. Subsequent token exchanges will use that API as the audience by default, resulting in the issuance of JWTs.', // UNTRANSLATED
};

export default api_resources;
