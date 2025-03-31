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
  prompt_at_sign_in_no_skip: '在下次登录时要求用户设置 MFA（无法跳过）',
};

export default Object.freeze(mfa);
