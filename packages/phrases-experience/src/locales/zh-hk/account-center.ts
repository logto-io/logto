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
    error_send_failed: '驗證碼傳送失敗，請稍後再試。',
    error_invalid_code: '驗證碼無效或已過期。',
    error_verify_failed: '驗證失敗，請重新輸入驗證碼。',
    verification_required: '驗證已失效，請再次驗證你的身份。',
  },
  password_verification: {
    title: '驗證密碼',
    description: '為保障帳戶安全，請輸入你的密碼完成驗證。',
    error_failed: '驗證失敗，請檢查你的密碼。',
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
  email: {
    title: '連結電郵',
    description: '連結你的電郵以登入或協助帳戶恢復。',
    verification_title: '輸入電郵驗證碼',
    verification_description: '驗證碼已發送至你的電郵 {{email_address}}。',
    success: '已成功連結主要電郵。',
    verification_required: '驗證已失效，請再次驗證你的身份。',
  },
  phone: {
    title: '連結電話',
    description: '連結你的電話號碼以登入或協助帳戶恢復。',
    verification_title: '輸入電話驗證碼',
    verification_description: '驗證碼已發送至你的電話 {{phone_number}}。',
    success: '已成功連結主要電話。',
    verification_required: '驗證已失效，請再次驗證你的身份。',
  },

  code_verification: {
    send: '發送驗證碼',
    resend: '重新傳送驗證碼',
    resend_countdown: '還未收到？{{seconds}} 秒後可重新傳送。',
  },

  email_verification: {
    title: '驗證你的電郵',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: '電郵地址',
    send: '發送驗證碼',
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
    send: '發送驗證碼',
    description: '驗證碼已發送至你的電話 {{phone}}。輸入驗證碼以繼續。',
    resend: '重新傳送驗證碼',
    resend_countdown: '還未收到？{{seconds}} 秒後可重新傳送。',
    error_send_failed: '驗證碼傳送失敗，請稍後再試。',
    error_verify_failed: '驗證失敗，請重新輸入驗證碼。',
    error_invalid_code: '驗證碼無效或已過期。',
  },
  update_success: {
    default: {
      title: '更新成功',
      description: '你的更改已成功儲存。',
    },
    email: {
      title: '電郵地址已更新！',
      description: '你的帳戶電郵地址已成功更改。',
    },
    phone: {
      title: '電話號碼已更新！',
      description: '你的帳戶電話號碼已成功更改。',
    },
  },
};

export default Object.freeze(account_center);
