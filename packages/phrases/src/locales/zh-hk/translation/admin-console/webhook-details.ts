const webhook_details = {
  page_title: 'Webhook 詳細資料',
  back_to_webhooks: '返回 Webhooks',
  not_in_use: '未啟用',
  success_rate: '成功率',
  requests: '24 小時內收到 {{value, number}} 個請求',
  disable_webhook: '停用 webhook',
  disable_reminder: '確定要重新啟用此 webhook？重新啟用後，不會對端點 URL 發送 HTTP 請求。',
  webhook_disabled: 'Webhook 已停用。',
  webhook_reactivated: 'Webhook 已重新啟用。',
  reactivate_webhook: '重新啟用 webhook',
  delete_webhook: '刪除 webhook',
  deletion_reminder: '您正在刪除此 webhook。刪除後，不會對端點 URL 發送 HTTP 請求。',
  deleted: 'Webhook 已成功刪除。',
  settings_tab: '設置',
  recent_requests_tab: '最新請求（24h）',
  settings: {
    settings: '設置',
    settings_description:
      'Webhooks 允許您即時接收特定事件的更新，通過將 POST 請求發送到您的端點 URL。這使您能夠根據收到的新信息立即採取行動。',
    events: '事件',
    events_description: '選擇 Logto 將發送 POST 請求的觸發事件。',
    name: '名稱',
    endpoint_url: '端點 URL',
    signing_key: '簽名密鑰',
    signing_key_tip:
      '添加 Logto 提供的秘密金鑰作為請求標題至您的端點，以確保 webhook 負載的真實性。',
    regenerate: '重新生成',
    regenerate_key_title: '重新生成簽名密鑰',
    regenerate_key_reminder:
      '是否確定要修改簽名密鑰？重新生成後立即生效。請記得同步在端點中修改簽名密鑰。',
    regenerated: '簽名密鑰已重新生成。',
    custom_headers: '自定義標頭',
    custom_headers_tip:
      '您可以選擇添加自定義標頭到 webhook 的負載，提供有關事件的更多上下文或元數據。',
    key_duplicated_error: 'Key 不能重複。',
    key_missing_error: '必須填寫 Key。',
    value_missing_error: '未填寫值。',
    invalid_key_error: 'Key 無效',
    invalid_value_error: '值無效',
    test: '測試',
    test_webhook: '測試您的 webhook',
    test_webhook_description:
      '配置 webhook，並使用每個選定事件的負載示例進行測試，以驗證正確接收和處理。',
    send_test_payload: '發送測試負載',
    test_result: {
      endpoint_url: '端點URL：{{url}}',
      message: '消息：{{message}}',
      response_status: '響應狀態：{{status, number}}',
      response_body: '響應主體：{{body}}',
      request_time: '請求時間：{{time}}',
      test_success: '向端點發起的 webhook 測試成功。',
    },
  },
};

export default Object.freeze(webhook_details);
