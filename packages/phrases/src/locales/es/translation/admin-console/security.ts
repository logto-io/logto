const security = {
  page_title: 'Seguridad',
  title: 'Seguridad',
  subtitle: 'Configura una protección avanzada contra ataques sofisticados.',
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
};

export default Object.freeze(security);
