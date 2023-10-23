const webhook_details = {
  page_title: 'Webhook 詳情',
  back_to_webhooks: '返回 Webhooks',
  not_in_use: '未使用',
  success_rate: '成功率',
  requests: '24 小時內 {{value, number}} 個請求',
  disable_webhook: '停用 Webhook',
  disable_reminder: '確定要重新啟用此 Webhook 嗎？繼續操作後，將不會向端點 URL 發送 HTTP 請求。',
  webhook_disabled: 'Webhook 已成功停用。',
  webhook_reactivated: 'Webhook 已成功重新啟用。',
  reactivate_webhook: '重新啟用 Webhook',
  delete_webhook: '刪除 Webhook',
  deletion_reminder: '您正在移除此 Webhook。刪除後，將不會向端點 URL 發送 HTTP 請求。',
  deleted: 'Webhook 已成功刪除。',
  settings_tab: '設置',
  recent_requests_tab: '最近的請求 (24h)',
  settings: {
    settings: '設置',
    settings_description:
      'Webhooks 允許您即時接收特定事件的更新，通過向您的端點 URL 發送 POST 請求。這使您能夠根據接收到的新信息立即採取行動。',
    events: '事件',
    events_description: '選擇觸發 Logto 發送 POST 請求的觸發器事件。',
    name: '名稱',
    endpoint_url: '端點 URL',
    signing_key: '簽名密鑰',
    signing_key_tip:
      '將 Logto 提供的密鑰添加到您的端點作為請求標頭，以確保 Webhook 的有效載荷的真實性。',
    regenerate: '重新生成',
    regenerate_key_title: '重新生成簽名密鑰',
    regenerate_key_reminder:
      '您確定要修改簽名密鑰嗎？重新生成將立即生效。請記得同步修改端點中的簽名密鑰。',
    regenerated: '簽名密鑰已重新生成。',
    custom_headers: '自定義標頭',
    custom_headers_tip:
      '您可以選擇將自定義標頭添加到有效載荷中，以提供有關事件的其他上下文或元數據。',
    key_duplicated_error: 'Key 不能重複。',
    key_missing_error: '必須填寫 Key。',
    value_missing_error: '未填寫值。',
    invalid_key_error: 'Key 無效',
    invalid_value_error: '值無效',
    test: '測試',
    test_webhook: '測試您的 Webhook',
    test_webhook_description:
      '配置 Webhook，並使用每個選定事件的有效載荷示例進行測試，以驗證正確的接收和處理。',
    send_test_payload: '發送測試有效載荷',
    test_result: {
      endpoint_url: '端點URL：{{url}}',
      message: '訊息：{{message}}',
      response_status: '回應狀態：{{status, number}}',
      response_body: '回應主體：{{body}}',
      request_time: '請求時間：{{time}}',
      test_success: '向端點發起的 webhook 測試成功。',
    },
  },
};

export default Object.freeze(webhook_details);
