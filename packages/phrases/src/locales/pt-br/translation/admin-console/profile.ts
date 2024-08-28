const profile = {
  page_title: 'Configurações da conta',
  title: 'Configurações da conta',
  description:
    'Altere suas configurações de conta e gerencie suas informações pessoais aqui para garantir a segurança da sua conta.',
  settings: {
    title: 'CONFIGURAÇÕES DO PERFIL',
    profile_information: 'Informações do perfil',
    avatar: 'Avatar',
    name: 'Nome',
    username: 'Nome de usuário',
  },
  link_account: {
    title: 'LINKAR CONTA',
    email_sign_in: 'Login por e-mail',
    email: 'E-mail',
    social_sign_in: 'Login social',
    link_email: 'Vincular e-mail',
    link_email_subtitle: 'Vincule seu e-mail para fazer login ou ajudar na recuperação da conta.',
    email_required: 'E-mail obrigatório',
    invalid_email: 'Endereço de e-mail inválido',
    identical_email_address: 'O endereço de e-mail inserido é idêntico ao atual',
    anonymous: 'Anônimo',
  },
  password: {
    title: 'SENHA E SEGURANÇA',
    password: 'Senha',
    password_setting: 'Configuração de senha',
    new_password: 'Nova senha',
    confirm_password: 'Confirme a senha',
    enter_password: 'Digite a senha atual',
    enter_password_subtitle:
      'Verifique se é você para proteger a segurança da sua conta. Por favor, digite sua senha atual antes de alterá-la.',
    set_password: 'Definir senha',
    verify_via_password: 'Verificar via senha',
    show_password: 'Mostrar senha',
    required: 'Senha obrigatória',
    do_not_match: 'As senhas não coincidem. Tente novamente.',
  },
  code: {
    enter_verification_code: 'Digite o código de verificação',
    enter_verification_code_subtitle:
      'O código de verificação foi enviado para <strong>{{target}}</strong>',
    verify_via_code: 'Verificar via código de verificação',
    resend: 'Reenviar código de verificação',
    resend_countdown: 'Reenviar em {{countdown}} segundos',
  },
  delete_account: {
    title: 'EXCLUIR CONTA',
    label: 'Excluir conta',
    description:
      'Excluir sua conta removerá todas as suas informações pessoais, dados do usuário e configurações. Essa ação não pode ser desfeita.',
    button: 'Excluir conta',
  },
  set: 'Configurar',
  change: 'Alterar',
  link: 'Linkar',
  unlink: 'Deslinkar',
  not_set: 'Não definido',
  change_avatar: 'Alterar avatar',
  change_name: 'Alterar nome',
  change_username: 'Alterar nome de usuário',
  set_name: 'Definir nome',
  email_changed: 'E-mail alterado.',
  password_changed: 'Senha alterada.',
  updated: '{{target}} atualizado.',
  linked: '{{target}} conectada.',
  unlinked: '{{target}} desconectada.',
  email_exists_reminder:
    'Este e-mail {{email}} está associado a uma conta existente. Vincule outro e-mail aqui.',
  unlink_confirm_text: 'Sim, deslinkar',
  unlink_reminder:
    'Os usuários não poderão fazer login com a conta <span></span> se você deslinká-la. Tem certeza de que deseja prosseguir?',
};

export default Object.freeze(profile);
