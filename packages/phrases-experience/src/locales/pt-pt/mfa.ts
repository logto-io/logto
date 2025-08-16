const mfa = {
  totp: 'Senha única do aplicativo autenticador',
  webauthn: 'Senha de dispositivo',
  backup_code: 'Código de backup',
  email_verification_code: 'Código de verificação por e-mail',
  phone_verification_code: 'Código de verificação por SMS',
  link_totp_description: 'Por exemplo, Google Authenticator, etc.',
  link_webauthn_description: 'Vincule o seu dispositivo ou hardware USB',
  link_backup_code_description: 'Gere um código de backup',
  link_email_verification_code_description: 'Vincule o seu endereço de e-mail',
  link_email_2fa_description: 'Vincule o seu endereço de e-mail para verificação em 2 passos',
  link_phone_verification_code_description: 'Vincule o seu número de telefone',
  link_phone_2fa_description: 'Vincule o seu número de telefone para verificação em 2 passos',
  verify_totp_description: 'Introduza o código único na aplicação',
  verify_webauthn_description: 'Verifique o seu dispositivo ou hardware USB',
  verify_backup_code_description: 'Cole o código de backup que guardou',
  verify_email_verification_code_description: 'Introduza o código enviado para o seu e-mail',
  verify_phone_verification_code_description: 'Introduza o código enviado para o seu telefone',
  add_mfa_factors: 'Adicionar verificação em duas etapas',
  add_mfa_description:
    'A verificação em duas etapas está ativada. Selecione o seu segundo método de verificação para iniciar sessão de forma segura.',
  verify_mfa_factors: 'Verificação em duas etapas',
  verify_mfa_description:
    'A verificação em duas etapas foi ativada para esta conta. Por favor, selecione a segunda forma de verificar a sua identidade.',
  add_authenticator_app: 'Adicionar aplicativo autenticador',
  step: 'Passo {{step, number}}: {{content}}',
  scan_qr_code: 'Digitalize este código QR',
  scan_qr_code_description:
    'Digitalize o código QR seguinte com a sua aplicação autenticadora, como o Google Authenticator, Duo Mobile, Authy, etc.',
  qr_code_not_available: 'Não consegue digitalizar o código QR?',
  copy_and_paste_key: 'Copiar e colar a chave',
  copy_and_paste_key_description:
    'Copie e cole a seguinte chave na sua aplicação autenticadora, como o Google Authenticator, Duo Mobile, Authy, etc.',
  want_to_scan_qr_code: 'Quer digitalizar o código QR?',
  enter_one_time_code: 'Introduza o código único',
  enter_one_time_code_link_description:
    'Introduza o código de verificação de 6 dígitos gerado pela aplicação autenticadora.',
  enter_one_time_code_description:
    'A verificação em duas etapas foi ativada para esta conta. Por favor, insira o código de utilização única mostrado na sua aplicação autenticadora vinculada.',
  link_another_mfa_factor: 'Mudar para outro método',
  save_backup_code: 'Guarde o seu código de backup',
  save_backup_code_description:
    'Pode usar um destes códigos de backup para aceder à sua conta se tiver problemas durante a verificação em duas etapas de outras formas. Cada código só pode ser utilizado uma vez.',
  backup_code_hint: 'Certifique-se de os copiar e guardar num local seguro.',
  enter_a_backup_code: 'Introduza um código de backup',
  enter_backup_code_description:
    'Introduza o código de backup que guardou quando a verificação em duas etapas foi ativada inicialmente.',
  create_a_passkey: 'Criar uma palavra-passe',
  create_passkey_description:
    'Registe a sua palavra-passe utilizando a biometria do dispositivo, chaves de segurança (por exemplo, YubiKey) ou outros métodos disponíveis.',
  try_another_verification_method: 'Experimente outro método de verificação',
  verify_via_passkey: 'Verificar através da palavra-passe',
  verify_via_passkey_description:
    'Utilize a palavra-passe para verificar através da senha do seu dispositivo ou biometria, digitalizando o código QR ou utilizando uma chave de segurança USB como a YubiKey.',
  secret_key_copied: 'Chave secreta copiada.',
  backup_code_copied: 'Código de backup copiado.',
  webauthn_not_ready: 'O WebAuthn ainda não está pronto. Por favor, tente novamente mais tarde.',
  webauthn_not_supported: 'O WebAuthn não é suportado neste navegador.',
  webauthn_failed_to_create: 'Falha ao criar. Por favor, tente novamente.',
  webauthn_failed_to_verify: 'Falha ao verificar. Por favor, tente novamente.',
};

export default Object.freeze(mfa);
