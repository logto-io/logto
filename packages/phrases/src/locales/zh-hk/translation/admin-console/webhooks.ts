const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle: '創建 Webhooks，輕鬆地接收有關特定事件的實時更新。',
  create: '創建 Webhook',
  schemas: {
    interaction: '用戶互動',
    user: '用戶',
    organization: '組織',
    role: '角色',
    scope: '權限',
    organization_role: '組織角色',
    organization_scope: '組織權限',
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
      '創建 Webhook 以通過 POST 請求向您的端點 URL 接收實時更新。了解詳情並針對“創建帳戶”、“登錄”和“重置密碼”等事件立即採取行動。',
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
    endpoint_url_tip: '輸入您的端點 URL，當事件發生時向其發送 Webhook 的有效負載。',
    create_webhook: '創建 Webhook',
    missing_event_error: '您必須至少選擇一個事件。',
  },
  webhook_created: 'Webhook {{name}} 成功創建。',
};

export default Object.freeze(webhooks);
