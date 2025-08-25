const errors = {
  something_went_wrong: 'ขออภัย! มีบางอย่างผิดพลาด',
  page_not_found: 'ไม่พบหน้าดังกล่าว',
  unknown_server_error: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ที่ไม่ทราบสาเหตุ',
  empty: 'ไม่มีข้อมูล',
  missing_total_number: 'ไม่พบ Total-Number ใน response headers',
  invalid_uri_format: 'รูปแบบ URI ไม่ถูกต้อง',
  invalid_origin_format: 'รูปแบบ origin ของ URI ไม่ถูกต้อง',
  invalid_json_format: 'รูปแบบ JSON ไม่ถูกต้อง',
  invalid_parameters_format: 'รูปแบบพารามิเตอร์ไม่ถูกต้อง',
  invalid_regex: 'รูปแบบ regular expression ไม่ถูกต้อง',
  invalid_error_message_format: 'รูปแบบข้อความแสดงข้อผิดพลาดไม่ถูกต้อง',
  required_field_missing: 'โปรดกรอก {{field}}',
  required_field_missing_plural: 'คุณต้องกรอกอย่างน้อยหนึ่ง {{field}}',
  more_details: 'รายละเอียดเพิ่มเติม',
  username_pattern_error:
    'ชื่อผู้ใช้ควรมีเฉพาะตัวอักษร ตัวเลข หรือขีดล่าง และไม่ควรขึ้นต้นด้วยตัวเลข',
  email_pattern_error: 'อีเมลไม่ถูกต้อง',
  phone_pattern_error: 'หมายเลขโทรศัพท์ไม่ถูกต้อง',
  insecure_contexts: 'ไม่รองรับบริบทที่ไม่ปลอดภัย (non-HTTPS)',
  unexpected_error: 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
  not_found: 'ไม่พบ 404',
  create_internal_role_violation:
    'คุณกำลังสร้างบทบาทภายในใหม่ซึ่ง Logto ไม่อนุญาต ลองใช้ชื่อที่ไม่ได้ขึ้นต้นด้วย "#internal:"',
  should_be_an_integer: 'ควรเป็นจำนวนเต็ม',
  number_should_be_between_inclusive: 'ค่าควรอยู่ระหว่าง {{min}} และ {{max}} (รวมทั้งสองค่าด้วย)',
};

export default Object.freeze(errors);
