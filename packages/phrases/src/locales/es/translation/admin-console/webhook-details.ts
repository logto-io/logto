const webhook_details = {
  page_title: 'Detalles de Webhook',
  back_to_webhooks: 'Volver a Webhooks',
  not_in_use: 'No se está usando',
  success_rate: 'Tasa de éxito: {{value, number}}',
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
  recent_requests_tab: 'Solicitudes recientes',
  settings: {
    settings: 'Configuración',
    settings_description:
      'Los webhooks le permiten recibir actualizaciones en tiempo real sobre eventos específicos, enviando una solicitud POST a la URL de su extremo. Esto le permite tomar medidas inmediatas en función de la nueva información recibida.',
    events: 'Eventos',
    events_description:
      'Seleccione los eventos desencadenantes que Logto enviará como solicitud POST.',
    name: 'Nombre',
    endpoint_url: 'URL del Extremo',
    endpoint_url_tip:
      'Ingrese la URL HTTPS de su endpoint a la que se enviará el payload del webhook cuando ocurra el evento.',
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
    test: 'Prueba',
    test_webhook: 'Probar su webhook',
    test_webhook_description:
      'Por favor, termine de configurar el webhook anterior. Haga clic en el botón de prueba, y enviaremos ejemplos de carga útil individuales de cada evento seleccionado a la URL de su extremo. Esto le permitirá verificar que su extremo está recibiendo y procesando correctamente las cargas útiles.',
    send_test_payload: 'Enviar carga útil de prueba',
    test_payload_sent: 'La carga útil se ha enviado con éxito!',
  },
};

export default webhook_details;
