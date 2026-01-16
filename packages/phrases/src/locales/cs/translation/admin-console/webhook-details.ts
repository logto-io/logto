const webhook_details = {
  page_title: 'Webhook details',
  back_to_webhooks: 'Back to webhooks',
  not_in_use: 'Not in use',
  success_rate: 'success rate',
  requests: '{{value, number}} requests in 24h',
  disable_webhook: 'Disable webhook',
  disable_reminder:
    'Are you sure you want to reactivate this webhook? Doing so will not send HTTP request to endpoint URL.',
  webhook_disabled: 'The webhook has been disabled.',
  webhook_reactivated: 'The webhook has been reactivated.',
  reactivate_webhook: 'Reactivate webhook',
  delete_webhook: 'Delete webhook',
  deletion_reminder:
    'You are removing this webhook. After deleting it will not send HTTP request to endpoint URL.',
  deleted: 'The webhook has been successfully deleted.',
  settings_tab: 'Settings',
  recent_requests_tab: 'Recent requests (24h)',
  settings: {
    settings: 'Settings',
    settings_description:
      'Webhooks allow you to receive real-time updates on specific events as they happen, by sending a POST request to your endpoint URL. This enables you to take immediate actions based on the new information received.',
    events: 'Events',
    events_description: 'Select the trigger events which Logto will send the POST request.',
    name: 'Name',
    endpoint_url: 'Endpoint URL',
    signing_key: 'Signing key',
    signing_key_tip:
      'Add the secret key provided by Logto to your endpoint as a request header to ensure the authenticity of the webhook’s payload.',
    regenerate: 'Regenerate',
    regenerate_key_title: 'Regenerate signing key',
    regenerate_key_reminder:
      'Are you sure you want to modify the signing key? Regenerating it will take effect immediately. Please remember to modify the signing key synchronously in your endpoint.',
    regenerated: 'Signing key has been regenerated.',
    custom_headers: 'Custom headers',
    custom_headers_tip:
      'Optionally, you can add custom headers to the webhook’s payload to provide additional context or metadata about the event.',
    key_duplicated_error: 'Key cannot be repeated.',
    key_missing_error: 'Key is required.',
    value_missing_error: 'Value is required.',
    invalid_key_error: 'Key is invalid',
    invalid_value_error: 'Value is invalid',
    test: 'Test',
    test_webhook: 'Test your webhook',
    test_webhook_description:
      'Configure the webhook, and test it with payload examples for each selected event to verify correct reception and processing.',
    send_test_payload: 'Send test payload',
    test_result: {
      endpoint_url: 'Endpoint URL: {{url}}',
      message: 'Message: {{message}}',
      response_status: 'Response status: {{status, number}}',
      response_body: 'Response body: {{body}}',
      request_time: 'Request time: {{time}}',
      test_success: 'The webhook test to the endpoint was successful.',
    },
  },
};

export default Object.freeze(webhook_details);
