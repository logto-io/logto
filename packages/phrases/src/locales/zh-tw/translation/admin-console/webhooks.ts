const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle: '創建 Webhook 以輕鬆收到特定事件的即時更新。',
  create: '創建 Webhook',
  events: {
    post_register: '創建新帳戶',
    post_sign_in: '登錄',
    post_reset_password: '重置密碼',
  },
  schemas: {
    /** UNTRANSLATED */
    interaction: 'User interaction',
    /** UNTRANSLATED */
    user: 'User',
    /** UNTRANSLATED */
    organization: 'Organization',
    /** UNTRANSLATED */
    role: 'Role',
    /** UNTRANSLATED */
    scope: 'Permission',
    /** UNTRANSLATED */
    organization_role: 'Organization role',
    /** UNTRANSLATED */
    organization_scope: 'Organization permission',
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
      '創建 Webhook 以收到通過 POST 請求發送到您的端點 URL 的即時更新。保持資訊，對「創建帳戶」「登錄」和「重置密碼」等事件立即採取行動。',
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
    endpoint_url_tip: '輸入您的端點 URL，當事件發生時會將 Webhook 的載荷發送到該 URL。',
    create_webhook: '創建 webhook',
    missing_event_error: '您需要選擇至少一個事件。',
  },
  webhook_created: 'Webhook {{name}} 已成功創建。',
};

export default Object.freeze(webhooks);
