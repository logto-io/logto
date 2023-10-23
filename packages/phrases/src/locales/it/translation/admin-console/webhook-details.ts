const webhook_details = {
  page_title: 'Dettagli webhook',
  back_to_webhooks: 'Torna ai Webhook',
  not_in_use: 'Non in uso',
  success_rate: 'Tasso di successo',
  requests: '{{value, number}} richieste in 24h',
  disable_webhook: 'Disabilita webhook',
  disable_reminder:
    "Sei sicuro di voler riattivare questo webhook? Farlo non invierà una richiesta HTTP all'URL dell'endpoint.",
  webhook_disabled: 'Il webhook è stato disattivato.',
  webhook_reactivated: 'Il webhook è stato riattivato.',
  reactivate_webhook: 'Riattiva webhook',
  delete_webhook: 'Elimina webhook',
  deletion_reminder:
    "Stai rimuovendo questo webhook. Dopo la cancellazione non invierà una richiesta HTTP all'URL dell'endpoint.",
  deleted: 'Il webhook è stato eliminato con successo.',
  settings_tab: 'Impostazioni',
  recent_requests_tab: 'Richieste recenti (24h)',
  settings: {
    settings: 'Impostazioni',
    settings_description:
      "I webhook ti consentono di ricevere aggiornamenti in tempo reale su eventi specifici non appena avvengono, inviando una richiesta POST all'URL dell'endpoint. Ciò ti consente di agire immediatamente in base alle nuove informazioni ricevute.",
    events: 'Eventi',
    events_description: 'Seleziona gli eventi trigger che Logto invierà la richiesta POST.',
    name: 'Nome',
    endpoint_url: 'Endpoint URL',
    signing_key: 'Chiave di firma',
    signing_key_tip:
      "Aggiungi la chiave segreta fornita da Logto al tuo endpoint come header richiesta per garantire l'autenticità del payload del webhook.",
    regenerate: 'Rigenera',
    regenerate_key_title: 'Rigenera chiave di firma',
    regenerate_key_reminder:
      'Sei sicuro di voler modificare la chiave di firma? Rigenerandola avrà immediatamente effetto. Ricorda di modificare in modo sincrono la chiave di firma nel tuo endpoint.',
    regenerated: 'La chiave di firma è stata rigenerata.',
    custom_headers: 'Intestazioni personalizzate',
    custom_headers_tip:
      "Opzionalmente, puoi aggiungere intestazioni personalizzate al payload del webhook per fornire contesto o metadati aggiuntivi sull'evento.",
    key_duplicated_error: 'Le chiavi non possono essere ripetute.',
    key_missing_error: 'La chiave è necessaria.',
    value_missing_error: 'Il valore è obbligatorio.',
    invalid_key_error: 'Chiave non valida',
    invalid_value_error: 'Valore non valido',
    test: 'Test',
    test_webhook: 'Testa il tuo webhook',
    test_webhook_description:
      'Configurare il webhook e testarlo con esempi di payload per ciascun evento selezionato al fine di verificare la corretta ricezione e elaborazione.',
    send_test_payload: 'Invia Payload di Test',
    test_result: {
      endpoint_url: 'URL del punto di arrivo: {{url}}',
      message: 'Messaggio: {{message}}',
      response_status: 'Stato della risposta: {{status, number}}',
      response_body: 'Corpo della risposta: {{body}}',
      request_time: 'Tempo di richiesta: {{time}}',
      test_success: 'Il test del webhook al punto di arrivo è stato eseguito con successo.',
    },
  },
};

export default Object.freeze(webhook_details);
