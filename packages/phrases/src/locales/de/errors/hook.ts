const hook = {
  missing_events: 'Sie müssen mindestens ein Ereignis angeben.',
  send_test_payload_failed: 'Fehler beim Senden des Testpayloads: {{message}}',
  endpoint_responded_with_error: 'Endpunkt antwortete mit Fehler.',
  disabled: 'Der Hook ist deaktiviert und kann Ereignisse nicht erneut zustellen.',
  log_not_permanently_failed:
    'Nur dauerhaft fehlgeschlagene Webhook-Zustellungen können erneut zugestellt werden.',
  invalid_log_payload:
    'Der Webhook-Protokolleintrag enthält keine gültige Anfrage-Nutzlast für eine erneute Zustellung.',
  redelivery_in_progress:
    'Für dieses Webhook-Ereignis läuft bereits eine Zustellung oder erneute Zustellung.',
};

export default Object.freeze(hook);
