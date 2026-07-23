const actions = {
  page_title: 'Actions',
  title: 'Actions',
  subtitle: '在驗證流程的特定節點執行自訂程式碼，以擴充 Logto 的行為。',
  status: {
    not_configured: '未設定',
    configured: '已設定',
    enabled: '已啟用',
    disabled: '已停用',
  },
  types: {
    post_first_factor_verification: {
      name: '第一個驗證因素驗證後',
      description: '在登入期間本機密碼驗證失敗後執行自訂邏輯。',
    },
    post_sign_in: {
      name: '登入後',
      description: '在使用者成功登入後執行自訂邏輯。',
    },
  },
  data_source_tab: '資料來源',
  test_tab: '測試內容',
  settings_tab: '設定',
  event_data: {
    title: '事件負載',
    subtitle: '使用 `event` 輸入參數取得驗證事件資料。',
  },
  result_data: {
    title: '動作結果',
    subtitle: '回傳 Logto 可理解的結果物件，以適配此動作類型。',
  },
  environment_variables: {
    title: '設定環境變數',
    subtitle: '使用環境變數儲存敏感資訊。',
    input_field_title: '新增環境變數',
    sample_code: '在動作處理程式中存取環境變數。範例：',
  },
  fetch_external_data: {
    title: '取得外部資料',
    subtitle: '在動作腳本中呼叫外部 API。',
    description: '使用 `fetch` 函式呼叫外部 API，並將資料包含在動作結果中。範例：',
  },
  settings: {
    title: '設定',
    subtitle: '控制動作是否啟用，以及執行時期錯誤的處理方式。',
    enabled: {
      title: '啟用動作',
      description: '在驗證事件觸發時執行此腳本。',
    },
    on_execution_error: {
      title: '腳本出錯時',
      description: '選擇腳本執行失敗時 Logto 的行為。',
      block: '阻止驗證流程',
      allow: '允許驗證流程繼續',
      post_first_factor_description:
        '當此腳本失敗時，Logto 一律拒絕無效憑證，以確保無法繞過密碼驗證。',
    },
  },
  test_context: {
    subtitle: '調整執行測試時使用的模擬事件負載。',
    input_field_title: '事件範例 JSON',
  },
  script: {
    title: '腳本',
    restore: '還原預設值',
    restored: '已還原',
  },
  tester: {
    run_button: '執行測試',
    result_title: '測試結果',
  },
  form_error: {
    invalid_json: '無效的 JSON 格式',
  },
  security_warning: {
    title: '安全警告',
    description:
      '此動作僅在本機密碼驗證失敗後執行。只有在獨立驗證提交的密碼後，才能回傳 `passwordVerified: true`。透過此動作建立的使用者會繞過僅適用於註冊的限制，包括電子郵件黑名單、僅 SSO 網域、停用註冊模式，以及註冊必填資料檢查。對現有使用者的資料和密碼寫入也會在 MFA 完成前發生。',
  },
  delete_modal_title: '刪除動作',
  delete_modal_content: '確定要刪除此動作嗎？驗證流程將不再執行此腳本。',
  deleted: '動作已刪除',
  created: '動作已建立',
  saved: '動作已儲存',
};

export default Object.freeze(actions);
