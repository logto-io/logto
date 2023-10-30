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
    reset_password: 'Redefinir palavra-passe',
    title: 'Tem a certeza de que deseja redefinir a palavra-passe?',
    content:
      'Esta ação não pode ser desfeita. Isso irá redefinir as informações de login do utilizador.',
    congratulations: 'Este utilizador foi redefinido',
    new_password: 'Nova palavra-passe:',
  },
  tab_settings: 'Definições',
  tab_roles: 'Funções',
  tab_logs: 'Registos do utilizador',
  /** UNTRANSLATED */
  tab_organizations: 'Organizations',
  /** UNTRANSLATED */
  authentication: 'Authentication',
  authentication_description:
    'Cada utilizador tem um perfil que contém todas as informações do utilizador. Consiste em dados básicos, identidades sociais e dados personalizados.',
  /** UNTRANSLATED */
  user_profile: 'User profile',
  field_email: 'Endereço de email',
  field_phone: 'Número de telefone',
  field_username: 'Nome de utilizador',
  field_name: 'Nome',
  field_avatar: 'URL da imagem do avatar',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: 'Dados personalizados',
  field_custom_data_tip:
    'Informações adicionais do utilizador não listadas nas propriedades predefinidas, ex: idioma preferido pelo utilizador.',
  field_connectors: 'Conexões sociais',
  /** UNTRANSLATED */
  field_sso_connectors: 'Enterprise connections',
  custom_data_invalid: 'Os dados personalizados devem ser um objeto JSON válido',
  connectors: {
    connectors: 'Conectores',
    user_id: 'ID do utilizador',
    remove: 'Remover',
    /** UNTRANSLATED */
    connected: 'This user is connected with multiple social connectors.',
    not_connected: 'O utilizador não está conectado a nenhum conector social',
    deletion_confirmation:
      'Está a remover a identidade existente <name/>. Tem a certeza de que deseja continuar?',
  },
  sso_connectors: {
    /** UNTRANSLATED */
    connectors: 'Connectors',
    /** UNTRANSLATED */
    enterprise_id: 'Enterprise ID',
    /** UNTRANSLATED */
    connected:
      'This user is connected to multiple enterprise identity providers for Single Sign-On.',
    /** UNTRANSLATED */
    not_connected:
      'The user is not connected to any enterprise identity providers for Single Sign-On.',
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
    name_column: 'Função',
    description_column: 'Descrição',
    assign_button: 'Atribuir funções',
    delete_description:
      'Esta ação irá remover esta função deste utilizador. A função em si ainda existirá, mas não estará mais associada a este utilizador.',
    deleted: '{{name}} foi removido do utilizador com sucesso.',
    assign_title: 'Atribuir funções a {{name}}',
    assign_subtitle: 'Autorize {{name}} uma ou mais funções',
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
  /** UNTRANSLATED */
  organization_roles_tooltip:
    'Organization roles assigned to the current user in this organization.',
};

export default Object.freeze(user_details);
