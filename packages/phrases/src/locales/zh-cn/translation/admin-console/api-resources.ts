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
  default_api: '默认API',
  default_api_label:
    '每个租户只能设置零个或一个默认 API。当指定默认 API 时，可以在认证请求中省略资源参数。后续令牌交换将默认使用该 API 作为 Audience，从而签发 JWT。<a>了解更多</a>',
  api_resource_created: ' API 资源 {{name}} 已成功创建。',
  /** UNTRANSLATED */
  invalid_resource_indicator_format: 'API indicator must be a valid absolute URI.',
};

export default Object.freeze(api_resources);
