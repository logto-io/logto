const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle: 'Webhooks 提供關於特定事件的即時更新至你的端點 URL，啟用即時反應。',
  create: '創建 Webhook',
  events: {
    post_register: '創建新帳戶',
    post_sign_in: '登錄',
    post_reset_password: '重置密碼',
  },
  table: {
    name: '名稱',
    events: '事件',
    success_rate: '成功率 (24h)',
    requests: '請求數量 (24h)',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'Webhooks 提供關於特定事件的即時更新至你的端點 URL，啟用即時反應。當事件發生時，Logto 會將 POST 請求發送到你的端點 URL，讓你可立即根據新收到的信息採取行動。目前支持的事件為「創建新帳戶」、「登錄」、「重置密碼」。',
    create_webhook: '創建 Webhook',
  },
  create_form: {
    title: '創建 Webhook',
    subtitle: '添加 Webhook 以發送 POST 請求到端點 URL，包含任何用戶事件的詳細信息。',
    events: '事件',
    events_description: '選擇 Logto 將發送 POST 請求的觸發事件。',
    name: '名稱',
    name_placeholder: '輸入 webhook 名稱',
    endpoint_url: '端點 URL',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip:
      '輸入 Webhook 要發送到的 HTTPS URL，當事件發生時，Logto 會將 POST 請求發送到此處，以便收到最新的信息。',
    create_webhook: '創建 webhook',
    missing_event_error: '您需要選擇至少一個事件。',
    https_format_error: 'HTTPS 格式要求為了安全原因。',
  },
  webhook_created: 'Webhook {{name}} 已成功創建。',
};

export default webhooks;
