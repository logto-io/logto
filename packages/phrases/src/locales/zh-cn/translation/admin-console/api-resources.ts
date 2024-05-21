const api_resources = {
  page_title: 'API资源',
  title: 'API资源',
  subtitle: '定义可以从已授权的应用程序中使用的API',
  create: '创建API资源',
  api_name: 'API名称',
  api_name_placeholder: '输入API名称',
  api_identifier: 'API标识符',
  api_identifier_placeholder: 'https://your-api-identifier/',
  api_identifier_tip:
    '对于API资源的唯一标识符。它必须是一个绝对URI并没有fragment(#)组件。等价于OAuth 2.0中的<a>资源参数</a>。',
  default_api: '默认API',
  default_api_label:
    '每个租户只能设置零个或一个默认API。当指定默认API时，可以在认证请求中省略资源参数。后续令牌交换将默认使用该API作为Audience，从而签发JWT。<a>了解更多</a>',
  api_resource_created: 'API资源{{name}}已成功创建。',
  invalid_resource_indicator_format: 'API标识符必须是有效的绝对URI。',
};

export default Object.freeze(api_resources);
