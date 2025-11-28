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
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
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
    success: 'Primary email linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  phone: {
    title: 'Link phone',
    description: 'Link your phone number to sign in or help with account recovery.',
    verification_title: 'Enter phone verification code',
    verification_description: 'The verification code has been sent to your phone {{phone_number}}.',
    success: 'Primary phone linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },

  email_verification: {
    title: 'Verifica tu correo electrónico',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
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
};

export default Object.freeze(account_center);
