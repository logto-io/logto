const mfa = {
  totp: 'OTP do aplicativo autenticador',
  webauthn: 'Chave de acesso',
  backup_code: 'Código de backup',
  link_totp_description: 'Vincule o Google Authenticator, etc.',
  link_webauthn_description: 'Vincule seu dispositivo ou hardware USB',
  link_backup_code_description: 'Gere um código de backup',
  verify_totp_description: 'Digite o código de uso único no aplicativo',
  verify_webauthn_description: 'Verifique seu dispositivo ou hardware USB',
  verify_backup_code_description: 'Cole o código de backup que você salvou',
  add_mfa_factors: 'Adicionar autenticação em duas etapas',
  add_mfa_description:
    'A autenticação em duas etapas está ativada. Selecione seu segundo método de verificação para acessar sua conta com segurança.',
  verify_mfa_factors: 'Autenticação em duas etapas',
  verify_mfa_description:
    'A autenticação em duas etapas foi ativada para esta conta. Selecione a segunda forma de verificar sua identidade.',
  add_authenticator_app: 'Adicionar aplicativo autenticador',
  step: 'Etapa {{step, number}}: {{content}}',
  scan_qr_code: 'Escanear este código QR',
  scan_qr_code_description:
    'Escaneie este código QR usando seu aplicativo autenticador, como o Google Authenticator, Duo Mobile, Authy, etc.',
  qr_code_not_available: 'Não consegue escanear o código QR?',
  copy_and_paste_key: 'Copiar e colar a chave',
  copy_and_paste_key_description:
    'Cole a chave abaixo no seu aplicativo autenticador, como o Google Authenticator, Duo Mobile, Authy, etc.',
  want_to_scan_qr_code: 'Quer escanear o código QR?',
  enter_one_time_code: 'Digite o código de uso único',
  enter_one_time_code_link_description:
    'Digite o código de verificação de 6 dígitos gerado pelo aplicativo autenticador.',
  enter_one_time_code_description:
    'A autenticação em duas etapas foi ativada para esta conta. Por favor, insira o código de uso único exibido no seu aplicativo autenticador vinculado.',
  link_another_mfa_factor: 'Vincular outro método de autenticação em duas etapas',
  save_backup_code: 'Salve seu código de backup',
  save_backup_code_description:
    'Você pode usar um desses códigos de backup para acessar sua conta se tiver problemas durante a autenticação em duas etapas de outras maneiras. Cada código só pode ser usado uma vez.',
  backup_code_hint: 'Certifique-se de copiá-los e salvá-los em um local seguro.',
  enter_backup_code_description:
    'Digite o código de backup que você salvou quando a autenticação em duas etapas foi ativada pela primeira vez.',
  create_a_passkey: 'Criar uma chave de acesso',
  create_passkey_description:
    'Registre uma chave de acesso para verificar por meio da senha do seu dispositivo ou biometria, escaneando o código QR ou usando uma chave de segurança USB como a YubiKey.',
  name_your_passkey: 'Nomeie sua chave de acesso',
  name_passkey_description:
    'Você verificou com sucesso este dispositivo para autenticação em duas etapas. Personalize o nome para reconhecê-lo se tiver várias chaves.',
  try_another_verification_method: 'Tente outro método de verificação',
  verify_via_passkey: 'Verificar via chave de acesso',
  verify_via_passkey_description:
    'Use a chave de acesso para verificar por meio da senha do seu dispositivo ou biometria, escaneando o código QR ou usando uma chave de segurança USB como a YubiKey.',
  secret_key_copied: 'Chave secreta copiada.',
  backup_code_copied: 'Código de backup copiado.',
};

export default Object.freeze(mfa);
