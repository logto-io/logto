const sign_up_and_sign_in = {
  identifiers_email: '郵件地址',
  identifiers_phone: '手機號碼',
  identifiers_username: '用戶名',
  identifiers_email_or_sms: '郵件地址或手機號碼',
  identifiers_none: '無',
  and: '與',
  or: '或',
  sign_up: {
    title: '註冊',
    sign_up_identifier: '註冊標識',
    identifier_description: '創建新帳戶時，所有選擇的註冊標識都是必需的。',
    sign_up_authentication: '註冊身份認證設置',
    verification_tip: '用戶必須在註冊時通過輸入驗證碼來驗證你配置的電子郵件或手機號碼。',
    authentication_description: '註冊時，你的用戶將要完成以下所有勾選的任務。',
    set_a_password_option: '創建密碼',
    verify_at_sign_up_option: '註冊時驗證身份',
    social_only_creation_description: '（僅對社交註冊用戶適用）',
  },
  sign_in: {
    title: '登錄',
    sign_in_identifier_and_auth: '登錄標識和身份認證設置',
    description: '用戶可以使用任何可用的選項進行登錄。',
    add_sign_in_method: '添加登錄方式',
    add_sign_up_method: '添加註冊方式',
    password_auth: '密碼',
    verification_code_auth: '驗證碼',
    auth_swap_tip: '交換以下選項的位置即可設定它們在用戶登錄流程中出現的先後。',
    require_auth_factor: '請至少選擇一種認證方式。',
    forgot_password_verification_method: '忘記密碼驗證方式',
    forgot_password_description: '用戶可以使用任何可用的驗證方式重置他們的密碼。',
    add_verification_method: '添加驗證方式',
    email_verification_code: '郵件驗證碼',
    phone_verification_code: '電話驗證碼',
  },
  social_sign_in: {
    title: '社交登錄',
    social_sign_in: '社交登錄',
    description: '你已設定特定的標識。用戶在通過社交連接器註冊時可能會被要求提供一個對應的標識。',
    add_social_connector: '添加社交連接器',
    set_up_hint: {
      not_in_list: '沒有你想要的連接器？',
      set_up_more: '立即設置',
      go_to: '其他社交連接器。',
    },
    automatic_account_linking: '自動帳戶連結',
    automatic_account_linking_label:
      '當啟用時，如果用戶以系統中新身份登錄，但存在與之相同標識（如電郵地址）的唯一帳戶，Logto 將自動連結該帳戶與社交身份，而不要求用戶進行帳戶連結。',
  },
  tip: {
    set_a_password: '啟用用戶名註冊，必須設置密碼。',
    verify_at_sign_up:
      '我們目前僅支持經過驗證的郵件地址登錄。如果沒有驗證，你的用戶信息中可能出現大量無效電子郵件地址。',
    password_auth: '因註冊設置裏你啟用了用戶名密碼標識。這個資訊在用戶登錄時，屬於必選項。',
    verification_code_auth:
      '因註冊設置裏你啟用了驗證碼標識，驗證碼屬於用戶必選項。開啟密碼註冊後，你可以選擇關閉驗證碼登錄。',
    email_mfa_enabled: '郵件驗證碼已經啟用為 MFA，因安全起見，無法重複用作主要登錄方式。',
    phone_mfa_enabled: '電話驗證碼已經啟用為 MFA，因安全起見，無法重複用作主要登錄方式。',
    delete_sign_in_method:
      '因註冊設置裏你啟用了{{identifier}}標識。這些資訊在用戶登錄時，屬於必選項。',
    password_disabled_notification:
      '用戶名註冊的“創建密碼”選項已禁用，這可能會阻止用戶登錄。確認以繼續保存。',
  },
  advanced_options: {
    title: '進階選項',
    enable_single_sign_on: '啟用企業單一登錄 (SSO)',
    enable_single_sign_on_description: '啟用用戶使用企業身份進行應用程式的單一登錄。',
    single_sign_on_hint: {
      prefix: '前往',
      link: '“企業 SSO”',
      suffix: '部分設置更多企業連接器。',
    },
    enable_user_registration: '啟用用戶註冊',
    enable_user_registration_description:
      '啟用或禁止用戶註冊。禁用後，管理控制臺仍然可以添加用戶，但用戶無法通過登錄界面建立帳戶。',
    unknown_session_redirect_url: '未知 Session 重新導向 URL',
    unknown_session_redirect_url_tip:
      '有時，Logto 可能無法識別用戶在登錄頁面的 Session，比如 Session 過期或用戶書籤或分享錄入連結時。預設顯示"未知 Session" 404 錯誤。為增強用戶體驗，設定一個回退 URL，將用戶重定向回應用程式並重啟身份認證。',
  },
};

export default Object.freeze(sign_up_and_sign_in);
