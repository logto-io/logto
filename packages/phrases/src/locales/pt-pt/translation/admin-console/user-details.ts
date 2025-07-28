const user_details = {
  page_title: 'Detalhes do utilizador',
  back_to_users: 'Voltar à gestão de utilizadores',
  created_title: 'Este utilizador foi criado com sucesso',
  created_guide: 'Aqui está a informação para ajudar o utilizador no processo de login.',
  created_email: 'Endereço de email:',
  created_phone: 'Número de telefone:',
  created_username: 'Nome de utilizador:',
  created_password: 'Palavra-passe:',
  menu_delete: 'eliminar',
  delete_description:
    'Esta ação não pode ser desfeita. Isso irá eliminar o utilizador permanentemente.',
  deleted: 'O utilizador foi eliminado com sucesso',
  reset_password: {
    reset_title: 'Tem a certeza de que deseja redefinir a palavra-passe?',
    generate_title: 'Tem a certeza de que deseja gerar uma palavra-passe?',
    content:
      'Esta ação não pode ser desfeita. Isso irá redefinir as informações de login do utilizador.',
    reset_complete: 'Este utilizador foi redefinido',
    generate_complete: 'A palavra-passe foi gerada',
    new_password: 'Nova palavra-passe:',
    password: 'Palavra-passe:',
  },
  tab_settings: 'Definições',
  tab_roles: 'Funções de usuário',
  tab_logs: 'Registos do utilizador',
  tab_organizations: 'Organizações',
  authentication: 'Autenticação',
  authentication_description:
    'Cada utilizador tem um perfil que contém todas as informações do utilizador. Consiste em dados básicos, identidades sociais e dados personalizados.',
  user_profile: 'Perfil de utilizador',
  field_email: 'Endereço de email',
  field_phone: 'Número de telefone',
  field_username: 'Nome de utilizador',
  field_password: 'Palavra-passe',
  field_name: 'Nome',
  field_avatar: 'URL da imagem do avatar',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: 'Dados personalizados',
  field_custom_data_tip:
    'Informações adicionais do utilizador não listadas nas propriedades predefinidas, ex: idioma preferido pelo utilizador.',
  field_profile: 'Perfil',
  field_profile_tip:
    'Reivindicações adicionais do padrão OpenID Connect que não estão incluídas nas propriedades do usuário. Note que todas as propriedades desconhecidas serão removidas. Consulte a <a>referência da propriedade do perfil</a> para mais informações.',
  field_connectors: 'Conexões sociais',
  field_sso_connectors: 'Conexões empresariais',
  custom_data_invalid: 'Os dados personalizados devem ser um objeto JSON válido',
  profile_invalid: 'O perfil deve ser um objeto JSON válido',
  password_already_set: 'Palavra-passe já definida',
  no_password_set: 'Nenhuma palavra-passe definida',
  connectors: {
    connectors: 'Conectores',
    user_id: 'ID do utilizador',
    remove: 'Remover',
    connected: 'Este utilizador está conectado a múltiplos conectores sociais.',
    not_connected: 'O utilizador não está conectado a nenhum conector social',
    deletion_confirmation:
      'Está a remover a identidade existente <name/>. Tem a certeza de que deseja continuar?',
  },
  sso_connectors: {
    connectors: 'Conetores',
    enterprise_id: 'ID da empresa',
    connected:
      'Este utilizador está conectado a múltiplos provedores de identidade empresarial para Início de Sessão Único.',
    not_connected:
      'O utilizador não está conectado a nenhum provedor de identidade empresarial para Início de Sessão Único.',
  },
  mfa: {
    field_name: 'Autenticação de dois fatores',
    field_description: 'Este utilizador ativou fatores de autenticação de 2 etapas.',
    name_column: 'Autenticação de dois fatores',
    field_description_empty: 'Este utilizador não ativou fatores de autenticação de 2 passos.',
    deletion_confirmation:
      'Está a remover o existente <name/> para a verificação em duas etapas. Tem a certeza de que deseja continuar?',
  },
  suspended: 'suspenso',
  suspend_user: 'Suspender utilizador',
  suspend_user_reminder:
    'Tem a certeza de que deseja suspender este utilizador? O utilizador não conseguirá entrar na sua aplicação e não será capaz de obter um novo Token de acesso após o termo atual. Além disso, qualquer pedido API feito por este utilizador irá falhar.',
  suspend_action: 'Suspender',
  user_suspended: 'O utilizador foi suspenso.',
  reactivate_user: 'Reativar utilizador',
  reactivate_user_reminder:
    'Tem a certeza de que deseja reativar este utilizador? Isso permitirá tentativas de login para este utilizador.',
  reactivate_action: 'Reativar',
  user_reactivated: 'O utilizador foi reativado.',
  roles: {
    name_column: 'Função de usuário',
    description_column: 'Descrição',
    assign_button: 'Atribuir funções',
    delete_description:
      'Esta ação irá remover esta função deste utilizador. A função em si ainda existirá, mas não estará mais associada a este utilizador.',
    deleted: '{{name}} foi removido do utilizador com sucesso.',
    assign_title: 'Atribuir funções a {{name}}',
    assign_subtitle:
      'Encontre funções de usuário apropriadas pesquisando por nome, descrição ou ID de função.',
    assign_role_field: 'Atribuir funções',
    role_search_placeholder: 'Pesquisar pelo nome da função',
    added_text: '{{value, number}} adicionados',
    assigned_user_count: '{{value, number}} utilizador(es)',
    confirm_assign: 'Atribuir funções',
    role_assigned: 'Função(ões) atribuída(s) com sucesso',
    search: 'Pesquisar pelo nome, descrição ou ID da função',
    empty: 'Nenhuma função disponível',
  },
  warning_no_sign_in_identifier:
    'O utilizador precisa de ter pelo menos um dos identificadores de início de sessão (nome de utilizador, e-mail, número de telefone ou redes sociais) para iniciar sessão. Tem a certeza de que quer continuar?',
  personal_access_tokens: {
    title: 'Token de acesso pessoal',
    title_other: 'Tokens de acesso pessoal',
    title_short: 'token',
    empty: 'O utilizador não possui nenhum token de acesso pessoal.',
    create: 'Criar novo token',
    tip: 'Tokens de acesso pessoal (PATs) fornecem uma maneira segura para os utilizadores concederem tokens de acesso sem usar as suas credenciais e login interativo. Isso é útil para CI/CD, scripts ou aplicações que precisam acessar recursos programaticamente.',
    value: 'Valor',
    created_at: 'Criado em',
    expires_at: 'Expira em',
    never: 'Nunca',
    create_new_token: 'Criar novo token',
    delete_confirmation:
      'Esta ação não pode ser desfeita. Tem a certeza de que deseja eliminar este token?',
    expired: 'Expirado',
    expired_tooltip: 'Este token expirou em {{date}}.',
    create_modal: {
      title: 'Criar token de acesso pessoal',
      expiration: 'Expiração',
      expiration_description: 'O token expirará em {{date}}.',
      expiration_description_never:
        'O token nunca expirará. Recomendamos definir uma data de expiração para maior segurança.',
      days: '{{count}} dia',
      days_other: '{{count}} dias',
      created: 'O token {{name}} foi criado com sucesso.',
    },
    edit_modal: {
      title: 'Editar token de acesso pessoal',
      edited: 'O token {{name}} foi editado com sucesso.',
    },
  },
  connections: {
    title: 'Ligação',
    description:
      'O utilizador liga contas de terceiros para login social, SSO empresarial ou acesso a recursos.',
    token_status_column: 'Estado do token',
    token_status: {
      active: 'Ativo',
      expired: 'Expirado',
      inactive: 'Inativo',
      not_applicable: 'Não aplicável',
      available: 'Disponível',
      not_available: 'Indisponível',
    },
  },
};

export default Object.freeze(user_details);
