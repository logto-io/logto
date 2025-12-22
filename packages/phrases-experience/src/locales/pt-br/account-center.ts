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
    title: 'Vincular número de telefone',
    description: 'Vincule seu número de telefone para entrar ou ajudar na recuperação da conta.',
    verification_title: 'Digite o código de verificação SMS',
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
    resend: 'Ainda não recebeu? <a>Reenviar código de verificação</a>',
    resend_countdown: 'Ainda não recebeu?<span> Reenvie após {{seconds}} s.</span>',
  },

  email_verification: {
    title: 'Verifique seu e-mail',
    prepare_description:
      'Confirme que é você para proteger a segurança da sua conta. Envie o código de verificação para seu e-mail.',
    email_label: 'Endereço de e-mail',
    send: 'Enviar código de verificação',
    description:
      'O código de verificação foi enviado para o e-mail {{email}}. Digite o código para continuar.',
    resend: 'Ainda não recebeu? <a>Reenviar código de verificação</a>',
    resend_countdown: 'Ainda não recebeu?<span> Reenvie após {{seconds}} s.</span>',
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
    resend: 'Ainda não recebeu? <a>Reenviar código de verificação</a>',
    resend_countdown: 'Ainda não recebeu?<span> Reenvie após {{seconds}} s.</span>',
    error_send_failed: 'Falha ao enviar o código de verificação. Tente novamente mais tarde.',
    error_verify_failed: 'Falha na verificação. Digite o código novamente.',
    error_invalid_code: 'O código de verificação é inválido ou expirou.',
  },
  mfa: {
    totp_already_added:
      'Você já adicionou um aplicativo autenticador. Remova o existente primeiro.',
    totp_not_enabled:
      'O aplicativo autenticador não está ativado. Entre em contato com o administrador para ativá-lo.',
    backup_code_already_added:
      'Você já possui códigos de backup ativos. Use-os ou remova-os antes de gerar novos.',
    backup_code_not_enabled:
      'O código de backup não está ativado. Entre em contato com o administrador para ativá-lo.',
    backup_code_requires_other_mfa:
      'Os códigos de backup exigem que outro método MFA seja configurado primeiro.',
    passkey_not_enabled:
      'Passkey não está ativado. Entre em contato com o administrador para ativá-lo.',
  },
  update_success: {
    default: {
      title: 'Atualizado!',
      description: 'Suas informações foram atualizadas.',
    },
    email: {
      title: 'E-mail atualizado!',
      description: 'Seu endereço de e-mail foi atualizado com sucesso.',
    },
    phone: {
      title: 'Número de telefone atualizado!',
      description: 'Seu número de telefone foi atualizado com sucesso.',
    },
    username: {
      title: 'Nome de usuário alterado!',
      description: 'Seu nome de usuário foi atualizado com sucesso.',
    },
    password: {
      title: 'Senha alterada!',
      description: 'Sua senha foi atualizada com sucesso.',
    },
    totp: {
      title: 'Aplicativo autenticador adicionado!',
      description: 'Seu aplicativo autenticador foi vinculado com sucesso à sua conta.',
    },
    backup_code: {
      title: 'Códigos de backup gerados!',
      description: 'Seus códigos de backup foram salvos. Mantenha-os em um local seguro.',
    },
    backup_code_deleted: {
      title: 'Códigos de backup removidos!',
      description: 'Seus códigos de backup foram removidos da sua conta.',
    },
    passkey: {
      title: 'Passkey adicionado!',
      description: 'Seu passkey foi vinculado com sucesso à sua conta.',
    },
    passkey_deleted: {
      title: 'Passkey removido!',
      description: 'Seu passkey foi removido da sua conta.',
    },
    social: {
      title: 'Conta social vinculada!',
      description: 'Sua conta social foi vinculada com sucesso.',
    },
  },
  backup_code: {
    title: 'Códigos de backup',
    description:
      'Você pode usar um destes códigos de backup para acessar sua conta se tiver problemas durante a verificação em duas etapas de outra forma. Cada código só pode ser usado uma vez.',
    copy_hint: 'Certifique-se de copiá-los e salvá-los em um lugar seguro.',
    generate_new_title: 'Gerar novos códigos de backup',
    generate_new: 'Gerar novos códigos de backup',
    delete_confirmation_title: 'Remover seus códigos de backup',
    delete_confirmation_description:
      'Se você remover estes códigos de backup, não poderá usá-los para verificação.',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Adicionado: {{date}}',
    last_used: 'Último uso: {{date}}',
    never_used: 'Nunca',
    unnamed: 'Passkey sem nome',
    renamed: 'Passkey renomeado com sucesso.',
    add_another_title: 'Adicionar outro passkey',
    add_another_description:
      'Registre seu passkey usando biometria do dispositivo, chaves de segurança (ex: YubiKey) ou outros métodos disponíveis.',
    add_passkey: 'Adicionar um passkey',
    delete_confirmation_title: 'Remover passkey',
    delete_confirmation_description:
      'Tem certeza de que deseja remover "{{name}}"? Você não poderá mais usar este passkey para fazer login.',
    rename_passkey: 'Renomear passkey',
    rename_description: 'Digite um novo nome para este passkey.',
  },
};

export default Object.freeze(account_center);
