const mfa = {
  title: 'Autenticación de múltiples factores',
  description:
    'Agrega autenticación de múltiples factores para elevar la seguridad de tu experiencia de inicio de sesión.',
  factors: 'Factores',
  multi_factors: 'Múltiples factores',
  multi_factors_description:
    'Los usuarios deben verificar uno de los factores habilitados para la verificación de dos pasos.',
  totp: 'OTP de la aplicación autenticadora',
  otp_description: 'Vincula Google Authenticator, etc., para verificar contraseñas de un solo uso.',
  webauthn: 'WebAuthn (Clave de paso)',
  webauthn_description:
    'Verifica a través de un método compatible con el navegador: biometría, escaneo de teléfono o clave de seguridad, etc.',
  webauthn_native_tip: 'WebAuthn no es compatible con aplicaciones nativas.',
  webauthn_domain_tip:
    'WebAuthn vincula claves públicas al dominio específico. Modificar el dominio del servicio bloqueará a los usuarios para autenticarse mediante claves de paso existentes.',
  backup_code: 'Código de respaldo',
  backup_code_description:
    'Genera 10 códigos de respaldo de un solo uso después de que los usuarios configuren cualquier método de MFA.',
  backup_code_setup_hint:
    'Cuando los usuarios no pueden verificar los factores de MFA anteriores, utiliza la opción de respaldo.',
  backup_code_error_hint:
    'Para usar un código de respaldo, necesitas al menos un método de MFA adicional para una autenticación exitosa del usuario.',
  policy: 'Política',
  policy_description:
    'Establece la política de MFA para los flujos de inicio de sesión y registro.',
  two_step_sign_in_policy: 'Política de verificación de dos pasos al iniciar sesión',
  user_controlled: 'Los usuarios pueden habilitar o deshabilitar MFA por sí mismos',
  user_controlled_tip:
    'Los usuarios pueden omitir la configuración de MFA la primera vez al iniciar sesión o registrarse, o habilitar/deshabilitarla en la configuración de la cuenta.',
  mandatory: 'Siempre se requiere que los usuarios usen MFA al iniciar sesión',
  mandatory_tip:
    'Los usuarios deben configurar MFA la primera vez al iniciar sesión o registrarse, y usarlo en todas las futuras sesiones de inicio de sesión.',
  /** UNTRANSLATED */
  require_mfa: 'Require MFA',
  /** UNTRANSLATED */
  require_mfa_label:
    'Enable this to make 2-step verification mandatory for accessing your applications. If disabled, users can decide whether to enable MFA for themselves.',
  /** UNTRANSLATED */
  set_up_prompt: 'MFA set-up prompt',
  /** UNTRANSLATED */
  no_prompt: 'Do not ask users to set up MFA',
  /** UNTRANSLATED */
  prompt_at_sign_in_and_sign_up:
    'Ask users to set up MFA during registration (skippable, one-time prompt)',
  /** UNTRANSLATED */
  prompt_only_at_sign_in:
    'Ask users to set up MFA on their next sign-in attempt after registration (skippable, one-time prompt)',
};

export default Object.freeze(mfa);
