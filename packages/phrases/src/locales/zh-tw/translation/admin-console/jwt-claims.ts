const jwt_claims = {
  title: '自定義 JWT',
  description: '設置自定義 JWT 声明以包含在訪問令牌中。這些聲明可用於向應用程序傳遞附加信息。',
  user_jwt: {
    card_title: '針對用戶',
    card_field: '用戶訪問令牌',
    card_description: '在發出訪問令牌時添加用戶特定數據。',
    for: '針對用戶',
  },
  machine_to_machine_jwt: {
    card_title: '針對 M2M',
    card_field: '機器對機器令牌',
    card_description: '在發出機器對機器令牌時添加額外數據。',
    for: '針對 M2M',
  },
  code_editor_title: '自定義 {{token}} 声明',
  custom_jwt_create_button: '添加自定義声明',
  custom_jwt_item: '自定義声明 {{for}}',
  delete_modal_title: '刪除自定義声明',
  delete_modal_content: '你確定要刪除自定義声明嗎？',
  clear: '清除',
  cleared: '已清除',
  restore: '恢復默認值',
  restored: '已恢復',
  data_source_tab: '數據源',
  test_tab: '測試上下文',
  jwt_claims_description: '默認声明自動包含在 JWT 中，無法覆蓋。',
  user_data: {
    title: '用戶數據',
    subtitle: '使用 `context.user` 輸入參數提供重要用戶信息。',
  },
  grant_data: {
    title: '授權資料',
    subtitle: '使用 `context.grant` 輸入參數提供重要授權信息，僅適用於令牌交換。',
  },
  token_data: {
    title: '令牌數據',
    subtitle: '使用 `token` 輸入參數獲取當前訪問令牌有效載荷。',
  },
  fetch_external_data: {
    title: '提取外部數據',
    subtitle: '直接將來自外部 APIs 的數據合併到声明中。',
    description: '使用 `fetch` 函數調用外部 APIs 並將數據包含在你的自定義声明中。示例：',
  },
  environment_variables: {
    title: '設置環境變量',
    subtitle: '使用環境變量存儲敏感信息。',
    input_field_title: '添加環境變量',
    sample_code: '在自定義 JWT 声明處理程序中訪問環境變量。示例：',
  },
  jwt_claims_hint: '將自定義声明限制在 50KB 以下。默認 JWT 声明將自動包含在令牌中，無法覆蓋。',
  tester: {
    subtitle: '調整測試用的模擬令牌和用戶數據。',
    run_button: '運行測試',
    result_title: '測試結果',
  },
  form_error: {
    invalid_json: '無效的 JSON 格式',
  },
};

export default Object.freeze(jwt_claims);
