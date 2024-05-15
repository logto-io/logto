const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle: 'Create webhooks to effortlessly receive real-time updates regarding specific events.',
  create: 'Create Webhook',
  schemas: {
    interaction: 'User interaction',
    user: 'User',
    organization: 'Organization',
    role: 'Role',
    scope: 'Permission',
    organization_role: 'Organization role',
    organization_scope: 'Organization permission',
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
      'Create a webhook to receive real-time updates through POST requests to your endpoint URL. Stay informed and take immediate action on events like "Create account", "Sign in", and "Reset password".',
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
      'Enter the URL of your endpoint where a webhook’s payload is sent to when the event occurs.',
    create_webhook: 'Create webhook',
    missing_event_error: 'You have to select at least one event.',
  },
  webhook_created: 'The webhook {{name}} has been successfully created.',
};

export default Object.freeze(webhooks);
