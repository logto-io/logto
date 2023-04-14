const user_details = {
  page_title: 'Detalhes do utilizador',
  back_to_users: 'Voltar a gestão de utilizadores',
  created_title: 'Este utilizador foi criado com sucesso',
  created_guide: 'Pode enviar as seguintes informações de login para o utilizador',
  created_username: 'Utilizador:',
  created_password: 'Palavra-passe:',
  menu_delete: 'eliminar',
  delete_description:
    'Esta ação não pode ser desfeita. Isso irá eliminar o utilizador permanentemente.',
  deleted: 'O utilizador foi eliminado com sucesso',
  reset_password: {
    reset_password: 'Redefinir palavra-passe',
    title: 'Tem a certeza que deseja redefinir a palavra-passe?',
    content:
      'Esta ação não pode ser desfeita. Isso irá redefinir as informações de login do utilizador.',
    congratulations: 'Este utilizador foi redefinido',
    new_password: 'Nova palavra-passe:',
  },
  tab_settings: 'Definições',
  tab_roles: 'Funções',
  tab_logs: 'Registos do utilizador',
  settings: 'Definições',
  settings_description:
    'Cada utilizador tem um perfil que contém todas as informações do utilizador. Consiste em dados básicos, identidades sociais e dados personalizados.',
  field_email: 'Email',
  field_phone: 'Telefone',
  field_username: 'Nome de utilizador',
  field_name: 'Nome',
  field_avatar: 'URL da imagem do avatar',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: 'Dados personalizados',
  field_custom_data_tip:
    'Informações adicionais do utilizador não listadas nas propriedades predefinidas, ex: idioma preferido pelo utilizador.',
  field_connectors: 'Conexões sociais',
  custom_data_invalid: 'Os dados personalizados devem ser um objeto JSON válido',
  connectors: {
    connectors: 'Conectores',
    user_id: 'ID do utilizador',
    remove: 'Remover',
    not_connected: 'O utilizador não está conectado a nenhum conector social',
    deletion_confirmation:
      'Está removendo a identidade <name/> existente. Tem a certeza que deseja fazer isso?',
  },
  suspended: 'suspenso',
  suspend_user: 'Suspender utilizador',
  suspend_user_reminder:
    'Tem a certeza que deseja suspender este utilizador? O utilizador não conseguira entrar na sua aplicação e não será capaz de obter um novo Token de acesso após o termo do atual. Além disso, qualquer pedido API feito por este utilizador irá falhar.',
  suspend_action: 'Suspender',
  user_suspended: 'O utilizador foi suspenso.',
  reactivate_user: 'Reativar utilizador',
  reactivate_user_reminder:
    'Tem a certeza que deseja reativar este utilizador? Isso permitirá tentativas de login para este utilizador.',
  reactivate_action: 'Reativar',
  user_reactivated: 'O utilizador foi reativado.',
  roles: {
    name_column: 'Função',
    description_column: 'Descrição',
    assign_button: 'Atribuir Funções',
    delete_description:
      'Esta ação irá remover esta função deste utilizador. A função em si ainda existirá, mas não estará mais associada a este utilizador.',
    deleted: '{{name}} foi removido do utilizador com sucesso.',
    assign_title: 'Atribuir funções a {{name}}',
    assign_subtitle: 'Autorize {{name}} uma ou mais funções',
    assign_role_field: 'Atribuir funções',
    role_search_placeholder: 'Pesquisar pelo nome da função',
    added_text: '{{value, number}} adicionado',
    assigned_user_count: '{{value, number}} utilizadores',
    confirm_assign: 'Atribuir funções',
    role_assigned: 'Função(s) atribuída(s) com sucesso',
    search: 'Pesquisar pelo nome, descrição ou ID da função',
    empty: 'Nenhuma função disponível',
  },
};

export default user_details;
