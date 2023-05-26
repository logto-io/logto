const webhooks = {
  page_title: 'Wejścia',
  title: 'Webhooki',
  subtitle:
    'Webhooki umożliwiają aktualizacje w czasie rzeczywistym dla określonych zdarzeń do twojego URL punktu końcowego, umożliwiając natychmiastowe reakcje.',
  create: 'Utwórz webhook',
  events: {
    post_register: 'Utwórz nowe konto',
    post_sign_in: 'Zaloguj się',
    post_reset_password: 'Zresetuj hasło',
  },
  table: {
    name: 'Nazwa',
    events: 'Zdarzenia',
    success_rate: 'Wskaźnik sukcesu (24h)',
    requests: 'Żądania (24h)',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'Webhooki zapewniają aktualizacje w czasie rzeczywistym dla określonych zdarzeń do twojego URL punktu końcowego, umożliwiając natychmiastowe reakcje. Obsługiwane są zdarzenia "Utwórz nowe konto", "Zaloguj sie", "Zresetuj hasło"',
    create_webhook: 'Stwórz webhook',
  },
  create_form: {
    title: 'Utwórz Webhook',
    subtitle:
      'Dodaj Webhook aby wysyłać żądania POST na endpoint URL z detalami o zdarzeniach użytkowników.',
    events: 'Zdarzenia',
    events_description:
      'Wybierz zdarzenia wyzwalające które Logto wykorzysta do wysłania żądania POST.',
    name: 'Nazwa',
    name_placeholder: 'Wprowadź nazwę webhooka',
    endpoint_url: 'URL punktu końcowego',
    endpoint_url_placeholder: 'https://twoj.webhook.endpoint.url',
    endpoint_url_tip:
      'Wprowadź adres URL końcowego, na który zostanie wysłany ładunek webhooka, gdy wystąpi zdarzenie.',
    create_webhook: 'Utwórz webhook',
    missing_event_error: 'Musisz wybrać przynajmniej jedno zdarzenie.',
    https_format_error: 'Wymagany format HTTPS ze względu na bezpieczeństwo.',
  },
  webhook_created: 'Webhook {{name}} został pomyślnie utworzony.',
};

export default webhooks;
