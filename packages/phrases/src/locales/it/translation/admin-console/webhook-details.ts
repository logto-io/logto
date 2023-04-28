const webhook_details = {
  page_title: 'Dettagli webhook',
  back_to_webhooks: 'Torna ai Webhook',
  not_in_use: 'Non in uso',
  success_rate: 'Tasso di successo {{value,number}}',
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
  recent_requests_tab: 'Richieste recenti',
  settings: {
    settings: 'Impostazioni',
    settings_description:
      "I webhook ti consentono di ricevere aggiornamenti in tempo reale su eventi specifici non appena avvengono, inviando una richiesta POST all'URL dell'endpoint. Ciò ti consente di agire immediatamente in base alle nuove informazioni ricevute.",
    events: 'Eventi',
    events_description: 'Seleziona gli eventi trigger che Logto invierà la richiesta POST.',
    name: 'Nome',
    endpoint_url: 'Endpoint URL',
    endpoint_url_tip:
      "Inserisci l'URL HTTPS del tuo endpoint dove viene inviato il payload del webhook quando il evento si verifica.",
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
    test: 'Test',
    test_webhook: 'Testa il tuo webhook',
    test_webhook_description:
      "Si prega di completare la configurazione del webhook sopra. Fai clic sul pulsante di test e invieremo esempi di payload individuali di ogni evento selezionato all'URL del tuo endpoint. Questo ti consentirà di verificare che il tuo endpoint riceva e elabori correttamente i payload.",
    send_test_payload: 'Invia Payload di Test',
    test_payload_sent: 'Il payload è stato inviato con successo!',
  },
};

export default webhook_details;
