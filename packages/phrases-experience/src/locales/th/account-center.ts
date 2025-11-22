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
