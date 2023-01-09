const user_details = {
  back_to_users: 'Voltar a gestão de utilizadores',
  created_title: 'Este utilizador foi criado com sucesso',
  created_guide: 'Pode enviar as seguintes informações de login para o utilizador',
  created_username: 'Utilizador:',
  created_password: 'Password:',
  menu_delete: 'eliminar',
  delete_description:
    'Esta ação não pode ser desfeita. Isso ira eliminar o utilizador permanentemente.',
  deleted: 'The user has been successfully deleted',
  reset_password: {
    reset_password: 'Redefinir password',
    title: 'Tem a certeza que deseja redefinir a password?',
    content:
      'Esta ação não pode ser desfeita. Isso irá redefinir as informações de login do utilizador.',
    congratulations: 'Este utilizador foi redefinido',
    new_password: 'Nova password:',
  },
  tab_settings: 'Settings', // UNTRANSLATED
  tab_roles: 'Roles', // UNTRANSLATED
  tab_logs: 'Registros do utilizador',
  settings: 'Settings', // UNTRANSLATED
  settings_description:
    'Each user has a profile containing all user information. It consists of basic data, social identities, and custom data.', // UNTRANSLATED
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
  suspended: 'Suspended', // UNTRANSLATED
  roles: {
    name_column: 'Role', // UNTRANSLATED
    description_column: 'Description', // UNTRANSLATED
    assign_button: 'Assign Roles', // UNTRANSLATED
    delete_description: 'TBD', // UNTRANSLATED
    deleted: 'The role {{name}} has been successfully deleted from the user.', // UNTRANSLATED
  },
};

export default user_details;
