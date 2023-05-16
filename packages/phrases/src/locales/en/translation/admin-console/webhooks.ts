const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle:
    'Webhooks provide real-time updates on specific events to your endpoint URL, enabling immediate reactions.',
  create: 'Create Webhook',
  events: {
    post_register: 'Create new account',
    post_sign_in: 'Sign in',
    post_reset_password: 'Reset password',
  },
  table: {
    name: 'Name',
    events: 'Events',
    success_rate: 'Success rate (24h)',
    requests: 'Requests (24h)',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'Webhooks provide real-time updates on specific events as they happen, by sending a POST request to your endpoint URL. This enables you to take immediate actions based on the new information received. The events of "Create account, Sign in, Reset a password" are now supported.',
    create_webhook: 'Create Webhook',
  },
  create_form: {
    title: 'Create Webhook',
    subtitle:
      'Add the Webhook to send a POST request to the endpoint URL with details of any users events.',
    events: 'Events',
    events_description: 'Select the trigger events which Logto will send the POST request.',
    name: 'Name',
    name_placeholder: 'Enter webhook name',
    endpoint_url: 'Endpoint URL',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip:
      'Enter the HTTPS URL of your endpoint where a webhook’s payload is sent to when the event occurs.',
    create_webhook: 'Create webhook',
    missing_event_error: 'You have to select at least one event.',
    https_format_error: 'HTTPS format required for security reasons.',
    block_description:
      'The current version supports only up to three webhooks. If you require additional webhooks, please email our support team at <a>{{link}}</a> and we will be happy to assist you.',
  },
  webhook_created: 'The webhook {{name}} has been successfully created.',
};

export default webhooks;
