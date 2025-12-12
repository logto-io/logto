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
    verification_required: '驗證已失效，請再次驗證您的身分。',
    try_another_method: '嘗試其他驗證方式',
  },
  password_verification: {
    title: '驗證密碼',
    description: '為保護帳戶安全，請輸入您的密碼完成驗證。',
    error_failed: '驗證失敗，請檢查您的密碼。',
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
    success: '已成功連結主要電子郵件。',
    verification_required: '驗證已失效，請再次驗證您的身分。',
  },
  phone: {
    title: '連結電話',
    description: '連結你的電話號碼以登入或協助帳戶復原。',
    verification_title: '輸入電話驗證碼',
    verification_description: '驗證碼已傳送至你的電話 {{phone_number}}。',
    success: '已成功連結主要電話。',
    verification_required: '驗證已失效，請再次驗證您的身分。',
  },
  username: {
    title: '設定使用者名稱',
    description: '使用者名稱只能包含字母、數字和底線。',
    success: '使用者名稱已成功更新。',
  },
  password: {
    title: '設定密碼',
    description: '建立新密碼以保障您的帳戶安全。',
    success: '密碼已成功更新。',
  },

  code_verification: {
    send: '傳送驗證碼',
    resend: '重新傳送驗證碼',
    resend_countdown: '尚未收到？{{seconds}} 秒後可重新傳送。',
  },

  email_verification: {
    title: '驗證您的電子郵件',
    prepare_description: '為保護帳戶安全，請確認是您本人。傳送驗證碼到您的電子郵件。',
    email_label: '電子郵件地址',
    send: '傳送驗證碼',
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
    send: '傳送驗證碼',
    description: '驗證碼已傳送至您的電話 {{phone}}。請輸入驗證碼以繼續。',
    resend: '重新傳送驗證碼',
    resend_countdown: '尚未收到？{{seconds}} 秒後可重新傳送。',
    error_send_failed: '驗證碼傳送失敗，請稍後再試。',
    error_verify_failed: '驗證失敗，請重新輸入驗證碼。',
    error_invalid_code: '驗證碼無效或已過期。',
  },
  mfa: {
    totp_already_added: '您已新增過身份驗證器應用程式，請先移除現有的。',
    totp_not_enabled: '身份驗證器應用程式未啟用，請聯繫管理員啟用。',
  },
  update_success: {
    default: {
      title: '更新成功',
      description: '您的變更已成功儲存。',
    },
    email: {
      title: '電子郵件地址已更新！',
      description: '您的帳戶電子郵件地址已成功變更。',
    },
    phone: {
      title: '電話號碼已更新！',
      description: '您的帳戶電話號碼已成功變更。',
    },
    username: {
      title: '使用者名稱已更新！',
      description: '您的帳戶使用者名稱已成功變更。',
    },

    password: {
      title: '密碼已更新！',
      description: '您的帳戶密碼已成功變更。',
    },
    totp: {
      title: '身份驗證器應用程式已新增！',
      description: '身份驗證器應用程式已成功連結至您的帳戶。',
    },
  },
};

export default Object.freeze(account_center);
