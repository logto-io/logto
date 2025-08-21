const mfa = {
  totp: 'Senha única do aplicativo autenticador',
  webauthn: 'Senha de dispositivo',
  backup_code: 'Código de backup',
  email_verification_code: 'Código de verificação por e-mail',
  phone_verification_code: 'Código de verificação por SMS',
  link_totp_description: 'Por exemplo, Google Authenticator, etc.',
  link_webauthn_description: 'Vincule seu dispositivo ou hardware USB',
  link_backup_code_description: 'Gere um código de backup',
  link_email_verification_code_description: 'Vincule seu endereço de e-mail',
  link_email_2fa_description: 'Vincule seu endereço de e-mail para verificação em 2 etapas',
  link_phone_verification_code_description: 'Vincule seu número de telefone',
  link_phone_2fa_description: 'Vincule seu número de telefone para verificação em 2 etapas',
  verify_totp_description: 'Digite o código único no aplicativo',
  verify_webauthn_description: 'Verifique seu dispositivo ou hardware USB',
  verify_backup_code_description: 'Cole o código de backup que você salvou',
  verify_email_verification_code_description: 'Digite o código enviado para seu e-mail',
  verify_phone_verification_code_description: 'Digite o código enviado para seu telefone',
  add_mfa_factors: 'Adicionar verificação em duas etapas',
  add_mfa_description:
    'A verificação em duas etapas está ativada. Selecione seu segundo método de verificação para login seguro.',
  verify_mfa_factors: 'Verificação em duas etapas',
  verify_mfa_description:
    'A verificação em duas etapas foi ativada para esta conta. Por favor, selecione a segunda forma de verificar sua identidade.',
  add_authenticator_app: 'Adicionar aplicativo autenticador',
  step: 'Passo {{step, number}}: {{content}}',
  scan_qr_code: 'Escanear este código QR',
  scan_qr_code_description:
    'Escanee o seguinte código QR com seu aplicativo autenticador, como Google Authenticator, Duo Mobile, Authy, etc.',
  qr_code_not_available: 'Não consegue escanear o código QR?',
  copy_and_paste_key: 'Copiar e colar a chave',
  copy_and_paste_key_description:
    'Copie e cole a seguinte chave no seu aplicativo autenticador, como Google Authenticator, Duo Mobile, Authy, etc.',
  want_to_scan_qr_code: 'Quer escanear o código QR?',
  enter_one_time_code: 'Digite o código único',
  enter_one_time_code_link_description:
    'Digite o código de verificação de 6 dígitos gerado pelo aplicativo autenticador.',
  enter_one_time_code_description:
    'A verificação em duas etapas foi habilitada para esta conta. Por favor, insira o código de uso único mostrado no seu aplicativo autenticador vinculado.',
  enter_email_verification_code: 'Inserir código de verificação por e‑mail',
  enter_email_verification_code_description:
    'A autenticação em duas etapas está habilitada para esta conta. Insira o código de verificação enviado para {{identifier}}.',
  enter_phone_verification_code: 'Inserir código de verificação por SMS',
  enter_phone_verification_code_description:
    'A autenticação em duas etapas está habilitada para esta conta. Insira o código de verificação por SMS enviado para {{identifier}}.',
  link_another_mfa_factor: 'Trocar para outro método',
  save_backup_code: 'Salve seu código de backup',
  save_backup_code_description:
    'Você pode usar um desses códigos de backup para acessar sua conta se tiver problemas durante a verificação em duas etapas de outras maneiras. Cada código pode ser usado apenas uma vez.',
  backup_code_hint: 'Certifique-se de copiá-los e salvar em um local seguro.',
  enter_a_backup_code: 'Digite um código de backup',
  enter_backup_code_description:
    'Digite o código de backup que você salvou quando a verificação em duas etapas foi ativada inicialmente.',
  create_a_passkey: 'Criar uma senha',
  create_passkey_description:
    'Registre sua senha usando biometria do dispositivo, chaves de segurança (por exemplo, YubiKey) ou outros métodos disponíveis.',
  try_another_verification_method: 'Experimente outro método de verificação',
  verify_via_passkey: 'Verificar via senha',
  verify_via_passkey_description:
    'Use a senha para verificar por meio da senha do seu dispositivo ou biometria, escaneando o código QR ou usando uma chave de segurança USB como a YubiKey.',
  secret_key_copied: 'Chave secreta copiada.',
  backup_code_copied: 'Código de backup copiado.',
  webauthn_not_ready: 'WebAuthn ainda não está pronto. Por favor, tente novamente mais tarde.',
  webauthn_not_supported: 'WebAuthn não é suportado neste navegador.',
  webauthn_failed_to_create: 'Falha ao criar. Por favor, tente novamente.',
  webauthn_failed_to_verify: 'Falha ao verificar. Por favor, tente novamente.',
};

export default Object.freeze(mfa);
