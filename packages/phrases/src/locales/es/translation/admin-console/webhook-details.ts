const webhook_details = {
  page_title: 'Detalles de Webhook',
  back_to_webhooks: 'Volver a Webhooks',
  not_in_use: 'No se está usando',
  success_rate: 'Tasa de éxito',
  requests: 'Solicitudes en 24h: {{value, number}}',
  disable_webhook: 'Desactivar webhook',
  disable_reminder:
    '¿Está seguro de que desea reactivar este webhook? Al hacerlo, no se enviará ninguna solicitud HTTP a la URL de extremo.',
  webhook_disabled: 'El webhook se ha desactivado.',
  webhook_reactivated: 'El webhook ha sido reactivado.',
  reactivate_webhook: 'Reactivar webhook',
  delete_webhook: 'Eliminar webhook',
  deletion_reminder:
    'Está eliminando este webhook. Después de eliminarlo, no se enviará ninguna solicitud HTTP a la URL de extremo.',
  deleted: 'El webhook se ha eliminado correctamente.',
  settings_tab: 'Configuración',
  recent_requests_tab: 'Solicitudes recientes (24 h)',
  settings: {
    settings: 'Configuración',
    settings_description:
      'Los webhooks le permiten recibir actualizaciones en tiempo real sobre eventos específicos, enviando una solicitud POST a la URL de su extremo. Esto le permite tomar medidas inmediatas en función de la nueva información recibida.',
    events: 'Eventos',
    events_description:
      'Seleccione los eventos desencadenantes que Logto enviará como solicitud POST.',
    name: 'Nombre',
    endpoint_url: 'URL del Extremo',
    signing_key: 'Clave de firma',
    signing_key_tip:
      'Agregue la clave secreta proporcionada por Logto a su extremo como encabezado de solicitud para garantizar la autenticidad del payload del webhook.',
    regenerate: 'Regenerar',
    regenerate_key_title: 'Regenerar clave de firma',
    regenerate_key_reminder:
      '¿Está seguro de que desea modificar la clave de firma? Regenerar tendrá efecto de inmediato. Recuerde modificar la clave de firma de forma síncrona en su endpoint.',
    regenerated: 'La clave de firma ha sido regenerada.',
    custom_headers: 'Encabezados Personalizados',
    custom_headers_tip:
      'De manera opcional, puede agregar encabezados personalizados al payload del webhook para proporcionar más contexto o metadatos sobre el evento.',
    key_duplicated_error: 'Las claves no pueden repetirse.',
    key_missing_error: 'Se requiere clave.',
    value_missing_error: 'Se requiere valor.',
    invalid_key_error: 'La clave no es válida',
    invalid_value_error: 'El valor no es válido',
    test: 'Prueba',
    test_webhook: 'Probar su webhook',
    test_webhook_description:
      'Configure el webhook y pruébelo con ejemplos de carga útil para cada evento seleccionado para verificar la recepción y el procesamiento correcto.',
    send_test_payload: 'Enviar carga útil de prueba',
    test_result: {
      endpoint_url: 'URL del punto final: {{url}}',
      message: 'Mensaje: {{message}}',
      response_status: 'Estado de la respuesta: {{status, number}}',
      response_body: 'Cuerpo de la respuesta: {{body}}',
      request_time: 'Tiempo de solicitud: {{time}}',
      test_success: 'La prueba del webhook en el punto final fue exitosa.',
    },
  },
};

export default Object.freeze(webhook_details);
