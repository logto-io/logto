const system_limit = {
  limit_exceeded: '此 <planName/> 租户已达到 <a>Logto 实体政策</a>下的{{entity}}限制。',
  entities: {
    application: '应用',
    third_party_application: '第三方应用',
    scope_per_resource: '每个资源的权限',
    social_connector: '社交连接器',
    user_role: '用户角色',
    machine_to_machine_role: '机器对机器角色',
    scope_per_role: '每个角色的权限',
    hook: 'Webhook',
    machine_to_machine: '机器对机器应用',
    resource: 'API 资源',
    enterprise_sso: '企业 SSO',
    tenant_member: '租户成员',
    organization: '组织',
    saml_application: 'SAML 应用',
    custom_domain: '自定义域名',
    user_per_organization: '每个组织的用户',
    organization_user_role: '组织用户角色',
    organization_machine_to_machine_role: '组织机器对机器角色',
    organization_scope: '组织权限',
  },
};

export default Object.freeze(system_limit);
