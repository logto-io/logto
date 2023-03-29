const error = {
  general_required: '{{types, list(type: disjunction;)}}은/는 필수예요.',
  general_invalid: '{{types, list(type: disjunction;)}}은/는 유효하지 않아요.',
  username_required: '사용자 이름은 필수예요.',
  password_required: '비밀번호는 필수예요.',
  username_exists: '사용자 이름이 이미 존재해요.',
  username_should_not_start_with_number: '사용자 이름은 숫자로 시작하면 안 돼요.',
  username_invalid_charset: '사용자 이름은 문자, 숫자, _(밑줄 문자) 로만 이루어져야 해요.',
  invalid_email: '이메일이 유효하지 않아요.',
  invalid_phone: '휴대전화번호가 유효하지 않아요.',
  password_min_length: '비밀번호는 최소 {{min}} 자리로 이루어져야 해요.',
  passwords_do_not_match: '비밀번호가 일치하지 않아요.',
  invalid_password: '비밀번호는 최소 {{min}}자 이상이며 문자, 숫자 및 기호의 조합이어야 해요.',
  invalid_passcode: '비밀번호가 유효하지 않아요.',
  invalid_connector_auth: '인증이 유효하지 않아요.',
  invalid_connector_request: '연동 정보가 유효하지 않아요.',
  unknown: '알 수 없는 오류가 발생했어요. 잠시 후에 시도해 주세요.',
  invalid_session: '세션을 찾을 수 없어요. 다시 로그인해 주세요.',
  timeout: '요청 시간이 초과되었어요. 잠시 후에 다시 시도해 주세요.',
};

export default error;
