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
  },
};

export default Object.freeze(account_center);
