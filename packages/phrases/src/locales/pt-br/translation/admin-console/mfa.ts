const mfa = {
  title: 'Autenticação de múltipiplos fatores',
  description:
    'Adicione autenticação de múltiplos fatores para aumentar a segurança da sua experiência de login.',
  factors: 'Fatores',
  multi_factors: 'Múltiplos fatores',
  multi_factors_description:
    'Os usuários precisam verificar um dos fatores habilitados para verificação em duas etapas.',
  totp: 'OTP do aplicativo autenticador',
  otp_description: 'Vincule o Google Authenticator, etc., para verificar senhas de uso único.',
  webauthn: 'WebAuthn (Senha)',
  webauthn_description:
    'Verifique via método suportado pelo navegador: biometria, digitalização de telefone ou chave de segurança, etc.',
  webauthn_native_tip: 'O WebAuthn não é suportado para aplicativos nativos.',
  webauthn_domain_tip:
    'O WebAuthn vincula chaves públicas ao domínio específico. Modificar o domínio do serviço bloqueará os usuários de autenticar através das senhas existentes.',
  backup_code: 'Código de backup',
  backup_code_description:
    'Gere 10 códigos de backup únicos após os usuários configurarem qualquer método MFA.',
  backup_code_setup_hint:
    'Quando os usuários não puderem verificar os fatores MFA acima, use a opção de backup.',
  backup_code_error_hint:
    'Para usar um código de backup, você precisa de pelo menos mais um método MFA para autenticação bem-sucedida do usuário.',
  email_verification_code: 'Código de verificação de e-mail',
  email_verification_code_description:
    'Vincule o endereço de e-mail para receber e verificar códigos de verificação.',
  phone_verification_code: 'Código de verificação por SMS',
  phone_verification_code_description:
    'Vincule o número de telefone para receber e verificar códigos de verificação por SMS.',
  policy: 'Política',
  policy_description: 'Defina a política MFA para fluxos de login e inscrição.',
  two_step_sign_in_policy: 'Política de verificação em duas etapas no login',
  user_controlled: 'Os usuários podem habilitar ou desabilitar o MFA por conta própria',
  user_controlled_tip:
    'Os usuários podem pular a configuração do MFA na primeira vez do login ou inscrição, ou habilitar/desabilitar nas configurações da conta.',
  mandatory: 'Os usuários sempre precisam usar o MFA no login',
  mandatory_tip:
    'Os usuários devem configurar o MFA na primeira vez do login ou inscrição e usá-lo em todos os logins futuros.',
  require_mfa: 'Exigir MFA',
  require_mfa_label:
    'Ative isso para tornar a verificação em duas etapas obrigatória para acessar seus aplicativos. Se desativado, os usuários podem decidir se desejam habilitar o MFA para si mesmos.',
  set_up_prompt: 'Prompt de configuração do MFA',
  no_prompt: 'Não pedir aos usuários para configurar o MFA',
  prompt_at_sign_in_and_sign_up:
    'Pedir aos usuários para configurar MFA durante o registro (pode ser ignorado, prompt único)',
  prompt_only_at_sign_in:
    'Pedir aos usuários para configurar o MFA na próxima tentativa de login após o registro (pode ser ignorado, prompt único)',
  set_up_organization_required_mfa_prompt:
    'Avisar os usuários para configurar o MFA após a organização ativar o MFA',
  prompt_at_sign_in_no_skip:
    'Solicitar que os usuários configurem MFA na próxima tentativa de login (não pode ser ignorado)',
  email_primary_method_tip:
    'O código de verificação do e-mail já é seu principal método de login. Para manter a segurança, ele não pode ser reutilizado para MFA.',
  phone_primary_method_tip:
    'O código de verificação por SMS já é seu principal método de login. Para manter a segurança, ele não pode ser reutilizado para MFA.',
  no_email_connector_warning:
    'Nenhum conector de e-mail foi configurado ainda. Antes de completar a configuração, os usuários não poderão usar códigos de verificação por e-mail para MFA. <a>{{link}}</a> em "Conectores".',
  no_sms_connector_warning:
    'Nenhum conector SMS foi configurado ainda. Antes de completar a configuração, os usuários não poderão usar códigos de verificação SMS para MFA. <a>{{link}}</a> em "Conectores".',
  no_email_connector_error:
    'Não é possível habilitar MFA com código de verificação por e-mail sem um conector de e-mail. Por favor, configure primeiro um conector de e-mail.',
  no_sms_connector_error:
    'Não é possível habilitar MFA com código de verificação SMS sem um conector SMS. Por favor, configure primeiro um conector SMS.',
  setup_link: 'Configurar',
};

export default Object.freeze(mfa);
