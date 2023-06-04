const api_resources = {
  page_title: 'API 資源',
  title: 'API 資源',
  subtitle: '定義可以從已授權的應用程序中使用的 API',
  create: '創建 API 資源',
  api_name: 'API 名稱',
  api_name_placeholder: '輸入API名稱',
  api_identifier: 'API 辨識碼',
  api_identifier_placeholder: 'https://你的-api-辨識碼/',
  api_identifier_tip:
    '對於 API 資源的唯一標識符。它必須是一個絕對 URI，並沒有 fragment (#) 組件。等價於 OAuth 2.0 中的 <a>resource parameter</a>。',
  api_resource_created: ' API 資源 {{name}} 已成功創建。',
  default_api: '預設 API',
  default_api_label:
    '一個租戶只能設定零個或一個預設 API。當指定了預設 API 後，可以在授權請求中省略資源參數。隨後的令牌交換將使用該 API 作為默認的受眾端，從而產生 JWT。',
};

export default api_resources;
