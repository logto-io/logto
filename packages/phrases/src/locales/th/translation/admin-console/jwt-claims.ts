const jwt_claims = {
  title: 'JWT ที่กำหนดเอง',
  description:
    'ตั้งค่าค่าเคลมที่กำหนดเองใน access token ค่าต่าง ๆ เหล่านี้สามารถใช้ส่งข้อมูลเพิ่มเติมไปยังแอปพลิเคชันของคุณได้',
  user_jwt: {
    card_title: 'สำหรับผู้ใช้',
    card_field: 'User access token',
    card_description: 'เพิ่มข้อมูลเฉพาะของผู้ใช้ระหว่างออก access token',
    for: 'สำหรับผู้ใช้',
  },
  machine_to_machine_jwt: {
    card_title: 'สำหรับ M2M',
    card_field: 'Machine-to-machine token',
    card_description: 'เพิ่มข้อมูลเพิ่มเติมระหว่างการออก token สำหรับ machine-to-machine',
    for: 'สำหรับ M2M',
  },
  code_editor_title: 'ปรับแต่ง claims ของ {{token}}',
  custom_jwt_create_button: 'เพิ่มค่าเคลมที่กำหนดเอง',
  custom_jwt_item: 'ค่าเคลมที่กำหนดเอง {{for}}',
  delete_modal_title: 'ลบค่าเคลมที่กำหนดเอง',
  delete_modal_content: 'คุณแน่ใจหรือไม่ว่าต้องการลบค่าเคลมที่กำหนดเองนี้?',
  clear: 'เริ่มใหม่',
  cleared: 'ลบแล้ว',
  restore: 'กู้คืนค่าเริ่มต้น',
  restored: 'กู้คืนแล้ว',
  data_source_tab: 'แหล่งข้อมูล',
  test_tab: 'ทดสอบ context',
  jwt_claims_description: 'Default claims จะถูกเพิ่มใน token อัตโนมัติและไม่สามารถเขียนทับได้',
  user_data: {
    title: 'ข้อมูลผู้ใช้',
    subtitle: 'ใช้พารามิเตอร์ `context.user` เพื่อใส่ข้อมูลสำคัญของผู้ใช้',
  },
  grant_data: {
    title: 'ข้อมูล Grant',
    subtitle:
      'ใช้พารามิเตอร์ `context.grant` เพื่อใส่ข้อมูลสำคัญของ grant ใช้ได้เฉพาะสำหรับ token exchange เท่านั้น',
  },
  interaction_data: {
    title: 'บริบทปฏิสัมพันธ์กับผู้ใช้',
    subtitle:
      'ใช้พารามิเตอร์ `context.interaction` เพื่อเข้าถึงรายละเอียดการโต้ตอบของผู้ใช้ใน session การยืนยันตัวตนปัจจุบัน รวมถึง `interactionEvent`, `userId` และ `verificationRecords`',
  },
  token_data: {
    title: 'payload ของ token',
    subtitle: 'ใช้พารามิเตอร์ `token` เพื่อ payload ของ access token ปัจจุบัน',
  },
  api_context: {
    title: 'บริบท API: การควบคุมการเข้าถึง',
    subtitle: 'ใช้เมธอด `api.denyAccess` เพื่อปฏิเสธคำขอรับ token',
  },
  fetch_external_data: {
    title: 'ดึงข้อมูลภายนอก',
    subtitle: 'ผสานข้อมูลจาก API ภายนอกของคุณลงใน claims ได้โดยตรง',
    description:
      'ใช้ฟังก์ชัน `fetch` เพื่อเรียก API ภายนอกของคุณและใส่ข้อมูลลงในค่าเคลมที่กำหนดเอง ตัวอย่าง: ',
  },
  environment_variables: {
    title: 'ตั้งตัวแปร environment',
    subtitle: 'ใช้ตัวแปร environment เพื่อเก็บข้อมูลที่สำคัญ',
    input_field_title: 'เพิ่มตัวแปร environment',
    sample_code: 'การเข้าถึงตัวแปร environment ใน handler เคลม token ที่คุณกำหนดเอง ตัวอย่าง: ',
  },
  jwt_claims_hint:
    'จำกัดค่าเคลมที่กำหนดเองไม่เกิน 50KB ค่าเคลมเริ่มต้นจะถูกเพิ่มไปยัง token อัตโนมัติและไม่สามารถเขียนทับได้',
  tester: {
    subtitle: 'ปรับ token mock และข้อมูลผู้ใช้สำหรับการทดสอบ',
    run_button: 'ทดสอบ',
    result_title: 'ผลลัพธ์การทดสอบ',
  },
  form_error: {
    invalid_json: 'รูปแบบ JSON ไม่ถูกต้อง',
  },
};

export default Object.freeze(jwt_claims);
