const account_center = {
  header: {
    title: 'Centro de cuentas',
  },
  home: {
    title: 'Página no encontrada',
    description: 'Esta página no está disponible.',
  },
  verification: {
    title: 'Verificación de seguridad',
    description:
      'Confirma que eres tú para proteger la seguridad de tu cuenta. Selecciona el método para verificar tu identidad.',
    error_send_failed: 'No se pudo enviar el código de verificación. Inténtalo de nuevo más tarde.',
    error_invalid_code: 'El código de verificación no es válido o ha expirado.',
    error_verify_failed: 'La verificación falló. Ingresa el código nuevamente.',
    verification_required: 'La verificación expiró. Vuelve a comprobar tu identidad.',
    try_another_method: 'Prueba otro método de verificación',
  },
  password_verification: {
    title: 'Verifica la contraseña',
    description: 'Para proteger tu cuenta, ingresa tu contraseña para confirmar tu identidad.',
    error_failed: 'La verificación falló. Revisa tu contraseña.',
  },
  verification_method: {
    password: {
      name: 'Contraseña',
      description: 'Verifica tu contraseña',
    },
    email: {
      name: 'Código de verificación por correo',
      description: 'Enviar código de verificación a tu correo electrónico',
    },
    phone: {
      name: 'Código de verificación por teléfono',
      description: 'Enviar código de verificación a tu número de teléfono',
    },
  },
  email: {
    title: 'Vincular correo electrónico',
    description:
      'Vincula tu correo electrónico para iniciar sesión o ayudar con la recuperación de la cuenta.',
    verification_title: 'Ingresa el código de verificación de correo',
    verification_description:
      'El código de verificación se ha enviado a tu correo {{email_address}}.',
    success: 'Correo principal vinculado correctamente.',
    verification_required: 'La verificación expiró. Vuelve a comprobar tu identidad.',
  },
  phone: {
    title: 'Vincular número de teléfono',
    description:
      'Vincula tu número de teléfono para iniciar sesión o ayudar con la recuperación de la cuenta.',
    verification_title: 'Ingresa el código de verificación SMS',
    verification_description:
      'El código de verificación se ha enviado a tu teléfono {{phone_number}}.',
    success: 'Teléfono principal vinculado correctamente.',
    verification_required: 'La verificación expiró. Vuelve a comprobar tu identidad.',
  },
  username: {
    title: 'Establecer nombre de usuario',
    description: 'El nombre de usuario solo puede contener letras, números y guiones bajos.',
    success: 'Nombre de usuario actualizado correctamente.',
  },
  password: {
    title: 'Establecer contraseña',
    description: 'Crea una nueva contraseña para proteger tu cuenta.',
    success: 'Contraseña actualizada correctamente.',
  },

  code_verification: {
    send: 'Enviar código de verificación',
    resend: '¿Aún no lo recibes? <a>Reenviar código de verificación</a>',
    resend_countdown: '¿Aún no lo recibes?<span> Reenvía después de {{seconds}} s.</span>',
  },

  email_verification: {
    title: 'Verifica tu correo electrónico',
    prepare_description:
      'Confirma que eres tú para proteger la seguridad de tu cuenta. Envía el código de verificación a tu correo electrónico.',
    email_label: 'Dirección de correo electrónico',
    send: 'Enviar código de verificación',
    description:
      'El código de verificación se ha enviado a tu correo {{email}}. Ingresa el código para continuar.',
    resend: '¿Aún no lo recibes? <a>Reenviar código de verificación</a>',
    resend_countdown: '¿Aún no lo recibes?<span> Reenvía después de {{seconds}} s.</span>',
    error_send_failed: 'No se pudo enviar el código de verificación. Inténtalo de nuevo más tarde.',
    error_verify_failed: 'La verificación falló. Ingresa el código nuevamente.',
    error_invalid_code: 'El código de verificación no es válido o ha expirado.',
  },
  phone_verification: {
    title: 'Verifica tu teléfono',
    prepare_description:
      'Confirma que eres tú para proteger la seguridad de tu cuenta. Envía el código de verificación a tu teléfono.',
    phone_label: 'Número de teléfono',
    send: 'Enviar código de verificación',
    description:
      'El código de verificación se ha enviado a tu teléfono {{phone}}. Ingresa el código para continuar.',
    resend: '¿Aún no lo recibes? <a>Reenviar código de verificación</a>',
    resend_countdown: '¿Aún no lo recibes?<span> Reenvía después de {{seconds}} s.</span>',
    error_send_failed: 'No se pudo enviar el código de verificación. Inténtalo de nuevo más tarde.',
    error_verify_failed: 'La verificación falló. Ingresa el código nuevamente.',
    error_invalid_code: 'El código de verificación no es válido o ha expirado.',
  },
  mfa: {
    totp_already_added:
      'You have already added an authenticator app. Please remove the existing one first.',
    totp_not_enabled:
      'La aplicación de autenticación no está habilitada. Por favor, contacta a tu administrador para habilitarla.',
    backup_code_already_added:
      'Ya tienes códigos de respaldo activos. Úsalos o elimínalos antes de generar nuevos.',
    backup_code_not_enabled:
      'El código de respaldo no está habilitado. Contacta a tu administrador para habilitarlo.',
    backup_code_requires_other_mfa:
      'Los códigos de respaldo requieren que se configure otro método MFA primero.',
    passkey_not_enabled:
      'Passkey no está habilitado. Por favor, contacta a tu administrador para habilitarlo.',
  },
  update_success: {
    default: {
      title: '¡Actualizado!',
      description: 'Tu información ha sido actualizada.',
    },
    email: {
      title: '¡Correo electrónico actualizado!',
      description: 'Tu dirección de correo electrónico ha sido actualizada exitosamente.',
    },
    phone: {
      title: '¡Número de teléfono actualizado!',
      description: 'Tu número de teléfono ha sido actualizado exitosamente.',
    },
    username: {
      title: '¡Nombre de usuario cambiado!',
      description: 'Tu nombre de usuario ha sido actualizado exitosamente.',
    },

    password: {
      title: '¡Contraseña cambiada!',
      description: 'Tu contraseña ha sido actualizada exitosamente.',
    },
    totp: {
      title: '¡Aplicación de autenticación añadida!',
      description: 'Tu aplicación de autenticación ha sido vinculada exitosamente a tu cuenta.',
    },
    backup_code: {
      title: '¡Códigos de respaldo generados!',
      description: 'Tus códigos de respaldo se han guardado. Guárdalos en un lugar seguro.',
    },
    backup_code_deleted: {
      title: '¡Códigos de respaldo eliminados!',
      description: 'Tus códigos de respaldo han sido eliminados de tu cuenta.',
    },
    passkey: {
      title: '¡Passkey añadido!',
      description: 'Tu passkey se ha vinculado correctamente a tu cuenta.',
    },
    passkey_deleted: {
      title: '¡Passkey eliminado!',
      description: 'Tu passkey ha sido eliminado de tu cuenta.',
    },
    social: {
      title: '¡Cuenta social vinculada!',
      description: 'Tu cuenta social ha sido vinculada exitosamente.',
    },
  },
  backup_code: {
    title: 'Códigos de respaldo',
    description:
      'Puedes usar uno de estos códigos de respaldo para acceder a tu cuenta si tienes problemas durante la verificación en dos pasos de otra manera. Cada código solo se puede usar una vez.',
    copy_hint: 'Asegúrate de copiarlos y guardarlos en un lugar seguro.',
    generate_new_title: 'Generar nuevos códigos de respaldo',
    generate_new: 'Generar nuevos códigos de respaldo',
    delete_confirmation_title: 'Eliminar tus códigos de respaldo',
    delete_confirmation_description:
      'Si eliminas estos códigos de respaldo, no podrás verificarte con ellos.',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Añadido: {{date}}',
    last_used: 'Último uso: {{date}}',
    never_used: 'Nunca',
    unnamed: 'Passkey sin nombre',
    renamed: 'Passkey renombrado correctamente.',
    add_another_title: 'Añadir otro passkey',
    add_another_description:
      'Registra tu passkey usando biometría del dispositivo, llaves de seguridad (ej. YubiKey) u otros métodos disponibles.',
    add_passkey: 'Añadir un passkey',
    delete_confirmation_title: 'Eliminar passkey',
    delete_confirmation_description:
      '¿Estás seguro de que deseas eliminar "{{name}}"? Ya no podrás usar este passkey para iniciar sesión.',
    rename_passkey: 'Renombrar passkey',
    rename_description: 'Ingresa un nuevo nombre para este passkey.',
  },
};

export default Object.freeze(account_center);
