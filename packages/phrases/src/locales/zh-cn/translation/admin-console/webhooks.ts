const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle: 'Webhooks提供实时更新指定的事件，以您的Endpoint URL，实现即时反应。',
  create: '创建Webhook',
  events: {
    post_register: '创建新账户',
    post_sign_in: '登录',
    post_reset_password: '重置密码',
  },
  table: {
    name: '名称',
    events: '事件',
    success_rate: '成功率（24小时）',
    requests: '请求数（24小时）',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'Webhooks提供实时更新指定的事件，以您的Endpoint URL，实现即时反应。这样您就能立即根据接收到的新信息采取行动了。现在已支持“创建帐户、登录、重置密码”等事件。',
    create_webhook: '创建Webhook',
  },
  create_form: {
    title: '创建Webhook',
    subtitle: '添加Webhook以将POST请求发送到端点URL，并附带任何用户事件的详细信息。',
    events: '事件',
    events_description: '选择触发事件，Logto将发送POST请求。',
    name: '名称',
    name_placeholder: '输入Webhook名称',
    endpoint_url: 'Endpoint URL',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip: '在事件发生时发送 Webhook 负载的 HTTPS URL 端点。',
    create_webhook: '创建Webhook',
    missing_event_error: '您必须至少选择一个事件。',
    https_format_error: 'HTTPS格式为安全性所必须。',
  },
  webhook_created: 'Webhook {{name}} 已成功创建。',
};

export default webhooks;
