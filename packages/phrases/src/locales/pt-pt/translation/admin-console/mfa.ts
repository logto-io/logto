const mfa = {
  title: 'Autenticação de vários fatores',
  description:
    'Adicione autenticação de vários fatores para aumentar a segurança da sua experiência de login.',
  factors: 'Fatores',
  multi_factors: 'Vários fatores',
  multi_factors_description:
    'Os usuários precisam verificar um dos fatores habilitados para a verificação em duas etapas.',
  totp: 'OTP do aplicativo autenticador',
  otp_description: 'Vincule o Google Authenticator, etc., para verificar senhas únicas.',
  webauthn: 'WebAuthn (Senha)',
  webauthn_description:
    'Verifique por meio de um método suportado pelo navegador: biometria, digitalização de telefone ou chave de segurança, etc.',
  webauthn_native_tip: 'O WebAuthn não é suportado para aplicativos nativos.',
  webauthn_domain_tip:
    'O WebAuthn vincula chaves públicas ao domínio específico. Modificar o domínio do seu serviço bloqueará usuários de autenticar via senhas existentes.',
  backup_code: 'Código de backup',
  backup_code_description:
    'Gere 10 códigos de backup únicos após os usuários configurarem qualquer método MFA.',
  backup_code_setup_hint:
    'Quando os usuários não podem verificar os fatores MFA acima, use a opção de backup.',
  backup_code_error_hint:
    'Para usar um código de backup, você precisa de pelo menos mais um método MFA para autenticação bem-sucedida do usuário.',
  policy: 'Política',
  policy_description: 'Defina a política MFA para fluxos de login e inscrição.',
  two_step_sign_in_policy: 'Política de verificação em duas etapas no login',
  user_controlled: 'Os usuários podem ativar ou desativar o MFA por conta própria',
  user_controlled_tip:
    'Os usuários podem pular a configuração do MFA na primeira vez no login ou inscrição, ou ativar/desativar nas configurações da conta.',
  mandatory: 'Os usuários sempre precisam usar o MFA no login',
  mandatory_tip:
    'Os usuários devem configurar o MFA na primeira vez no login ou inscrição e usá-lo em todos os logins futuros.',
  require_mfa: 'Exigir MFA',
  require_mfa_label:
    'Ative isto para tornar a verificação em duas etapas obrigatória para acessar as suas aplicações. Se desativado, os usuários podem decidir se ativam o MFA por si mesmos.',
  set_up_prompt: 'Prompt de configuração do MFA',
  no_prompt: 'Não pedir aos usuários para configurar o MFA',
  prompt_at_sign_in_and_sign_up:
    'Pedir aos usuários para configurar o MFA durante o registo (pode ser ignorado, prompt único)',
  prompt_only_at_sign_in:
    'Pedir aos usuários para configurar o MFA na próxima tentativa de início de sessão após o registo (pode ser ignorado, prompt único)',
  set_up_organization_required_mfa_prompt:
    'Prompt de configuração do MFA para utilizadores após a ativação do MFA pela organização',
  prompt_at_sign_in_no_skip: '要求用户在下次登录时设置 MFA（不可跳过）',
};

export default Object.freeze(mfa);
