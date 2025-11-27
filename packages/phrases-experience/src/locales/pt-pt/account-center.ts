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
      'Confirme que é você para proteger a segurança da sua conta. Selecione o método para verificar a sua identidade.',
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
  },
  verification_method: {
    password: {
      name: 'Palavra-passe',
      description: 'Verifique a sua palavra-passe',
    },
    email: {
      name: 'Código de verificação por e-mail',
      description: 'Enviar código de verificação para o seu e-mail',
    },
    phone: {
      name: 'Código de verificação por telefone',
      description: 'Enviar código de verificação para o seu número de telefone',
    },
  },
  email: {
    title: 'Associar e-mail',
    description: 'Associe o seu e-mail para iniciar sessão ou ajudar na recuperação da conta.',
    verification_title: 'Introduza o código de verificação de e-mail',
    verification_description:
      'O código de verificação foi enviado para o seu e-mail {{email_address}}.',
    success: 'Primary email linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  email_verification: {
    title: 'Verifique o seu e-mail',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
    description:
      'O código de verificação foi enviado para o e-mail {{email}}. Introduza o código para continuar.',
    resend: 'Reenviar código',
    resend_countdown: 'Ainda não recebeu? Reenvie após {{seconds}} s.',
    error_send_failed: 'Falha ao enviar o código de verificação. Tente novamente mais tarde.',
    error_verify_failed: 'Falha na verificação. Introduza novamente o código.',
    error_invalid_code: 'O código de verificação é inválido ou expirou.',
  },
  phone_verification: {
    title: 'Verifique o seu telefone',
    prepare_description:
      'Confirme que é você para proteger a segurança da sua conta. Envie o código de verificação para o seu telefone.',
    phone_label: 'Número de telefone',
    send: 'Send verification code',
    description:
      'O código de verificação foi enviado para o seu telefone {{phone}}. Introduza o código para continuar.',
    resend: 'Reenviar código',
    resend_countdown: 'Ainda não recebeu? Reenvie após {{seconds}} s.',
    error_send_failed: 'Falha ao enviar o código de verificação. Tente novamente mais tarde.',
    error_verify_failed: 'Falha na verificação. Introduza novamente o código.',
    error_invalid_code: 'O código de verificação é inválido ou expirou.',
  },
};

export default Object.freeze(account_center);
