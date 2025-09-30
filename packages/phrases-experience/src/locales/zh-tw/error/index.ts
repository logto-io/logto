import password_rejected from './password-rejected.js';

const error = {
  general_required: '{{types, list(type: disjunction;)}}必填',
  general_invalid: '無效的{{types, list(type: disjunction;)}}',
  invalid_min_max_input: '輸入的值應該在 {{minValue}} 到 {{maxValue}} 之間',
  invalid_min_max_length: '輸入值的長度應該在 {{minLength}} 到 {{maxLength}} 之間',
  username_required: '使用者名稱必填',
  password_required: '密碼必填',
  username_exists: '使用者名稱已存在',
  username_should_not_start_with_number: '使用者名稱不能以數字開頭',
  username_invalid_charset: '使用者名稱只能包含英文字母、數字或下劃線。',
  invalid_email: '無效的郵箱',
  invalid_phone: '無效的手機號',
  passwords_do_not_match: '兩次輸入的密碼不一致，請重試。',
  invalid_passcode: '無效的驗證碼。',
  invalid_connector_auth: '登錄失敗',
  invalid_connector_request: '無效的登錄請求',
  unknown: '未知錯誤，請稍後重試。',
  invalid_session: '未找到會話，請返回並重新登錄。',
  timeout: '請求超時，請稍後重試。',
  password_rejected,
  sso_not_enabled: '此郵箱帳戶未啟用單一登錄。',
  invalid_link: '無效的鏈接',
  invalid_link_description: '你的一次性令牌可能已過期或不再有效。',
  captcha_verification_failed: '驗證碼驗證失敗。',
  terms_acceptance_required: '需要同意條款',
  terms_acceptance_required_description: '必須同意條款後才能繼續，請重試。',
  something_went_wrong: '出了些問題。',
};

export default Object.freeze(error);
