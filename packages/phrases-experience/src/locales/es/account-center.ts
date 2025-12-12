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
    title: 'Vincular teléfono',
    description:
      'Vincula tu número de teléfono para iniciar sesión o ayudar con la recuperación de la cuenta.',
    verification_title: 'Ingresa el código de verificación del teléfono',
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
    resend: 'Reenviar código',
    resend_countdown: '¿Aún no lo recibes? Reenvía después de {{seconds}} s.',
  },

  email_verification: {
    title: 'Verifica tu correo electrónico',
    prepare_description:
      'Confirma que eres tú para proteger la seguridad de tu cuenta. Envía el código de verificación a tu correo electrónico.',
    email_label: 'Dirección de correo electrónico',
    send: 'Enviar código de verificación',
    description:
      'El código de verificación se ha enviado a tu correo {{email}}. Ingresa el código para continuar.',
    resend: 'Reenviar código',
    resend_countdown: '¿Aún no lo recibes? Reenvía después de {{seconds}} s.',
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
    resend: 'Reenviar código',
    resend_countdown: '¿Aún no lo recibes? Reenvía después de {{seconds}} s.',
    error_send_failed: 'No se pudo enviar el código de verificación. Inténtalo de nuevo más tarde.',
    error_verify_failed: 'La verificación falló. Ingresa el código nuevamente.',
    error_invalid_code: 'El código de verificación no es válido o ha expirado.',
  },
  mfa: {
    totp_already_added:
      'Ya has añadido una aplicación de autenticación. Por favor, elimina la existente primero.',
    totp_not_enabled:
      'La aplicación de autenticación no está habilitada. Por favor, contacta a tu administrador para habilitarla.',
  },
  update_success: {
    default: {
      title: 'Actualización exitosa',
      description: 'Tus cambios se han guardado correctamente.',
    },
    email: {
      title: '¡Dirección de correo electrónico actualizada!',
      description: 'La dirección de correo electrónico de tu cuenta se ha cambiado correctamente.',
    },
    phone: {
      title: '¡Número de teléfono actualizado!',
      description: 'El número de teléfono de tu cuenta se ha cambiado correctamente.',
    },
    username: {
      title: '¡Nombre de usuario actualizado!',
      description: 'El nombre de usuario de tu cuenta se ha cambiado correctamente.',
    },

    password: {
      title: '¡Contraseña actualizada!',
      description: 'La contraseña de tu cuenta se ha cambiado correctamente.',
    },
    totp: {
      title: '¡Aplicación de autenticación añadida!',
      description: 'Tu aplicación de autenticación se ha vinculado correctamente a tu cuenta.',
    },
  },
};

export default Object.freeze(account_center);
