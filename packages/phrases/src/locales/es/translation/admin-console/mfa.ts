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
  email_verification_code: 'Código de verificación de email',
  email_verification_code_description:
    'Vincula la dirección de correo electrónico para recibir y verificar los códigos de verificación.',
  phone_verification_code: 'Código de verificación SMS',
  phone_verification_code_description:
    'Vincula el número de teléfono para recibir y verificar los códigos de verificación SMS.',
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
  require_mfa: 'Requerir MFA',
  require_mfa_label:
    'Activa esto para hacer obligatorio la verificación de 2 pasos al acceder a tus aplicaciones. Si está desactivado, los usuarios pueden decidir si habilitar MFA por sí mismos.',
  set_up_prompt: 'Sugerencia de configuración de MFA',
  no_prompt: 'No pedir a los usuarios que configuren MFA',
  prompt_at_sign_in_and_sign_up:
    'Preguntar a los usuarios si desean configurar MFA durante el registro (omitible, solicitud única)',
  prompt_only_at_sign_in:
    'Preguntar a los usuarios si desean configurar MFA en su siguiente intento de inicio de sesión después del registro (omitible, solicitud única)',
  set_up_organization_required_mfa_prompt:
    'Sugerencia de configuración de MFA para usuarios después de que la organización habilita MFA',
  prompt_at_sign_in_no_skip:
    'Pedir a los usuarios que configuren MFA en el próximo inicio de sesión (sin omitir)',
  email_primary_method_tip:
    'El código de verificación de email ya es tu método principal de inicio de sesión. Para mantener la seguridad, no se puede reutilizar para MFA.',
  phone_primary_method_tip:
    'El código de verificación SMS ya es tu método principal de inicio de sesión. Para mantener la seguridad, no se puede reutilizar para MFA.',
  no_email_connector_warning:
    'Aún no se ha configurado ningún conector de correo electrónico. Antes de completar la configuración, los usuarios no podrán usar códigos de verificación por correo electrónico para MFA. <a>{{link}}</a> en "Conectores".',
  no_sms_connector_warning:
    'Aún no se ha configurado ningún conector SMS. Antes de completar la configuración, los usuarios no podrán usar códigos de verificación por SMS para MFA. <a>{{link}}</a> en "Conectores".',
  no_email_connector_error:
    'No se puede habilitar MFA con código de verificación por correo electrónico sin un conector de correo electrónico. Por favor, configure primero un conector de correo electrónico.',
  no_sms_connector_error:
    'No se puede habilitar MFA con código de verificación SMS sin un conector SMS. Por favor, configure primero un conector SMS.',
  setup_link: 'Configurar',
};

export default Object.freeze(mfa);
