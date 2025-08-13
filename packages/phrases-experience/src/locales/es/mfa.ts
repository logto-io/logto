const mfa = {
  totp: 'OTP de la aplicación autenticadora',
  webauthn: 'Contraseña',
  backup_code: 'Código de respaldo',
  email_verification_code: 'Código de verificación por correo electrónico',
  phone_verification_code: 'Código de verificación por SMS',
  link_totp_description: 'Ej., Google Authenticator, etc.',
  link_webauthn_description: 'Vincule su dispositivo o hardware USB',
  link_backup_code_description: 'Genere un código de respaldo',
  link_email_verification_code_description: 'Vincule su dirección de correo electrónico',
  link_email_2fa_description:
    'Vincula tu dirección de correo electrónico para verificación de 2 pasos',
  link_phone_verification_code_description: 'Vincule su número de teléfono',
  link_phone_2fa_description: 'Vincula tu número de teléfono para verificación de 2 pasos',
  verify_totp_description: 'Ingrese el código de un solo uso en la aplicación',
  verify_webauthn_description: 'Verifique su dispositivo o hardware USB',
  verify_backup_code_description: 'Pegue el código de respaldo que guardó',
  verify_email_verification_code_description: 'Ingrese el código enviado a su correo electrónico',
  verify_phone_verification_code_description: 'Ingrese el código enviado a su teléfono',
  add_mfa_factors: 'Agregar verificación de 2 pasos',
  add_mfa_description:
    'La verificación de dos factores está habilitada. Seleccione su segundo método de verificación para iniciar sesión de forma segura.',
  verify_mfa_factors: 'Verificación de 2 pasos',
  verify_mfa_description:
    'La verificación de 2 pasos se ha habilitado para esta cuenta. Seleccione la segunda forma de verificar su identidad.',
  add_authenticator_app: 'Agregar aplicación autenticadora',
  step: 'Paso {{step, number}}: {{content}}',
  scan_qr_code: 'Escanee este código QR',
  scan_qr_code_description:
    'Escanee el siguiente código QR con su aplicación autenticadora, como Google Authenticator, Duo Mobile, Authy, etc.',
  qr_code_not_available: '¿No puede escanear el código QR?',
  copy_and_paste_key: 'Copie y pegue la clave',
  copy_and_paste_key_description:
    'Copie y pegue la siguiente clave en su aplicación autenticadora, como Google Authenticator, Duo Mobile, Authy, etc.',
  want_to_scan_qr_code: '¿Quiere escanear el código QR?',
  enter_one_time_code: 'Ingrese el código de un solo uso',
  enter_one_time_code_link_description:
    'Ingrese el código de verificación de 6 dígitos generado por la aplicación autenticadora.',
  enter_one_time_code_description:
    'Se ha habilitado la verificación en dos pasos para esta cuenta. Por favor, ingrese el código de un solo uso que se muestra en su aplicación de autenticación vinculada.',
  link_another_mfa_factor: 'Cambiar a otro método',
  save_backup_code: 'Guarde su código de respaldo',
  save_backup_code_description:
    'Puede usar uno de estos códigos de respaldo para acceder a su cuenta si tiene problemas durante la verificación de 2 pasos de otras maneras. Cada código solo se puede usar una vez.',
  backup_code_hint: 'Asegúrese de copiarlos y guardarlos en un lugar seguro.',
  enter_a_backup_code: 'Ingrese un código de respaldo',
  enter_backup_code_description:
    'Ingrese el código de respaldo que guardó cuando se habilitó la verificación de 2 pasos inicialmente.',
  create_a_passkey: 'Crear una contraseña',
  create_passkey_description:
    'Registre su contraseña utilizando la biometría del dispositivo, claves de seguridad (por ejemplo, YubiKey) u otros métodos disponibles.',
  try_another_verification_method: 'Pruebe otro método de verificación',
  verify_via_passkey: 'Verificar mediante contraseña',
  verify_via_passkey_description:
    'Use la contraseña para verificar mediante la contraseña de su dispositivo o biometría, escanee el código QR o use una clave de seguridad USB como YubiKey.',
  secret_key_copied: 'Clave secreta copiada.',
  backup_code_copied: 'Código de respaldo copiado.',
  webauthn_not_ready: 'WebAuthn aún no está listo. Por favor, inténtelo de nuevo más tarde.',
  webauthn_not_supported: 'WebAuthn no es compatible con este navegador.',
  webauthn_failed_to_create: 'Error al crear. Por favor, inténtelo de nuevo.',
  webauthn_failed_to_verify: 'Error al verificar. Por favor, inténtelo de nuevo.',
};

export default Object.freeze(mfa);
