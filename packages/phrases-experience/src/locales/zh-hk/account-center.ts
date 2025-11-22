const account_center = {
  header: {
    title: '帳戶中心',
  },
  home: {
    title: '找不到頁面',
    description: '此頁面不可用。',
  },
  verification: {
    title: '安全驗證',
    description: '為保障帳戶安全，請確認是你本人。請選擇用於驗證身份的方法。',
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
  },
  verification_method: {
    password: {
      name: '密碼',
      description: '驗證你的密碼',
    },
    email: {
      name: '電郵驗證碼',
      description: '發送驗證碼到你的電郵',
    },
    phone: {
      name: '電話驗證碼',
      description: '發送驗證碼到你的電話號碼',
    },
  },
  email_verification: {
    title: '驗證你的電郵',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
    description: '驗證碼已發送至你的電郵 {{email}}。輸入驗證碼以繼續。',
    resend: '重新傳送驗證碼',
    resend_countdown: '還未收到？{{seconds}} 秒後可重新傳送。',
    error_send_failed: '驗證碼傳送失敗，請稍後再試。',
    error_verify_failed: '驗證失敗，請重新輸入驗證碼。',
    error_invalid_code: '驗證碼無效或已過期。',
  },
  phone_verification: {
    title: '驗證你的電話',
    prepare_description: '為保障帳戶安全，請確認是你本人。將驗證碼發送到你的電話。',
    phone_label: '電話號碼',
    send: 'Send verification code',
    description: '驗證碼已發送至你的電話 {{phone}}。輸入驗證碼以繼續。',
    resend: '重新傳送驗證碼',
    resend_countdown: '還未收到？{{seconds}} 秒後可重新傳送。',
    error_send_failed: '驗證碼傳送失敗，請稍後再試。',
    error_verify_failed: '驗證失敗，請重新輸入驗證碼。',
    error_invalid_code: '驗證碼無效或已過期。',
  },
};

export default Object.freeze(account_center);
