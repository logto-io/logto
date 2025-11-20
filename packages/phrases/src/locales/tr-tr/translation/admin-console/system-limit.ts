const system_limit = {
  limit_exceeded:
    "Bu <planName/> tenant'ı, <a>Logto'nun varlık politikası</a> kapsamında {{entity}} limitine ulaştı.",
  entities: {
    application: 'uygulama',
    third_party_application: 'üçüncü taraf uygulama',
    scope_per_resource: 'kaynak başına izin',
    social_connector: 'sosyal bağlayıcı',
    user_role: 'kullanıcı rolü',
    machine_to_machine_role: 'makine arası rol',
    scope_per_role: 'rol başına izin',
    hook: 'webhook',
    machine_to_machine: 'makine arası uygulama',
    resource: 'API kaynağı',
    enterprise_sso: 'Kurumsal SSO',
    tenant_member: 'tenant üyesi',
    organization: 'organizasyon',
    saml_application: 'SAML uygulaması',
    custom_domain: 'özel alan adı',
    user_per_organization: 'organizasyon başına kullanıcı',
    organization_user_role: 'organizasyon kullanıcı rolü',
    organization_machine_to_machine_role: 'organizasyon makine arası rol',
    organization_scope: 'organizasyon izni',
  },
};

export default Object.freeze(system_limit);
