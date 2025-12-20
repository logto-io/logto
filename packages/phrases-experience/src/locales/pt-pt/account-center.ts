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
    error_send_failed: 'Falha ao enviar o código de verificação. Tente novamente mais tarde.',
    error_invalid_code: 'O código de verificação é inválido ou expirou.',
    error_verify_failed: 'Falha na verificação. Introduza novamente o código.',
    verification_required: 'A verificação expirou. Confirme novamente a sua identidade.',
    try_another_method: 'Tente outro método para verificar',
  },
  password_verification: {
    title: 'Verificar palavra-passe',
    description:
      'Para proteger a sua conta, introduza a sua palavra-passe para confirmar a sua identidade.',
    error_failed: 'Falha na verificação. Verifique a sua palavra-passe.',
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
    success: 'E-mail principal associado com sucesso.',
    verification_required: 'A verificação expirou. Confirme novamente a sua identidade.',
  },
  phone: {
    title: 'Associar número de telefone',
    description:
      'Associe o seu número de telefone para iniciar sessão ou ajudar na recuperação da conta.',
    verification_title: 'Introduza o código de verificação SMS',
    verification_description:
      'O código de verificação foi enviado para o seu telefone {{phone_number}}.',
    success: 'Telefone principal associado com sucesso.',
    verification_required: 'A verificação expirou. Confirme novamente a sua identidade.',
  },
  username: {
    title: 'Definir nome de utilizador',
    description: 'O nome de utilizador deve conter apenas letras, números e sublinhados.',
    success: 'Nome de utilizador atualizado com sucesso.',
  },
  password: {
    title: 'Definir palavra-passe',
    description: 'Crie uma nova palavra-passe para proteger a sua conta.',
    success: 'Palavra-passe atualizada com sucesso.',
  },

  code_verification: {
    send: 'Enviar código de verificação',
    resend: 'Ainda não recebeu? <a>Reenviar código de verificação</a>',
    resend_countdown: 'Ainda não recebeu?<span> Reenvie após {{seconds}} s.</span>',
  },

  email_verification: {
    title: 'Verifique o seu e-mail',
    prepare_description:
      'Confirme que é você para proteger a segurança da sua conta. Envie o código de verificação para o seu e-mail.',
    email_label: 'Endereço de e-mail',
    send: 'Enviar código de verificação',
    description:
      'O código de verificação foi enviado para o e-mail {{email}}. Introduza o código para continuar.',
    resend: 'Ainda não recebeu? <a>Reenviar código de verificação</a>',
    resend_countdown: 'Ainda não recebeu?<span> Reenvie após {{seconds}} s.</span>',
    error_send_failed: 'Falha ao enviar o código de verificação. Tente novamente mais tarde.',
    error_verify_failed: 'Falha na verificação. Introduza novamente o código.',
    error_invalid_code: 'O código de verificação é inválido ou expirou.',
  },
  phone_verification: {
    title: 'Verifique o seu telefone',
    prepare_description:
      'Confirme que é você para proteger a segurança da sua conta. Envie o código de verificação para o seu telefone.',
    phone_label: 'Número de telefone',
    send: 'Enviar código de verificação',
    description:
      'O código de verificação foi enviado para o seu telefone {{phone}}. Introduza o código para continuar.',
    resend: 'Ainda não recebeu? <a>Reenviar código de verificação</a>',
    resend_countdown: 'Ainda não recebeu?<span> Reenvie após {{seconds}} s.</span>',
    error_send_failed: 'Falha ao enviar o código de verificação. Tente novamente mais tarde.',
    error_verify_failed: 'Falha na verificação. Introduza novamente o código.',
    error_invalid_code: 'O código de verificação é inválido ou expirou.',
  },
  mfa: {
    totp_already_added: 'Já adicionou uma aplicação de autenticação. Remova a existente primeiro.',
    totp_not_enabled:
      'A aplicação de autenticação não está ativa. Contacte o administrador para a ativar.',
    backup_code_already_added:
      'Já tem códigos de cópia de segurança ativos. Utilize-os ou remova-os antes de gerar novos.',
    backup_code_not_enabled:
      'O código de cópia de segurança não está ativado. Contacte o administrador para o ativar.',
    backup_code_requires_other_mfa:
      'Os códigos de cópia de segurança requerem que outro método MFA seja configurado primeiro.',
    passkey_not_enabled: 'Passkey não está ativado. Contacte o administrador para o ativar.',
  },
  update_success: {
    default: {
      title: 'Atualizado!',
      description: 'Os seus dados foram atualizados.',
    },
    email: {
      title: 'E-mail atualizado!',
      description: 'O seu endereço de e-mail foi atualizado com sucesso.',
    },
    phone: {
      title: 'Número de telemóvel atualizado!',
      description: 'O seu número de telemóvel foi atualizado com sucesso.',
    },
    username: {
      title: 'Nome de utilizador alterado!',
      description: 'O seu nome de utilizador foi atualizado com sucesso.',
    },

    password: {
      title: 'Palavra-passe alterada!',
      description: 'A sua palavra-passe foi atualizada com sucesso.',
    },
    totp: {
      title: 'Aplicação de autenticação adicionada!',
      description: 'A sua aplicação de autenticação foi associada com sucesso à sua conta.',
    },
    backup_code: {
      title: 'Códigos de cópia de segurança gerados!',
      description:
        'Os seus códigos de cópia de segurança foram guardados. Guarde-os num local seguro.',
    },
    backup_code_deleted: {
      title: 'Códigos de cópia de segurança removidos!',
      description: 'Os seus códigos de cópia de segurança foram removidos da sua conta.',
    },
    passkey: {
      title: 'Passkey adicionado!',
      description: 'O seu passkey foi associado com sucesso à sua conta.',
    },
    passkey_deleted: {
      title: 'Passkey removido!',
      description: 'O seu passkey foi removido da sua conta.',
    },
    social: {
      title: 'Conta social associada!',
      description: 'A sua conta social foi associada com sucesso.',
    },
  },
  backup_code: {
    title: 'Códigos de cópia de segurança',
    description:
      'Pode utilizar um destes códigos de cópia de segurança para aceder à sua conta se tiver problemas durante a verificação em duas etapas de outra forma. Cada código só pode ser utilizado uma vez.',
    copy_hint: 'Certifique-se de os copiar e guardar num local seguro.',
    generate_new_title: 'Gerar novos códigos de cópia de segurança',
    generate_new: 'Gerar novos códigos de cópia de segurança',
    delete_confirmation_title: 'Remover os seus códigos de cópia de segurança',
    delete_confirmation_description:
      'Se remover estes códigos de cópia de segurança, não poderá utilizá-los para verificação.',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Adicionado: {{date}}',
    last_used: 'Última utilização: {{date}}',
    never_used: 'Nunca',
    unnamed: 'Passkey sem nome',
    renamed: 'Passkey renomeado com sucesso.',
    add_another_title: 'Adicionar outro passkey',
    add_another_description:
      'Registe o seu passkey utilizando biometria do dispositivo, chaves de segurança (ex: YubiKey) ou outros métodos disponíveis.',
    add_passkey: 'Adicionar um passkey',
    delete_confirmation_title: 'Remover passkey',
    delete_confirmation_description:
      'Tem a certeza de que deseja remover "{{name}}"? Não poderá utilizar este passkey para iniciar sessão.',
    rename_passkey: 'Renomear passkey',
    rename_description: 'Introduza um novo nome para este passkey.',
  },
};

export default Object.freeze(account_center);
