const sign_up_and_sign_in = {
  identifiers_email: '郵件地址',
  identifiers_phone: '手機號碼',
  identifiers_username: '使用者名稱',
  identifiers_email_or_sms: '郵件地址或手機號碼',
  identifiers_none: '無',
  and: '與',
  or: '或',
  sign_up: {
    title: '註冊',
    sign_up_identifier: '註冊標誌',
    identifier_description: '創建新帳戶時，所有選擇的註冊標誌都是必需的。',
    sign_up_authentication: '註冊身分驗證設置',
    verification_tip: '用戶必須在註冊時通過輸入驗證碼來驗證你配置的電子郵件或手機號碼。',
    authentication_description: '在註冊時，你的使用者將必須完成所有勾選的任務。',
    set_a_password_option: '建立密碼',
    verify_at_sign_up_option: '驗證身分',
    social_only_creation_description: '（僅適用於社交註冊使用者）',
  },
  sign_in: {
    title: '登入',
    sign_in_identifier_and_auth: '登入標誌和身分驗證設置',
    description: '使用者可以使用任何可用的選項進行登入。',
    add_sign_in_method: '新增登入方式',
    add_sign_up_method: '新增註冊方式',
    password_auth: '密碼',
    verification_code_auth: '驗證碼',
    auth_swap_tip: '交換以下選項的位置即可設定它們在使用者登入流程中出現的先後順序。',
    require_auth_factor: '請至少選擇一種驗證方式。',
    forgot_password_verification_method: '忘記密碼驗證方式',
    forgot_password_description: '使用者可以使用任何可用的驗證方法重置密碼。',
    add_verification_method: '新增驗證方法',
    email_verification_code: '郵件驗證碼',
    phone_verification_code: '手機驗證碼',
  },
  social_sign_in: {
    title: '社交登入',
    social_sign_in: '社交登入',
    description: '你已設定特定的標誌。使用者在通過社交連結器註冊時可能會被要求提供一個對應的標誌。',
    add_social_connector: '新增社交連結器',
    set_up_hint: {
      not_in_list: '沒有你想要的連結器？',
      set_up_more: '立即設定',
      go_to: '參考其他的社交連結器。',
    },
    automatic_account_linking: '自動帳號連結',
    automatic_account_linking_label:
      '當啟用時，如果使用者以新社交身份登入系統，且系統中有且僅有一個現有帳戶具有相同的標識符（如電子郵件），Logto 將自動連結該帳戶與社交身份，而不是提示使用者進行帳戶連結。',
  },
  tip: {
    set_a_password: '啟用使用者名稱註冊，必須設定密碼。',
    verify_at_sign_up:
      '目前我們僅支持經過驗證的郵件地址登入。如果沒有驗證，你的使用者信息中可能出現大量無效的電子郵件地址。',
    password_auth: '因註冊設置啟用了使用者名稱密碼標誌。在使用者登入時，這個資訊是必填的。',
    verification_code_auth:
      '因註冊設置啟用了驗證碼標誌，驗證碼屬於使用者必選項，啟用密碼註冊後，你可以選擇關閉驗證碼登入。',
    email_mfa_enabled:
      '郵件驗證碼已啟用作為多因素驗證 (MFA)，因此不能重用作為主要登入方式以確保安全。',
    phone_mfa_enabled:
      '手機驗證碼已啟用作為多因素驗證 (MFA)，因此不能重用作為主要登入方式以確保安全。',
    delete_sign_in_method: '因註冊設置啟用了{{identifier}}標誌。在使用者登入時，這些資訊是必填的。',
    password_disabled_notification:
      '用於使用者名稱註冊的"設置密碼"選項已被禁用，可能會阻止使用者登入。確認後繼續保存。',
  },
  advanced_options: {
    title: '進階選項',
    enable_single_sign_on: '啟用企業單一登入 (SSO)',
    enable_single_sign_on_description: '啟用使用者透過其企業身份以單一登入的方式登入應用程式。',
    single_sign_on_hint: {
      prefix: '前往 ',
      link: '"Enterprise SSO"',
      suffix: '區段以設定更多企業連結器。',
    },
    enable_user_registration: '啟用使用者註冊',
    enable_user_registration_description:
      '啟用或禁止使用者註冊。禁用後，管理員仍然可以新增使用者，但無法透過登入界面建立帳戶。',
    unknown_session_redirect_url: '未知會話重定向 URL',
    unknown_session_redirect_url_tip:
      '有時，Logto 可能無法識別使用者在登入頁面的會話，例如當會話過期或使用者收藏或分享登入連結時。預設情況下，會出現 "unknown session" 404 錯誤。為了增強使用者體驗，請設置一個回退 URL，將使用者重定向回你的應用程式並重新開始身分驗證。',
  },
};

export default Object.freeze(sign_up_and_sign_in);
