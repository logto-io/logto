const hook = {
  missing_events: '你需要提供至少一个事件。',
  send_test_payload_failed: '无法发送测试内容：{{message}}',
  endpoint_responded_with_error: '端点返回了错误。',
  disabled: 'Hook 已禁用，无法重新投递事件。',
  log_not_permanently_failed: '仅可重新投递永久失败的 Webhook 投递记录。',
  invalid_log_payload: 'Webhook 日志条目不包含可用于重新投递的有效请求负载。',
  redelivery_in_progress: '该 Webhook 事件已有正在进行的投递或重新投递任务。',
};

export default Object.freeze(hook);
