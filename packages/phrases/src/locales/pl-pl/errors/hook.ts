const hook = {
  missing_events: 'Musisz podać przynajmniej jedno zdarzenie.',
  send_test_payload_failed: 'Błąd podczas wysyłania testowego ładunku: {{message}}',
  endpoint_responded_with_error: 'Punkt końcowy odpowiedział błędem.',
  disabled: 'Hook jest wyłączony i nie może ponownie dostarczać zdarzeń.',
  log_not_permanently_failed:
    'Ponownie można dostarczyć tylko trwale nieudane dostarczenia webhooka.',
  invalid_log_payload:
    'Wpis dziennika webhooka nie zawiera prawidłowego ładunku żądania do ponownego dostarczenia.',
  redelivery_in_progress:
    'Dostarczanie lub ponowne dostarczanie dla tego zdarzenia webhooka jest już w toku.',
};

export default Object.freeze(hook);
