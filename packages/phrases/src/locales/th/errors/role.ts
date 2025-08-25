const role = {
  name_in_use: 'ชื่อบทบาท {{name}} นี้ถูกใช้งานแล้ว',
  scope_exists: 'ไอดีขอบเขต {{scopeId}} ได้ถูกเพิ่มในบทบาทนี้แล้ว',
  management_api_scopes_not_assignable_to_user_role:
    'ไม่สามารถกำหนด Management API scopes ให้กับบทบาทผู้ใช้ได้',
  user_exists: 'ไอดีผู้ใช้ {{userId}} ได้ถูกเพิ่มในบทบาทนี้แล้ว',
  application_exists: 'ไอดีแอปพลิเคชัน {{applicationId}} ได้ถูกเพิ่มในบทบาทนี้แล้ว',
  default_role_missing:
    'ชื่อบทบาทเริ่มต้นบางรายการไม่มีอยู่ในฐานข้อมูล กรุณาสร้างบทบาทเหล่านั้นก่อน',
  internal_role_violation:
    'คุณอาจกำลังพยายามอัปเดตหรือลบบทบาทภายใน ซึ่งไม่อนุญาตโดย Logto หากคุณกำลังสร้างบทบาทใหม่ กรุณาใช้งานชื่ออื่นที่ไม่ขึ้นต้นด้วย "#internal:"',
};

export default Object.freeze(role);
