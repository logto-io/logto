const mfa = {
  title: 'Autenticación multifactor',
  description:
    'Agrega autenticación multifactor para elevar la seguridad de tu experiencia de inicio de sesión.',
  factors: 'Factores',
  multi_factors: 'Multifactores',
  multi_factors_description:
    'Los usuarios deben verificar uno de los factores habilitados para la autenticación de dos pasos.',
  totp: 'OTP de la aplicación autenticadora',
  otp_description: 'Vincula Google Authenticator, etc., para verificar contraseñas de un solo uso.',
  webauthn: 'WebAuthn',
  webauthn_description:
    'WebAuthn utiliza la clave de paso para verificar el dispositivo del usuario, incluido YubiKey.',
  backup_code: 'Código de respaldo',
  backup_code_description:
    'Genera 10 códigos únicos, cada uno utilizable para una sola autenticación.',
  backup_code_setup_hint:
    'El factor de autenticación de respaldo que no se puede habilitar por sí solo:',
  backup_code_error_hint:
    'Para usar el código de respaldo para la autenticación multifactor, deben estar habilitados otros factores para garantizar el inicio de sesión exitoso de tus usuarios.',
  policy: 'Política',
  two_step_sign_in_policy: 'Política de autenticación de dos pasos al iniciar sesión',
  user_controlled: 'Los usuarios tienen la opción de habilitar MFA personalmente.',
  mandatory: 'MFA obligatorio para todos tus usuarios en cada inicio de sesión.',
  unlock_reminder:
    'Desbloquea la autenticación multifactor para mejorar la seguridad mediante la actualización a un plan de pago. No dudes en <a>contactarnos</a> si necesitas ayuda.',
  view_plans: 'Ver planes',
};

export default Object.freeze(mfa);
