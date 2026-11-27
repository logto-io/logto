const hook = {
  missing_events: 'Necesita proporcionar al menos un evento.',
  send_test_payload_failed: 'Error al enviar carga útil de prueba: {{message}}',
  endpoint_responded_with_error: 'El punto de enlace respondió con un error.',
  disabled: 'El hook está deshabilitado y no puede reenviar eventos.',
  log_not_permanently_failed:
    'Solo se pueden reenviar las entregas de webhook que hayan fallado de forma permanente.',
  invalid_log_payload:
    'La entrada del registro del webhook no contiene una carga de solicitud válida para reenviar.',
  redelivery_in_progress: 'Ya hay una entrega o un reenvío en curso para este evento de webhook.',
};

export default Object.freeze(hook);
