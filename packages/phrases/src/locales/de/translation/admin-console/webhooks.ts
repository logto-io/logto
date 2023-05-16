const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle:
    'Webhooks ermöglichen Echtzeitupdates zu speziellen Ereignissen an Ihre Endpunkt-URL, so dass umgehend Reaktionen erfolgen können.',
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
      'Webhooks ermöglichen Echtzeitupdates zu speziellen Ereignissen an Ihre Endpunkt-URL, so dass umgehend Reaktionen erfolgen können.',
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
    endpoint_url_tip:
      'Geben Sie die HTTPS-URL Ihres Endpunkts ein, an den der Payload eines Webhooks gesendet wird, wenn das Ereignis eintritt.',
    create_webhook: 'Webhook erstellen',
    missing_event_error: 'Sie müssen mindestens ein Ereignis auswählen.',
    https_format_error: 'HTTPS-Format erforderlich aus Sicherheitsgründen.',
    block_description:
      'Die aktuelle Version unterstützt nur bis zu drei Webhooks. Wenn Sie zusätzliche Webhooks benötigen, senden Sie bitte eine E-Mail an unser Support-Team unter <a>{{link}}</a> und wir helfen Ihnen gerne weiter.',
  },
  webhook_created: 'Der Webhook {{name}} wurde erfolgreich erstellt.',
};

export default webhooks;
