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
  webauthn: 'WebAuthn',
  webauthn_description:
    'O WebAuthn usa a chave de passagem para verificar o dispositivo do usuário, incluindo o YubiKey.',
  backup_code: 'Código de backup',
  backup_code_description:
    'Gere 10 códigos exclusivos, cada um utilizável para uma única autenticação.',
  backup_code_setup_hint: 'O fator de autenticação de backup que não pode ser ativado sozinho:',
  backup_code_error_hint:
    'Para usar o código de backup para autenticação de vários fatores, outros fatores devem estar ativados para garantir o login bem-sucedido de seus usuários.',
  policy: 'Política',
  two_step_sign_in_policy: 'Política de autenticação de dois passos no login',
  two_step_sign_in_policy_description:
    'Defina um requisito de autenticação de dois passos em toda a aplicação no momento do login.',
  user_controlled: 'Controlado pelo usuário',
  user_controlled_description:
    'Desativado por padrão e não obrigatório, mas os usuários podem ativá-lo individualmente.',
  mandatory: 'Obrigatório',
  mandatory_description:
    'Exija autenticação de vários fatores para todos os seus usuários em cada login.',
  unlock_reminder:
    'Desbloqueie a autenticação de vários fatores para verificar a segurança, fazendo upgrade para um plano pago. Não hesite em <a>entrar em contato conosco</a> se precisar de assistência.',
  view_plans: 'Ver planos',
};

export default Object.freeze(mfa);
