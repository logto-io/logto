const password_policy = {
  password_requirements: 'Requisitos de contraseña',
  minimum_length: 'Longitud mínima',
  minimum_length_description: 'NIST sugiere usar <a>al menos 8 caracteres</a> para productos web.',
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
};

const security = {
  page_title: 'Seguridad',
  title: 'Seguridad',
  subtitle: 'Configura una protección avanzada contra ataques sofisticados.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Política de contraseña',
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
    captcha_required_flows: 'Flujos requeridos por CAPTCHA',
    sign_up: 'Registrarse',
    sign_in: 'Iniciar sesión',
    forgot_password: 'Olvidé mi contraseña',
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
    deletion_description: '¿Estás seguro de que quieres eliminar este proveedor de CAPTCHA?',
    captcha_deleted: 'Proveedor de CAPTCHA eliminado con éxito',
    setup_captcha: 'Configurar CAPTCHA',
  },
  password_policy,
};

export default Object.freeze(security);
