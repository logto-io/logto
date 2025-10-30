const system_limit = {
  limit_exceeded: '此租戶已達到 Logto 實體限制政策規定的{{entity}}限制。',
  entities: {
    application: '應用',
    third_party_application: '第三方應用',
    scope_per_resource: '每個資源的權限',
    social_connector: '社交連接器',
    user_role: '用戶角色',
    machine_to_machine_role: '機器對機器角色',
    scope_per_role: '每個角色的權限',
    hook: 'Webhook',
    machine_to_machine: '機器對機器應用',
    resource: 'API 資源',
    enterprise_sso: '企業 SSO',
    tenant_member: '租戶成員',
    organization: '組織',
    saml_application: 'SAML 應用',
    user_per_organization: '每個組織的用戶',
    organization_user_role: '組織用戶角色',
    organization_machine_to_machine_role: '組織機器對機器角色',
    organization_scope: '組織權限',
  },
};

export default Object.freeze(system_limit);
