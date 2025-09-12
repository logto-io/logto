const api_resource_details = {
  page_title: 'รายละเอียดทรัพยากร API',
  back_to_api_resources: 'กลับไปที่ทรัพยากร API',
  general_tab: 'ทั่วไป',
  permissions_tab: 'สิทธิ์',
  settings: 'การตั้งค่า',
  settings_description:
    'ทรัพยากร API หรือ Resource Indicators เป็นตัวบ่งชี้บริการหรือทรัพยากรที่ต้องการร้องขอ โดยปกติจะเป็นตัวแปรในรูปแบบ URI ที่แสดงถึงตัวตนของทรัพยากรนั้น',
  management_api_settings_description:
    'Logto Management API คือชุด API ที่ครอบคลุม ช่วยให้งานบริหารจัดการตัวตน การบังคับใช้นโยบายความปลอดภัย และการปฏิบัติตามกฎระเบียบต่าง ๆ สำหรับผู้ดูแลระบบเป็นไปได้อย่างครบถ้วน',
  management_api_notice:
    'API นี้แทน Logto entity และไม่สามารถแก้ไขหรือถูกลบได้ สร้างแอป machine-to-machine เพื่อเรียกใช้ Logto Management API <a>เรียนรู้เพิ่มเติม</a>',
  token_expiration_time_in_seconds: 'เวลาหมดอายุของโทเคน (เป็นวินาที)',
  token_expiration_time_in_seconds_placeholder: 'ป้อนเวลาหมดอายุของโทเคน',
  delete_description:
    'การดำเนินการนี้ไม่สามารถย้อนกลับได้ จะลบทรัพยากร API นี้อย่างถาวร กรุณากรอกชื่อทรัพยากร API <span>{{name}}</span> เพื่อยืนยัน',
  enter_your_api_resource_name: 'กรอกชื่อทรัพยากร API ของคุณ',
  api_resource_deleted: 'ลบทรัพยากร API {{name}} เรียบร้อยแล้ว',
  permission: {
    create_button: 'สร้างสิทธิ์',
    create_title: 'สร้างสิทธิ์',
    create_subtitle: 'กำหนดสิทธิ์ (scope) ที่ API นี้ต้องการ',
    confirm_create: 'สร้างสิทธิ์',
    edit_title: 'แก้ไขสิทธิ์ของ API',
    edit_subtitle: 'กำหนดสิทธิ์ (scope) ที่ API {{resourceName}} ต้องการ',
    name: 'ชื่อสิทธิ์',
    name_placeholder: 'read:resource',
    forbidden_space_in_name: 'ชื่อสิทธิ์ต้องไม่มีเว้นวรรค',
    description: 'คำอธิบาย',
    description_placeholder: 'สามารถอ่านทรัพยากรได้',
    permission_created: 'สร้างสิทธิ์ {{name}} เรียบร้อยแล้ว',
    delete_description: 'หากลบสิทธิ์นี้ ผู้ใช้ที่มีสิทธิ์นี้จะไม่สามารถเข้าถึงตามที่เคยได้รับ',
    deleted: 'ลบสิทธิ์ "{{name}}" เรียบร้อยแล้ว',
  },
};

export default Object.freeze(api_resource_details);
