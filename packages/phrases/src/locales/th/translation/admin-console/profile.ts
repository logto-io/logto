const profile = {
  link_account: {
    anonymous: 'ไม่ระบุชื่อ',
  },

  delete_account: {
    title: 'ลบบัญชี',
    label: 'ลบบัญชี',
    description:
      'การลบบัญชีของคุณจะลบข้อมูลส่วนบุคคล ข้อมูลผู้ใช้ และการตั้งค่าทั้งหมดของคุณ การดำเนินการนี้ไม่สามารถย้อนคืนได้',
    button: 'ลบบัญชี',
    p: {
      has_issue:
        'เราขออภัยที่คุณต้องการลบบัญชี กรุณาแก้ไขปัญหาดังต่อไปนี้ก่อนจึงจะสามารถลบบัญชีได้',
      after_resolved:
        'เมื่อคุณได้แก้ไขปัญหาแล้ว คุณสามารถลบบัญชีของคุณได้ หากต้องการความช่วยเหลือโปรดติดต่อเรา',
      check_information:
        'เราขออภัยที่คุณต้องการลบบัญชี กรุณาตรวจสอบข้อมูลต่อไปนี้ให้ถี่ถ้วนก่อนดำเนินการ',
      remove_all_data:
        'การลบบัญชีจะลบข้อมูลทั้งหมดของคุณใน Logto Cloud แบบถาวร กรุณาสำรองข้อมูลสำคัญก่อนดำเนินการ',
      confirm_information:
        'กรุณายืนยันว่าข้อมูลข้างต้นเป็นไปตามที่คุณคาดหวัง เมื่อคุณลบบัญชี จะไม่สามารถกู้คืนได้',
      has_admin_role: 'เนื่องจากคุณมีบทบาทผู้ดูแลในเท็นแนนต์ต่อไปนี้ จะถูกลบพร้อมกับบัญชีของคุณ:',
      has_admin_role_other:
        'เนื่องจากคุณมีบทบาทผู้ดูแลในเท็นแนนต์ต่อไปนี้ ทั้งหมดจะถูกลบพร้อมกับบัญชีของคุณ:',
      quit_tenant: 'คุณกำลังจะออกจากเท็นแนนต์ต่อไปนี้:',
      quit_tenant_other: 'คุณกำลังจะออกจากเท็นแนนต์ต่อไปนี้:',
    },
    issues: {
      paid_plan: 'เท็นแนนต์ต่อไปนี้มีแผนชำระเงิน กรุณายกเลิกการสมัครสมาชิกก่อน:',
      paid_plan_other: 'เท็นแนนต์ต่อไปนี้มีแผนชำระเงิน กรุณายกเลิกการสมัครสมาชิกก่อน:',
      subscription_status: 'เท็นแนนต์ต่อไปนี้มีปัญหาสถานะการสมัครสมาชิก:',
      subscription_status_other: 'เท็นแนนต์ต่อไปนี้มีปัญหาสถานะการสมัครสมาชิก:',
      open_invoice: 'เท็นแนนต์ต่อไปนี้มีใบแจ้งหนี้ที่ยังไม่ปิด:',
      open_invoice_other: 'เท็นแนนต์ต่อไปนี้มีใบแจ้งหนี้ที่ยังไม่ปิด:',
    },
    error_occurred: 'เกิดข้อผิดพลาด',
    error_occurred_description: 'ขออภัย เกิดข้อผิดพลาดขณะลบบัญชีของคุณ:',
    request_id: 'รหัสคำขอ: {{requestId}}',
    try_again_later:
      'กรุณาลองใหม่อีกครั้งในภายหลัง หากปัญหายังคงอยู่ กรุณาติดต่อทีม Logto พร้อมรหัสคำขอ',
    final_confirmation: 'ยืนยันขั้นสุดท้าย',
    about_to_start_deletion: 'คุณกำลังจะเริ่มกระบวนการลบ และการดำเนินการนี้ไม่สามารถย้อนคืนได้',
    permanently_delete: 'ลบถาวร',
  },

  fields: {
    name: 'ชื่อ',
    name_description:
      'ชื่อเต็มของผู้ใช้ในรูปแบบที่สามารถแสดงผลได้ รวมทุกองค์ประกอบชื่อ (เช่น “Jane Doe”)',
    avatar: 'รูปโปรไฟล์',
    avatar_description: 'URL ของรูปโปรไฟล์ผู้ใช้',
    familyName: 'นามสกุล',
    familyName_description: 'นามสกุลของผู้ใช้ (เช่น "Doe")',
    givenName: 'ชื่อจริง',
    givenName_description: 'ชื่อจริงของผู้ใช้ (เช่น "Jane")',
    middleName: 'ชื่อกลาง',
    middleName_description: 'ชื่อกลางของผู้ใช้ (เช่น "Marie")',
    nickname: 'ชื่อเล่น',
    nickname_description: 'ชื่อเล่นหรือชื่อที่ผู้ใช้คุ้นเคย อาจต่างจากชื่อทางการ',
    preferredUsername: 'ชื่อผู้ใช้ที่ต้องการ',
    preferredUsername_description: 'รหัสย่อที่ผู้ใช้ต้องการให้เรียก',
    profile: 'โปรไฟล์',
    profile_description: 'URL ของหน้าโปรไฟล์ที่มนุษย์อ่านได้ของผู้ใช้ (เช่น โปรไฟล์โซเชียลมีเดีย)',
    website: 'เว็บไซต์',
    website_description: 'URL ของเว็บไซต์ส่วนตัวหรือบล็อกของผู้ใช้',
    gender: 'เพศ',
    gender_description: 'เพศที่ผู้ใช้ระบุเอง (เช่น "หญิง", "ชาย", "ไม่ระบุเพศ")',
    birthdate: 'วันเกิด',
    birthdate_description: 'วันเกิดของผู้ใช้ในรูปแบบที่ระบุ (เช่น "MM-dd-yyyy")',
    zoneinfo: 'เขตเวลา',
    zoneinfo_description:
      'เขตเวลาของผู้ใช้ในรูปแบบ IANA (เช่น "America/New_York" หรือ "Europe/Paris")',
    locale: 'ภาษา',
    locale_description: 'ภาษาของผู้ใช้ในรูปแบบ IETF BCP 47 (เช่น "en-US" หรือ "zh-CN")',
    address: {
      formatted: 'ที่อยู่',
      streetAddress: 'ที่อยู่ถนน',
      locality: 'เมือง',
      region: 'รัฐ/จังหวัด',
      postalCode: 'รหัสไปรษณีย์',
      country: 'ประเทศ',
    },
    address_description:
      'ที่อยู่เต็มของผู้ใช้ในรูปแบบที่สามารถแสดงผลได้ รวมทุกองค์ประกอบที่อยู่ (เช่น "123 Main St, Anytown, USA 12345")',
    fullname: 'ชื่อเต็ม',
    fullname_description: 'รวม familyName, givenName และ middleName ตามการตั้งค่า',
  },
};

export default Object.freeze(profile);
