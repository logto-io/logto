const system_limit = {
  limit_exceeded:
    "This <planName/> tenant has reached its {{entity}} limit under <a>Logto's entity policy</a>.",
  entities: {
    application: 'application',
    third_party_application: 'third-party application',
    scope_per_resource: 'permission per resource',
    social_connector: 'social connector',
    user_role: 'user role',
    machine_to_machine_role: 'machine-to-machine role',
    scope_per_role: 'permission per role',
    hook: 'hook',
    machine_to_machine: 'machine-to-machine application',
    resource: 'API resource',
    enterprise_sso: 'Enterprise SSO',
    tenant_member: 'tenant member',
    organization: 'organization',
    saml_application: 'SAML application',
    custom_domain: 'custom domain',
    user_per_organization: 'user per organization',
    organization_user_role: 'organization user role',
    organization_machine_to_machine_role: 'organization machine-to-machine role',
    organization_scope: 'organization permission',
  },
};

export default Object.freeze(system_limit);
