const organization_role_details = {
  page_title: 'รายละเอียดบทบาทขององค์กร',
  back_to_org_roles: 'กลับไปยังบทบาทขององค์กร',
  delete_confirm:
    'การดำเนินการนี้จะลบสิทธิ์ที่เชื่อมโยงกับบทบาทนี้ออกจากผู้ใช้ที่เกี่ยวข้อง และลบความสัมพันธ์ระหว่างบทบาทขององค์กร สมาชิกในองค์กร และสิทธิ์ขององค์กร',
  deleted: 'ลบบทบาทองค์กร {{name}} เรียบร้อยแล้ว',
  permissions: {
    tab: 'สิทธิ์',
    name_column: 'สิทธิ์',
    description_column: 'คำอธิบาย',
    type_column: 'ประเภทสิทธิ์',
    type: {
      api: 'สิทธิ์ API',
      org: 'สิทธิ์ขององค์กร',
    },
    assign_permissions: 'กำหนดสิทธิ์',
    remove_permission: 'ลบสิทธิ์',
    remove_confirmation:
      'หากลบสิทธิ์นี้ ผู้ใช้ที่มีบทบาทขององค์กรนี้จะสูญเสียสิทธิ์การเข้าถึงที่ได้รับจากสิทธิ์นี้',
    removed: 'ลบสิทธิ์ {{name}} ออกจากบทบาทองค์กรนี้เรียบร้อยแล้ว',
    assign_description:
      'กำหนดสิทธิ์ให้กับบทบาทต่าง ๆ ภายในองค์กรนี้ ซึ่งอาจเป็นได้ทั้งสิทธิ์ขององค์กรและสิทธิ์ API',
    organization_permissions: 'สิทธิ์ขององค์กร',
    api_permissions: 'สิทธิ์ API',
    assign_organization_permissions: 'กำหนดสิทธิ์ขององค์กร',
    assign_api_permissions: 'กำหนดสิทธิ์ API',
  },
  general: {
    tab: 'ทั่วไป',
    settings: 'การตั้งค่า',
    description:
      'บทบาทขององค์กรคือกลุ่มของสิทธิ์ที่สามารถกำหนดให้กับผู้ใช้ได้ สิทธิ์เหล่านี้อาจเป็นสิทธิ์ที่องค์กรกำหนดไว้ล่วงหน้าและสิทธิ์ API',
    name_field: 'ชื่อ',
    description_field: 'คำอธิบาย',
    description_field_placeholder: 'ผู้ใช้ที่มีสิทธิ์ในการดูเท่านั้น',
  },
};

export default Object.freeze(organization_role_details);
