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
    identifier_description: '創建帳戶時你需要設定註冊標識。這些信息在用戶登錄時，屬於必選項。',
    sign_up_authentication: '註冊身份認證設置',
    authentication_description: '註冊時，你的用戶將要完成以下所有勾選的任務。',
    set_a_password_option: '創建密碼',
    verify_at_sign_up_option: '註冊時驗證身份',
    social_only_creation_description: '（僅對社交註冊用戶適用）',
  },
  sign_in: {
    title: '登錄',
    sign_in_identifier_and_auth: '登錄標識和身份認證設置',
    description: '用戶可以使用任何可用的選項進行登錄。拖拽選項即可調整頁面佈局。',
    add_sign_in_method: '添加登錄方式',
    password_auth: '密碼',
    verification_code_auth: '驗證碼',
    auth_swap_tip: '交換以下選項的位置即可設定它們在用戶登錄流程中出現的先後。',
    require_auth_factor: '請至少選擇一種認證方式。',
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
  },
  tip: {
    set_a_password: '啟用用戶名註冊，必須設置密碼。',
    verify_at_sign_up:
      '我們目前僅支持經過驗證的郵件地址登錄。如果沒有驗證，你的用戶信息中可能出現大量無效電子郵件地址。',
    password_auth: '因註冊設置裏你啟用了用戶名密碼標識。這個信息在用戶登錄時，屬於必選項。',
    verification_code_auth:
      '因註冊設置裏你啟用了驗證碼標識，驗證碼屬於用戶必選項。開啟密碼註冊後，你可以選擇關閉驗證碼登錄。',
    delete_sign_in_method:
      '因註冊設置裏你啟用了{{identifier}}標識。這些信息在用戶登錄時，屬於必選項。',
  },
};

export default sign_up_and_sign_in;
