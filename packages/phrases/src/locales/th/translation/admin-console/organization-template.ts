const organization_template = {
  title: 'เทมเพลตองค์กร',
  subtitle:
    'ในแอปพลิเคชัน SaaS แบบหลายเช่า เทมเพลตองค์กรจะกำหนดนโยบายการควบคุมสิทธิ์การเข้าถึง (สิทธิ์และบทบาท) ร่วมกันสำหรับหลายองค์กร',
  roles: {
    tab_name: 'บทบาทองค์กร',
    search_placeholder: 'ค้นหาด้วยชื่อบทบาท',
    create_title: 'สร้างบทบาทองค์กร',
    role_column: 'บทบาทองค์กร',
    permissions_column: 'สิทธิ์',
    placeholder_title: 'บทบาทองค์กร',
    placeholder_description:
      'บทบาทองค์กรคือการรวมกลุ่มของสิทธิ์ที่สามารถกำหนดให้กับผู้ใช้ได้ สิทธิ์เหล่านี้จะต้องมาจากสิทธิ์องค์กรที่กำหนดไว้ล่วงหน้า',
    create_modal: {
      title: 'สร้างบทบาทองค์กร',
      create: 'สร้างบทบาท',
      name: 'ชื่อบทบาท',
      description: 'คำอธิบาย',
      type: 'ประเภทบทบาท',
      created: 'ได้สร้างบทบาทองค์กร {{name}} สำเร็จแล้ว',
    },
  },
  permissions: {
    tab_name: 'สิทธิ์ขององค์กร',
    search_placeholder: 'ค้นหาด้วยชื่อสิทธิ์',
    create_org_permission: 'สร้างสิทธิ์องค์กร',
    permission_column: 'สิทธิ์ขององค์กร',
    description_column: 'คำอธิบาย',
    placeholder_title: 'สิทธิ์ขององค์กร',
    placeholder_description: 'สิทธิ์ขององค์กรหมายถึงการอนุญาตเข้าถึงทรัพยากรในบริบทขององค์กร',
    delete_confirm:
      'หากลบสิทธิ์นี้ บทบาทองค์กรทั้งหมดที่มีสิทธิ์นี้จะสูญเสียสิทธิ์นี้ และผู้ใช้ที่มีสิทธิ์นี้จะไม่สามารถเข้าถึงได้',
    create_title: 'สร้างสิทธิ์ขององค์กร',
    edit_title: 'แก้ไขสิทธิ์ขององค์กร',
    permission_field_name: 'ชื่อสิทธิ์',
    description_field_name: 'คำอธิบาย',
    description_field_placeholder: 'อ่านประวัติการนัดหมาย',
    create_permission: 'สร้างสิทธิ์',
    created: 'ได้สร้างสิทธิ์ขององค์กร {{name}} สำเร็จแล้ว',
  },
};

export default Object.freeze(organization_template);
