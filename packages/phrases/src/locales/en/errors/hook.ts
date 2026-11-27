const hook = {
  missing_events: 'You need to provide at least one event.',
  send_test_payload_failed: 'Failed to send test payload: {{message}}',
  endpoint_responded_with_error: 'Endpoint responded with error.',
  disabled: 'The hook is disabled and cannot redeliver events.',
  log_not_permanently_failed: 'Only permanently failed webhook deliveries can be redelivered.',
  invalid_log_payload:
    'The webhook log entry does not contain a valid request payload to redeliver.',
  redelivery_in_progress: 'A delivery or redelivery for this webhook event is already in progress.',
};

export default Object.freeze(hook);
