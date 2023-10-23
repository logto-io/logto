const mfa = {
  title: 'Autenticação de vários fatores',
  description:
    'Adicione autenticação de vários fatores para elevar a segurança da sua experiência de login.',
  factors: 'Fatores',
  multi_factors: 'Múltiplos fatores',
  multi_factors_description:
    'Os usuários precisam verificar um dos fatores habilitados para autenticação de dois passos.',
  totp: 'OTP do aplicativo Authenticator',
  otp_description: 'Vincule o Google Authenticator, etc., para verificar senhas de uso único.',
  /** UNTRANSLATED */
  webauthn: 'WebAuthn(Passkey)',
  /** UNTRANSLATED */
  webauthn_description:
    'Verify via browser-supported method: biometrics, phone scanning, or security key, etc.',
  /** UNTRANSLATED */
  webauthn_native_tip: 'WebAuthn is not supported for Native applications.',
  /** UNTRANSLATED */
  webauthn_domain_tip:
    'WebAuthn binds public keys to the specific domain. Modifying your service domain will block users from authenticating via existing passkeys.',
  backup_code: 'Código de backup',
  backup_code_description:
    'Gere 10 códigos exclusivos, cada um utilizável para uma única autenticação.',
  backup_code_setup_hint: 'O fator de autenticação de backup que não pode ser ativado sozinho:',
  backup_code_error_hint:
    'Para usar o código de backup para autenticação de vários fatores, outros fatores devem estar ativados para garantir o login bem-sucedido de seus usuários.',
  policy: 'Política',
  two_step_sign_in_policy: 'Política de autenticação de dois passos no login',
  user_controlled: 'Os utilizadores têm a opção de ativar a MFA pessoalmente.',
  mandatory: 'MFA obrigatório para todos os seus utilizadores em cada início de sessão.',
  unlock_reminder:
    'Desbloqueie a autenticação de vários fatores para verificar a segurança, fazendo upgrade para um plano pago. Não hesite em <a>entrar em contato conosco</a> se precisar de assistência.',
  view_plans: 'Ver planos',
};

export default Object.freeze(mfa);
