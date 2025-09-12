const single_sign_on = {
  forbidden_domains: 'ไม่อนุญาตโดเมนอีเมลสาธารณะ',
  duplicated_domains: 'มีโดเมนซ้ำกัน',
  invalid_domain_format: 'รูปแบบโดเมนไม่ถูกต้อง',
  duplicate_connector_name: 'มีชื่อคอนเนกเตอร์นี้อยู่แล้ว กรุณาเลือกชื่ออื่น',
  idp_initiated_authentication_not_supported:
    'รองรับการรับรองความถูกต้องที่เริ่มต้นโดย IdP เฉพาะสำหรับ SAML connector เท่านั้น',
  idp_initiated_authentication_invalid_application_type:
    'ประเภทแอปพลิเคชันไม่ถูกต้อง อนุญาตเฉพาะแอปพลิเคชัน {{type}} เท่านั้น',
  idp_initiated_authentication_redirect_uri_not_registered:
    'redirect_uri ยังไม่ได้ลงทะเบียน กรุณาตรวจสอบการตั้งค่าแอปพลิเคชัน',
  idp_initiated_authentication_client_callback_uri_not_found:
    'ไม่พบ URI callback สำหรับการรับรองความถูกต้อง IdP-initiated ของ client กรุณาตรวจสอบการตั้งค่าคอนเนกเตอร์',
};

export default Object.freeze(single_sign_on);
