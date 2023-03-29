const others = {
  terms_of_use: {
    title: 'TÉRMINOS',
    terms_of_use: 'URL de términos de uso',
    terms_of_use_placeholder: 'https://tus.terminos.de.uso/',
    privacy_policy: 'URL de política de privacidad',
    privacy_policy_placeholder: 'https://tu.politica.de.privacidad/',
  },
  languages: {
    title: 'IDIOMAS',
    enable_auto_detect: 'Habilitar la detección automática',
    description:
      'Tu software detecta la configuración regional del usuario y cambia al idioma local. Puedes agregar nuevos idiomas traduciendo la IU del inglés a otro idioma.',
    manage_language: 'Administrar idioma',
    default_language: 'Idioma predeterminado',
    default_language_description_auto:
      'Se usará el idioma predeterminado cuando el idioma detectado del usuario no esté incluido en la biblioteca de idiomas actual.',
    default_language_description_fixed:
      'Cuando la detección automática está desactivada, el idioma predeterminado es el único idioma que se mostrará en tu software. Activa la detección automática para agregar idiomas.',
  },
  manage_language: {
    title: 'Administrar idioma',
    subtitle:
      'Localiza la experiencia del producto agregando idiomas y traducciones. Tu contribución se puede establecer como el idioma predeterminado.',
    add_language: 'Agregar idioma',
    logto_provided: 'Logto proporcionado',
    key: 'Llave',
    logto_source_values: 'Valores de origen de Logto',
    custom_values: 'Valores personalizados',
    clear_all_tip: 'Borrar todos los valores',
    unsaved_description: 'Los cambios no se guardarán si sales de esta página sin guardar.',
    deletion_tip: 'Borrar el idioma',
    deletion_title: '¿Deseas borrar el idioma agregado?',
    deletion_description:
      'Después de la eliminación, tus usuarios no podrán navegar en ese idioma de nuevo.',
    default_language_deletion_title: 'El idioma predeterminado no se puede borrar.',
    default_language_deletion_description:
      '{{idioma}} está establecido como tu idioma predeterminado y no se puede borrar.',
  },
  advanced_options: {
    title: 'OPCIONES AVANZADAS',
    enable_user_registration: 'Habilitar registro de usuario',
    enable_user_registration_description:
      'Habilita o deshabilita el registro de usuarios. Una vez deshabilitado, los usuarios aún pueden ser agregados en la consola de administración, pero los usuarios ya no pueden establecer cuentas a través de la UI de inicio de sesión.',
  },
};

export default others;
