const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle:
    'Erstellen Sie Webhooks, um mühelos Echtzeit-Updates zu bestimmten Ereignissen zu empfangen.',
  create: 'Webhook erstellen',
  events: {
    post_register: 'Neuen Account anlegen',
    post_sign_in: 'Anmelden',
    post_reset_password: 'Passwort zurücksetzen',
  },
  table: {
    name: 'Name',
    events: 'Ereignisse',
    success_rate: 'Erfolgsrate (24h)',
    requests: 'Anfragen (24h)',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'Erstellen Sie einen Webhook, um Echtzeit-Updates über POST-Anfragen an Ihre Endpunkt-URL zu empfangen. Bleiben Sie über Ereignisse wie "Account erstellen", "Anmelden" und "Passwort zurücksetzen" informiert und ergreifen Sie sofort Maßnahmen.',
    create_webhook: 'Webhook erstellen',
  },
  create_form: {
    title: 'Webhook erstellen',
    subtitle:
      'Fügen Sie den Webhook hinzu, um eine POST-Anfrage an die Endpunkt-URL mit Details zu Ereignissen der Benutzer zu senden.',
    events: 'Ereignisse',
    events_description:
      'Wählen Sie die Trigger-Ereignisse aus, bei welchen Logto die POST-Anfrage senden soll.',
    name: 'Name',
    name_placeholder: 'Webhook-Namen eingeben',
    endpoint_url: 'Endpunkt-URL',
    endpoint_url_placeholder: 'https://Ihre.webhook.endpunkt.url',
    /** UNTRANSLATED */
    endpoint_url_tip:
      'Enter the URL of your endpoint where a webhook’s payload is sent to when the event occurs.',
    create_webhook: 'Webhook erstellen',
    missing_event_error: 'Sie müssen mindestens ein Ereignis auswählen.',
  },
  webhook_created: 'Der Webhook {{name}} wurde erfolgreich erstellt.',
};

export default Object.freeze(webhooks);
