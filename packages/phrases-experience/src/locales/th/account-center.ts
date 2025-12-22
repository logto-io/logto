const account_center = {
  header: {
    title: 'ศูนย์บัญชี',
  },
  home: {
    title: 'ไม่พบหน้าเว็บ',
    description: 'ไม่สามารถใช้หน้านี้ได้',
  },
  verification: {
    title: 'การยืนยันความปลอดภัย',
    description:
      'ยืนยันว่าเป็นคุณเพื่อปกป้องความปลอดภัยของบัญชี กรุณาเลือกวิธีเพื่อยืนยันตัวตนของคุณ',
    error_send_failed: 'ส่งรหัสยืนยันไม่สำเร็จ โปรดลองอีกครั้งในภายหลัง',
    error_invalid_code: 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุแล้ว',
    error_verify_failed: 'ยืนยันไม่สำเร็จ กรุณากรอกรหัสอีกครั้ง',
    verification_required: 'การยืนยันหมดอายุ โปรดยืนยันตัวตนอีกครั้ง',
    try_another_method: 'ลองใช้วิธีอื่นเพื่อยืนยันตัวตน',
  },
  password_verification: {
    title: 'ยืนยันรหัสผ่าน',
    description: 'เพื่อปกป้องบัญชี กรุณากรอกรหัสผ่านเพื่อยืนยันตัวตน',
    error_failed: 'การยืนยันล้มเหลว โปรดตรวจสอบรหัสผ่านของคุณ',
  },
  verification_method: {
    password: {
      name: 'รหัสผ่าน',
      description: 'ยืนยันรหัสผ่านของคุณ',
    },
    email: {
      name: 'รหัสยืนยันทางอีเมล',
      description: 'ส่งรหัสยืนยันไปยังอีเมลของคุณ',
    },
    phone: {
      name: 'รหัสยืนยันทางโทรศัพท์',
      description: 'ส่งรหัสยืนยันไปยังหมายเลขโทรศัพท์ของคุณ',
    },
  },
  email: {
    title: 'เชื่อมต่ออีเมล',
    description: 'เชื่อมต่ออีเมลของคุณเพื่อเข้าสู่ระบบหรือช่วยในการกู้คืนบัญชี',
    verification_title: 'ป้อนรหัสยืนยันอีเมล',
    verification_description: 'รหัสยืนยันได้ถูกส่งไปยังอีเมล {{email_address}} ของคุณ',
    success: 'เชื่อมต่ออีเมลหลักเรียบร้อยแล้ว',
    verification_required: 'การยืนยันหมดอายุ โปรดยืนยันตัวตนอีกครั้ง',
  },
  phone: {
    title: 'เชื่อมต่อหมายเลขโทรศัพท์',
    description: 'เชื่อมต่อหมายเลขโทรศัพท์เพื่อใช้เข้าสู่ระบบหรือช่วยกู้คืนบัญชี',
    verification_title: 'กรอกรหัสยืนยัน SMS',
    verification_description: 'ได้ส่งรหัสยืนยันไปยังโทรศัพท์ {{phone_number}} แล้ว',
    success: 'เชื่อมต่อโทรศัพท์หลักเรียบร้อยแล้ว',
    verification_required: 'การยืนยันหมดอายุ โปรดยืนยันตัวตนอีกครั้ง',
  },
  username: {
    title: 'ตั้งชื่อผู้ใช้',
    description: 'ชื่อผู้ใช้ต้องมีเฉพาะตัวอักษร ตัวเลข และขีดล่างเท่านั้น',
    success: 'อัปเดตชื่อผู้ใช้เรียบร้อยแล้ว',
  },
  password: {
    title: 'ตั้งรหัสผ่าน',
    description: 'สร้างรหัสผ่านใหม่เพื่อความปลอดภัยของบัญชี',
    success: 'อัปเดตรหัสผ่านเรียบร้อยแล้ว',
  },

  code_verification: {
    send: 'ส่งรหัสยืนยัน',
    resend: 'ยังไม่ได้รับใช่ไหม? <a>ส่งรหัสยืนยันอีกครั้ง</a>',
    resend_countdown: 'ยังไม่ได้รับใช่ไหม?<span> ส่งใหม่ได้หลัง {{seconds}} วินาที</span>',
  },

  email_verification: {
    title: 'ยืนยันอีเมลของคุณ',
    prepare_description:
      'ยืนยันตัวตนของคุณเพื่อปกป้องความปลอดภัยของบัญชี ส่งรหัสยืนยันไปยังอีเมลของคุณ',
    email_label: 'ที่อยู่อีเมล',
    send: 'ส่งรหัสยืนยัน',
    description: 'ได้ส่งรหัสยืนยันไปยังอีเมล {{email}} แล้ว กรุณากรอกรหัสเพื่อดำเนินการต่อ',
    resend: 'ยังไม่ได้รับใช่ไหม? <a>ส่งรหัสยืนยันอีกครั้ง</a>',
    resend_countdown: 'ยังไม่ได้รับใช่ไหม?<span> ส่งใหม่ได้หลัง {{seconds}} วินาที</span>',
    error_send_failed: 'ส่งรหัสยืนยันไม่สำเร็จ โปรดลองอีกครั้งในภายหลัง',
    error_verify_failed: 'ยืนยันไม่สำเร็จ กรุณากรอกรหัสอีกครั้ง',
    error_invalid_code: 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุแล้ว',
  },
  phone_verification: {
    title: 'ยืนยันโทรศัพท์ของคุณ',
    prepare_description:
      'ยืนยันว่าเป็นคุณเพื่อปกป้องความปลอดภัยของบัญชี ส่งรหัสยืนยันไปยังโทรศัพท์ของคุณ',
    phone_label: 'หมายเลขโทรศัพท์',
    send: 'ส่งรหัสยืนยัน',
    description: 'ได้ส่งรหัสยืนยันไปยังโทรศัพท์ {{phone}} แล้ว กรุณากรอกรหัสเพื่อดำเนินการต่อ',
    resend: 'ยังไม่ได้รับใช่ไหม? <a>ส่งรหัสยืนยันอีกครั้ง</a>',
    resend_countdown: 'ยังไม่ได้รับใช่ไหม?<span> ส่งใหม่ได้หลัง {{seconds}} วินาที</span>',
    error_send_failed: 'ส่งรหัสยืนยันไม่สำเร็จ โปรดลองอีกครั้งในภายหลัง',
    error_verify_failed: 'ยืนยันไม่สำเร็จ กรุณากรอกรหัสอีกครั้ง',
    error_invalid_code: 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุแล้ว',
  },
  mfa: {
    totp_already_added: 'คุณได้เพิ่มแอป Authenticator แล้ว โปรดลบแอปที่มีอยู่ก่อน',
    totp_not_enabled: 'แอป Authenticator ไม่ได้เปิดใช้งาน โปรดติดต่อผู้ดูแลระบบเพื่อเปิดใช้งาน',
    backup_code_already_added: 'คุณมีรหัสสำรองที่ใช้งานอยู่แล้ว โปรดใช้หรือลบออกก่อนที่จะสร้างใหม่',
    backup_code_not_enabled: 'รหัสสำรองไม่ได้เปิดใช้งาน โปรดติดต่อผู้ดูแลระบบของคุณเพื่อเปิดใช้งาน',
    backup_code_requires_other_mfa: 'รหัสสำรองต้องมีการตั้งค่าวิธี MFA อื่นก่อน',
    passkey_not_enabled: 'Passkey ไม่ได้เปิดใช้งาน โปรดติดต่อผู้ดูแลระบบเพื่อเปิดใช้งาน',
  },
  update_success: {
    default: {
      title: 'อัปเดตแล้ว!',
      description: 'ข้อมูลของคุณได้รับการอัปเดตแล้ว',
    },
    email: {
      title: 'อัปเดตอีเมลแล้ว!',
      description: 'ที่อยู่อีเมลของคุณได้รับการอัปเดตเรียบร้อยแล้ว',
    },
    phone: {
      title: 'อัปเดตเบอร์โทรศัพท์แล้ว!',
      description: 'หมายเลขโทรศัพท์ของคุณได้รับการอัปเดตเรียบร้อยแล้ว',
    },
    username: {
      title: 'เปลี่ยนชื่อผู้ใช้แล้ว!',
      description: 'ชื่อผู้ใช้ของคุณได้รับการอัปเดตเรียบร้อยแล้ว',
    },

    password: {
      title: 'เปลี่ยนรหัสผ่านแล้ว!',
      description: 'รหัสผ่านของคุณได้รับการอัปเดตเรียบร้อยแล้ว',
    },
    totp: {
      title: 'เพิ่มแอป Authenticator แล้ว!',
      description: 'แอป Authenticator ของคุณได้รับการเชื่อมต่อกับบัญชีของคุณเรียบร้อยแล้ว',
    },
    backup_code: {
      title: 'สร้างรหัสสำรองแล้ว!',
      description: 'รหัสสำรองของคุณถูกบันทึกแล้ว โปรดเก็บรักษาไว้ในที่ปลอดภัย',
    },
    backup_code_deleted: {
      title: 'ลบรหัสสำรองแล้ว!',
      description: 'รหัสสำรองของคุณถูกลบออกจากบัญชีแล้ว',
    },
    passkey: {
      title: 'เพิ่ม Passkey แล้ว!',
      description: 'Passkey ของคุณได้รับการเชื่อมต่อกับบัญชีของคุณเรียบร้อยแล้ว',
    },
    passkey_deleted: {
      title: 'ลบ Passkey แล้ว!',
      description: 'Passkey ของคุณถูกลบออกจากบัญชีแล้ว',
    },
    social: {
      title: 'เชื่อมต่อบัญชีโซเชียลแล้ว!',
      description: 'บัญชีโซเชียลของคุณได้รับการเชื่อมต่อเรียบร้อยแล้ว',
    },
  },
  backup_code: {
    title: 'รหัสสำรอง',
    description:
      'คุณสามารถใช้รหัสสำรองเหล่านี้เพื่อเข้าถึงบัญชีของคุณหากมีปัญหาในการยืนยันตัวตนแบบ 2 ขั้นตอน แต่ละรหัสสามารถใช้ได้เพียงครั้งเดียว',
    copy_hint: 'คัดลอกและเก็บรักษาไว้ในที่ปลอดภัย',
    generate_new_title: 'สร้างรหัสสำรองใหม่',
    generate_new: 'สร้างรหัสสำรองใหม่',
    delete_confirmation_title: 'ลบรหัสสำรองของคุณ',
    delete_confirmation_description: 'หากคุณลบรหัสสำรองเหล่านี้ คุณจะไม่สามารถใช้ยืนยันตัวตนได้',
  },
  passkey: {
    title: 'Passkeys',
    added: 'เพิ่มเมื่อ: {{date}}',
    last_used: 'ใช้ล่าสุด: {{date}}',
    never_used: 'ไม่เคยใช้',
    unnamed: 'Passkey ไม่มีชื่อ',
    renamed: 'เปลี่ยนชื่อ Passkey เรียบร้อยแล้ว',
    add_another_title: 'เพิ่ม Passkey อีกอัน',
    add_another_description:
      'ลงทะเบียน Passkey ของคุณโดยใช้ไบโอเมตริกซ์ของอุปกรณ์ กุญแจความปลอดภัย (เช่น YubiKey) หรือวิธีอื่นที่มี',
    add_passkey: 'เพิ่ม Passkey',
    delete_confirmation_title: 'ลบ Passkey',
    delete_confirmation_description:
      'คุณแน่ใจหรือไม่ว่าต้องการลบ "{{name}}"? คุณจะไม่สามารถใช้ Passkey นี้เข้าสู่ระบบได้อีก',
    rename_passkey: 'เปลี่ยนชื่อ Passkey',
    rename_description: 'ป้อนชื่อใหม่สำหรับ Passkey นี้',
  },
};

export default Object.freeze(account_center);
