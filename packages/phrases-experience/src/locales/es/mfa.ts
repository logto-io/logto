const mfa = {
  totp: 'OTP de la aplicación autenticadora',
  webauthn: 'Clave de acceso',
  backup_code: 'Código de respaldo',
  link_totp_description: 'Vincular Google Authenticator, etc.',
  link_webauthn_description: 'Vincular su dispositivo o hardware USB',
  link_backup_code_description: 'Generar un código de respaldo',
  verify_totp_description: 'Ingrese el código de un solo uso en la aplicación',
  verify_webauthn_description: 'Verifique su dispositivo o hardware USB',
  verify_backup_code_description: 'Pegue el código de respaldo que guardó',
  add_mfa_factors: 'Agregar autenticación de 2 pasos',
  add_mfa_description:
    'La autenticación de dos factores está habilitada. Seleccione su segunda forma de verificación para iniciar sesión de forma segura en su cuenta.',
  verify_mfa_factors: 'Autenticación de 2 pasos',
  verify_mfa_description:
    'Se ha habilitado la autenticación de dos pasos para esta cuenta. Seleccione la segunda forma de verificar su identidad.',
  add_authenticator_app: 'Agregar aplicación autenticadora',
  step: 'Paso {{step, number}}: {{content}}',
  scan_qr_code: 'Escanear este código QR',
  scan_qr_code_description:
    'Escanee este código QR con su aplicación autenticadora, como Google Authenticator, Duo Mobile, Authy, etc.',
  qr_code_not_available: '¿No puede escanear el código QR?',
  copy_and_paste_key: 'Copiar y pegar la clave',
  copy_and_paste_key_description:
    'Pegue la clave a continuación en su aplicación autenticadora, como Google Authenticator, Duo Mobile, Authy, etc.',
  want_to_scan_qr_code: '¿Desea escanear el código QR?',
  enter_one_time_code: 'Ingrese el código de un solo uso',
  enter_one_time_code_link_description:
    'Ingrese el código de verificación de 6 dígitos generado por la aplicación autenticadora.',
  enter_one_time_code_description:
    'Se ha habilitado la autenticación de dos pasos para esta cuenta. Ingrese el código de un solo uso que ve en su aplicación autenticadora vinculada.',
  link_another_mfa_factor: 'Vincular otro método de autenticación de 2 pasos',
  save_backup_code: 'Guardar su código de respaldo',
  save_backup_code_description:
    'Puede usar uno de estos códigos de respaldo para acceder a su cuenta si tiene problemas durante la autenticación de dos pasos de otras formas. Cada código solo se puede usar una vez.',
  backup_code_hint: 'Asegúrese de copiarlos y guardarlos en un lugar seguro.',
  enter_backup_code_description:
    'Ingrese el código de respaldo que guardó cuando se habilitó inicialmente la autenticación de dos pasos.',
  create_a_passkey: 'Crear una clave de acceso',
  create_passkey_description:
    'Registre una clave de acceso para verificar mediante la contraseña de su dispositivo o biometría, escanee el código QR o use una llave de seguridad USB como YubiKey.',
  name_your_passkey: 'Nombre de su clave de acceso',
  name_passkey_description:
    'Ha verificado con éxito este dispositivo para la autenticación de 2 pasos. Personalice el nombre para reconocerlo si tiene varias claves.',
  try_another_verification_method: 'Pruebe otro método de verificación',
  verify_via_passkey: 'Verificar mediante clave de acceso',
  verify_via_passkey_description:
    'Use la clave de acceso para verificar mediante la contraseña de su dispositivo o biometría, escanee el código QR o use una llave de seguridad USB como YubiKey.',
  secret_key_copied: 'Clave secreta copiada.',
  backup_code_copied: 'Código de respaldo copiado.',
};

export default Object.freeze(mfa);
