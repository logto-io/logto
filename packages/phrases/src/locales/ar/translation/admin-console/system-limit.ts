const system_limit = {
  limit_exceeded: 'وصل هذا المستأجر إلى حد {{entity}} وفقًا لسياسة حد الكيان الخاصة بـ Logto.',
  entities: {
    application: 'التطبيق',
    third_party_application: 'تطبيق الطرف الثالث',
    scope_per_resource: 'الإذن لكل مورد',
    social_connector: 'موصل اجتماعي',
    user_role: 'دور المستخدم',
    machine_to_machine_role: 'دور الآلة إلى الآلة',
    scope_per_role: 'الإذن لكل دور',
    hook: 'webhook',
    machine_to_machine: 'تطبيق الآلة إلى الآلة',
    resource: 'مورد API',
    enterprise_sso: 'تسجيل الدخول الموحد للمؤسسة',
    tenant_member: 'عضو المستأجر',
    organization: 'المنظمة',
    saml_application: 'تطبيق SAML',
    user_per_organization: 'المستخدم لكل منظمة',
    organization_user_role: 'دور مستخدم المنظمة',
    organization_machine_to_machine_role: 'دور الآلة إلى الآلة للمنظمة',
    organization_scope: 'إذن المنظمة',
  },
};

export default Object.freeze(system_limit);
