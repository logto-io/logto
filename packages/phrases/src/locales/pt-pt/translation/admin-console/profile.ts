const profile = {
  page_title: 'Definições da conta',
  title: 'Definições da conta',
  description:
    'Altere as suas definições de conta e gerencie suas informações pessoais aqui para garantir a segurança da sua conta.',
  settings: {
    title: 'DEFINIÇÕES DO PERFIL',
    profile_information: 'Informação do perfil',
    avatar: 'Avatar',
    name: 'Nome',
    username: 'Nome de usuário',
  },
  link_account: {
    title: 'LIGAR CONTA',
    email_sign_in: 'Registo de email',
    email: 'Email',
    social_sign_in: 'Registo social',
    link_email: 'Ligar email',
    link_email_subtitle:
      'Ligue o seu e-mail para fazer login ou ajudar na recuperação da sua conta.',
    email_required: 'Email é obrigatório',
    invalid_email: 'Endereço de email inválido',
    identical_email_address: 'O endereço de email inserido é idêntico ao atual',
    anonymous: 'Anónimo',
  },
  password: {
    title: 'PALAVRA-PASSE E SEGURANÇA',
    password: 'Palavra-passe',
    password_setting: 'Configuração da palavra-passe',
    new_password: 'Nova palavra-passe',
    confirm_password: 'Confirmar palavra-passe',
    enter_password: 'Introduza a palavra-passe atual',
    enter_password_subtitle:
      'Verifique se é realmente você para proteger a segurança da sua conta. Por favor, introduza a sua palavra-passe atual antes de a alterar.',
    set_password: 'Definir palavra-passe',
    verify_via_password: 'Verificar através da palavra-passe',
    show_password: 'Mostrar palavra-passe',
    required: 'Palavra-passe é obrigatória',
    do_not_match: 'As palavras-passe não correspondem. Por favor, tente novamente.',
  },
  code: {
    enter_verification_code: 'Introduzir código de verificação',
    enter_verification_code_subtitle:
      'O código de verificação foi enviado para <strong>{{target}}</strong>',
    verify_via_code: 'Verificar através do código de verificação',
    resend: 'Reenviar código de verificação',
    resend_countdown: 'Reenviar em {{countdown}} segundos',
  },
  delete_account: {
    title: 'APAGAR CONTA',
    label: 'Apagar conta',
    description:
      'Apagar a sua conta irá remover todas as suas informações pessoais, dados de usuário e configurações. Esta ação não pode ser desfeita.',
    button: 'Apagar conta',
  },
  set: 'Definir',
  change: 'Mudar',
  link: 'Ligar',
  unlink: 'Desligar',
  not_set: 'Não definido',
  change_avatar: 'Mudar avatar',
  change_name: 'Mudar nome',
  change_username: 'Mudar nome de usuário',
  set_name: 'Definir nome',
  email_changed: 'Email alterado.',
  password_changed: 'Palavra-passe alterada.',
  updated: '{{target}} atualizado.',
  linked: '{{target}} ligado.',
  unlinked: '{{target}} desligado.',
  email_exists_reminder:
    'Este email {{email}} está associado a uma conta existente. Conecte outro email aqui.',
  unlink_confirm_text: 'Sim, desligar',
  unlink_reminder:
    'Os usuários não poderão entrar com a conta <span></span> se você a desligar. Tem a certeza de que deseja prosseguir?',
};

export default Object.freeze(profile);
