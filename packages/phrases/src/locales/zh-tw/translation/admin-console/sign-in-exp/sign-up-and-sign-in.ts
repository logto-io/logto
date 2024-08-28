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
    identifier_description: '在建立帳戶時，您需要設定註冊標誌。在使用者登錄時，這些資訊是必填的。',
    sign_up_authentication: '註冊身分驗證設置',
    authentication_description: '在註冊時，您的使用者將必須完成所有勾選的任務。',
    set_a_password_option: '建立密碼',
    verify_at_sign_up_option: '驗證身分',
    social_only_creation_description: '（僅適用於社交註冊使用者）',
  },
  sign_in: {
    title: '登入',
    sign_in_identifier_and_auth: '登入標誌和身分驗證設置',
    description: '使用者可以使用任何可用的選項進行登入。拖曳選項即可調整頁面佈局。',
    add_sign_in_method: '新增登入方式',
    password_auth: '密碼',
    verification_code_auth: '驗證碼',
    auth_swap_tip: '交換以下選項的位置即可設定它們在使用者登入流程中出現的先後順序。',
    require_auth_factor: '請至少選擇一種驗證方式。',
  },
  social_sign_in: {
    title: '社交登入',
    social_sign_in: '社交登入',
    description: '您已設定特定的標誌。使用者在通過社交連結器註冊時可能會被要求提供一個對應的標誌。',
    add_social_connector: '新增社交連結器',
    set_up_hint: {
      not_in_list: '沒有你想要的連結器？',
      set_up_more: '立即設定',
      go_to: '參考其他的社交連結器。',
    },
  },
  tip: {
    set_a_password: '啟用使用者名稱註冊，必須設定密碼。',
    verify_at_sign_up:
      '目前我們僅支持經過驗證的郵件地址登入。如果沒有驗證，你的使用者信息中可能出現大量無效的電子郵件地址。',
    password_auth: '因註冊設置啟用了使用者名稱密碼標誌。在使用者登入時，這個資訊是必填的。',
    verification_code_auth:
      '因註冊設置啟用了驗證碼標誌，驗證碼屬於使用者必選項，啟用密碼註冊後，你可以選擇關閉驗證碼登入。',
    delete_sign_in_method: '因註冊設置啟用了{{identifier}}標誌。在使用者登入時，這些資訊是必填的。',
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
  },
};

export default Object.freeze(sign_up_and_sign_in);
