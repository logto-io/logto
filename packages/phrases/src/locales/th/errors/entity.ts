const entity = {
  invalid_input: 'ข้อมูลไม่ถูกต้อง รายการค่าต้องไม่ว่างเปล่า',
  create_failed: 'สร้าง {{name}} ไม่สำเร็จ',
  db_constraint_violated: 'ละเมิดข้อจำกัดฐานข้อมูล',
  not_exists: '{{name}} นี้ไม่มีอยู่',
  not_exists_with_id: '{{name}} ที่มีรหัส `{{id}}` นี้ไม่มีอยู่',
  not_found: 'ไม่พบทรัพยากร',
  relation_foreign_key_not_found:
    'ไม่พบคีย์ต่างประเทศหนึ่งหรือมากกว่า โปรดตรวจสอบข้อมูลที่กรอกและตรวจสอบให้แน่ใจว่ามีเอนทิตี้ที่อ้างอิงทั้งหมด',
  unique_integrity_violation: 'เอนทิตี้นี้มีอยู่แล้ว โปรดตรวจสอบข้อมูลแล้วลองใหม่อีกครั้ง',
};

export default Object.freeze(entity);
