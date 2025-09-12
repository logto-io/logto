const custom_profile_fields = {
  entity_not_exists_with_names: 'ไม่พบเอนทิตีที่มีชื่อ: {{names}}',
  invalid_min_max_input: 'ค่าขั้นต่ำและค่าสูงสุดไม่ถูกต้อง',
  invalid_default_value: 'ค่าเริ่มต้นไม่ถูกต้อง',
  invalid_options: 'ตัวเลือกฟิลด์ไม่ถูกต้อง',
  invalid_regex_format: 'รูปแบบ regex ไม่ถูกต้อง',
  invalid_address_components: 'ส่วนประกอบที่อยู่ไม่ถูกต้อง',
  invalid_fullname_components: 'ส่วนประกอบชื่อเต็มไม่ถูกต้อง',
  invalid_sub_component_type: 'ประเภทส่วนประกอบย่อยไม่ถูกต้อง',
  name_exists: 'มีฟิลด์ที่ใช้ชื่อนี้อยู่แล้ว',
  conflicted_sie_order: 'ลำดับของฟิลด์สำหรับ Sign-in Experience ขัดแย้งกัน',
  invalid_name: 'ชื่อฟิลด์ไม่ถูกต้อง ต้องเป็นตัวอักษรหรือตัวเลขเท่านั้น และใช้ตัวพิมพ์เล็ก/ใหญ่',
  name_conflict_sign_in_identifier:
    'ชื่อฟิลด์ไม่ถูกต้อง ชื่อที่สงวนไว้สำหรับ sign-in identifier คือ: {{name}}',
  name_conflict_built_in_prop:
    'ชื่อฟิลด์ไม่ถูกต้อง ชื่อที่สงวนไว้สำหรับคุณสมบัติโปรไฟล์ของผู้ใช้ในระบบคือ: {{name}}',
  name_conflict_custom_data:
    'ชื่อฟิลด์ไม่ถูกต้อง ชื่อที่สงวนไว้สำหรับข้อมูลแบบกำหนดเองคือ: {{name}}',
  name_required: 'ต้องระบุชื่อฟิลด์',
};

export default Object.freeze(custom_profile_fields);
