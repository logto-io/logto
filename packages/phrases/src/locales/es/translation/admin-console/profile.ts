const profile = {
  page_title: 'Configuración de cuenta',
  title: 'Configuración de cuenta',
  description:
    'Cambie su configuración de cuenta y administre su información personal aquí para garantizar la seguridad de su cuenta.',
  settings: {
    title: 'AJUSTES DE PERFIL',
    profile_information: 'Información del perfil',
    avatar: 'Avatar',
    name: 'Nombre',
    username: 'Nombre de usuario',
  },
  link_account: {
    title: 'ENLAZAR CUENTA',
    email_sign_in: 'Inicio de sesión por correo electrónico',
    email: 'Correo electrónico',
    social_sign_in: 'Inicio de sesión social',
    link_email: 'Vincular correo electrónico',
    link_email_subtitle:
      'Vincule su correo electrónico para iniciar sesión o ayudar con la recuperación de la cuenta.',
    email_required: 'Se requiere correo electrónico',
    invalid_email: 'Dirección de correo electrónico no válida',
    identical_email_address:
      'La dirección de correo electrónico de entrada es idéntica a la actual',
    anonymous: 'Anónimo',
  },
  password: {
    title: 'CONTRASEÑA Y SEGURIDAD',
    password: 'Contraseña',
    password_setting: 'Configuración de contraseña',
    new_password: 'Nueva contraseña',
    confirm_password: 'Confirmar contraseña',
    enter_password: 'Ingrese la contraseña actual',
    enter_password_subtitle:
      'Verifica que eres tú para proteger la seguridad de tu cuenta. Por favor, ingresa tu contraseña actual antes de cambiarla.',
    set_password: 'Establecer contraseña',
    verify_via_password: 'Verificar mediante contraseña',
    show_password: 'Mostrar contraseña',
    required: 'Se requiere contraseña',
    do_not_match: 'Las contraseñas no coinciden. Inténtelo de nuevo.',
  },
  code: {
    enter_verification_code: 'Ingrese el código de verificación',
    enter_verification_code_subtitle:
      'El código de verificación se ha enviado a <strong>{{target}}</strong>',
    verify_via_code: 'Verificar mediante el código de verificación',
    resend: 'Reenviar código de verificación',
    resend_countdown: 'Reenviar en {{countdown}} segundos',
  },
  delete_account: {
    title: 'ELIMINAR CUENTA',
    label: 'Eliminar cuenta',
    description:
      'La eliminación de su cuenta eliminará toda su información personal, datos de usuario y configuración. Esta acción no se puede deshacer.',
    button: 'Eliminar cuenta',
    p: {
      has_issue:
        'Lamentamos escuchar que deseas eliminar tu cuenta. Antes de poder eliminar tu cuenta, necesitas resolver los siguientes problemas.',
      after_resolved:
        'Una vez que hayas resuelto los problemas, podrás eliminar tu cuenta. No dudes en contactarnos si necesitas ayuda.',
      check_information:
        'Lamentamos escuchar que deseas eliminar tu cuenta. Por favor, revisa la siguiente información cuidadosamente antes de proceder.',
      remove_all_data:
        'Eliminar tu cuenta eliminará permanentemente todos tus datos en Logto Cloud. Así que asegura respaldar cualquier dato importante antes de proceder.',
      confirm_information:
        'Por favor, confirma que la información anterior es lo que esperabas. Una vez que elimines tu cuenta, no podremos recuperarla.',
      has_admin_role:
        'Dado que tienes el rol de administrador en el siguiente inquilino, será eliminado junto con tu cuenta:',
      has_admin_role_other:
        'Dado que tienes el rol de administrador en los siguientes inquilinos, serán eliminados junto con tu cuenta:',
      quit_tenant: 'Estás a punto de salir del siguiente inquilino:',
      quit_tenant_other: 'Estás a punto de salir de los siguientes inquilinos:',
    },
    issues: {
      paid_plan:
        'El siguiente inquilino tiene un plan pagado, por favor cancela la suscripción primero:',
      paid_plan_other:
        'Los siguientes inquilinos tienen planes pagados, por favor cancela la suscripción primero:',
      subscription_status: 'El siguiente inquilino tiene un problema de estado de suscripción:',
      subscription_status_other:
        'Los siguientes inquilinos tienen problemas de estado de suscripción:',
      open_invoice: 'El siguiente inquilino tiene una factura abierta:',
      open_invoice_other: 'Los siguientes inquilinos tienen facturas abiertas:',
    },
    error_occurred: 'Ocurrió un error',
    error_occurred_description: 'Lo siento, algo salió mal al eliminar tu cuenta:',
    request_id: 'ID de solicitud: {{requestId}}',
    try_again_later:
      'Por favor, inténtalo nuevamente más tarde. Si el problema persiste, contacta al equipo de Logto con el ID de solicitud.',
    final_confirmation: 'Confirmación final',
    about_to_start_deletion:
      'Estás a punto de iniciar el proceso de eliminación y esta acción no se puede deshacer.',
    permanently_delete: 'Eliminar permanentemente',
  },
  set: 'Establecer',
  change: 'Cambiar',
  link: 'Vincular',
  unlink: 'Desvincular',
  not_set: 'No configurado',
  change_avatar: 'Cambiar avatar',
  change_name: 'Cambiar nombre',
  change_username: 'Cambiar nombre de usuario',
  set_name: 'Establecer nombre',
  email_changed: '¡Se cambió el correo electrónico.',
  password_changed: '¡Se cambió la contraseña.',
  updated: '¡{{target}} actualizado.',
  linked: '¡{{target}} vinculado.',
  unlinked: '¡{{target}} desvinculado.',
  email_exists_reminder:
    'Este correo electrónico {{email}} está asociado con una cuenta existente. Vincule otro correo electrónico aquí.',
  unlink_confirm_text: 'Sí, desvincular',
  unlink_reminder:
    'Los usuarios no podrán iniciar sesión con la cuenta <span></span> si la desvincula. ¿Estás seguro de que quieres continuar?',
  fields: {
    name: 'Nombre',
    name_description:
      'El nombre completo del usuario en formato legible, incluyendo todos los componentes del nombre (ej. "Juan Pérez").',
    avatar: 'Avatar',
    avatar_description: 'URL de la imagen de avatar del usuario.',
    familyName: 'Apellido',
    familyName_description: 'El apellido del usuario (ej. "Pérez").',
    givenName: 'Nombre',
    givenName_description: 'El nombre de pila del usuario (ej. "Juan").',
    middleName: 'Segundo nombre',
    middleName_description: 'El segundo nombre del usuario (ej. "María").',
    nickname: 'Apodo',
    nickname_description:
      'Nombre informal o familiar del usuario, que puede diferir de su nombre legal.',
    preferredUsername: 'Nombre de usuario preferido',
    preferredUsername_description:
      'Identificador abreviado por el cual el usuario desea ser referenciado.',
    profile: 'Perfil',
    profile_description:
      'URL de la página de perfil legible por humanos del usuario (ej. perfil de redes sociales).',
    website: 'Sitio web',
    website_description: 'URL del sitio web personal o blog del usuario.',
    gender: 'Género',
    gender_description:
      'Género autoidentificado del usuario (ej. "Femenino", "Masculino", "No binario")',
    birthdate: 'Fecha de nacimiento',
    birthdate_description:
      'Fecha de nacimiento del usuario en un formato específico (ej. "dd-MM-yyyy").',
    zoneinfo: 'Zona horaria',
    zoneinfo_description:
      'Zona horaria del usuario en formato IANA (ej. "America/New_York" o "Europe/Paris").',
    locale: 'Idioma',
    locale_description: 'Idioma del usuario en formato IETF BCP 47 (ej. "es-ES" o "en-US").',
    address: {
      formatted: 'Dirección',
      streetAddress: 'Dirección postal',
      locality: 'Ciudad',
      region: 'Estado/Provincia',
      postalCode: 'Código postal',
      country: 'País',
    },
    address_description:
      'La dirección completa del usuario en formato legible, incluyendo todos los componentes de la dirección (ej. "123 Calle Principal, Ciudad, País 12345").',
    fullname: 'Nombre completo',
    fullname_description:
      'Combina flexiblemente apellido, nombre y segundo nombre según la configuración.',
  },
};

export default Object.freeze(profile);
