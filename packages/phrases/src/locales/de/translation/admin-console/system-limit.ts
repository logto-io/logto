const system_limit = {
  limit_exceeded:
    'Dieser <planName/>-Mandant hat sein {{entity}}-Limit gemäß <a>Logtos Entitätsrichtlinie</a> erreicht.',
  entities: {
    application: 'Anwendung',
    third_party_application: 'Drittanbieter-Anwendung',
    scope_per_resource: 'Berechtigung pro Ressource',
    social_connector: 'Social Connector',
    user_role: 'Benutzerrolle',
    machine_to_machine_role: 'Maschine-zu-Maschine-Rolle',
    scope_per_role: 'Berechtigung pro Rolle',
    hook: 'Webhook',
    machine_to_machine: 'Maschine-zu-Maschine-Anwendung',
    resource: 'API-Ressource',
    enterprise_sso: 'Enterprise SSO',
    tenant_member: 'Mandantenmitglied',
    organization: 'Organisation',
    saml_application: 'SAML-Anwendung',
    custom_domain: 'Benutzerdefinierte Domain',
    user_per_organization: 'Benutzer pro Organisation',
    organization_user_role: 'Organisationsbenutzerrolle',
    organization_machine_to_machine_role: 'Organisations-Maschine-zu-Maschine-Rolle',
    organization_scope: 'Organisationsberechtigung',
  },
};

export default Object.freeze(system_limit);
