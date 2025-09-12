const verification_record = {
  not_found: 'ไม่พบข้อมูลการยืนยันตัวตน',
  permission_denied: 'ปฏิเสธการอนุญาต โปรดตรวจสอบสิทธิ์ใหม่อีกครั้ง',
  not_supported_for_google_one_tap: 'API นี้ไม่รองรับ Google One Tap',
  social_verification: {
    invalid_target: 'ข้อมูลการยืนยันตัวตนไม่ถูกต้อง คาดว่าเป็น {{expected}} แต่ได้รับ {{actual}}',
    token_response_not_found:
      'ไม่พบผลลัพธ์ของโทเคน โปรดตรวจสอบให้แน่ใจว่าการจัดเก็บโทเคนได้รับการรองรับและเปิดใช้งานสำหรับตัวเชื่อมต่อโซเชียลนี้',
  },
};

export default Object.freeze(verification_record);
