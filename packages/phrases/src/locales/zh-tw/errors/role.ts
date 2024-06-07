const role = {
  name_in_use: '此角色名稱 {{name}} 已被使用',
  scope_exists: '作用域 ID {{scopeId}} 已添加到此角色',
  management_api_scopes_not_assignable_to_user_role: '無法將管理 API 作用域分配給用戶角色。',
  user_exists: '用戶 ID {{userId}} 已添加到此角色',
  application_exists: '已經將應用程式 ID {{applicationId}} 添加到此角色',
  default_role_missing: '某些預設角色名稱在資料庫中不存在，請確保先創建角色',
  internal_role_violation:
    '你可能正在嘗試更新或刪除 Logto 禁止的內部角色。如果你要創建新角色，請嘗試使用不以“#internal:”開頭的名稱。',
};

export default Object.freeze(role);
