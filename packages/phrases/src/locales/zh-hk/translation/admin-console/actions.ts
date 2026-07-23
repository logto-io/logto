const actions = {
  page_title: 'Actions',
  title: 'Actions',
  subtitle: '在身份驗證流程的特定節點運行自定義代碼，以擴展 Logto 的行為。',
  status: {
    not_configured: '未配置',
    configured: '已配置',
    enabled: '已啟用',
    disabled: '已停用',
  },
  types: {
    post_first_factor_verification: {
      name: '首個身份驗證因素驗證後',
      description: '在登入期間本地密碼驗證失敗後運行自訂邏輯。',
    },
    post_sign_in: {
      name: '登錄後',
      description: '在用戶成功登錄後運行自定義邏輯。',
    },
  },
  data_source_tab: '數據源',
  test_tab: '測試上下文',
  settings_tab: '設定',
  event_data: {
    title: '事件負載',
    subtitle: '使用 `event` 輸入參數取得身份驗證事件數據。',
  },
  result_data: {
    title: '操作結果',
    subtitle: '返回 Logto 可理解的結果物件，以適配此操作類型。',
  },
  environment_variables: {
    title: '設定環境變數',
    subtitle: '使用環境變數儲存敏感資訊。',
    input_field_title: '新增環境變數',
    sample_code: '在操作處理程序中存取環境變數。示例：',
  },
  fetch_external_data: {
    title: '取得外部數據',
    subtitle: '在操作腳本中呼叫外部 API。',
    description: '使用 `fetch` 函數呼叫外部 API，並將數據包含在操作結果中。示例：',
  },
  settings: {
    title: '設定',
    subtitle: '控制操作是否啟用，以及運行時錯誤的處理方式。',
    enabled: {
      title: '啟用操作',
      description: '在身份驗證事件觸發時運行此腳本。',
    },
    on_execution_error: {
      title: '腳本出錯時',
      description: '選擇腳本運行失敗時 Logto 的行為。',
      block: '阻止身份驗證流程',
      allow: '允許身份驗證流程繼續',
      post_first_factor_description:
        '當此腳本失敗時，Logto 一律拒絕無效憑證，以確保無法繞過密碼驗證。',
    },
  },
  test_context: {
    subtitle: '調整運行測試時使用的模擬事件負載。',
    input_field_title: '事件示例 JSON',
  },
  script: {
    title: '腳本',
    restore: '還原預設值',
    restored: '已還原',
  },
  tester: {
    run_button: '運行測試',
    result_title: '測試結果',
  },
  form_error: {
    invalid_json: '無效的 JSON 格式',
  },
  security_warning: {
    title: '安全警告',
    description:
      '此操作僅在本地密碼驗證失敗後運行。只有在獨立驗證提交的密碼後，才能傳回 `passwordVerified: true`。透過此操作建立的用戶會繞過僅適用於註冊的限制，包括電郵黑名單、僅 SSO 網域、停用註冊模式，以及註冊必填資料檢查。對現有用戶的資料和密碼寫入也會在 MFA 完成前發生。',
  },
  delete_modal_title: '刪除操作',
  delete_modal_content: '確定要刪除此操作嗎？身份驗證流程將不再運行此腳本。',
  deleted: '操作已刪除',
  created: '操作已建立',
  saved: '操作已儲存',
};

export default Object.freeze(actions);
