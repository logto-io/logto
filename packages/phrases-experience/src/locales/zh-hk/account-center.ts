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
    resend_countdown: '還未收到？<span>{{seconds}} 秒後可重新傳送。</span>',
  },

  email_verification: {
    title: '驗證你的電郵',
    prepare_description: '為保障帳戶安全，請確認是你本人。將驗證碼發送到你的電郵。',
    email_label: '電郵地址',
    send: '發送驗證碼',
    description: '驗證碼已發送至你的電郵 {{email}}。輸入驗證碼以繼續。',
    resend: '還未收到？<a>重新傳送驗證碼</a>',
    resend_countdown: '還未收到？<span>{{seconds}} 秒後可重新傳送。</span>',
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
    resend_countdown: '還未收到？<span>{{seconds}} 秒後可重新傳送。</span>',
    error_send_failed: '驗證碼傳送失敗，請稍後再試。',
    error_verify_failed: '驗證失敗，請重新輸入驗證碼。',
    error_invalid_code: '驗證碼無效或已過期。',
  },
  mfa: {
    totp_already_added: '你已添加過身份驗證器應用程式，請先移除現有的。',
    totp_not_enabled: '身份驗證器應用程式未啟用，請聯繫管理員啟用。',
    backup_code_already_added: '你已擁有有效的備份碼，請先使用或移除它們再產生新的。',
    backup_code_not_enabled: '備份碼未啟用，請聯繫管理員啟用。',
    backup_code_requires_other_mfa: '備份碼需要先設置其他 MFA 方式。',
    passkey_not_enabled: 'Passkey 未啟用，請聯繫管理員啟用。',
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
    backup_code_deleted: {
      title: '備用碼已移除！',
      description: '你的備用碼已從帳戶中移除。',
    },
    passkey: {
      title: 'Passkey 已添加！',
      description: 'Passkey 已成功連結到你的帳戶。',
    },
    passkey_deleted: {
      title: 'Passkey 已移除！',
      description: 'Passkey 已從你的帳戶中移除。',
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
    delete_confirmation_title: '移除你的備用碼',
    delete_confirmation_description: '如果你移除這些備用碼，你將無法使用它們進行驗證。',
  },
  passkey: {
    title: 'Passkeys',
    added: '添加於：{{date}}',
    last_used: '上次使用：{{date}}',
    never_used: '從未使用',
    unnamed: '未命名的 Passkey',
    renamed: 'Passkey 已成功重新命名。',
    add_another_title: '添加另一個 Passkey',
    add_another_description:
      '使用設備生物識別、安全密鑰（例如 YubiKey）或其他可用方法註冊你的 Passkey。',
    add_passkey: '添加 Passkey',
    delete_confirmation_title: '移除 Passkey',
    delete_confirmation_description: '你確定要移除「{{name}}」嗎？你將無法再使用此 Passkey 登入。',
    rename_passkey: '重新命名 Passkey',
    rename_description: '為此 Passkey 輸入新名稱。',
  },
};

export default Object.freeze(account_center);
