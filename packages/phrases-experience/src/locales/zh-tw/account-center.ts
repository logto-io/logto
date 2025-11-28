const account_center = {
  header: {
    title: '帳戶中心',
  },
  home: {
    title: '找不到頁面',
    description: '此頁面無法使用。',
  },
  verification: {
    title: '安全驗證',
    description: '為保護帳戶安全，請確認是您本人。請選擇用於驗證身分的方法。',
    error_send_failed: '驗證碼傳送失敗，請稍後再試。',
    error_invalid_code: '驗證碼無效或已過期。',
    error_verify_failed: '驗證失敗，請重新輸入驗證碼。',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
  },
  verification_method: {
    password: {
      name: '密碼',
      description: '驗證您的密碼',
    },
    email: {
      name: '電子郵件驗證碼',
      description: '傳送驗證碼到您的電子郵件',
    },
    phone: {
      name: '電話驗證碼',
      description: '傳送驗證碼到您的電話號碼',
    },
  },
  email: {
    title: '連結電子郵件',
    description: '連結你的電子郵件以登入或協助帳戶復原。',
    verification_title: '輸入電子郵件驗證碼',
    verification_description: '驗證碼已傳送至你的電子郵件 {{email_address}}。',
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
    resend: '重新傳送驗證碼',
    resend_countdown: '尚未收到？{{seconds}} 秒後可重新傳送。',
  },

  email_verification: {
    title: '驗證您的電子郵件',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
    description: '驗證碼已傳送至您的電子郵件 {{email}}。請輸入驗證碼以繼續。',
    resend: '重新傳送驗證碼',
    resend_countdown: '尚未收到？{{seconds}} 秒後可重新傳送。',
    error_send_failed: '驗證碼傳送失敗，請稍後再試。',
    error_verify_failed: '驗證失敗，請重新輸入驗證碼。',
    error_invalid_code: '驗證碼無效或已過期。',
  },
  phone_verification: {
    title: '驗證您的電話',
    prepare_description: '為保護帳戶安全，請確認是您本人。傳送驗證碼到您的電話。',
    phone_label: '電話號碼',
    send: 'Send verification code',
    description: '驗證碼已傳送至您的電話 {{phone}}。請輸入驗證碼以繼續。',
    resend: '重新傳送驗證碼',
    resend_countdown: '尚未收到？{{seconds}} 秒後可重新傳送。',
    error_send_failed: '驗證碼傳送失敗，請稍後再試。',
    error_verify_failed: '驗證失敗，請重新輸入驗證碼。',
    error_invalid_code: '驗證碼無效或已過期。',
  },
};

export default Object.freeze(account_center);
