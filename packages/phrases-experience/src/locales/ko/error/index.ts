import password_rejected from './password-rejected.js';

const error = {
  general_required: '{{types, list(type: disjunction;)}}은/는 필수예요.',
  general_invalid: '{{types, list(type: disjunction;)}}은/는 유효하지 않아요.',
  invalid_min_max_input: '입력값은 {{minValue}}에서 {{maxValue}} 사이여야 해요',
  invalid_min_max_length: '입력값의 길이는 {{minLength}}에서 {{maxLength}} 사이여야 해요',
  username_required: '사용자 이름은 필수예요.',
  password_required: '비밀번호는 필수예요.',
  username_exists: '사용자 이름이 이미 존재해요.',
  username_should_not_start_with_number: '사용자 이름은 숫자로 시작하면 안 돼요.',
  username_invalid_charset: '사용자 이름은 문자, 숫자, _(밑줄 문자) 로만 이루어져야 해요.',
  invalid_email: '이메일이 유효하지 않아요.',
  invalid_phone: '휴대전화번호가 유효하지 않아요.',
  passwords_do_not_match: '비밀번호가 일치하지 않아요.',
  invalid_passcode: '비밀번호가 유효하지 않아요.',
  invalid_connector_auth: '인증이 유효하지 않아요.',
  invalid_connector_request: '연동 정보가 유효하지 않아요.',
  unknown: '알 수 없는 오류가 발생했어요. 잠시 후에 시도해 주세요.',
  invalid_session: '세션을 찾을 수 없어요. 다시 로그인해 주세요.',
  timeout: '요청 시간이 초과되었어요. 잠시 후에 다시 시도해 주세요.',
  password_rejected,
  sso_not_enabled: '이 이메일 계정에 대해 단일 로그인이 활성화되지 않았어요.',
  invalid_link: '유효하지 않은 링크',
  invalid_link_description: '일회성 토큰이 만료되었거나 더 이상 유효하지 않을 수 있어요.',
  captcha_verification_failed: '캡차 검증에 실패했어요.',
  terms_acceptance_required: '약관 동의가 필요해요',
  terms_acceptance_required_description: '계속하려면 약관에 동의해야 해요. 다시 시도해 주세요.',
  something_went_wrong: '문제가 발생했어요.',
  feature_not_enabled: '이 기능은 활성화되어 있지 않습니다.',
};

export default Object.freeze(error);
