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
    verification_required: 'A verificação expirou. Confirme sua identidade novamente.',
    try_another_method: 'Tente outro método para verificar',
  },
  password_verification: {
    title: 'Verificar senha',
    description: 'Para proteger sua conta, insira sua senha para confirmar sua identidade.',
    error_failed: 'Falha na verificação. Verifique sua senha.',
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
    success: 'E-mail principal vinculado com sucesso.',
    verification_required: 'A verificação expirou. Confirme sua identidade novamente.',
  },
  phone: {
    title: 'Vincular telefone',
    description: 'Vincule seu número de telefone para entrar ou ajudar na recuperação da conta.',
    verification_title: 'Digite o código de verificação do telefone',
    verification_description:
      'O código de verificação foi enviado para o seu telefone {{phone_number}}.',
    success: 'Telefone principal vinculado com sucesso.',
    verification_required: 'A verificação expirou. Confirme sua identidade novamente.',
  },
  username: {
    title: 'Definir nome de usuário',
    description: 'O nome de usuário deve conter apenas letras, números e sublinhados.',
    success: 'Nome de usuário atualizado com sucesso.',
  },
  password: {
    title: 'Definir senha',
    description: 'Crie uma nova senha para proteger sua conta.',
    success: 'Senha atualizada com sucesso.',
  },

  code_verification: {
    send: 'Enviar código de verificação',
    resend: 'Reenviar código',
    resend_countdown: 'Ainda não recebeu? Reenvie após {{seconds}} s.',
  },

  email_verification: {
    title: 'Verifique seu e-mail',
    prepare_description:
      'Confirme que é você para proteger a segurança da sua conta. Envie o código de verificação para seu e-mail.',
    email_label: 'Endereço de e-mail',
    send: 'Enviar código de verificação',
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
    send: 'Enviar código de verificação',
    description:
      'O código de verificação foi enviado para o seu telefone {{phone}}. Digite o código para continuar.',
    resend: 'Reenviar código',
    resend_countdown: 'Ainda não recebeu? Reenvie após {{seconds}} s.',
    error_send_failed: 'Falha ao enviar o código de verificação. Tente novamente mais tarde.',
    error_verify_failed: 'Falha na verificação. Digite o código novamente.',
    error_invalid_code: 'O código de verificação é inválido ou expirou.',
  },
  update_success: {
    default: {
      title: 'Atualização bem-sucedida',
      description: 'Suas alterações foram salvas com sucesso.',
    },
    email: {
      title: 'Endereço de e-mail atualizado!',
      description: 'O endereço de e-mail da sua conta foi alterado com sucesso.',
    },
    phone: {
      title: 'Número de telefone atualizado!',
      description: 'O número de telefone da sua conta foi alterado com sucesso.',
    },
    username: {
      title: 'Nome de usuário atualizado!',
      description: 'O nome de usuário da sua conta foi alterado com sucesso.',
    },

    password: {
      title: 'Senha atualizada!',
      description: 'A senha da sua conta foi alterada com sucesso.',
    },
  },
};

export default Object.freeze(account_center);
