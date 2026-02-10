const jwt_claims = {
  title: '自定義 JWT',
  description: '自定義訪問令牌或ID令牌，為應用程序提供額外信息。',
  access_token: {
    card_title: '訪問令牌',
    card_description: '訪問令牌是API用於授權請求的憑證,僅包含訪問決策所需的聲明。',
  },
  user_jwt: {
    card_field: '用戶訪問令牌',
    card_description: '在發出訪問令牌時添加用戶特定數據。',
    for: '針對用戶',
  },
  machine_to_machine_jwt: {
    card_field: '機器對機器訪問令牌',
    card_description: '在發出機器對機器令牌時添加額外數據。',
    for: '針對 M2M',
  },
  id_token: {
    card_title: 'ID令牌',
    card_description: 'ID令牌是登入後收到的身份斷言，包含客戶端用於顯示或創建會話的用戶身份聲明。',
    card_field: '用戶ID令牌',
    card_field_description:
      "聲明 'sub'、'email'、'phone'、'profile' 和 'address' 始終可用。其他聲明必須先在此處啟用。在所有情況下，您的應用必須在集成時請求匹配的 scope 才能接收它們。",
  },
  code_editor_title: '自定義 {{token}} 聲明',
  custom_jwt_create_button: '添加自定義聲明',
  custom_jwt_item: '自定義聲明 {{for}}',
  delete_modal_title: '刪除自定義聲明',
  delete_modal_content: '你確定要刪除自定義聲明嗎？',
  clear: '清除',
  cleared: '已清除',
  restore: '恢復默認值',
  restored: '已恢復',
  data_source_tab: '數據源',
  test_tab: '測試上下文',
  jwt_claims_description: '默認聲明自動包含在 JWT 中，無法覆蓋。',
  user_data: {
    title: '用戶數據',
    subtitle: '使用 `context.user` 輸入參數提供重要用戶信息。',
  },
  grant_data: {
    title: '授權資料',
    subtitle: '使用 `context.grant` 輸入參數提供重要授權信息，僅適用於令牌交換。',
  },
  interaction_data: {
    title: '用戶交互上下文',
    subtitle:
      '使用 `context.interaction` 參數訪問當前身份驗證會話的用戶交互詳細信息，包括 `interactionEvent`、`userId` 和 `verificationRecords`。',
  },
  token_data: {
    title: '令牌數據',
    subtitle: '使用 `token` 輸入參數獲取當前訪問令牌有效載荷。',
  },
  api_context: {
    title: 'API 上下文：訪問控制',
    subtitle: '使用 `api.denyAccess` 方法拒絕令牌請求。',
  },
  fetch_external_data: {
    title: '提取外部數據',
    subtitle: '直接將來自外部 APIs 的數據合併到聲明中。',
    description: '使用 `fetch` 函數調用外部 APIs 並將數據包含在你的自定義聲明中。示例：',
  },
  environment_variables: {
    title: '設置環境變量',
    subtitle: '使用環境變量存儲敏感信息。',
    input_field_title: '添加環境變量',
    sample_code: '在自定義 JWT 聲明處理程序中訪問環境變量。示例：',
  },
  jwt_claims_hint: '將自定義聲明限制在 50KB 以下。默認 JWT 聲明將自動包含在令牌中，無法覆蓋。',
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
