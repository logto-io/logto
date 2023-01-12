const user_details = {
  back_to_users: '返回用户管理',
  created_title: '用户创建成功',
  created_guide: '你可以将以下登录信息发送给用户',
  created_username: '用户名：',
  created_password: '密码：',
  menu_delete: '删除用户',
  delete_description: '本操作将永久删除该用户，且无法撤销。',
  deleted: '用户已成功删除！',
  reset_password: {
    reset_password: '重置密码',
    title: '确定要重置密码？',
    content: '本操作不可撤销，将会重置用户的登录信息。',
    congratulations: '该用户已被重置',
    new_password: '新密码：',
  },
  tab_settings: 'Settings', // UNTRANSLATED
  tab_roles: 'Roles', // UNTRANSLATED
  tab_logs: '用户日志',
  settings: 'Settings', // UNTRANSLATED
  settings_description:
    'Each user has a profile containing all user information. It consists of basic data, social identities, and custom data.', // UNTRANSLATED
  field_email: '主要邮箱',
  field_phone: '主要手机号码',
  field_username: '用户名',
  field_name: '姓名',
  field_avatar: '头像图片链接',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: '自定义数据',
  field_custom_data_tip: '预定义属性之外的用户信息，例如用户偏好的颜色和语言。',
  field_connectors: '社交帐号',
  custom_data_invalid: '自定义数据必须是有效的 JSON 对象',
  connectors: {
    connectors: '连接器',
    user_id: '用户ID',
    remove: '删除',
    not_connected: '该用户还没有绑定社交帐号',
    deletion_confirmation: '你在正要删除现有的 <name /> 身份，是否确认？',
  },
  suspended: '已禁用',
  roles: {
    name_column: 'Role', // UNTRANSLATED
    description_column: 'Description', // UNTRANSLATED
    assign_button: 'Assign Roles', // UNTRANSLATED
    delete_description:
      'This action will removing this role from this user. The role itself will still exist, but it will no longer be associated with this user.', // UNTRANSLATED
    deleted: '{{name}} was successfully removed from this user!', // UNTRANSLATED
    assign_title: 'Assign roles to {{name}}', // UNTRANSLATED
    assign_subtitle: 'Authorize {{name}} one or more roles', // UNTRANSLATED
    assign_role_field: 'Assign roles', // UNTRANSLATED
    role_search_placeholder: 'Search by role name', // UNTRANSLATED
    added_text: '{{value, number}} added', // UNTRANSLATED
    assigned_user_count: '{{value, number}} users', // UNTRANSLATED
    confirm_assign: 'Assign roles', // UNTRANSLATED
    role_assigned: 'Successfully assigned role(s)', // UNTRANSLATED
  },
};

export default user_details;
