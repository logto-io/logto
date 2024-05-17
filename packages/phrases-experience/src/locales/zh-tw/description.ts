const description = {
  email: '郵箱',
  phone_number: '手機號碼',
  username: '用戶名',
  reminder: '提示',
  not_found: '404 頁面不存在',
  agree_with_terms: '我已閱讀並同意 ',
  agree_with_terms_modal: '請先同意<link></link>以繼續',
  terms_of_use: '使用條款',
  sign_in: '登錄',
  privacy_policy: '隱私政策',
  create_account: '創建帳號',
  or: '或',
  and: '和',
  enter_passcode: '驗證碼已經發送至你的{{address}} {{target}}',
  passcode_sent: '驗證碼已經發送',
  resend_after_seconds: '在 <span>{{seconds}}</span> 秒後重新發送',
  resend_passcode: '重新發送驗證碼',
  create_account_id_exists: '{{type}} 為 {{value}} 的帳號已存在，你要登錄嗎？',
  link_account_id_exists: ' {{type}} 為 {{value}} 的帳號已註冊，你要綁定至這個帳號嗎？',
  sign_in_id_does_not_exist: '{{type}} 為 {{value}} 的帳號不存在，你要創建一個新帳號嗎？',
  sign_in_id_does_not_exist_alert: '{{type}} 為 {{value}} 的帳號不存在。',
  create_account_id_exists_alert: '{{type}} {{value}} 已綁定其他帳號。請嘗試其他{{type}}。',
  social_identity_exist: ' {{type}} {{value}} 已綁定其他帳號。請嘗試其他{{type}}',
  bind_account_title: '綁定或註冊帳號',
  social_create_account: '你可以註冊一個新的帳號。',
  social_link_email: '你可以綁定其他郵箱',
  social_link_phone: '你可以綁定其他手機號碼',
  social_link_email_or_phone: '你可以綁定其他郵箱或手機號碼',
  social_bind_with_existing: '找到了一個已註冊的帳號，你可以直接綁定。',
  reset_password: '忘記密碼',
  reset_password_description: '輸入{{types, list(type: disjunction;)}}，獲取驗證碼以重設密碼。',
  new_password: '新密碼',
  set_password: '設置密碼',
  password_changed: '已重置密碼！',
  no_account: '還沒有帳號？',
  have_account: ' 已有帳號？',
  enter_password: '輸入密碼',
  enter_password_for: '輸入{{method}} {{value}}對應的密碼進行登錄',
  enter_username: '設置用戶名',
  enter_username_description: '用戶名可以用來進行登錄。用戶名僅可以包含字母、數字和下劃線。',
  link_email: '綁定郵箱',
  link_phone: '綁定手機',
  link_email_or_phone: '綁定郵箱或手機號碼',
  link_email_description: '綁定郵箱以保障你的帳號安全',
  link_phone_description: '綁定手機號碼以保障你的帳號安全',
  link_email_or_phone_description: '綁定郵箱或手機號碼以保障你的帳號安全',
  continue_with_more_information: '為保障你的帳號安全，需要你補充以下信息。',
  create_your_account: '註冊你的帳號',
  sign_in_to_your_account: '登錄你的帳號',
  no_region_code_found: '沒有找到區域碼',
  verify_email: '驗證你的郵箱',
  verify_phone: '驗證你的手機號碼',
  password_requirements: '密碼{{items, list}}。',
  password_requirement: {
    length_one: '長度至少為 {{count}} 個字符',
    length_other: '長度至少為 {{count}} 個字符',
    character_types_one: '需包含 {{count}} 類型的大寫字母、小寫字母、數字和符號',
    character_types_other: '需包含 {{count}} 類型的大寫字母、小寫字母、數字和符號',
  },
  use: '使用',
  single_sign_on_email_form: '輸入你的企業電子郵件地址',
  single_sign_on_connectors_list:
    '您的企業已為電子郵件帳戶{{email}}啟用單一登入。您可以繼續使用以下的SSO供應商登入。',
  single_sign_on_enabled: '該帳戶已啟用單一登入',
  /** UNTRANSLATED */
  authorize_title: 'Authorize {{name}}',
  /** UNTRANSLATED */
  request_permission: '{{name}} is requesting access to:',
  /** UNTRANSLATED */
  grant_organization_access: 'Grant the organization access:',
  /** UNTRANSLATED */
  authorize_personal_data_usage: 'Authorize the use of your personal data:',
  /** UNTRANSLATED */
  authorize_organization_access: 'Authorize access to the specific organization:',
  /** UNTRANSLATED */
  user_scopes: 'Personal user data',
  /** UNTRANSLATED */
  organization_scopes: 'Organization access',
  /** UNTRANSLATED */
  authorize_agreement: `By authorizing the access, you agree to the {{name}}'s <link></link>.`,
  /** UNTRANSLATED */
  authorize_agreement_with_redirect: `By authorizing the access, you agree to the {{name}}'s <link></link>, and will be redirected to {{uri}}.`,
  /** UNTRANSLATED */
  not_you: 'Not you?',
  /** UNTRANSLATED */
  user_id: 'User ID: {{id}}',
  /** UNTRANSLATED */
  redirect_to: 'You will be redirected to {{name}}.',
};

export default Object.freeze(description);
