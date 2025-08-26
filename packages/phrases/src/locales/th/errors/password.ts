const password = {
  unsupported_encryption_method: 'ไม่รองรับวิธีการเข้ารหัส {{name}}',
  pepper_not_found: 'ไม่พบรหัส pepper ของรหัสผ่าน กรุณาตรวจสอบ core envs ของคุณ',
  rejected: 'รหัสผ่านถูกปฏิเสธ กรุณาตรวจสอบว่ารหัสผ่านของคุณตรงตามข้อกำหนดหรือไม่',
  invalid_legacy_password_format: 'รูปแบบรหัสผ่านเก่าไม่ถูกต้อง',
  unsupported_legacy_hash_algorithm: 'ไม่รองรับอัลกอริทึมแฮชแบบเก่า: {{algorithm}}',
};

export default Object.freeze(password);
