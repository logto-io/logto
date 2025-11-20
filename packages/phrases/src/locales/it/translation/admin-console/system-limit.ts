const system_limit = {
  limit_exceeded:
    'Questo tenant <planName/> ha raggiunto il limite di {{entity}} secondo <a>la politica delle entità di Logto</a>.',
  entities: {
    application: 'applicazione',
    third_party_application: 'applicazione di terze parti',
    scope_per_resource: 'permesso per risorsa',
    social_connector: 'connettore sociale',
    user_role: 'ruolo utente',
    machine_to_machine_role: 'ruolo macchina a macchina',
    scope_per_role: 'permesso per ruolo',
    hook: 'webhook',
    machine_to_machine: 'applicazione macchina a macchina',
    resource: 'risorsa API',
    enterprise_sso: 'SSO aziendale',
    tenant_member: 'membro del tenant',
    organization: 'organizzazione',
    saml_application: 'applicazione SAML',
    custom_domain: 'dominio personalizzato',
    user_per_organization: 'utente per organizzazione',
    organization_user_role: "ruolo utente dell'organizzazione",
    organization_machine_to_machine_role: "ruolo macchina a macchina dell'organizzazione",
    organization_scope: "permesso dell'organizzazione",
  },
};

export default Object.freeze(system_limit);
