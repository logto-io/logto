const oidc_configs = {
  sessions_card_title: 'เซสชัน Logto',
  sessions_card_description:
    'ปรับแต่งนโยบายเซสชันที่จัดเก็บโดยเซิร์ฟเวอร์การอนุญาตของ Logto โดยจะบันทึกสถานะการยืนยันตัวตนส่วนกลางของผู้ใช้เพื่อเปิดใช้งาน SSO และรองรับการยืนยันตัวตนใหม่แบบเงียบข้ามแอป',
  session_max_ttl_in_days: 'อายุการใช้งานสูงสุดของเซสชัน (TTL) เป็นวัน',
  session_max_ttl_in_days_tip:
    'ขีดจำกัดอายุการใช้งานแบบตายตัวนับจากเวลาที่สร้างเซสชัน ไม่ว่ามีกิจกรรมหรือไม่ เซสชันจะสิ้นสุดเมื่อครบระยะเวลาคงที่นี้',
  cloud_private_key_rotation_notice:
    'ใน Logto Cloud การหมุนเวียนคีย์ส่วนตัวจะมีผลหลังจากช่วงผ่อนผัน 4 ชั่วโมง',
};

export default Object.freeze(oidc_configs);
