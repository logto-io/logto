const user_identity_details = {
  social_identity_page_title: 'รายละเอียดข้อมูลโซเชียลไอดี',
  back_to_user_details: 'กลับไปยังรายละเอียดผู้ใช้',
  delete_identity: `ลบการเชื่อมต่อไอดี`,
  social_account: {
    title: 'บัญชีโซเชียล',
    description: 'ดูข้อมูลผู้ใช้และข้อมูลโปรไฟล์ที่ซิงค์จากบัญชี {{connectorName}} ที่เชื่อมต่อ',
    provider_name: 'ชื่อผู้ให้บริการโซเชียลไอดี',
    identity_id: 'รหัสโซเชียลไอดี',
    user_profile: 'โปรไฟล์ผู้ใช้ที่ซิงค์จากผู้ให้บริการโซเชียลไอดี',
  },
  sso_account: {
    title: 'บัญชี SSO องค์กร',
    description: 'ดูข้อมูลผู้ใช้และข้อมูลโปรไฟล์ที่ซิงค์จากบัญชี {{connectorName}} ที่เชื่อมต่อ',
    provider_name: 'ชื่อผู้ให้บริการ SSO องค์กร',
    identity_id: 'รหัส SSO องค์กร',
    user_profile: 'โปรไฟล์ผู้ใช้ที่ซิงค์จากผู้ให้บริการ SSO องค์กร',
  },
  token_storage: {
    title: 'โทเค็นเข้าใช้งาน',
    description:
      'จัดเก็บ access token และ refresh token จาก {{connectorName}} ใน Secret Vault ช่วยให้อัตโนมัติในการเรียก API โดยไม่ต้องขอความยินยอมจากผู้ใช้ซ้ำ',
  },
  access_token: {
    title: 'โทเค็นเข้าใช้งาน',
    description_active:
      'โทเค็นเข้าใช้งานเปิดใช้งานและถูกเก็บไว้อย่างปลอดภัยใน Secret Vault ผลิตภัณฑ์ของคุณสามารถใช้เพื่อเรียก API ของ {{connectorName}} ได้',
    description_inactive:
      'โทเค็นเข้าใช้งานนี้ไม่ทำงาน (เช่น ถูกเพิกถอน) ผู้ใช้ต้องอนุญาตใหม่เพื่อเรียกคืนฟังก์ชันการทำงาน',
    description_expired:
      'โทเค็นเข้าใช้งานนี้หมดอายุแล้ว จะมีการต่ออายุโดยอัตโนมัติในการเรียก API ครั้งถัดไปโดยใช้ refresh token หากไม่มี refresh token ต้องให้ผู้ใช้เข้าสู่ระบบใหม่',
  },
  refresh_token: {
    available:
      'Refresh token พร้อมใช้งาน หาก access token หมดอายุ จะมีการรีเฟรชอัตโนมัติโดยใช้ refresh token',
    not_available:
      'ไม่มี refresh token หลังจาก access token หมดอายุ ผู้ใช้ต้องเข้าสู่ระบบใหม่เพื่อรับโทเค็นใหม่',
  },
  token_status: 'สถานะโทเค็น',
  created_at: 'สร้างเมื่อ',
  updated_at: 'อัปเดตเมื่อ',
  expires_at: 'วันหมดอายุ',
  scopes: 'ขอบเขต',
  delete_tokens: {
    title: 'ลบโทเค็น',
    description: 'ลบโทเค็นที่จัดเก็บไว้ ผู้ใช้ต้องอนุญาตใหม่เพื่อกู้คืนฟังก์ชันการทำงาน',
    confirmation_message:
      'คุณแน่ใจหรือไม่ว่าต้องการลบโทเค็น? Logto Secret Vault จะลบโทเค็น access และ refresh ของ {{connectorName}} ที่จัดเก็บไว้ ผู้ใช้นี้ต้องอนุญาตใหม่เพื่อเข้าถึง API ของ {{connectorName}} อีกครั้ง',
  },
  token_storage_disabled: {
    title: 'ปิดใช้งานการเก็บโทเค็นสำหรับคอนเนคเตอร์นี้',
    description:
      'ปัจจุบันผู้ใช้สามารถใช้ {{connectorName}} เพื่อเข้าสู่ระบบ เชื่อมบัญชี หรือซิงค์โปรไฟล์ในแต่ละครั้งที่มีการขอความยินยอมเท่านั้น หากต้องการเข้าถึง API ของ {{connectorName}} และดำเนินการในนามผู้ใช้ กรุณาเปิดใช้งานการเก็บโทเค็นที่',
  },
};

export default user_identity_details;
