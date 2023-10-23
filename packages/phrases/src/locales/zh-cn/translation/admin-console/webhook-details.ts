const webhook_details = {
  page_title: 'Webhook 详情',
  back_to_webhooks: '返回 Webhooks',
  not_in_use: '未使用',
  success_rate: '成功率',
  requests: '24 小时内请求次数：{{value, number}}',
  disable_webhook: '禁用 Webhook',
  disable_reminder: '是否确定重新激活此 Webhook？重新激活后将不会向端点 URL 发送 HTTP 请求。',
  webhook_disabled: 'Webhook 已被禁用。',
  webhook_reactivated: 'Webhook 已经重新激活。',
  reactivate_webhook: '重新激活 Webhook',
  delete_webhook: '删除 Webhook',
  deletion_reminder: '您正在删除此 Webhook。删除后，将不会向端点 URL 发送 HTTP 请求。',
  deleted: 'Webhook 已成功删除。',
  settings_tab: '设置',
  recent_requests_tab: '最近请求（24小时）',
  settings: {
    settings: '设置',
    settings_description:
      'Webhook 允许您通过向端点 URL 发送 POST 请求，实时接收特定事件的更新。这使您可以根据接收到的新信息立即采取行动。',
    events: '事件',
    events_description: '选择 Logto 将发送 POST 请求的触发事件。',
    name: '名称',
    endpoint_url: '端点 URL',
    signing_key: '签名密钥',
    signing_key_tip:
      '将由 Logto 提供的密钥作为请求标头添加到您的端点中，以确保 Webhook 负载的真实性。',
    regenerate: '重新生成',
    regenerate_key_title: '重新生成签名密钥',
    regenerate_key_reminder:
      '是否确定要修改签名密钥？重新生成后将立即生效。请在您的端点中同步修改签名密钥。',
    regenerated: '签名密钥已重新生成。',
    custom_headers: '自定义标头',
    custom_headers_tip:
      '选择性地，您可以向 Webhook 负载添加自定义标头，以提供事件的其他上下文或元数据。',
    key_duplicated_error: 'Key 不能重复。',
    key_missing_error: '必须填写 Key。',
    value_missing_error: '必须填写值。',
    invalid_key_error: ' Key 无效',
    invalid_value_error: '值无效',
    test: '测试',
    test_webhook: '测试您的 Webhook',
    test_webhook_description:
      '配置 Webhook，并使用每个选定事件的负载示例进行测试，以验证正确的接收和处理。',
    send_test_payload: '发送测试负载',
    test_result: {
      endpoint_url: '端点 URL：{{url}}',
      message: '消息：{{message}}',
      response_status: '响应状态：{{status, number}}',
      response_body: '响应主体：{{body}}',
      request_time: '请求时间：{{time}}',
      test_success: '向端点发起的 webhook 测试成功。',
    },
  },
};

export default Object.freeze(webhook_details);
