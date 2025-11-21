const system_limit = {
  limit_exceeded:
    'Este inquilino <planName/> ha alcanzado su límite de {{entity}} bajo <a>la política de entidad de Logto</a>.',
  entities: {
    application: 'aplicación',
    third_party_application: 'aplicación de terceros',
    scope_per_resource: 'permiso por recurso',
    social_connector: 'conector social',
    user_role: 'rol de usuario',
    machine_to_machine_role: 'rol de máquina a máquina',
    scope_per_role: 'permiso por rol',
    hook: 'webhook',
    machine_to_machine: 'aplicación de máquina a máquina',
    resource: 'recurso de API',
    enterprise_sso: 'SSO empresarial',
    tenant_member: 'miembro del inquilino',
    organization: 'organización',
    saml_application: 'aplicación SAML',
    custom_domain: 'dominio personalizado',
    user_per_organization: 'usuario por organización',
    organization_user_role: 'rol de usuario de organización',
    organization_machine_to_machine_role: 'rol de máquina a máquina de organización',
    organization_scope: 'permiso de organización',
  },
};

export default Object.freeze(system_limit);
