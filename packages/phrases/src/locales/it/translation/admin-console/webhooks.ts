const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle:
    "I Webhooks forniscono aggiornamenti in tempo reale su eventi specifici all'URL del tuo endpoint, consentendo reazioni immediate.",
  create: 'Crea Webhook',
  events: {
    post_register: 'Crea nuovo account',
    post_sign_in: 'Accedi',
    post_reset_password: 'Reimposta password',
  },
  table: {
    name: 'Nome',
    events: 'Eventi',
    success_rate: 'Tasso di successo (24h)',
    requests: 'Richieste (24h)',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'I Webhooks forniscono aggiornamenti in tempo reale su eventi specifici all\'URL del tuo endpoint, consentendo reazioni immediate. I seguenti eventi "Crea nuovo account, Accedi, Reimposta password" sono ora supportati.',
    create_webhook: 'Crea Webhook',
  },
  create_form: {
    title: 'Crea Webhook',
    subtitle:
      "Aggiungi il Webhook per inviare una richiesta POST all'endpoint URL con i dettagli degli eventi degli utenti.",
    events: 'Eventi',
    events_description: 'Selezionare gli eventi trigger che Logto invierà alla richiesta POST.',
    name: 'Nome',
    name_placeholder: 'Inserisci nome webhook',
    endpoint_url: 'Endpoint URL',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip:
      "Inserisci l'URL HTTPS del tuo endpoint dove il payload di un webhook viene inviato quando si verifica l'evento.",
    create_webhook: 'Crea webhook',
    missing_event_error: 'Devi selezionare almeno un evento.',
    https_format_error: 'Richiesto formato HTTPS per motivi di sicurezza.',
    block_description:
      "La versione corrente supporta solo fino a tre webhook. Se hai bisogno di ulteriori webhook, ti preghiamo di inviare un'email al nostro team di supporto su <a>{{link}}</a> e saremo lieti di assisterti.",
  },
  webhook_created: 'Il webhook {{name}} è stato creato con successo.',
};

export default webhooks;
