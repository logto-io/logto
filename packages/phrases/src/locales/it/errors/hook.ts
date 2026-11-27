const hook = {
  missing_events: 'È necessario fornire almeno un evento.',
  send_test_payload_failed: 'Impossibile inviare il payload di prova: {{message}}',
  endpoint_responded_with_error: 'Il punto di accesso ha risposto con un errore.',
  disabled: "L'hook è disabilitato e non può riconsegnare gli eventi.",
  log_not_permanently_failed:
    'È possibile riconsegnare solo gli invii webhook falliti in modo permanente.',
  invalid_log_payload:
    'La voce del registro webhook non contiene un payload di richiesta valido da riconsegnare.',
  redelivery_in_progress: 'Una consegna o riconsegna per questo evento webhook è già in corso.',
};

export default Object.freeze(hook);
