const mfa = {
  totp: 'OTP da aplicação autenticadora',
  webauthn: 'Chave de acesso',
  backup_code: 'Código de backup',
  link_totp_description: 'Ligar o Google Authenticator, etc.',
  link_webauthn_description: 'Ligar o seu dispositivo ou hardware USB',
  link_backup_code_description: 'Gerar um código de backup',
  verify_totp_description: 'Introduza o código de utilização única na aplicação',
  verify_webauthn_description: 'Verifique o seu dispositivo ou hardware USB',
  verify_backup_code_description: 'Cole o código de backup que guardou',
  add_mfa_factors: 'Adicionar autenticação de dois fatores',
  add_mfa_description:
    'A autenticação de dois fatores está ativada. Selecione o seu segundo método de verificação para fazer login na sua conta com segurança.',
  verify_mfa_factors: 'Autenticação de dois fatores',
  verify_mfa_description:
    'A autenticação de dois fatores foi ativada para esta conta. Por favor, selecione a segunda forma de verificar a sua identidade.',
  add_authenticator_app: 'Adicionar aplicação autenticadora',
  step: 'Passo {{step, number}}: {{content}}',
  scan_qr_code: 'Digitalize este código QR',
  scan_qr_code_description:
    'Digitalize este código QR usando a sua aplicação autenticadora, como o Google Authenticator, Duo Mobile, Authy, etc.',
  qr_code_not_available: 'Não consegue digitalizar o código QR?',
  copy_and_paste_key: 'Copiar e colar a chave',
  copy_and_paste_key_description:
    'Cole a chave abaixo na sua aplicação autenticadora, como o Google Authenticator, Duo Mobile, Authy, etc.',
  want_to_scan_qr_code: 'Quer digitalizar o código QR?',
  enter_one_time_code: 'Introduza o código de utilização única',
  enter_one_time_code_link_description:
    'Introduza o código de verificação de 6 dígitos gerado pela aplicação autenticadora.',
  enter_one_time_code_description:
    'A autenticação de dois fatores foi ativada para esta conta. Por favor, introduza o código de utilização única exibido na sua aplicação autenticadora vinculada.',
  link_another_mfa_factor: 'Ligar outro método de autenticação de dois fatores',
  save_backup_code: 'Guarde o seu código de backup',
  save_backup_code_description:
    'Pode usar um destes códigos de backup para aceder à sua conta se tiver problemas durante a autenticação de dois fatores de outras formas. Cada código só pode ser usado uma vez.',
  backup_code_hint: 'Certifique-se de os copiar e guardar num local seguro.',
  enter_backup_code_description:
    'Introduza o código de backup que guardou quando a autenticação de dois fatores foi ativada pela primeira vez.',
  create_a_passkey: 'Criar uma chave de acesso',
  create_passkey_description:
    'Registe uma chave de acesso para verificar através da senha do seu dispositivo ou biometria, digitalizando o código QR ou utilizando uma chave de segurança USB como a YubiKey.',
  name_your_passkey: 'Dê um nome à sua chave de acesso',
  name_passkey_description:
    'Verificou com sucesso este dispositivo para autenticação de dois fatores. Personalize o nome para o reconhecer se tiver várias chaves.',
  try_another_verification_method: 'Experimente outro método de verificação',
  verify_via_passkey: 'Verificar através da chave de acesso',
  verify_via_passkey_description:
    'Utilize a chave de acesso para verificar através da senha do seu dispositivo ou biometria, digitalizando o código QR ou utilizando uma chave de segurança USB como a YubiKey.',
  secret_key_copied: 'Chave secreta copiada.',
  backup_code_copied: 'Código de backup copiado.',
};

export default Object.freeze(mfa);
