const detalles_conector = {
  back_to_connectors: 'Volver a conectores',
  check_readme: 'Ver el archivo README',
  settings: 'Configuraciones generales',
  settings_description:
    'Los conectores desempeñan un papel fundamental en Logto. Con su ayuda, Logto permite que los usuarios finales utilicen el registro o inicio de sesión sin contraseña y las capacidades para iniciar sesión con cuentas sociales.',
  parameter_configuration: 'Configuración de parámetros',
  test_connection: 'Probar conexión',
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
};

export default detalles_conector;
