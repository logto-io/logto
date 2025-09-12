import password_rejected from './password-rejected.js';

const error = {
  general_required: `{{types, list(type: disjunction;)}} จำเป็นต้องระบุ`,
  general_invalid: `{{types, list(type: disjunction;)}} ไม่ถูกต้อง`,
  invalid_min_max_input: 'ค่าที่กรอกควรอยู่ระหว่าง {{minValue}} และ {{maxValue}}',
  invalid_min_max_length: 'จำนวนตัวอักษรที่กรอกควรอยู่ระหว่าง {{minLength}} และ {{maxLength}}',
  username_required: 'ต้องระบุชื่อผู้ใช้',
  password_required: 'ต้องระบุรหัสผ่าน',
  username_exists: 'ชื่อผู้ใช้นี้มีอยู่แล้ว',
  username_should_not_start_with_number: 'ชื่อผู้ใช้ไม่ควรขึ้นต้นด้วยตัวเลข',
  username_invalid_charset: 'ชื่อผู้ใช้ควรมีแค่ตัวอักษร ตัวเลข หรือขีดล่างเท่านั้น',
  invalid_email: 'อีเมลไม่ถูกต้อง',
  invalid_phone: 'หมายเลขโทรศัพท์ไม่ถูกต้อง',
  passwords_do_not_match: 'รหัสผ่านไม่ตรงกัน กรุณาลองใหม่อีกครั้ง',
  invalid_passcode: 'รหัสยืนยันไม่ถูกต้อง',
  invalid_connector_auth: 'การอนุญาตไม่ถูกต้อง',
  invalid_connector_request: 'ข้อมูลตัวเชื่อมต่อไม่ถูกต้อง',
  unknown: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่ภายหลัง',
  invalid_session: 'ไม่พบเซสชัน กรุณากลับไปและเข้าสู่ระบบอีกครั้ง',
  timeout: 'หมดเวลา กรุณาลองใหม่ภายหลัง',
  password_rejected,
  sso_not_enabled: 'ยังไม่ได้เปิดใช้งาน Single Sign-On สำหรับบัญชีอีเมลนี้',
  invalid_link: 'ลิงก์ไม่ถูกต้อง',
  invalid_link_description: 'โทเค็นใช้ครั้งเดียวของคุณอาจหมดอายุหรือไม่ถูกต้องอีกต่อไป',
  captcha_verification_failed: 'การตรวจสอบ captcha ล้มเหลว',
  something_went_wrong: 'เกิดข้อผิดพลาดบางอย่าง',
};

export default Object.freeze(error);
