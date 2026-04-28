const account_center = {
  home: {
    title: 'ไม่พบหน้าเว็บ',
    description: 'ไม่สามารถใช้หน้านี้ได้',
  },
  page: {
    title: 'บัญชี',
    security_title: 'ความปลอดภัย',
    security_description: 'เปลี่ยนการตั้งค่าบัญชีของคุณที่นี่เพื่อให้บัญชีของคุณปลอดภัย',
    /** UNTRANSLATED */
    profile_title: 'Personal info',
    /** UNTRANSLATED */
    profile_description: 'Change your personal information here.',
    /** UNTRANSLATED */
    sidebar_personal_info: 'Personal info',
    /** UNTRANSLATED */
    sidebar_security: 'Security',
    support: 'ฝ่ายช่วยเหลือ',
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
    no_available_methods_title: 'ไม่มีวิธีการยืนยันตัวตนที่พร้อมใช้งาน',
    no_available_methods_description:
      'คุณยังไม่ได้ตั้งค่าวิธีการยืนยันตัวตน กรุณาเพิ่มรหัสผ่าน อีเมล หรือหมายเลขโทรศัพท์ให้กับบัญชีของคุณก่อน',
  },
  password_verification: {
    title: 'ยืนยันรหัสผ่าน',
    description: 'เพื่อปกป้องบัญชี กรุณากรอกรหัสผ่านเพื่อยืนยันตัวตน',
    error_failed: 'รหัสผ่านไม่ถูกต้อง โปรดตรวจสอบข้อมูลที่ป้อน',
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
  security: {
    add: 'เพิ่ม',
    change: 'เปลี่ยน',
    remove: 'ลบ',
    not_set: 'ยังไม่ได้ตั้งค่า',
    social_sign_in: 'การเข้าสู่ระบบด้วยโซเชียล',
    social_not_linked: 'ยังไม่ได้เชื่อมโยง',
    email_phone: 'อีเมล / โทรศัพท์',
    email: 'อีเมล',
    phone: 'โทรศัพท์',
    password: 'รหัสผ่าน',
    configured: 'ตั้งค่าแล้ว',
    not_configured: 'ยังไม่ได้ตั้งค่า',
    two_step_verification: 'การยืนยันแบบ 2 ขั้นตอน',
    authenticator_app: 'แอป Authenticator',
    passkeys: 'Passkeys',
    backup_codes: 'รหัสสำรอง',
    email_verification_code: 'รหัสยืนยันทางอีเมล',
    phone_verification_code: 'รหัสยืนยันทางโทรศัพท์',
    passkeys_count_one: '{{count}} passkey',
    passkeys_count_other: '{{count}} passkeys',
    backup_codes_count_one: 'เหลือ {{count}} รหัส',
    backup_codes_count_other: 'เหลือ {{count}} รหัส',
    view: 'ดู',
    manage: 'จัดการ',
    turn_on_2_step_verification: 'เปิดการยืนยันตัวตนสองขั้นตอน',
    turn_on_2_step_verification_description:
      'เพิ่มชั้นความปลอดภัยเพิ่มเติม คุณจะถูกขอให้ทำการยืนยันขั้นตอนที่สองเมื่อลงชื่อเข้าใช้',
    turn_off_2_step_verification: 'ปิดการยืนยันตัวตนสองขั้นตอน',
    turn_off_2_step_verification_description:
      'การปิดการยืนยันตัวตนสองขั้นตอนจะลบชั้นการป้องกันเพิ่มเติมออกจากบัญชีของคุณเมื่อลงชื่อเข้าใช้ คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?',
    disable_2_step_verification: 'ปิด',
    no_verification_method_warning:
      'คุณยังไม่ได้เพิ่มวิธีการยืนยันตัวตนที่สอง เพิ่มอย่างน้อยหนึ่งวิธีเพื่อเปิดใช้งานการยืนยันตัวตนสองขั้นตอนเมื่อลงชื่อเข้าใช้',
    account_removal: 'การลบบัญชี',
    delete_your_account: 'ลบบัญชีของคุณ',
    delete_account: 'ลบบัญชี',
    remove_email_confirmation_title: 'ลบที่อยู่อีเมล',
    remove_email_confirmation_description:
      'เมื่อลบแล้ว คุณจะไม่สามารถลงชื่อเข้าใช้ด้วยที่อยู่อีเมลนี้ได้อีก คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?',
    remove_phone_confirmation_title: 'ลบหมายเลขโทรศัพท์',
    remove_phone_confirmation_description:
      'เมื่อลบแล้ว คุณจะไม่สามารถลงชื่อเข้าใช้ด้วยหมายเลขโทรศัพท์นี้ได้อีก คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?',
    email_removed: 'ลบที่อยู่อีเมลเรียบร้อยแล้ว',
    phone_removed: 'ลบหมายเลขโทรศัพท์เรียบร้อยแล้ว',
  },
  social: {
    linked: 'เชื่อมโยง {{connector}} สำเร็จแล้ว',
    not_enabled:
      'วิธีการเข้าสู่ระบบผ่านโซเชียลนี้ยังไม่ได้เปิดใช้งาน โปรดติดต่อผู้ดูแลระบบเพื่อขอความช่วยเหลือ',
    removed: 'นำ {{connector}} ออกสำเร็จแล้ว',
    remove_confirmation_title: 'ลบบัญชีโซเชียล',
    remove_confirmation_description:
      'หากคุณลบ {{connector}} คุณอาจไม่สามารถลงชื่อเข้าใช้ด้วยบัญชีนี้ได้จนกว่าจะเพิ่มอีกครั้ง',
  },
  password: {
    title: 'ตั้งรหัสผ่าน',
    description: 'สร้างรหัสผ่านใหม่เพื่อความปลอดภัยของบัญชี',
    success: 'อัปเดตรหัสผ่านเรียบร้อยแล้ว',
  },
  code_verification: {
    send: 'ส่งรหัสยืนยัน',
    resend: 'ยังไม่ได้รับใช่ไหม? <a>ส่งรหัสยืนยันอีกครั้ง</a>',
    resend_countdown: 'ยังไม่ได้รับใช่ไหม? ส่งใหม่ได้หลัง {{seconds}} วินาที',
  },
  email_verification: {
    title: 'ยืนยันอีเมลของคุณ',
    prepare_description:
      'ยืนยันตัวตนของคุณเพื่อปกป้องความปลอดภัยของบัญชี ส่งรหัสยืนยันไปยังอีเมลของคุณ',
    email_label: 'ที่อยู่อีเมล',
    send: 'ส่งรหัสยืนยัน',
    description: 'ได้ส่งรหัสยืนยันไปยังอีเมล {{email}} แล้ว กรุณากรอกรหัสเพื่อดำเนินการต่อ',
    resend: 'ยังไม่ได้รับใช่ไหม? <a>ส่งรหัสยืนยันอีกครั้ง</a>',
    not_received: 'ยังไม่ได้รับใช่ไหม?',
    resend_action: 'ส่งรหัสยืนยันอีกครั้ง',
    resend_countdown: 'ยังไม่ได้รับใช่ไหม? ส่งใหม่ได้หลัง {{seconds}} วินาที',
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
    resend_countdown: 'ยังไม่ได้รับใช่ไหม? ส่งใหม่ได้หลัง {{seconds}} วินาที',
    error_send_failed: 'ส่งรหัสยืนยันไม่สำเร็จ โปรดลองอีกครั้งในภายหลัง',
    error_verify_failed: 'ยืนยันไม่สำเร็จ กรุณากรอกรหัสอีกครั้ง',
    error_invalid_code: 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุแล้ว',
  },
  mfa: {
    totp_already_added: 'คุณได้เพิ่มแอป Authenticator แล้ว โปรดลบแอปที่มีอยู่ก่อน',
    totp_not_enabled:
      'แอป Authenticator OTP ไม่ได้เปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อขอความช่วยเหลือ',
    backup_code_already_added: 'คุณมีรหัสสำรองที่ใช้งานอยู่แล้ว โปรดใช้หรือลบออกก่อนที่จะสร้างใหม่',
    backup_code_not_enabled: 'รหัสสำรองไม่ได้เปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อขอความช่วยเหลือ',
    backup_code_requires_other_mfa: 'รหัสสำรองต้องมีการตั้งค่าวิธี MFA อื่นก่อน',
    passkey_not_enabled: 'Passkey ไม่ได้เปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อขอความช่วยเหลือ',
    passkey_already_registered: 'Passkey นี้ลงทะเบียนกับบัญชีของคุณแล้ว กรุณาใช้ตัวยืนยันตัวตนอื่น',
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
    totp_replaced: {
      title: 'แอป Authenticator ถูกแทนที่แล้ว!',
      description: 'แอป Authenticator ของคุณถูกแทนที่เรียบร้อยแล้ว',
    },
    backup_code: {
      title: 'สร้างรหัสสำรองแล้ว!',
      description: 'รหัสสำรองของคุณถูกบันทึกแล้ว โปรดเก็บรักษาไว้ในที่ปลอดภัย',
    },
    passkey: {
      title: 'เพิ่ม Passkey แล้ว!',
      description: 'Passkey ของคุณได้รับการเชื่อมต่อกับบัญชีของคุณเรียบร้อยแล้ว',
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
  },
  passkey: {
    title: 'Passkeys',
    added: 'เพิ่มเมื่อ: {{date}}',
    last_used: 'ใช้ล่าสุด: {{date}}',
    never_used: 'ไม่เคยใช้',
    unnamed: 'Passkey ไม่มีชื่อ',
    renamed: 'เปลี่ยนชื่อ Passkey เรียบร้อยแล้ว',
    deleted: 'ลบ Passkey เรียบร้อยแล้ว',
    add_another_title: 'เพิ่ม Passkey อีกอัน',
    add_another_description:
      'ลงทะเบียน Passkey ของคุณโดยใช้ไบโอเมตริกซ์ของอุปกรณ์ กุญแจความปลอดภัย (เช่น YubiKey) หรือวิธีอื่นที่มี',
    add_passkey: 'เพิ่ม Passkey',
    delete_confirmation_title: 'ลบ Passkey ของคุณ',
    delete_confirmation_description: 'หากคุณลบ Passkey นี้ คุณจะไม่สามารถใช้เพื่อยืนยันตัวตนได้',
    rename_passkey: 'เปลี่ยนชื่อ Passkey',
    rename_description: 'ป้อนชื่อใหม่สำหรับ Passkey นี้',
    name_this_passkey: 'ตั้งชื่อ Passkey ของอุปกรณ์นี้',
    name_passkey_description:
      'คุณยืนยันอุปกรณ์นี้สำหรับการยืนยันตัวตนแบบ 2 ขั้นตอนสำเร็จแล้ว ปรับแต่งชื่อเพื่อให้จดจำได้หากคุณมีหลายคีย์',
    name_input_label: 'ชื่อ',
  },
};

export default Object.freeze(account_center);
