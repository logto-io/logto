const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle: '创建 Webhooks 以轻松接收有关特定事件的实时更新。',
  create: '创建 Webhook',
  schemas: {
    interaction: '用户交互',
    user: '用户',
    organization: '组织',
    role: '角色',
    scope: '权限',
    organization_role: '组织角色',
    organization_scope: '组织权限',
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
      '创建一个Webhook以通过POST请求将实时更新发送到您的端点URL。了解并立即采取有关“创建账户”、“登录”和“重置密码”等事件的操作。',
    create_webhook: '创建 Webhook',
  },
  create_form: {
    title: '创建 Webhook',
    subtitle: '添加 Webhook 以将 POST 请求发送到端点 URL，并附带任何用户事件的详细信息。',
    events: '事件',
    events_description: '选择触发事件，Logto 将发送 POST 请求。',
    name: '名称',
    name_placeholder: '输入 Webhook 名称',
    endpoint_url: '端点 URL',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip: '输入您的端点 URL，在事件发生时 Webhook 的数据将被发送到该 URL。',
    create_webhook: '创建 Webhook',
    missing_event_error: '您必须至少选择一个事件。',
  },
  webhook_created: 'Webhook {{name}} 已成功创建。',
};

export default Object.freeze(webhooks);
