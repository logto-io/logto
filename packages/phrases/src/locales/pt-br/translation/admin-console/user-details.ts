const user_details = {
  page_title: 'Detalhes do usuário',
  back_to_users: 'Voltar para gerenciamento de usuários',
  created_title: 'Este usuário foi criado com sucesso',
  created_guide: 'Aqui está a informação para ajudar o usuário com o processo de login.',
  created_email: 'Endereço de e-mail:',
  created_phone: 'Número de telefone:',
  created_username: 'Nome de usuário:',
  created_password: 'Senha:',
  menu_delete: 'Excluir',
  delete_description: 'Essa ação não pode ser desfeita. Isso excluirá permanentemente o usuário.',
  deleted: 'O usuário foi excluído com sucesso',
  reset_password: {
    reset_password: 'Redefinir senha',
    title: 'Tem certeza de que deseja redefinir a senha?',
    content: 'Essa ação não pode ser desfeita. Isso redefinirá as informações de login do usuário.',
    congratulations: 'Este usuário foi redefinido',
    new_password: 'Nova senha:',
  },
  tab_settings: 'Configurações',
  tab_roles: 'Papéis de usuário',
  tab_logs: 'Registros',
  tab_organizations: 'Organizações',
  authentication: 'Autenticação',
  authentication_description:
    'Cada usuário tem um perfil contendo todas as informações do usuário. Consiste em dados básicos, identidades sociais e dados personalizados.',
  user_profile: 'Perfil do usuário',
  field_email: 'Endereço de e-mail',
  field_phone: 'Número de telefone',
  field_username: 'Nome de usuário',
  field_name: 'Nome',
  field_avatar: 'URL da imagem do avatar',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: 'Dados personalizados',
  field_custom_data_tip:
    'Informações adicionais do usuário não listadas nas propriedades de usuário predefinidas, como cor e idioma preferidos do usuário.',
  field_profile: 'Perfil',
  field_profile_tip:
    'Declarações OpenID Connect padrão adicionais que não estão incluídas nas propriedades do usuário. Observe que todas as propriedades desconhecidas serão removidas. Por favor, consulte a <a>referência das propriedades de perfil</a> para mais informações.',
  field_connectors: 'Conectores de login sociais',
  field_sso_connectors: 'Conexões empresariais',
  custom_data_invalid: 'Os dados personalizados devem ser um objeto JSON válido',
  profile_invalid: 'O perfil deve ser um objeto JSON válido',
  connectors: {
    connectors: 'Conectores',
    user_id: 'ID do usuário',
    remove: 'Remover',
    connected: 'Este usuário está conectado com vários conectores sociais.',
    not_connected: 'O usuário não está conectado a nenhum conector social',
    deletion_confirmation:
      'Você está removendo a identidade existente <name/>. Tem certeza de que deseja continuar?',
  },
  sso_connectors: {
    connectors: 'Conectores',
    enterprise_id: 'ID da empresa',
    connected:
      'Este usuário está conectado a vários fornecedores de identidade empresarial para Entrada Única.',
    not_connected:
      'O usuário não está conectado a nenhum provedor de identidade empresarial para Entrada Única.',
  },
  mfa: {
    field_name: 'Autenticação de dois fatores',
    field_description: 'Este usuário habilitou fatores de autenticação de 2 etapas.',
    name_column: 'Autenticação de dois fatores',
    field_description_empty: 'Este usuário não habilitou fatores de autenticação em duas etapas.',
    deletion_confirmation:
      'Você está removendo o existente <name/> para a verificação em duas etapas. Tem certeza de que deseja continuar?',
  },
  suspended: 'Suspenso',
  suspend_user: 'Suspender usuário',
  suspend_user_reminder:
    'Tem certeza de que deseja suspender este usuário? O usuário não poderá entrar em seu aplicativo e não poderá obter um novo token de acesso após a expiração do atual. Além disso, qualquer solicitação de API feita por este usuário falhará.',
  suspend_action: 'Suspender',
  user_suspended: 'O usuário foi suspenso',
  reactivate_user: 'Reativar usuário',
  reactivate_user_reminder:
    'Tem certeza de que deseja reativar este usuário? Fazendo isso permitirá quaisquer tentativas de login para este usuário.',
  reactivate_action: 'Reativar',
  user_reactivated: 'O usuário foi reativado',
  roles: {
    name_column: 'Papel de usuário',
    description_column: 'Descrição',
    assign_button: 'Atribuir papéis',
    delete_description:
      'Esta ação removerá esta função deste usuário. A função em si ainda existirá, mas não estará mais associada a este usuário.',
    deleted: '{{name}} foi removido com sucesso deste usuário.',
    assign_title: 'Atribuir papéis a {{name}}',
    assign_subtitle:
      'Encontre papéis de usuário apropriados buscando pelo nome, descrição ou ID do papel.',
    assign_role_field: 'Atribuir funções',
    role_search_placeholder: 'Pesquisar por nome de função',
    added_text: '{{value, number}} adicionado(s)',
    assigned_user_count: '{{value, number}} usuários',
    confirm_assign: 'Atribuir papéis',
    role_assigned: 'Função(ões) atribuída(s) com sucesso',
    search: 'Pesquisar por nome de função, descrição ou ID',
    empty: 'Nenhuma função disponível',
  },
  warning_no_sign_in_identifier:
    'O usuário precisa ter pelo menos um dos identificadores de login (nome de usuário, e-mail, número de telefone ou social) para fazer login. Tem certeza de que deseja continuar?',
};

export default Object.freeze(user_details);
