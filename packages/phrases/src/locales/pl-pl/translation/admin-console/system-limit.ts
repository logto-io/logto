const system_limit = {
  limit_exceeded:
    'Ten najemca <planName/> osiągnął limit {{entity}} zgodnie z <a>polityką encji Logto</a>.',
  entities: {
    application: 'aplikacja',
    third_party_application: 'aplikacja zewnętrzna',
    scope_per_resource: 'uprawnienie na zasób',
    social_connector: 'łącznik społecznościowy',
    user_role: 'rola użytkownika',
    machine_to_machine_role: 'rola maszyna-maszyna',
    scope_per_role: 'uprawnienie na rolę',
    hook: 'webhook',
    machine_to_machine: 'aplikacja maszyna-maszyna',
    resource: 'zasób API',
    enterprise_sso: 'SSO dla przedsiębiorstw',
    tenant_member: 'członek najemcy',
    organization: 'organizacja',
    saml_application: 'aplikacja SAML',
    custom_domain: 'niestandardowa domena',
    user_per_organization: 'użytkownik na organizację',
    organization_user_role: 'rola użytkownika organizacji',
    organization_machine_to_machine_role: 'rola maszyna-maszyna organizacji',
    organization_scope: 'uprawnienie organizacji',
  },
};

export default Object.freeze(system_limit);
