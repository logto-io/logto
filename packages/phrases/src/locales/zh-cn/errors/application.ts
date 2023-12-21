const application = {
  invalid_type: '只有机器对机器应用程序可以有关联角色。',
  role_exists: '角色 ID {{roleId}} 已添加到此应用程序。',
  invalid_role_type: '无法将用户类型角色分配给机器对机器应用程序。',
  invalid_third_party_application_type: '只有传统网络应用程序可以标记为第三方应用。',
  third_party_application_only: '该功能仅适用于第三方应用程序。',
  user_consent_scopes_not_found: '无效的用户同意范围。',
};

export default Object.freeze(application);
