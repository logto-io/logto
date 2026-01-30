const jwt_claims = {
  title: '自訂 JWT',
  description: '設定自訂 JWT 聲明以包含在存取權杖中。這些聲明可用於將額外信息傳遞給你的應用程式。',
  user_jwt: {
    card_title: '用於用戶',
    card_field: '用戶存取權杖',
    card_description: '在發行存取權杖期間添加用戶特定數據。',
    for: '用於用戶',
  },
  machine_to_machine_jwt: {
    card_title: '用於 M2M',
    card_field: '機器對機器權杖',
    card_description: '在發行機器對機器權杖期間添加額外數據。',
    for: '用於 M2M',
  },
  code_editor_title: '自訂 {{token}} 聲明',
  custom_jwt_create_button: '添加自訂聲明',
  custom_jwt_item: '自訂聲明 {{for}}',
  delete_modal_title: '刪除自訂聲明',
  delete_modal_content: '你確定要刪除自訂聲明嗎？',
  clear: '清空',
  cleared: '已清空',
  restore: '恢復預設值',
  restored: '已恢復',
  data_source_tab: '數據來源',
  test_tab: '測試上下文',
  jwt_claims_description: '默認聲明會自動包含在 JWT 中，無法覆蓋。',
  user_data: {
    title: '用戶數據',
    subtitle: '使用 `context.user` 輸入參數提供重要用戶信息。',
  },
  grant_data: {
    title: '授權數據',
    subtitle: '使用 `context.grant` 輸入參數提供重要的授權信息，只適用於權杖交換。',
  },
  interaction_data: {
    title: '用戶交互上下文',
    subtitle:
      '使用 `context.interaction` 參數訪問當前身份驗證會話的用戶交互詳情，包括 `interactionEvent`、`userId` 和 `verificationRecords`。',
  },
  session_data: {
    title: '會話上下文',
    subtitle: '使用 `context.session` 參數訪問用戶的會話詳情，用於自適應 MFA 等。',
  },
  token_data: {
    title: '權杖數據',
    subtitle: '使用 `token` 輸入參數查看當前存取權杖有效負載。',
  },
  api_context: {
    title: 'API 上下文：訪問控制',
    subtitle: '使用 `api.denyAccess` 方法來拒絕權杖請求。',
  },
  fetch_external_data: {
    title: '提取外部數據',
    subtitle: '將來自外部 API 的數據直接導入聲明。',
    description: '使用 `fetch` 函數調用你的外部 API 並將數據包含在自訂聲明中。例如：',
  },
  environment_variables: {
    title: '設置環境變數',
    subtitle: '使用環境變數存儲敏感信息。',
    input_field_title: '添加環境變數',
    sample_code: '在你的自訂 JWT 聲明處理程序中訪問環境變數。例如：',
  },
  jwt_claims_hint: '將自訂聲明限制在 50KB 以下。默認 JWT 聲明會自動包含在權杖中，不能被覆蓋。',
  tester: {
    subtitle: '調整模擬權杖和用戶數據以進行測試。',
    run_button: '運行測試',
    result_title: '測試結果',
  },
  form_error: {
    invalid_json: '無效的 JSON 格式',
  },
};

export default Object.freeze(jwt_claims);
