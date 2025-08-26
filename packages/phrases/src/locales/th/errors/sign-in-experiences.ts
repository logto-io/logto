const sign_in_experiences = {
  empty_content_url_of_terms_of_use:
    'URL เนื้อหาของ "ข้อกำหนดการใช้งาน" ว่างเปล่า โปรดเพิ่ม URL เนื้อหาหากเปิดใช้งาน "ข้อกำหนดการใช้งาน"',
  empty_social_connectors:
    'ตัวเชื่อมต่อโซเชียลว่างเปล่า โปรดเพิ่มตัวเชื่อมต่อโซเชียลที่เปิดใช้งานเมื่อเปิดใช้งานวิธีเข้าสู่ระบบด้วยโซเชียล',
  enabled_connector_not_found: 'ไม่พบตัวเชื่อมต่อ {{type}} ที่เปิดใช้งาน',
  not_one_and_only_one_primary_sign_in_method:
    'ต้องมีเพียงหนึ่งวิธีเข้าสู่ระบบหลักเท่านั้น โปรดตรวจสอบข้อมูลของคุณ',
  username_requires_password:
    'ต้องเปิดใช้งานการตั้งรหัสผ่านสำหรับตัวระบุชื่อผู้ใช้ในการสมัครสมาชิก',
  passwordless_requires_verify:
    'ต้องเปิดใช้งานการยืนยันสำหรับตัวระบุอีเมล/โทรศัพท์ในการสมัครสมาชิก',
  miss_sign_up_identifier_in_sign_in: 'วิธีเข้าสู่ระบบต้องมีตัวระบุสำหรับสมัครสมาชิก',
  password_sign_in_must_be_enabled:
    'ต้องเปิดใช้งานการเข้าสู่ระบบด้วยรหัสผ่านเมื่อจำเป็นต้องตั้งรหัสผ่านในการสมัครสมาชิก',
  code_sign_in_must_be_enabled:
    'ต้องเปิดใช้งานการเข้าสู่ระบบด้วยรหัสยืนยันเมื่อไม่จำเป็นต้องตั้งรหัสผ่านในการสมัครสมาชิก',
  unsupported_default_language: 'ขออภัย ขณะนี้ยังไม่รองรับภาษา {{language}}',
  at_least_one_authentication_factor: 'คุณต้องเลือกปัจจัยการยืนยันตัวตนอย่างน้อยหนึ่งรายการ',
  backup_code_cannot_be_enabled_alone: 'ไม่สามารถเปิดใช้งานรหัสสำรองเพียงรายการเดียวได้',
  duplicated_mfa_factors: 'พบปัจจัย MFA ซ้ำกัน',
  email_verification_code_cannot_be_used_for_mfa:
    'ไม่สามารถใช้รหัสยืนยันอีเมลสำหรับ MFA เมื่อเปิดใช้งานการยืนยันอีเมลเพื่อเข้าสู่ระบบ',
  phone_verification_code_cannot_be_used_for_mfa:
    'ไม่สามารถใช้รหัสยืนยัน SMS สำหรับ MFA เมื่อเปิดใช้งานการยืนยัน SMS เพื่อเข้าสู่ระบบ',
  email_verification_code_cannot_be_used_for_sign_in:
    'ไม่สามารถใช้รหัสยืนยันอีเมลเพื่อเข้าสู่ระบบเมื่อเปิดใช้งานกับ MFA',
  phone_verification_code_cannot_be_used_for_sign_in:
    'ไม่สามารถใช้รหัสยืนยัน SMS เพื่อเข้าสู่ระบบเมื่อเปิดใช้งานกับ MFA',
  duplicated_sign_up_identifiers: 'ตรวจพบตัวระบุสมัครสมาชิกซ้ำ',
  missing_sign_up_identifiers: 'ตัวระบุสมัครสมาชิกหลักต้องไม่เว้นว่าง',
  invalid_custom_email_blocklist_format:
    'รายการบล็อคอีเมลแบบกำหนดเองไม่ถูกต้อง: {{items, list(type:conjunction)}} แต่ละรายการต้องเป็นอีเมลหรือโดเมนอีเมลที่ถูกต้อง เช่น foo@example.com หรือ @example.com',
  forgot_password_method_requires_connector:
    'วิธีกู้คืนรหัสผ่านต้องมีตัวเชื่อมต่อ {{method}} ที่เกี่ยวข้องกำหนดค่าไว้',
};

export default Object.freeze(sign_in_experiences);
