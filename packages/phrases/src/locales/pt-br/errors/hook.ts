const hook = {
  missing_events: 'Você precisa fornecer pelo menos um evento.',
  send_test_payload_failed: 'Falha ao enviar uma carga de teste: {{message}}',
  endpoint_responded_with_error: 'O ponto de extremidade respondeu com erro.',
  disabled: 'O hook está desabilitado e não pode reenviar eventos.',
  log_not_permanently_failed:
    'Apenas entregas de webhook que falharam permanentemente podem ser reenviadas.',
  invalid_log_payload:
    'A entrada de registro do webhook não contém uma carga de solicitação válida para reenvio.',
  redelivery_in_progress:
    'Já existe uma entrega ou reenvio em andamento para este evento de webhook.',
};

export default Object.freeze(hook);
