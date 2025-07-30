const user_identity_details = {
  social_identity_page_title: '社交身份详情',
  back_to_user_details: '返回用户详情',
  delete_identity: '移除身份连接',
  social_account: {
    title: '社交账户',
    description: '查看从关联的 {{connectorName}} 账户同步的用户数据和资料信息。',
    provider_name: '社交身份提供者名称',
    identity_id: '社交身份 ID',
    user_profile: '从社交身份提供者同步的用户资料',
  },
  sso_account: {
    title: '企业 SSO 账户',
    description: '查看从关联的 {{connectorName}} 账户同步的用户数据和资料信息。',
    provider_name: '企业 SSO 身份提供者名称',
    identity_id: '企业 SSO 身份 ID',
    user_profile: '从企业 SSO 身份提供者同步的用户资料',
  },
  token_storage: {
    title: '访问令牌',
    description:
      '在机密保险库中存储来自 {{connectorName}} 的访问和刷新令牌。允许在不重复用户同意的情况下进行自动化 API 调用。',
  },
  access_token: {
    title: '访问令牌',
    description_active:
      '访问令牌处于活动状态，并安全地存储在机密保险库中。你的产品可以使用它访问 {{connectorName}} 的 API。',
    description_inactive:
      '此访问令牌处于非活动状态（例如，被撤销）。用户必须重新授权访问以恢复功能。',
    description_expired:
      '此访问令牌已过期。在下一次使用刷新令牌的 API 请求时会自动续订。如果刷新令牌不可用，则需要用户重新身份验证。',
  },
  refresh_token: {
    available: '刷新令牌可用。如果访问令牌过期，将使用刷新令牌自动刷新。',
    not_available: '刷新令牌不可用。在访问令牌过期后，用户必须重新身份验证以获取新令牌。',
  },
  token_status: '令牌状态',
  created_at: '创建于',
  updated_at: '更新于',
  expires_at: '过期于',
  scopes: '范围',
  delete_tokens: {
    title: '删除令牌',
    description: '删除存储的令牌。用户必须重新授权访问以恢复功能。',
    confirmation_message:
      '你确定要删除令牌吗？Logto 机密保险库将删除存储的 {{connectorName}} 访问和刷新令牌。此用户必须重新授权以恢复 {{connectorName}} API 访问。',
  },
  token_storage_disabled: {
    title: '此连接器的令牌存储已禁用',
    description:
      '用户当前只能使用 {{connectorName}} 进行登录、关联账户或在每次同意流程中同步资料。要访问 {{connectorName}} 的 API 并代表用户执行操作，请在中启用令牌存储',
  },
};

export default Object.freeze(user_identity_details);
