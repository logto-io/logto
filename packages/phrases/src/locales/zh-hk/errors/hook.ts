const hook = {
  missing_events: '你需要至少提供一個事件。',
  send_test_payload_failed: '無法發送測試内容：{{message}}',
  endpoint_responded_with_error: '端點返回了錯誤。',
  disabled: 'Hook 已停用，無法重新傳遞事件。',
  log_not_permanently_failed: '僅可重新傳遞永久失敗的 Webhook 傳遞記錄。',
  invalid_log_payload: 'Webhook 日誌項目不包含可用於重新傳遞的有效請求負載。',
  redelivery_in_progress: '此 Webhook 事件已有正在進行的傳遞或重新傳遞工作。',
};

export default Object.freeze(hook);
