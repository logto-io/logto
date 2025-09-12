const roles = {
  page_title: 'บทบาท',
  title: 'บทบาท',
  subtitle:
    'บทบาทประกอบด้วยสิทธิ์ที่กำหนดว่าผู้ใช้สามารถทำอะไรได้บ้าง ระบบ RBAC ใช้บทบาทในการให้ผู้ใช้เข้าถึงทรัพยากรสำหรับการดำเนินการที่เฉพาะเจาะจง',
  create: 'สร้างบทบาท',
  role_name: 'ชื่อบทบาท',
  role_type: 'ประเภทบทบาท',
  type_user: 'ผู้ใช้',
  type_machine_to_machine: 'เครื่องกับเครื่อง',
  role_description: 'คำอธิบาย',
  role_name_placeholder: 'ป้อนชื่อบทบาทของคุณ',
  role_description_placeholder: 'ป้อนคำอธิบายบทบาทของคุณ',
  col_roles: 'บทบาท',
  col_type: 'ประเภท',
  col_description: 'คำอธิบาย',
  col_assigned_entities: 'ที่ได้รับมอบหมาย',
  user_counts: '{{count}} ผู้ใช้',
  application_counts: '{{count}} แอป',
  user_count: '{{count}} ผู้ใช้',
  application_count: '{{count}} แอป',
  assign_permissions: 'กำหนดสิทธิ์',
  create_role_title: 'สร้างบทบาท',
  create_role_description: 'ใช้บทบาทในการจัดกลุ่มสิทธิ์และมอบหมายให้กับผู้ใช้',
  create_role_button: 'สร้างบทบาท',
  role_created: 'สร้างบทบาท {{name}} สำเร็จแล้ว',
  search: 'ค้นหาด้วยชื่อบทบาท คำอธิบาย หรือ ID',
  placeholder_title: 'บทบาท',
  placeholder_description:
    'บทบาทคือกลุ่มของสิทธิ์ซึ่งสามารถมอบหมายให้กับผู้ใช้ได้ กรุณาเพิ่มสิทธิ์ก่อนสร้างบทบาท',
  assign_roles: 'กำหนดบทบาท',
  management_api_access_notification:
    'สำหรับการเข้าถึง Logto Management API ให้เลือกบทบาทที่มีสิทธิ์ Management API <flag/>',
  with_management_api_access_tip: 'บทบาทเครื่องกับเครื่องนี้มีสิทธิ์ Logto Management API',
  role_creation_hint: 'หาไม่เจอบทบาทที่ต้องการใช่ไหม? <a>สร้างบทบาท</a>',
};

export default Object.freeze(roles);
