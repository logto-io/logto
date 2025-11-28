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
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
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
    success: 'Primary email linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  phone: {
    title: 'Link phone',
    description: 'Link your phone number to sign in or help with account recovery.',
    verification_title: 'Enter phone verification code',
    verification_description: 'The verification code has been sent to your phone {{phone_number}}.',
    success: 'Primary phone linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },

  code_verification: {
    send: 'Send verification code',
    resend: 'ส่งรหัสอีกครั้ง',
    resend_countdown: 'ยังไม่ได้รับใช่ไหม? ส่งใหม่ได้หลัง {{seconds}} วินาที',
  },

  email_verification: {
    title: 'ยืนยันอีเมลของคุณ',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
    description: 'ได้ส่งรหัสยืนยันไปยังอีเมล {{email}} แล้ว กรุณากรอกรหัสเพื่อดำเนินการต่อ',
    resend: 'ส่งรหัสอีกครั้ง',
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
    send: 'Send verification code',
    description: 'ได้ส่งรหัสยืนยันไปยังโทรศัพท์ {{phone}} แล้ว กรุณากรอกรหัสเพื่อดำเนินการต่อ',
    resend: 'ส่งรหัสอีกครั้ง',
    resend_countdown: 'ยังไม่ได้รับใช่ไหม? ส่งใหม่ได้หลัง {{seconds}} วินาที',
    error_send_failed: 'ส่งรหัสยืนยันไม่สำเร็จ โปรดลองอีกครั้งในภายหลัง',
    error_verify_failed: 'ยืนยันไม่สำเร็จ กรุณากรอกรหัสอีกครั้ง',
    error_invalid_code: 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุแล้ว',
  },
};

export default Object.freeze(account_center);
