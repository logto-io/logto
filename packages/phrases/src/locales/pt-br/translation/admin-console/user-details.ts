const user_details = {
  back_to_users: 'Voltar para gerenciamento de usuários',
  created_title: 'Este usuário foi criado com sucesso',
  created_guide: 'Você pode enviar as seguintes informações de login para o usuário',
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
  tab_settings: 'Settings', // UNTRANSLATED
  tab_roles: 'Roles', // UNTRANSLATED
  tab_logs: 'Logs',
  settings: 'Configurações',
  settings_description:
    'Cada usuário tem um perfil contendo todas as informações do usuário. Consiste em dados básicos, identidades sociais e dados personalizados.',
  field_email: 'E-mail principal',
  field_phone: 'Telefone principal',
  field_username: 'Nome de usuário',
  field_name: 'Nome',
  field_avatar: 'URL da imagem do avatar',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: 'Dados personalizados',
  field_custom_data_tip:
    'Informações adicionais do usuário não listadas nas propriedades de usuário predefinidas, como cor e idioma preferidos do usuário.',
  field_connectors: 'Conectores de login sociais',
  custom_data_invalid: 'Os dados personalizados devem ser um objeto JSON válido',
  connectors: {
    connectors: 'Conectores',
    user_id: 'ID do usuário',
    remove: 'Remover',
    not_connected: 'O usuário não está conectado a nenhum conector social',
    deletion_confirmation:
      'Você está removendo a identidade <name/> existente. Você tem certeza que deseja fazer isso?',
  },
  suspended: 'Suspenso',
  roles: {
    name_column: 'Role', // UNTRANSLATED
    description_column: 'Description', // UNTRANSLATED
    assign_button: 'Assign Roles', // UNTRANSLATED
    delete_description:
      'This action will remove this role from this user. The role itself will still exist, but it will no longer be associated with this user.', // UNTRANSLATED
    deleted: '{{name}} was successfully removed from this user!', // UNTRANSLATED
    assign_title: 'Assign roles to {{name}}', // UNTRANSLATED
    assign_subtitle: 'Authorize {{name}} one or more roles', // UNTRANSLATED
    assign_role_field: 'Assign roles', // UNTRANSLATED
    role_search_placeholder: 'Search by role name', // UNTRANSLATED
    added_text: '{{value, number}} added', // UNTRANSLATED
    assigned_user_count: '{{value, number}} users', // UNTRANSLATED
    confirm_assign: 'Assign roles', // UNTRANSLATED
    role_assigned: 'Successfully assigned role(s)', // UNTRANSLATED
    search: 'Search by role name, description or ID', // UNTRANSLATED
    empty: 'No role available', // UNTRANSLATED
  },
};

export default user_details;
