const system_limit = {
  limit_exceeded:
    'این مستأجر <planName/> به محدودیت {{entity}} خود طبق <a>سیاست موجودیت Logto</a> رسیده است.',
  entities: {
    application: 'برنامه',
    third_party_application: 'برنامه شخص ثالث',
    scope_per_resource: 'مجوز به ازای هر منبع',
    social_connector: 'اتصال‌دهنده اجتماعی',
    user_role: 'نقش کاربر',
    machine_to_machine_role: 'نقش ماشین به ماشین',
    scope_per_role: 'مجوز به ازای هر نقش',
    hook: 'هوک',
    machine_to_machine: 'برنامه ماشین به ماشین',
    resource: 'منبع API',
    enterprise_sso: 'SSO سازمانی',
    tenant_member: 'عضو مستأجر',
    organization: 'سازمان',
    saml_application: 'برنامه SAML',
    custom_domain: 'دامنه سفارشی',
    user_per_organization: 'کاربر به ازای هر سازمان',
    organization_user_role: 'نقش کاربر سازمان',
    organization_machine_to_machine_role: 'نقش ماشین به ماشین سازمان',
    organization_scope: 'مجوز سازمان',
  },
};

export default Object.freeze(system_limit);
