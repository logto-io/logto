const webhooks = {
  page_title: 'Wejścia',
  title: 'Webhooki',
  subtitle:
    'Utwórz webhooki, aby bez wysiłku otrzymywać aktualizacje w czasie rzeczywistym dotyczące określonych zdarzeń.',
  create: 'Utwórz webhook',
  schemas: {
    interaction: 'Interakcja użytkownika',
    user: 'Użytkownik',
    organization: 'Organizacja',
    role: 'Rola',
    scope: 'Uprawnienie',
    organization_role: 'Rola w organizacji',
    organization_scope: 'Uprawnienie w organizacji',
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
      'Utwórz webhook, aby otrzymywać aktualizacje w czasie rzeczywistym za pomocą żądań POST na adres URL punktu końcowego. Bądź informowany i podejmuj natychmiastowe działania w przypadku zdarzeń takich jak "Utwórz konto", "Zaloguj się" i "Zresetuj hasło".',
    create_webhook: 'Utwórz webhook',
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
      'Wprowadź adres URL punktu końcowego, do którego wysyłane będzie obciążenie webhooka, gdy wydarzenie ma miejsce.',
    create_webhook: 'Utwórz webhook',
    missing_event_error: 'Musisz wybrać przynajmniej jedno zdarzenie.',
  },
  webhook_created: 'Webhook {{name}} został pomyślnie utworzony.',
};

export default Object.freeze(webhooks);
