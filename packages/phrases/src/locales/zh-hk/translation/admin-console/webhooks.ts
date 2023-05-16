const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle: 'Webhooks 可以實時更新特定事件的 endpoint URL，從而實現立即響應。',
  create: '創建 Webhook',
  events: {
    post_register: '創建新帐户',
    post_sign_in: '登录',
    post_reset_password: '重置密码',
  },
  table: {
    name: '名稱',
    events: '事件',
    success_rate: '成功率（24h）',
    requests: '請求（24h）',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'Webhooks 提供關於特定事件的即時更新至你的端點 URL，啟用即時反應。當事件發生時，Logto 會將 POST 請求發送到你的端點 URL，讓你可立即根據新收到的信息採取行動。目前支持的事件為「創建新帳戶」、「登錄」、「重置密碼」。',
    create_webhook: '創建 Webhook',
  },
  create_form: {
    title: '創建 Webhook',
    subtitle: '添加 Webhook 以向 endpoint URL 發送 POST 請求，將詳細信息推送到任何用戶事件。',
    events: '事件',
    events_description: '選擇需要 Logto 發送 POST 請求的觸發事件。',
    name: '名稱',
    name_placeholder: '輸入 webhook 名稱',
    endpoint_url: 'Endpoint URL',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip:
      '輸入 Webhook 要發送到的 HTTPS URL，當事件發生時，Logto 會將 POST 請求發送到此處，以便收到最新的信息。',
    create_webhook: '創建 Webhook',
    missing_event_error: '您必須至少選擇一個事件。',
    https_format_error: '出於安全原因，需要 HTTPS 格式。',
    block_description:
      '目前版本僅支持三條 Webhook。 如果需要額外的 Webhook，請發送電子郵件至我們的支持團隊 <a>{{link}}</a>，我們將樂意為你提供協助。',
  },
  webhook_created: 'Webhook {{name}} 成功創建。',
};

export default webhooks;
