import password_rejected from './password-rejected.js';

const error = {
  general_required: '{{types, list(type: disjunction;)}}必填',
  general_invalid: '無效的{{types, list(type: disjunction;)}}',
  username_required: '用戶名必填',
  password_required: '密碼必填',
  username_exists: '用戶名已存在',
  username_should_not_start_with_number: '用戶名不能以數字開頭',
  username_invalid_charset: '用戶名只能包含英文字母、數字或下劃線。',
  invalid_email: '無效的電子郵件',
  invalid_phone: '無效的手機號碼',
  passwords_do_not_match: '兩次輸入的密碼不一致，請重試。',
  invalid_passcode: '無效的驗證碼',
  invalid_connector_auth: '登錄失敗',
  invalid_connector_request: '無效的登錄請求',
  unknown: '未知錯誤，請稍後重試。',
  invalid_session: '未找到會話，請返回並重新登錄。',
  timeout: '請求超時，請稍後重試。',
  password_rejected,
  sso_not_enabled: '此電子郵件帳戶未啟用單一登錄。',
};

export default Object.freeze(error);
