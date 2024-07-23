const connector_details = {
  page_title: 'Detalles del conector',
  back_to_connectors: 'Volver a conectores',
  check_readme: 'Ver el archivo README',
  settings: 'Configuraciones generales',
  settings_description:
    'Los conectores desempeñan un papel fundamental en Logto. Con su ayuda, Logto permite que los usuarios finales utilicen el registro o inicio de sesión sin contraseña y las capacidades para iniciar sesión con cuentas sociales.',
  parameter_configuration: 'Configuración de parámetros',
  test_connection: 'Prueba',
  save_error_empty_config: 'Por favor, ingrese la configuración',
  send: 'Enviar',
  send_error_invalid_format: 'Entrada no válida',
  edit_config_label: 'Ingrese su JSON aquí',
  test_email_sender: 'Probar su conector de correo electrónico',
  test_sms_sender: 'Probar su conector de SMS',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+1 555-123-4567',
  test_message_sent: 'Mensaje de prueba enviado',
  test_sender_description:
    'Logto utiliza la plantilla "Generic" para realizar pruebas. Recibirá un mensaje si su conector está configurado correctamente.',
  options_change_email: 'Cambiar conector de correo electrónico',
  options_change_sms: 'Cambiar conector de SMS',
  connector_deleted: 'El conector ha sido eliminado con éxito',
  type_email: 'Conector de correo electrónico',
  type_sms: 'Conector de SMS',
  type_social: 'Conector social',
  in_used_social_deletion_description:
    'Este conector se utiliza en su experiencia de inicio de sesión. Al eliminarlo, la experiencia de inicio de sesión de <name/> se eliminará en la configuración de la experiencia de inicio de sesión. Deberá reconfigurarlo si decide agregarlo nuevamente.',
  in_used_passwordless_deletion_description:
    'Este {{name}} se utiliza en su experiencia de inicio de sesión. Al eliminarlo, su experiencia de inicio de sesión no funcionará correctamente hasta que resuelva el conflicto. Deberá reconfigurarlo si decide agregarlo nuevamente.',
  deletion_description:
    'Está eliminando este conector. No se puede deshacer, y deberá reconfigurarlo si decide agregarlo nuevamente.',
  logto_email: {
    total_email_sent: 'Total de correos electrónicos enviados: {{value, number}}',
    total_email_sent_tip:
      'Logto utiliza SendGrid para correo electrónico integrado seguro y estable. Es completamente gratuito de usar. <a>Más información</a>',
    email_template_title: 'Plantilla de correo electrónico',
    template_description:
      'El correo electrónico integrado utiliza plantillas predeterminadas para la entrega sin problemas de correos electrónicos de verificación. No se requiere configuración, y puede personalizar la información básica de la marca.',
    template_description_link_text: 'Ver plantillas',
    description_action_text: 'Ver plantillas',
    from_email_field: 'Correo electrónico de origen',
    sender_name_field: 'Nombre del remitente',
    sender_name_tip:
      'Personalice el nombre del remitente para los correos electrónicos. Si se deja en blanco, se utilizará "Verification" como nombre predeterminado.',
    sender_name_placeholder: 'Su nombre de remitente',
    company_information_field: 'Información de la empresa',
    company_information_description:
      'Muestre el nombre de su empresa, dirección o código postal en la parte inferior de los correos electrónicos para mejorar la autenticidad.',
    company_information_placeholder: 'Información básica de su empresa',
    email_logo_field: 'Logo del correo electrónico',
    email_logo_tip:
      'Muestre el logotipo de su marca en la parte superior de los correos electrónicos. Use la misma imagen tanto para el modo claro como para el modo oscuro.',
    urls_not_allowed: 'Las URL no están permitidas',
    test_notes: 'Logto utiliza la plantilla "Generic" para realizar pruebas.',
  },
  google_one_tap: {
    title: 'Google One Tap',
    description:
      'Google One Tap es una forma segura y fácil para que los usuarios inicien sesión en tu sitio web.',
    enable_google_one_tap: 'Habilitar Google One Tap',
    enable_google_one_tap_description:
      'Habilita Google One Tap en tu experiencia de inicio de sesión: Permite que los usuarios se registren o inicien sesión rápidamente con su cuenta de Google si ya han iniciado sesión en su dispositivo.',
    configure_google_one_tap: 'Configurar Google One Tap',
    auto_select: 'Seleccionar credencial automáticamente si es posible',
    close_on_tap_outside: 'Cancelar el aviso si el usuario hace clic/toca fuera',
    itp_support: 'Habilitar <a>UX de One Tap mejorado en navegadores ITP</a>',
  },
};

export default Object.freeze(connector_details);
