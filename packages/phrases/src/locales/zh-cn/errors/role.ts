const role = {
  name_in_use: '此角色名称 {{name}} 已被使用',
  scope_exists: '作用域 ID {{scopeId}} 已添加到此角色',
  management_api_scopes_not_assignable_to_user_role: '无法将管理 API 作用域分配给用户角色。',
  user_exists: '用户 ID {{userId}} 已添加到此角色',
  application_exists: '应用程序 ID {{applicationId}} 已添加到此角色',
  default_role_missing: '某些默认角色名称在数据库中不存在，请确保先创建角色',
  internal_role_violation:
    '你可能正在尝试更新或删除 Logto 禁止的内部角色。如果你要创建新角色，请尝试使用不以“#internal:”开头的名称。',
};

export default Object.freeze(role);
