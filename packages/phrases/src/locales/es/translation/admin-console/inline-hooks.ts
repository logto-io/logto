const inline_hooks = {
  page_title: 'Hooks inline',
  title: 'Hooks inline',
  subtitle:
    'Ejecuta código personalizado en puntos específicos del flujo de autenticación para ampliar el comportamiento de Logto.',
  details_page_title: '{{name}}',
  status: {
    not_configured: 'Sin configurar',
    configured: 'Configurado',
    enabled: 'Habilitado',
    disabled: 'Deshabilitado',
  },
  hooks: {
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
    title: 'Resultado del hook',
    subtitle: 'Devuelve un objeto de resultado que Logto entienda para este tipo de hook.',
  },
  environment_variables: {
    title: 'Definir variables de entorno',
    subtitle: 'Usa variables de entorno para almacenar información sensible.',
    input_field_title: 'Añadir variables de entorno',
    sample_code: 'Acceso a variables de entorno en el controlador del hook inline. Ejemplo:',
  },
  fetch_external_data: {
    title: 'Obtener datos externos',
    subtitle: 'Llama a APIs externas desde tu script de hook.',
    description:
      'Usa la función `fetch` para llamar a tus APIs externas e incluir los datos en el resultado del hook. Ejemplo:',
  },
  settings: {
    title: 'Ajustes',
    subtitle:
      'Controla si el hook está activo y cómo se gestionan los errores en tiempo de ejecución.',
    enabled: {
      title: 'Habilitar hook',
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
      'Los usuarios aprovisionados por este hook omiten las protecciones exclusivas del registro, incluida la lista de bloqueo de correo electrónico, el dominio solo SSO, el modo de registro deshabilitado y las comprobaciones de perfil obligatorio del registro. Las escrituras de perfil y contraseña de usuarios existentes también ocurren antes de que se complete la MFA.',
  },
  delete_modal_title: 'Eliminar hook inline',
  delete_modal_content:
    '¿Seguro que quieres eliminar este hook inline? El flujo de autenticación ya no ejecutará este script.',
  deleted: 'Hook inline eliminado',
  created: 'Hook inline creado',
  saved: 'Hook inline guardado',
};

export default Object.freeze(inline_hooks);
