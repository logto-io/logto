const jwt_claims = {
  title: 'JWT ที่กำหนดเอง',
  description: 'ปรับแต่ง access token หรือ ID token เพื่อให้ข้อมูลเพิ่มเติมกับแอปพลิเคชันของคุณ',
  access_token: {
    card_title: 'Access token',
    card_description:
      'Access token คือข้อมูลรับรองที่ API ใช้สำหรับการอนุมัติคำขอ โดยผมีเพียง claims ที่จำเป็นสำหรับการตัดสินการเข้าถึง',
  },
  user_jwt: {
    card_field: 'User access token',
    card_description: 'เพิ่มข้อมูลเฉพาะของผู้ใช้ระหว่างออก access token',
    for: 'สำหรับผู้ใช้',
  },
  machine_to_machine_jwt: {
    card_field: 'Machine-to-machine access token',
    card_description: 'เพิ่มข้อมูลเพิ่มเติมระหว่างการออก token สำหรับ machine-to-machine',
    for: 'สำหรับ M2M',
  },
  id_token: {
    card_title: 'ID token',
    card_description:
      'ID token คือการยืนยันตัวตนที่ได้รับหลังเข้าสู่ระบบ ประกอบด้วย claims ของตัวตนผู้ใช้สำหรับ client เพื่อใช้ในการแสดงผลหรือสร้าง session',
    card_field: 'User ID token',
    card_field_description:
      "Claims 'sub', 'email', 'phone', 'profile' และ 'address' สามารถใช้ได้เสมอ Claims อื่น ๆ ต้องเปิดใช้งานที่นี่ก่อน ในทุกกรณี แอปของคุณต้องขอ scopes ที่ตรงกันระหว่างการ integration เพื่อรับมัน",
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
  error_handling_tab: 'การจัดการข้อผิดพลาด',
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
      'ใช้พารามิเตอร์ `context.interaction` เพื่อเข้าถึงรายละเอียดการโต้ตอบของผู้ใช้ใน session การยืนยันตัวตนปัจจุบัน',
  },
  application_data: {
    title: 'บริบทของแอปพลิเคชัน',
    subtitle:
      'ใช้พารามิเตอร์อินพุต `context.application` เพื่อให้ข้อมูลแอปพลิเคชันที่เกี่ยวข้องกับโทเค็น',
  },
  organization_data: {
    title: 'บริบทขององค์กร',
    subtitle:
      'ใช้พารามิเตอร์อินพุต `context.organization` เพื่อให้ข้อมูลองค์กรเป้าหมาย ใช้ได้เฉพาะกับโทเค็นขององค์กรเท่านั้น',
  },
  token_data: {
    title: 'payload ของ token',
    subtitle: 'ใช้พารามิเตอร์ `token` เพื่อ payload ของ access token ปัจจุบัน',
  },
  api_context: {
    title: 'บริบท API: การควบคุมการเข้าถึง',
    subtitle: 'ใช้เมธอด `api.denyAccess` เพื่อปฏิเสธคำขอรับ token',
  },
  cryptographic_capability: {
    title: 'บริบท API: การเข้ารหัส',
    subtitle: 'ใช้ `api.crypto.sha256` และ `api.crypto.hmacSha256` สำหรับแฮช UTF-8',
    description:
      'ทั้งสองเมธอดเป็นแบบอะซิงโครนัสและคืน Promise ของสตริงเลขฐานสิบหกตัวพิมพ์เล็ก 64 ตัว อินพุตถูกเข้ารหัสเป็น UTF-8 โดยไม่ทำ Unicode normalization: `sha256(input)` คำนวณ SHA-256(UTF-8(input)); `hmacSha256({ key, input })` คำนวณ HMAC-SHA-256(UTF-8(key), UTF-8(input)) อ่านคีย์ HMAC จากตัวแปรสภาพแวดล้อม เรียก `.trim()` เอง และปฏิเสธผลลัพธ์ว่างก่อนเรียก HMAC — เมธอดไม่ trim และไม่ถอยกลับไป SHA-256 แนะนำคีย์เอนโทรปีสูงโดยไม่มีช่องว่าง อินพุตข้อความว่างใช้ได้ คีย์ว่างใช้ไม่ได้ อินพุตจำกัดที่ 1 MiB ไบต์ UTF-8 และคีย์ HMAC ที่ 64 KiB SHA-256 ไม่ซ่อนตัวระบุที่แจกแจงได้ เช่น อีเมลหรือเบอร์โทร ใช้ HMAC สำหรับตัวระบุคงที่ที่มีคีย์ลับ ไม่มีเมธอดใดเหมาะกับการเก็บรหัสผ่าน ตัวแปรสภาพแวดล้อมมองเห็นได้โดยผู้ดูแล Custom JWT ที่ได้รับอนุญาตและรันไทม์การทำงาน และไม่ใช่ระบบคีย์ที่จัดการให้ การหมุนคีย์ HMAC จะเปลี่ยนทุกค่าที่สร้างขึ้น — สคริปต์ที่ต้องย้ายควรพกเวอร์ชันคีย์ที่แอปกำหนดและทำช่วงค่าคู่เอง ค่าหลายค่าต้องการการซีเรียลไลซ์ที่ชัดเจนโดยผู้เรียก (เช่น `JSON.stringify([value1, value2])` ในรันไทม์เดียวกัน); การรวมข้ามภาษาต้องตกลงรูปแบบมาตรฐานของตนเอง ใน Logto แบบ self-hosted สคริปต์นี้ยังใช้โมเดลสคริปต์ที่เชื่อถือได้ตามคำเตือน sandbox',
  },
  error_handling: {
    title: 'การจัดการข้อผิดพลาด',
    subtitle: 'กำหนดว่าจะบล็อกการออกโทเค็นหรือไม่เมื่อสคริปต์ทำงานล้มเหลว',
    input_field_title: 'พฤติกรรมการออกโทเค็นเมื่อสคริปต์เกิดข้อผิดพลาด',
    block_issuance_switch: 'บล็อกการออกโทเค็นเมื่อสคริปต์เกิดข้อผิดพลาด',
    default_hint_create:
      'สคริปต์ custom claims ที่สร้างใหม่จะบล็อกการออกโทเค็นเมื่อสคริปต์ล้มเหลวโดยค่าเริ่มต้น หาก API ส่งค่ากลับมาอยู่แล้ว ระบบจะใช้ค่าที่บันทึกไว้แทน',
    default_hint_edit:
      'สคริปต์ custom claims ที่มีอยู่เดิมและยังไม่มีการตั้งค่านี้ จะคงพฤติกรรมเดิมโดยให้ตัวเลือกนี้ปิดไว้ จนกว่าคุณจะบันทึกค่าอย่างชัดเจน',
    warning:
      'เมื่อเปิดใช้งาน ข้อผิดพลาดขณะรันสคริปต์จะปฏิเสธคำขอโทเค็นด้วย `invalid_request` (400) และ `error_description` ที่แปลตามภาษา ส่วนการเรียก `api.denyAccess` จะยังคงคืนค่า `access_denied`',
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
  sandbox_warning: {
    title: 'สคริปต์ทำงานด้วยสิทธิ์ของเซิร์ฟเวอร์',
    description:
      'ใน Logto ที่โฮสต์ด้วยตนเอง สคริปต์นี้ทำงานในสภาพแวดล้อมเดียวกับ Logto เอง: สามารถอ่านตัวแปรสภาพแวดล้อมของเซิร์ฟเวอร์และเข้าถึงบริการในเครือข่ายภายในของคุณได้ ไม่ได้อยู่ในแซนด์บ็อกซ์ ให้สิทธิ์เข้าถึงหน้านี้เฉพาะผู้ที่คุณไว้วางใจให้เข้าถึงเซิร์ฟเวอร์เท่านั้น',
  },
  form_error: {
    invalid_json: 'รูปแบบ JSON ไม่ถูกต้อง',
  },
};

export default Object.freeze(jwt_claims);
