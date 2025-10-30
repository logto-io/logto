const system_limit = {
  limit_exceeded:
    "Ce locataire a atteint la limite de {{entity}} selon la politique de limite d'entité de Logto.",
  entities: {
    application: 'application',
    third_party_application: 'application tierce',
    scope_per_resource: 'permission par ressource',
    social_connector: 'connecteur social',
    user_role: 'rôle utilisateur',
    machine_to_machine_role: 'rôle machine à machine',
    scope_per_role: 'permission par rôle',
    hook: 'webhook',
    machine_to_machine: 'application machine à machine',
    resource: 'ressource API',
    enterprise_sso: 'SSO entreprise',
    tenant_member: 'membre du locataire',
    organization: 'organisation',
    saml_application: 'application SAML',
    user_per_organization: 'utilisateur par organisation',
    organization_user_role: "rôle utilisateur de l'organisation",
    organization_machine_to_machine_role: "rôle machine à machine de l'organisation",
    organization_scope: "permission de l'organisation",
  },
};

export default Object.freeze(system_limit);
