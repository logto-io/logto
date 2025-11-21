const system_limit = {
  limit_exceeded:
    'Este tenant <planName/> atingiu seu limite de {{entity}} sob <a>a política de entidade do Logto</a>.',
  entities: {
    application: 'aplicação',
    third_party_application: 'aplicação de terceiros',
    scope_per_resource: 'permissão por recurso',
    social_connector: 'conector social',
    user_role: 'função de usuário',
    machine_to_machine_role: 'função de máquina para máquina',
    scope_per_role: 'permissão por função',
    hook: 'webhook',
    machine_to_machine: 'aplicação de máquina para máquina',
    resource: 'recurso de API',
    enterprise_sso: 'SSO empresarial',
    tenant_member: 'membro do tenant',
    organization: 'organização',
    saml_application: 'aplicação SAML',
    custom_domain: 'domínio personalizado',
    user_per_organization: 'usuário por organização',
    organization_user_role: 'função de usuário da organização',
    organization_machine_to_machine_role: 'função de máquina para máquina da organização',
    organization_scope: 'permissão da organização',
  },
};

export default Object.freeze(system_limit);
