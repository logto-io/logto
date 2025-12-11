const security = {
  page_title: 'Seguridad',
  title: 'Seguridad',
  subtitle: 'Configura una protección avanzada contra ataques sofisticados.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Política de contraseña',
    blocklist: 'Lista de bloqueados',
    general: 'General',
  },
  bot_protection: {
    title: 'Protección contra bots',
    description:
      'Habilita el CAPTCHA para registrarse, iniciar sesión y recuperar la contraseña para bloquear amenazas automatizadas.',
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'Selecciona un proveedor de CAPTCHA y configura la integración.',
      add: 'Agregar CAPTCHA',
    },
    settings: 'Configuraciones',
    enable_captcha: 'Habilitar CAPTCHA',
    enable_captcha_description:
      'Habilita la verificación CAPTCHA para los procesos de registro, inicio de sesión y recuperación de contraseña.',
  },
  create_captcha: {
    setup_captcha: 'Configurar CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'La solución CAPTCHA de nivel empresarial de Google, que proporciona detección avanzada de amenazas y análisis de seguridad detallados para proteger tu sitio web contra actividades fraudulentas.',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'La alternativa inteligente de CAPTCHA de Cloudflare que proporciona protección contra bots no intrusiva mientras garantiza una experiencia de usuario fluida sin acertijos visuales.',
    },
  },
  captcha_details: {
    back_to_security: 'Volver a seguridad',
    page_title: 'Detalles de CAPTCHA',
    check_readme: 'Ver README',
    options_change_captcha: 'Cambiar proveedor de CAPTCHA',
    connection: 'Conexión',
    description: 'Configura tus conexiones de captcha.',
    site_key: 'Clave del sitio',
    secret_key: 'Clave secreta',
    project_id: 'ID del proyecto',
    domain: 'Dominio (opcional)',
    domain_placeholder: 'www.google.com (predeterminado) o recaptcha.net',
    recaptcha_key_id: 'ID de la clave reCAPTCHA',
    recaptcha_api_key: 'Clave API del proyecto',
    deletion_description: '¿Estás seguro de que quieres eliminar este proveedor de CAPTCHA?',
    captcha_deleted: 'Proveedor de CAPTCHA eliminado con éxito',
    setup_captcha: 'Configurar CAPTCHA',
    mode: 'Modo de verificación',
    mode_invisible: 'Invisible',
    mode_checkbox: 'Casilla de verificación',
    mode_notice:
      'El modo de verificación se define en la configuración de tu clave reCAPTCHA en Google Cloud Console. Cambiar el modo aquí requiere un tipo de clave coincidente.',
  },
  password_policy: {
    password_requirements: 'Requisitos de contraseña',
    password_requirements_description:
      'Mejora los requisitos de contraseña para defenderse contra ataques de relleno de credenciales y contraseñas débiles.',
    minimum_length: 'Longitud mínima',
    minimum_length_description:
      'NIST sugiere usar <a>al menos 8 caracteres</a> para productos web.',
    minimum_length_error: 'La longitud mínima debe estar entre {{min}} y {{max}} (inclusive).',
    minimum_required_char_types: 'Tipos de caracteres requeridos mínimos',
    minimum_required_char_types_description:
      'Tipos de caracteres: mayúsculas (A-Z), minúsculas (a-z), números (0-9) y símbolos especiales ({{symbols}}).',
    password_rejection: 'Rechazo de contraseña',
    compromised_passwords: 'Contraseñas comprometidas',
    breached_passwords: 'Contraseñas vulneradas',
    breached_passwords_description:
      'Rechazar contraseñas encontradas previamente en bases de datos de vulnerabilidad.',
    restricted_phrases: 'Restringir frases de baja seguridad',
    restricted_phrases_tooltip:
      'Su contraseña debe evitar estas frases a menos que combine con 3 o más caracteres adicionales.',
    repetitive_or_sequential_characters: 'Caracteres repetitivos o secuenciales',
    repetitive_or_sequential_characters_description: 'Por ejemplo, "AAAA", "1234" y "abcd".',
    user_information: 'Información de usuario',
    user_information_description:
      'Por ejemplo, dirección de correo electrónico, número de teléfono, nombre de usuario, etc.',
    custom_words: 'Palabras personalizadas',
    custom_words_description:
      'Personaliza las palabras específicas del contexto, sin importar las mayúsculas y minúsculas, y una por línea.',
    custom_words_placeholder: 'Nombre de su servicio, nombre de la empresa, etc.',
  },
  sentinel_policy: {
    card_title: 'Bloqueo de identificador',
    card_description:
      'El bloqueo está disponible para todos los usuarios con la configuración predeterminada, pero puedes personalizarlo para tener más control.\n\nBloquea temporalmente un identificador después de múltiples intentos fallidos de autenticación (por ejemplo, contraseña o código de verificación incorrecto consecutivos) para evitar el acceso por fuerza bruta.',
    enable_sentinel_policy: {
      title: 'Personalizar experiencia de bloqueo',
      description:
        'Permitir la personalización de los intentos de inicio de sesión fallidos máximos antes del bloqueo, la duración del bloqueo y el desbloqueo manual inmediato.',
    },
    max_attempts: {
      title: 'Máximos intentos fallidos',
      description:
        'Bloquea temporalmente un identificador después de alcanzar el número máximo de intentos fallidos de inicio de sesión en una hora.',
      error_message: 'Los máximos intentos fallidos deben ser mayores que 0.',
    },
    lockout_duration: {
      title: 'Duración del bloqueo (minutos)',
      description:
        'Bloquear inicios de sesión por un periodo después de exceder el límite de intentos fallidos.',
      error_message: 'La duración del bloqueo debe ser al menos de 1 minuto.',
    },
    manual_unlock: {
      title: 'Desbloqueo manual',
      description:
        'Desbloquear usuarios inmediatamente confirmando su identidad e ingresando su identificador.',
      unblock_by_identifiers: 'Desbloquear por identificador',
      modal_description_1:
        'Un identificador se bloqueó temporalmente debido a múltiples intentos de inicio/registro fallidos. Para proteger la seguridad, el acceso se restaurará automáticamente después de la duración del bloqueo.',
      modal_description_2:
        ' Solo desbloquear manualmente si has confirmado la identidad del usuario y asegurado que no hubo intentos de acceso no autorizados.',
      placeholder:
        'Ingresa identificadores (correo electrónico / número de teléfono / nombre de usuario)',
      confirm_button_text: 'Desbloquear ahora',
      success_toast: 'Desbloqueado con éxito',
      duplicate_identifier_error: 'Identificador ya agregado',
      empty_identifier_error: 'Por favor, ingresa al menos un identificador',
    },
  },
  blocklist: {
    card_title: 'Lista de bloqueo de correos electrónicos',
    card_description:
      'Toma el control de tu base de usuarios al bloquear direcciones de correo electrónico de alto riesgo o no deseadas.',
    disposable_email: {
      title: 'Bloquear direcciones de correo electrónico desechables',
      description:
        'Habilita el rechazo de cualquier intento de registro utilizando una dirección de correo desechable o de un solo uso, lo que puede prevenir el spam y mejorar la calidad del usuario.',
    },
    email_subaddressing: {
      title: 'Bloquear subdirecciones de correo electrónico',
      description:
        'Habilita el rechazo de cualquier intento de registro utilizando subdirecciones de correo electrónico con un signo más (+) y caracteres adicionales (por ejemplo, usuario+alias@foo.com).',
    },
    custom_email_address: {
      title: 'Bloquear direcciones de correo electrónico personalizadas',
      description:
        'Agrega dominios de correo específicos o direcciones de correo electrónico que no pueden registrarse o vincularse a través de la interfaz de usuario.',
      placeholder:
        'Ingresa la dirección de correo electrónico o dominio bloqueado (por ejemplo, bar@example.com, @example.com)',
      duplicate_error: 'La dirección de correo electrónico o el dominio ya fue agregado',
      invalid_format_error:
        'Debe ser una dirección de correo electrónico válida (bar@example.com) o un dominio (@example.com)',
    },
  },
};

export default Object.freeze(security);
