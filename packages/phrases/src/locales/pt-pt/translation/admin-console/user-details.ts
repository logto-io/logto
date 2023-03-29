const user_details = {
  page_title: 'Detalhes do utilizador',
  back_to_users: 'Voltar a gestão de utilizadores',
  created_title: 'Este utilizador foi criado com sucesso',
  created_guide: 'Pode enviar as seguintes informações de login para o utilizador',
  created_username: 'Utilizador:',
  created_password: 'Password:',
  menu_delete: 'eliminar',
  delete_description:
    'Esta ação não pode ser desfeita. Isso ira eliminar o utilizador permanentemente.',
  deleted: 'O utilizador foi eliminado com sucesso',
  reset_password: {
    reset_password: 'Redefinir password',
    title: 'Tem a certeza que deseja redefinir a password?',
    content:
      'Esta ação não pode ser desfeita. Isso irá redefinir as informações de login do utilizador.',
    congratulations: 'Este utilizador foi redefinido',
    new_password: 'Nova password:',
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
