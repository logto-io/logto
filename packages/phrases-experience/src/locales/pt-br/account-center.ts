const account_center = {
  header: {
    title: 'Centro de contas',
  },
  home: {
    title: 'Página não encontrada',
    description: 'Esta página não está disponível.',
  },
  verification: {
    title: 'Verificação de segurança',
    description:
      'Confirme que é você para proteger a segurança da sua conta. Selecione o método para verificar sua identidade.',
    error_send_failed: 'Falha ao enviar o código de verificação. Tente novamente mais tarde.',
    error_invalid_code: 'O código de verificação é inválido ou expirou.',
    error_verify_failed: 'Falha na verificação. Digite o código novamente.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
  },
  verification_method: {
    password: {
      name: 'Senha',
      description: 'Verifique sua senha',
    },
    email: {
      name: 'Código de verificação por e-mail',
      description: 'Enviar código de verificação para seu e-mail',
    },
    phone: {
      name: 'Código de verificação por telefone',
      description: 'Enviar código de verificação para seu número de telefone',
    },
  },
  email: {
    title: 'Vincular e-mail',
    description: 'Vincule seu e-mail para entrar ou ajudar na recuperação da conta.',
    verification_title: 'Digite o código de verificação de e-mail',
    verification_description:
      'O código de verificação foi enviado para seu e-mail {{email_address}}.',
    success: 'Primary email linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  phone: {
    title: 'Link phone',
    description: 'Link your phone number to sign in or help with account recovery.',
    verification_title: 'Enter phone verification code',
    verification_description: 'The verification code has been sent to your phone {{phone_number}}.',
    success: 'Primary phone linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },

  code_verification: {
    send: 'Send verification code',
    resend: 'Reenviar código',
    resend_countdown: 'Ainda não recebeu? Reenvie após {{seconds}} s.',
  },

  email_verification: {
    title: 'Verifique seu e-mail',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
    description:
      'O código de verificação foi enviado para o e-mail {{email}}. Digite o código para continuar.',
    resend: 'Reenviar código',
    resend_countdown: 'Ainda não recebeu? Reenvie após {{seconds}} s.',
    error_send_failed: 'Falha ao enviar o código de verificação. Tente novamente mais tarde.',
    error_verify_failed: 'Falha na verificação. Digite o código novamente.',
    error_invalid_code: 'O código de verificação é inválido ou expirou.',
  },
  phone_verification: {
    title: 'Verifique seu telefone',
    prepare_description:
      'Confirme que é você para proteger a segurança da sua conta. Envie o código de verificação para seu telefone.',
    phone_label: 'Número de telefone',
    send: 'Send verification code',
    description:
      'O código de verificação foi enviado para o seu telefone {{phone}}. Digite o código para continuar.',
    resend: 'Reenviar código',
    resend_countdown: 'Ainda não recebeu? Reenvie após {{seconds}} s.',
    error_send_failed: 'Falha ao enviar o código de verificação. Tente novamente mais tarde.',
    error_verify_failed: 'Falha na verificação. Digite o código novamente.',
    error_invalid_code: 'O código de verificação é inválido ou expirou.',
  },
};

export default Object.freeze(account_center);
