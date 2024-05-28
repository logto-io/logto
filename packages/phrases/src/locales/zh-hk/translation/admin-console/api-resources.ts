const api_resources = {
  page_title: 'API 資源',
  title: 'API 資源',
  subtitle: '定義可以從已授權的應用程序中使用的 API',
  create: '創建 API 資源',
  api_name: 'API 名稱',
  api_name_placeholder: '輸入 API 名稱',
  api_identifier: 'API 描述符',
  api_identifier_placeholder: 'https://your-api-identifier/',
  api_identifier_tip:
    '對於 API 資源的唯一標識符。它必須是一個絕對 URI 並沒有 fragment (#) 組件。等價於 OAuth 2.0 中的 <a>resource parameter</a>。',
  default_api: '預設的 API',
  default_api_label:
    '一个租户只能设置零或一个默认 API。當指定預設的 API 時，可以在身份驗證請求中省略資源參數，還可以使用該 API 作為預設受眾方進行令牌交換，從而發放 JWT。<a>了解更多</a>',
  api_resource_created: ' API 資源 {{name}} 已成功創建。',
  invalid_resource_indicator_format: 'API 描述符必須是有效的絕對 URI。',
};

export default Object.freeze(api_resources);
