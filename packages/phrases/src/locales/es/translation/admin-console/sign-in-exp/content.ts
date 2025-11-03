const content = {
  terms_of_use: {
    title: 'TERMS',
    description: 'Añadir términos y privacidad para cumplir con los requisitos de cumplimiento.',
    terms_of_use: 'URL de los términos de uso',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: 'URL de la política de privacidad',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: 'Aceptar los términos',
    agree_policies: {
      automatic: 'Continuar aceptando los términos automáticamente',
      manual_registration_only:
        'Requerir acuerdo con la casilla de verificación solo en el registro',
      manual:
        'Requerir acuerdo con la casilla de verificación tanto en el registro como al iniciar sesión',
    },
  },
  languages: {
    title: 'IDIOMAS',
    enable_auto_detect: 'Activar detección automática',
    description:
      'Tu software detecta la configuración regional del usuario y cambia al idioma local. Puedes añadir nuevos idiomas traduciendo la interfaz del inglés a otro idioma.',
    manage_language: 'Gestionar idioma',
    default_language: 'Idioma predeterminado',
    default_language_description_auto:
      'El idioma predeterminado se usará cuando el idioma detectado del usuario no esté disponible en la biblioteca actual.',
    default_language_description_fixed:
      'Si la detección automática está desactivada, el idioma predeterminado es el único que mostrará tu software. Activa la detección automática para ampliar idiomas.',
  },
  support: {
    title: 'SOPORTE',
    subtitle:
      'Muestra tus canales de soporte en las páginas de error para la asistencia rápida a usuarios.',
    support_email: 'Correo electrónico de soporte',
    support_email_placeholder: 'support@email.com',
    support_website: 'Sitio web de soporte',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: 'Gestionar idioma',
    subtitle:
      'Localiza la experiencia del producto añadiendo idiomas y traducciones. Tu contribución se puede establecer como idioma predeterminado.',
    add_language: 'Añadir idioma',
    logto_provided: 'Proporcionado por Logto',
    key: 'Clave',
    logto_source_values: 'Valores de origen de Logto',
    custom_values: 'Valores personalizados',
    clear_all_tip: 'Borrar todos los valores',
    unsaved_description: 'Los cambios no se guardarán si sales de esta página sin guardar.',
    deletion_tip: 'Eliminar el idioma',
    deletion_title: '¿Quieres eliminar el idioma añadido?',
    deletion_description: 'Tras eliminarlo, tus usuarios no podrán volver a navegar en ese idioma.',
    default_language_deletion_title: 'No se puede eliminar el idioma predeterminado.',
    default_language_deletion_description:
      '{{language}} está establecido como tu idioma predeterminado y no se puede eliminar.',
  },
};

export default Object.freeze(content);
