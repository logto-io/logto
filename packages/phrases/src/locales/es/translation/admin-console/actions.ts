const actions = {
  page_title: 'Actions',
  title: 'Actions',
  subtitle:
    'Ejecuta código personalizado en puntos específicos del flujo de autenticación para ampliar el comportamiento de Logto.',
  status: {
    not_configured: 'Sin configurar',
    configured: 'Configurado',
    enabled: 'Habilitado',
    disabled: 'Deshabilitado',
  },
  types: {
    post_first_factor_verification: {
      name: 'Después de verificar el primer factor',
      description:
        'Ejecuta lógica personalizada después de verificar el primer factor de autenticación y antes de continuar con el inicio de sesión.',
    },
    post_sign_in: {
      name: 'Después de iniciar sesión',
      description:
        'Ejecuta lógica personalizada después de que un usuario inicie sesión correctamente.',
    },
  },
  data_source_tab: 'Fuente de datos',
  test_tab: 'Contexto de prueba',
  settings_tab: 'Ajustes',
  event_data: {
    title: 'Carga útil del evento',
    subtitle: 'Usa el parámetro de entrada `event` para los datos del evento de autenticación.',
  },
  result_data: {
    title: 'Resultado de la acción',
    subtitle: 'Devuelve un objeto de resultado que Logto entienda para este tipo de acción.',
  },
  environment_variables: {
    title: 'Definir variables de entorno',
    subtitle: 'Usa variables de entorno para almacenar información sensible.',
    input_field_title: 'Añadir variables de entorno',
    sample_code: 'Acceso a variables de entorno en el controlador de la acción. Ejemplo:',
  },
  fetch_external_data: {
    title: 'Obtener datos externos',
    subtitle: 'Llama a APIs externas desde tu script de acción.',
    description:
      'Usa la función `fetch` para llamar a tus APIs externas e incluir los datos en el resultado de la acción. Ejemplo:',
  },
  settings: {
    title: 'Ajustes',
    subtitle:
      'Controla si la acción está activa y cómo se gestionan los errores en tiempo de ejecución.',
    enabled: {
      title: 'Habilitar acción',
      description: 'Ejecuta este script cuando se active el evento de autenticación.',
    },
    on_execution_error: {
      title: 'Si el script falla',
      description:
        'Elige cómo debe comportarse Logto cuando el script falle en tiempo de ejecución.',
      block: 'Bloquear el flujo de autenticación',
      allow: 'Permitir que el flujo de autenticación continúe',
      post_first_factor_description:
        'Cuando este script falla, Logto siempre rechaza las credenciales no válidas para que no se pueda omitir la verificación de la contraseña.',
    },
  },
  test_context: {
    subtitle: 'Ajusta la carga útil del evento simulado usada al ejecutar pruebas.',
    input_field_title: 'JSON de ejemplo del evento',
  },
  script: {
    title: 'Script',
    restore: 'Restaurar valores predeterminados',
    restored: 'Restaurado',
  },
  tester: {
    run_button: 'Ejecutar prueba',
    result_title: 'Resultado de la prueba',
  },
  form_error: {
    invalid_json: 'Formato JSON no válido',
  },
  security_warning: {
    title: 'Advertencia de seguridad',
    description:
      'Los usuarios aprovisionados por esta acción omiten las protecciones exclusivas del registro, incluida la lista de bloqueo de correo electrónico, el dominio solo SSO, el modo de registro deshabilitado y las comprobaciones de perfil obligatorio del registro. Las escrituras de perfil y contraseña de usuarios existentes también ocurren antes de que se complete la MFA.',
  },
  delete_modal_title: 'Eliminar acción',
  delete_modal_content:
    '¿Seguro que quieres eliminar esta acción? El flujo de autenticación ya no ejecutará este script.',
  deleted: 'Acción eliminada',
  created: 'Acción creada',
  saved: 'Acción guardada',
};

export default Object.freeze(actions);
