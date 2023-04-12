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
    min_length: 'La contraseña requiere un mínimo de {{min}} caracteres',
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
    dialog_paragraph_1:
      'Lamentamos mucho que quiera eliminar su cuenta. La eliminación de su cuenta eliminará permanentemente todos los datos, incluida la información del usuario, los registros y la configuración, y esta acción no se puede deshacer. Por lo tanto, asegúrese de realizar una copia de seguridad de cualquier dato importante antes de continuar.',
    dialog_paragraph_2:
      'Para iniciar el proceso de eliminación de la cuenta, envíe un correo electrónico a nuestro equipo de soporte en <a>{{mail}}</a> con el asunto "Solicitud de eliminación de cuenta". Le ayudaremos y nos aseguraremos de que todos sus datos se eliminen correctamente de nuestro sistema.',
    dialog_paragraph_3:
      'Gracias por elegir Logto Cloud. Si tiene más preguntas o inquietudes, no dude en comunicarse con nosotros.',
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
  email_changed: '¡Se cambió el correo electrónico!',
  password_changed: '¡Se cambió la contraseña!',
  updated: '¡{{target}} actualizado!',
  linked: '¡{{target}} vinculado!',
  unlinked: '¡{{target}} desvinculado!',
  email_exists_reminder:
    'Este correo electrónico {{email}} está asociado con una cuenta existente. Vincule otro correo electrónico aquí.',
  unlink_confirm_text: 'Sí, desvincular',
  unlink_reminder:
    'Los usuarios no podrán iniciar sesión con la cuenta <span></span> si la desvincula. ¿Estás seguro de que quieres continuar?',
};

export default profile;
