const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle:
    'Crea webhooks para recibir de manera fácil actualizaciones en tiempo real sobre eventos específicos.',
  create: 'Crear Webhook',
  schemas: {
    interaction: 'Interacción de usuario',
    user: 'Usuario',
    organization: 'Organización',
    role: 'Rol',
    scope: 'Permiso',
    organization_role: 'Rol de organización',
    organization_scope: 'Permiso de organización',
  },
  table: {
    name: 'Nombre',
    events: 'Eventos',
    success_rate: 'Tasa de éxito (24 h)',
    requests: 'Solicitudes (24 h)',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'Crea un webhook para recibir actualizaciones en tiempo real a través de solicitudes POST a tu URL de punto final. Mantente informado y toma medidas inmediatas en eventos como "Crear cuenta", "Iniciar sesión" y "Restablecer contraseña".',
    create_webhook: 'Crear Webhook',
  },
  create_form: {
    title: 'Crear Webhook',
    subtitle:
      'Agregue el Webhook para enviar una solicitud POST a la URL de punto final con detalles de cualquier evento de usuario.',
    events: 'Eventos',
    events_description:
      'Seleccione los eventos desencadenantes que Logto enviará la solicitud POST.',
    name: 'Nombre',
    name_placeholder: 'Ingrese el nombre del webhook',
    endpoint_url: 'URL de punto final',
    endpoint_url_placeholder: 'https://su.webhook.endpoint.url',
    endpoint_url_tip:
      'Ingrese la URL de su punto final a donde se envía la carga útil del webhook cuando ocurre el evento.',
    create_webhook: 'Crear webhook',
    missing_event_error: 'Debe seleccionar al menos un evento.',
  },
  webhook_created: 'El webhook {{name}} se ha creado correctamente.',
};

export default Object.freeze(webhooks);
