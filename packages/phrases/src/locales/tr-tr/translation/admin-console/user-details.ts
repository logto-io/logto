const user_details = {
  back_to_users: 'Kullanıcı Yönetimine Geri Dön',
  created_title: 'Bu kullanıcı başarıyla oluşturuldu',
  created_guide: 'Kullanıcıya aşağıdaki oturum açma bilgilerini gönderebilirsiniz',
  created_username: 'Kullanıcı Adı:',
  created_password: 'Şifre:',
  menu_delete: 'Sil',
  delete_description: 'Bu işlem geri alınamaz. Kullanıcıyı kalıcı olarak siler.',
  deleted: 'Kullanıcı başarıyla silindi.',
  reset_password: {
    reset_password: 'Şifreyi sıfırla',
    title: 'Şifreyi sıfırlamak istediğinizden emin misiniz?',
    content: 'Bu işlem geri alınamaz. Bu, kullanıcının oturum açma bilgilerini sıfırlayacaktır.',
    congratulations: 'Bu kullanıcı sıfırlandı',
    new_password: 'Yeni şifre:',
  },
  tab_settings: 'Settings', // UNTRANSLATED
  tab_roles: 'Roles', // UNTRANSLATED
  tab_logs: 'Kullanıcı kayıtları',
  settings: 'Settings', // UNTRANSLATED
  settings_description:
    'Each user has a profile containing all user information. It consists of basic data, social identities, and custom data.', // UNTRANSLATED
  field_email: 'Öncelikli e-posta adresi',
  field_phone: 'Öncelikli telefon',
  field_username: 'Kullanıcı Adı',
  field_name: 'İsim',
  field_avatar: 'Avatar resmi URLi',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: 'Özel veriler',
  field_custom_data_tip:
    'Kullanıcı tarafından tercih edilen renk ve dil gibi önceden tanımlanmış kullanıcı özelliklerinde listelenmeyen ek kullanıcı bilgileri.',
  field_connectors: 'Social connectors',
  custom_data_invalid: 'Özel veriler geçerli bir JSON nesnesi olmalıdır',
  connectors: {
    connectors: 'Connectors',
    user_id: 'Kullanıcı IDsi',
    remove: 'Kaldır',
    not_connected: 'Kullanıcı herhangi bir social connectora bağlı değil',
    deletion_confirmation:
      'Mevcut <name/> kimliğini kaldırıyorsunuz. Bunu yapmak istediğinizden emin misiniz?',
  },
  suspended: 'Suspended', // UNTRANSLATED
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
