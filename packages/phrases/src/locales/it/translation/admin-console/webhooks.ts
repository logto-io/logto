const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle:
    'Crea webhook per ricevere facilmente aggiornamenti in tempo reale relativi a eventi specifici.',
  create: 'Crea Webhook',
  schemas: {
    interaction: 'Interazione utente',
    user: 'Utente',
    organization: 'Organizzazione',
    role: 'Ruolo',
    scope: 'Permesso',
    organization_role: 'Ruolo organizzazione',
    organization_scope: 'Permesso organizzazione',
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
      'Crea un webhook per ricevere aggiornamenti in tempo reale tramite richieste POST al tuo URL di destinazione. Rimani informato e agisci immediatamente su eventi come "Creazione account", "Accesso" e "Reimposta password".',
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
      "Inserisci l'URL del tuo endpoint dove il payload del webhook viene inviato quando si verifica l'evento.",
    create_webhook: 'Crea webhook',
    missing_event_error: 'Devi selezionare almeno un evento.',
  },
  webhook_created: 'Il webhook {{name}} è stato creato con successo.',
};

export default Object.freeze(webhooks);
