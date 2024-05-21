const protected_app = {
  name: 'Aplicación Protegida',
  title: 'Crea una Aplicación Protegida: Agrega autenticación con simplicidad y velocidad épica',
  description:
    'Aplicación Protegida mantiene las sesiones de usuario de forma segura y redirige las peticiones de tu aplicación. Potenciado por Cloudflare Workers, disfruta del rendimiento de primera clase y 0ms de arranque en frío en todo el mundo. <a>Aprende más</a>',
  fast_create: 'Creación rápida',
  modal_title: 'Crear Aplicación Protegida',
  modal_subtitle:
    'Habilita protección segura y rápida con solo unos clics. Agrega autenticación a tu aplicación web existente con facilidad.',
  form: {
    url_field_label: 'La URL de origen',
    url_field_placeholder: 'https://dominio.com/',
    url_field_description:
      'Proporciona la dirección de tu aplicación que requiere protección de autenticación.',
    url_field_modification_notice:
      'Las modificaciones en la URL de origen pueden tardar de 1 a 2 minutos en ser efectivas en todas las ubicaciones de la red mundial.',
    url_field_tooltip:
      "Proporciona la dirección de tu aplicación, excluyendo '/ruta'. Después de la creación, puedes personalizar las reglas de autenticación en la ruta.\n\nNota: La URL de origen en sí no necesita autenticación; la protección se aplica exclusivamente a los accesos a través del dominio de la aplicación designada.",
    domain_field_label: 'Dominio de la aplicación',
    domain_field_placeholder: 'tu-dominio',
    domain_field_description:
      'Esta URL sirve como un proxy de protección de autenticación para la URL original. Se puede aplicar un dominio personalizado después de la creación.',
    domain_field_description_short:
      'Esta URL sirve como un proxy de protección de autenticación para la URL original.',
    domain_field_tooltip:
      "Las aplicaciones protegidas por Logto se alojarán en 'tu-dominio.{{dominio}}' de forma predeterminada. Se puede aplicar un dominio personalizado después de la creación.",
    create_application: 'Crear aplicación',
    create_protected_app: 'Creación rápida',
    errors: {
      domain_required: 'Se requiere tu dominio.',
      domain_in_use: 'Este nombre de subdominio ya está en uso.',
      invalid_domain_format:
        "Formato de subdominio no válido: usa solo letras minúsculas, números y guiones '-'.",
      url_required: 'La URL de origen es requerida.',
      invalid_url:
        "Formato de URL de origen no válido: Usar http:// o https://. Nota: '/ruta' no es compatible actualmente.",
      localhost:
        'Por favor, expone tu servidor local a internet primero. Aprende más sobre el <a>desarrollo local</a>.',
    },
  },
  success_message:
    '🎉 ¡La autenticación de la aplicación se ha habilitado con éxito! Explora la nueva experiencia de tu sitio web.',
};

export default Object.freeze(protected_app);
