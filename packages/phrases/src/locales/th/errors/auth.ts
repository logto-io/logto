const auth = {
  authorization_header_missing: 'ไม่มีส่วนหัว Authorization',
  authorization_token_type_not_supported: 'ไม่รองรับประเภท Authorization นี้',
  unauthorized: 'ไม่ได้รับอนุญาต กรุณาตรวจสอบข้อมูลรับรองและขอบเขต',
  forbidden: 'ถูกปฏิเสธการเข้าถึง กรุณาตรวจสอบบทบาทผู้ใช้และสิทธิ์ของคุณ',
  expected_role_not_found: 'ไม่พบบทบาทที่คาดหวัง กรุณาตรวจสอบบทบาทและสิทธิ์ของคุณ',
  jwt_sub_missing: 'ไม่มี `sub` ใน JWT',
  require_re_authentication: 'ต้องรับรองตัวตนใหม่เพื่อดำเนินการที่ได้รับการป้องกัน',
  exceed_token_limit: 'เกินขีดจำกัดโทเค็น กรุณาติดต่อผู้ดูแลระบบของคุณ',
};

export default Object.freeze(auth);
