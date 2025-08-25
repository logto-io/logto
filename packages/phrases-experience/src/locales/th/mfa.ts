const mfa = {
  totp: 'รหัส OTP จากแอป Authenticator',
  webauthn: 'รหัสผ่านดิจิทัล (Passkey)',
  backup_code: 'รหัสสำรอง',
  email_verification_code: 'รหัสยืนยันทางอีเมล',
  phone_verification_code: 'รหัสยืนยันทาง SMS',
  link_totp_description: 'เช่น Google Authenticator เป็นต้น',
  link_webauthn_description: 'เชื่อมต่ออุปกรณ์หรือฮาร์ดแวร์ USB',
  link_backup_code_description: 'สร้างรหัสสำรอง',
  link_email_verification_code_description: 'เชื่อมต่ออีเมลของคุณ',
  link_email_2fa_description: 'เชื่อมต่อที่อยู่อีเมลของคุณสำหรับการยืนยันแบบ 2 ขั้นตอน',
  link_phone_verification_code_description: 'เชื่อมต่อหมายเลขโทรศัพท์ของคุณ',
  link_phone_2fa_description: 'เชื่อมต่อหมายเลขโทรศัพท์ของคุณสำหรับการยืนยันแบบ 2 ขั้นตอน',
  verify_totp_description: 'กรอกรหัสครั้งเดียวในแอป',
  verify_webauthn_description: 'ยืนยันอุปกรณ์หรือฮาร์ดแวร์ USB ของคุณ',
  verify_backup_code_description: 'วางรหัสสำรองที่คุณบันทึกไว้',
  verify_email_verification_code_description: 'กรอกรหัสที่ส่งไปยังอีเมลของคุณ',
  verify_phone_verification_code_description: 'กรอกรหัสที่ส่งไปยังโทรศัพท์ของคุณ',
  add_mfa_factors: 'เพิ่มการยืนยันแบบ 2 ขั้นตอน',
  add_mfa_description:
    'เปิดใช้การยืนยันตัวตนสองขั้นตอนแล้ว เลือกวิธีที่สองในการยืนยันเพื่อความปลอดภัยขณะเข้าสู่ระบบ',
  verify_mfa_factors: 'การยืนยันแบบ 2 ขั้นตอน',
  verify_mfa_description:
    'ได้เปิดใช้การยืนยันแบบ 2 ขั้นตอนสำหรับบัญชีนี้ โปรดเลือกวิธีที่สองในการยืนยันตัวตนของคุณ',
  add_authenticator_app: 'เพิ่มแอป Authenticator',
  step: 'ขั้นตอน {{step, number}}: {{content}}',
  scan_qr_code: 'สแกนรหัส QR นี้',
  scan_qr_code_description:
    'สแกนรหัส QR ด้านล่างด้วยแอป Authenticator ของคุณ เช่น Google Authenticator, Duo Mobile, Authy เป็นต้น',
  qr_code_not_available: 'ไม่สามารถสแกน QR ได้ใช่ไหม?',
  copy_and_paste_key: 'คัดลอกและวางคีย์',
  copy_and_paste_key_description:
    'คัดลอกและวางคีย์ต่อไปนี้ในแอป Authenticator ของคุณ เช่น Google Authenticator, Duo Mobile, Authy เป็นต้น',
  want_to_scan_qr_code: 'ต้องการสแกน QR หรือไม่?',
  enter_one_time_code: 'กรอกรหัสครั้งเดียว',
  enter_one_time_code_link_description: 'กรอกรหัสยืนยัน 6 หลักที่สร้างโดยแอป Authenticator',
  enter_one_time_code_description:
    'ได้เปิดใช้การยืนยันแบบ 2 ขั้นตอนสำหรับบัญชีนี้ กรุณากรอกรหัสครั้งเดียวที่แสดงบนแอป Authenticator ที่เชื่อมต่อของคุณ',
  enter_email_verification_code: 'กรอกรหัสยืนยันอีเมล',
  enter_email_verification_code_description:
    'ได้เปิดใช้การยืนยันตัวตนแบบ 2 ขั้นตอนสำหรับบัญชีนี้ กรุณากรอกรหัสยืนยันอีเมลที่ส่งไปยัง {{identifier}}',
  enter_phone_verification_code: 'กรอกรหัสยืนยัน SMS',
  enter_phone_verification_code_description:
    'ได้เปิดใช้การยืนยันตัวตนแบบ 2 ขั้นตอนสำหรับบัญชีนี้ กรุณากรอกรหัสยืนยัน SMS ที่ส่งไปยัง {{identifier}}',
  link_another_mfa_factor: 'เปลี่ยนไปใช้วิธีอื่น',
  save_backup_code: 'บันทึกรหัสสำรองของคุณ',
  save_backup_code_description:
    'คุณสามารถใช้รหัสสำรองเหล่านี้เพื่อเข้าสู่บัญชีของคุณ หากประสบปัญหาในการยืนยันแบบ 2 ขั้นตอนด้วยวิธีอื่น รหัสแต่ละตัวใช้ได้เพียงครั้งเดียวเท่านั้น',
  backup_code_hint: 'โปรดคัดลอกและเก็บรักษาไว้ในที่ปลอดภัย',
  enter_a_backup_code: 'กรอกรหัสสำรอง',
  enter_backup_code_description:
    'กรอกรหัสสำรองที่คุณบันทึกไว้เมื่อตั้งค่าการยืนยันแบบ 2 ขั้นตอนครั้งแรก',
  create_a_passkey: 'สร้างรหัสผ่านดิจิทัล (Passkey)',
  create_passkey_description:
    'ลงทะเบียนรหัสผ่านดิจิทัลของคุณโดยใช้ไบโอเมตริกซ์ของอุปกรณ์ กุญแจความปลอดภัย (เช่น YubiKey) หรือวิธีอื่นที่มีให้',
  try_another_verification_method: 'ลองใช้วิธีการตรวจสอบอื่น',
  verify_via_passkey: 'ยืนยันผ่านรหัสผ่านดิจิทัล',
  verify_via_passkey_description:
    'ใช้รหัสผ่านดิจิทัลเพื่อยืนยันโดยรหัสผ่านอุปกรณ์หรือไบโอเมตริกซ์ สแกน QR หรือใช้กุญแจความปลอดภัย USB เช่น YubiKey',
  secret_key_copied: 'คัดลอกคีย์ลับแล้ว',
  backup_code_copied: 'คัดลอกรหัสสำรองแล้ว',
  webauthn_not_ready: 'WebAuthn ยังไม่พร้อม กรุณาลองใหม่อีกครั้งภายหลัง',
  webauthn_not_supported: 'เบราว์เซอร์นี้ไม่รองรับ WebAuthn',
  webauthn_failed_to_create: 'สร้างไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
  webauthn_failed_to_verify: 'ยืนยันไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
};

export default Object.freeze(mfa);
