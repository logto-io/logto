const system_limit = {
  limit_exceeded:
    'Этот арендатор <planName/> достиг своего лимита {{entity}} согласно <a>политике сущностей Logto</a>.',
  entities: {
    application: 'приложение',
    third_party_application: 'стороннее приложение',
    scope_per_resource: 'разрешение на ресурс',
    social_connector: 'социальный коннектор',
    user_role: 'роль пользователя',
    machine_to_machine_role: 'роль машина-машина',
    scope_per_role: 'разрешение на роль',
    hook: 'вебхук',
    machine_to_machine: 'приложение машина-машина',
    resource: 'API ресурс',
    enterprise_sso: 'корпоративный SSO',
    tenant_member: 'член арендатора',
    organization: 'организация',
    saml_application: 'SAML приложение',
    custom_domain: 'пользовательский домен',
    user_per_organization: 'пользователь на организацию',
    organization_user_role: 'роль пользователя организации',
    organization_machine_to_machine_role: 'роль машина-машина организации',
    organization_scope: 'разрешение организации',
  },
};

export default Object.freeze(system_limit);
