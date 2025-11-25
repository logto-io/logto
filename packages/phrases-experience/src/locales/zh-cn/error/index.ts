import password_rejected from './password-rejected.js';

const error = {
  general_required: '{{types, list(type: disjunction;)}}必填',
  general_invalid: '无效的{{types, list(type: disjunction;)}}',
  invalid_min_max_input: '输入值应在 {{minValue}} 和 {{maxValue}} 之间',
  invalid_min_max_length: '输入值的长度应在 {{minLength}} 和 {{maxLength}} 之间',
  username_required: '用户名必填',
  password_required: '密码必填',
  username_exists: '用户名已存在',
  username_should_not_start_with_number: '用户名不能以数字开头',
  username_invalid_charset: '用户名只能包含英文字母、数字或下划线。',
  invalid_email: '无效的邮箱',
  invalid_phone: '无效的手机号',
  passwords_do_not_match: '两次输入的密码不一致，请重试。',
  invalid_passcode: '无效的验证码。',
  invalid_connector_auth: '登录失败',
  invalid_connector_request: '无效的登录请求',
  unknown: '未知错误，请稍后重试。',
  invalid_session: '未找到会话，请返回并重新登录。',
  timeout: '请求超时，请稍后重试。',
  password_rejected,
  sso_not_enabled: '此邮箱账户未启用单点登录。',
  invalid_link: '无效的链接',
  invalid_link_description: '你的一次性令牌可能已过期或不再有效。',
  captcha_verification_failed: '验证码验证失败。',
  terms_acceptance_required: '需要同意条款',
  terms_acceptance_required_description: '必须同意条款后才能继续，请重试。',
  something_went_wrong: '出现错误。',
  feature_not_enabled: '此功能未启用。',
};

export default Object.freeze(error);
