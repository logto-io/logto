const connector = {
  general: 'เกิดข้อผิดพลาดในคอนเนคเตอร์: {{errorDescription}}',
  not_found: 'ไม่พบคอนเนคเตอร์ที่ใช้งานได้สำหรับประเภท: {{type}}.',
  not_enabled: 'คอนเนคเตอร์นี้ยังไม่ได้เปิดใช้งาน',
  invalid_metadata: 'ข้อมูลเมตาของคอนเนคเตอร์นี้ไม่ถูกต้อง',
  invalid_config_guard: 'ตัวป้องกันการตั้งค่าของคอนเนคเตอร์นี้ไม่ถูกต้อง',
  unexpected_type: 'ประเภทของคอนเนคเตอร์นี้ไม่ถูกต้อง',
  invalid_request_parameters: 'คำขอมีพารามิเตอร์อินพุตไม่ถูกต้อง',
  insufficient_request_parameters: 'คำขออาจขาดพารามิเตอร์อินพุตบางอย่าง',
  invalid_config: 'การตั้งค่าของคอนเนคเตอร์นี้ไม่ถูกต้อง',
  invalid_certificate:
    'ใบรับรองของคอนเนคเตอร์นี้ไม่ถูกต้อง กรุณาตรวจสอบให้แน่ใจว่าใบรับรองเป็นแบบ PEM',
  invalid_response: 'การตอบกลับของคอนเนคเตอร์นี้ไม่ถูกต้อง',
  template_not_found: 'ไม่พบเทมเพลตที่ถูกต้องในตั้งค่าคอนเนคเตอร์',
  template_not_supported: 'คอนเนคเตอร์นี้ไม่รองรับประเภทเทมเพลตนี้',
  rate_limit_exceeded: 'เกินขีดจำกัดการใช้งาน กรุณาลองใหม่ในภายหลัง',
  not_implemented: '{{method}}: ยังไม่ได้รับการพัฒนา',
  social_invalid_access_token: 'แอคเซสโทเคนของคอนเนคเตอร์นี้ไม่ถูกต้อง',
  invalid_auth_code: 'โค้ดยืนยันตัวตนของคอนเนคเตอร์นี้ไม่ถูกต้อง',
  social_invalid_id_token: 'ID โทเคนของคอนเนคเตอร์นี้ไม่ถูกต้อง',
  authorization_failed: 'กระบวนการขออนุญาตของผู้ใช้ไม่สำเร็จ',
  social_auth_code_invalid: 'ไม่สามารถดึงแอคเซสโทเคนได้ กรุณาตรวจสอบโค้ดการอนุญาต',
  more_than_one_sms: 'มีจำนวนคอนเนคเตอร์ SMS มากกว่า 1',
  more_than_one_email: 'มีจำนวนคอนเนคเตอร์อีเมลมากกว่า 1',
  more_than_one_connector_factory:
    'พบโรงงานคอนเนคเตอร์หลายรายการ (ID: {{connectorIds}}) คุณอาจถอนการติดตั้งส่วนที่ไม่จำเป็น',
  db_connector_type_mismatch: 'มีคอนเนคเตอร์ในฐานข้อมูลที่ประเภทไม่ตรงกัน',
  not_found_with_connector_id: 'ไม่พบคอนเนคเตอร์จาก standard connector id ที่ระบุ',
  multiple_instances_not_supported: 'ไม่สามารถสร้างหลายอินสแตนซ์ด้วย standard connector ที่เลือก',
  invalid_type_for_syncing_profile: 'สามารถซิงค์โปรไฟล์ผู้ใช้ได้เฉพาะกับคอนเนคเตอร์โซเชียลเท่านั้น',
  can_not_modify_target: "ไม่สามารถแก้ไข 'target' ของคอนเนคเตอร์นี้ได้",
  should_specify_target: "คุณต้องระบุ 'target'",
  multiple_target_with_same_platform:
    'ไม่สามารถมีคอนเนคเตอร์โซเชียลหลายอันที่ target และ platform เดียวกันได้',
  cannot_overwrite_metadata_for_non_standard_connector:
    "ไม่สามารถเขียนทับ 'metadata' ของคอนเนคเตอร์นี้ได้",
  email_connector: {
    bulk_deletion_no_filter:
      'เพื่อทำการลบจำนวนมากโดยใช้คุณสมบัติ ต้องมีเงื่อนไขการกรองอย่างน้อยหนึ่งข้อ คุณสมบัติที่รองรับ: {{properties, list(type:conjunction)}}.',
  },
  token_storage_not_supported: 'คอนเนคเตอร์นี้ไม่รองรับการจัดเก็บโทเคน',
};

export default Object.freeze(connector);
