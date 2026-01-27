const account_center = {
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
    try_another_method: '嘗試其他驗證方式',
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
    title: '連結電話號碼',
    description: '連結你的電話號碼以登入或協助帳戶恢復。',
    verification_title: '輸入短訊驗證碼',
    verification_description: '驗證碼已發送至你的電話 {{phone_number}}。',
    success: '已成功連結主要電話。',
    verification_required: '驗證已失效，請再次驗證你的身份。',
  },
  username: {
    title: '設定用戶名',
    description: '用戶名只能包含字母、數字和底線。',
    success: '用戶名已成功更新。',
  },
  password: {
    title: '設定密碼',
    description: '建立新密碼以保障你的帳戶安全。',
    success: '密碼已成功更新。',
  },

  code_verification: {
    send: '發送驗證碼',
    resend: '還未收到？<a>重新傳送驗證碼</a>',
    resend_countdown: '還未收到？{{seconds}} 秒後可重新傳送。',
  },

  email_verification: {
    title: '驗證你的電郵',
    prepare_description: '為保障帳戶安全，請確認是你本人。將驗證碼發送到你的電郵。',
    email_label: '電郵地址',
    send: '發送驗證碼',
    description: '驗證碼已發送至你的電郵 {{email}}。輸入驗證碼以繼續。',
    resend: '還未收到？<a>重新傳送驗證碼</a>',
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
    resend: '還未收到？<a>重新傳送驗證碼</a>',
    resend_countdown: '還未收到？{{seconds}} 秒後可重新傳送。',
    error_send_failed: '驗證碼傳送失敗，請稍後再試。',
    error_verify_failed: '驗證失敗，請重新輸入驗證碼。',
    error_invalid_code: '驗證碼無效或已過期。',
  },
  mfa: {
    totp_already_added: '你已添加過身份驗證器應用程式，請先移除現有的。',
    totp_not_enabled: '身份驗證器應用程式 OTP 未啟用。請聯繫管理員尋求幫助。',
    backup_code_already_added: '你已擁有有效的備份碼，請先使用或移除它們再產生新的。',
    backup_code_not_enabled: '備份碼未啟用。請聯繫管理員尋求幫助。',
    backup_code_requires_other_mfa: '備份碼需要先設置其他 MFA 方式。',
    passkey_not_enabled: '通行密鑰未啟用。請聯繫管理員尋求幫助。',
    passkey_already_registered: '此通行密鑰已綁定到你的帳戶，請使用其他認證器。',
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
    username: {
      title: '用戶名已更新！',
      description: '你的帳戶用戶名已成功更改。',
    },

    password: {
      title: '密碼已更新！',
      description: '你的帳戶密碼已成功更改。',
    },
    totp: {
      title: '身份驗證器應用程式已添加！',
      description: '身份驗證器應用程式已成功連結到你的帳戶。',
    },
    backup_code: {
      title: '備用碼已產生！',
      description: '您的備用碼已儲存。請將它們保存在安全的地方。',
    },
    passkey: {
      title: '通行密鑰已添加！',
      description: '通行密鑰已成功連結到你的帳戶。',
    },
    social: {
      title: '社交帳號已連結！',
      description: '你的社交帳號已成功連結。',
    },
  },
  backup_code: {
    title: '備用碼',
    description:
      '如果您在兩步驗證時遇到問題，可以使用這些備用碼中的一個來存取您的帳戶。每個代碼只能使用一次。',
    copy_hint: '請務必複製並保存在安全的地方。',
    generate_new_title: '產生新的備用碼',
    generate_new: '產生新的備用碼',
  },
  passkey: {
    title: '通行密鑰',
    added: '添加於：{{date}}',
    last_used: '上次使用：{{date}}',
    never_used: '從未使用',
    unnamed: '未命名的通行密鑰',
    renamed: '通行密鑰已成功重新命名。',
    deleted: '通行密鑰已移除。',
    add_another_title: '添加另一個通行密鑰',
    add_another_description:
      '使用設備生物識別、安全密鑰（例如 YubiKey）或其他可用方法註冊你的通行密鑰。',
    add_passkey: '添加通行密鑰',
    delete_confirmation_title: '移除你的通行密鑰',
    delete_confirmation_description: '如果你移除此通行密鑰，你將無法使用它進行驗證。',
    rename_passkey: '重新命名通行密鑰',
    rename_description: '為此通行密鑰輸入新名稱。',
    name_this_passkey: '為此裝置通行密鑰命名',
    name_passkey_description:
      '你已成功驗證此裝置用於兩步驗證。自訂名稱以便在擁有多個密鑰時進行識別。',
    name_input_label: '名稱',
  },
};

export default Object.freeze(account_center);
