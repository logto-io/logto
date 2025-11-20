const system_limit = {
  limit_exceeded:
    'ผู้เช่า<planName/>รายนี้ถึงขีดจำกัด{{entity}}ภายใต้<a>นโยบายเอนทิตีของ Logto</a> แล้ว',
  entities: {
    application: 'แอปพลิเคชัน',
    third_party_application: 'แอปพลิเคชันของบุคคลที่สาม',
    scope_per_resource: 'สิทธิ์ต่อทรัพยากร',
    social_connector: 'ตัวเชื่อมต่อโซเชียล',
    user_role: 'บทบาทผู้ใช้',
    machine_to_machine_role: 'บทบาทเครื่องต่อเครื่อง',
    scope_per_role: 'สิทธิ์ต่อบทบาท',
    hook: 'เว็บฮุค',
    machine_to_machine: 'แอปพลิเคชันเครื่องต่อเครื่อง',
    resource: 'ทรัพยากร API',
    enterprise_sso: 'SSO องค์กร',
    tenant_member: 'สมาชิกผู้เช่า',
    organization: 'องค์กร',
    saml_application: 'แอปพลิเคชัน SAML',
    custom_domain: 'โดเมนแบบกำหนดเอง',
    user_per_organization: 'ผู้ใช้ต่อองค์กร',
    organization_user_role: 'บทบาทผู้ใช้ขององค์กร',
    organization_machine_to_machine_role: 'บทบาทเครื่องต่อเครื่องขององค์กร',
    organization_scope: 'สิทธิ์ขององค์กร',
  },
};

export default Object.freeze(system_limit);
