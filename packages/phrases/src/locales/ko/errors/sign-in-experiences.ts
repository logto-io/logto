const sign_in_experiences = {
  empty_content_url_of_terms_of_use:
    '이용 약관 URL이 비어 있어요. 이용 약관이 활성화되어 있다면, 이용 약관 URL를 설정해 주세요.',
  empty_social_connectors: '연동된 소셜이 없어요. 소셜 로그인을 사용한다면, 연동해 주세요.',
  enabled_connector_not_found: '활성된 {{type}} 연동을 찾을 수 없어요.',
  not_one_and_only_one_primary_sign_in_method:
    '반드시 하나의 메인 로그인 방법이 설정되어야 해요. 입력된 값을 확인해주세요.',
  username_requires_password: '회원가입 식별자에 대한 비밀번호 설정을 사용하도록 설정해야 해요.',
  passwordless_requires_verify:
    '이메일/휴대전화번호 가입 식별자에 대해 확인을 사용하도록 설정해야 해요.',
  miss_sign_up_identifier_in_sign_in: '로그인 방법에는 회원가입 ID가 포함되어야 해요.',
  password_sign_in_must_be_enabled:
    '회원가입 시 비밀번호를 설정해야 할 경우 비밀번호 로그인을 사용하도록 설정해야 해요.',
  code_sign_in_must_be_enabled:
    '비밀번호를 설정할 필요가 없을 때는 인증 코드 로그인을 활성화해야 해요.',
  unsupported_default_language: '{{language}} 언어는 아직 지원하지 않아요.',
  at_least_one_authentication_factor: '최소한 하나의 인증 방법을 선택해야 해요.',
  backup_code_cannot_be_enabled_alone: '백업 코드는 단독으로 활성화할 수 없습니다.',
  duplicated_mfa_factors: '중복된 MFA 인증 요소입니다.',
  email_verification_code_cannot_be_used_for_mfa:
    '이메일 확인 코드가 로그인에 대해 이메일 확인이 활성화된 경우 MFA에 사용할 수 없습니다.',
  phone_verification_code_cannot_be_used_for_mfa:
    'SMS 확인 코드가 로그인에 대해 SMS 확인이 활성화된 경우 MFA에 사용할 수 없습니다.',
  email_verification_code_cannot_be_used_for_sign_in:
    '이메일 확인 코드는 MFA 에 활성화된 경우 로그인에 사용할 수 없습니다.',
  phone_verification_code_cannot_be_used_for_sign_in:
    'SMS 확인 코드는 MFA 에 활성화된 경우 로그인에 사용할 수 없습니다.',
  duplicated_sign_up_identifiers: '중복된 회원가입 식별자가 감지되었습니다.',
  missing_sign_up_identifiers: '기본 회원가입 식별자는 비워 둘 수 없습니다.',
  invalid_custom_email_blocklist_format:
    '잘못된 사용자 정의 이메일 차단 목록 항목: {{items, list(type:conjunction)}}. 각 항목은 유효한 이메일 주소 또는 이메일 도메인이어야 합니다. 예: foo@example.com 또는 @example.com.',
  forgot_password_method_requires_connector:
    '비밀번호 찾기 방법은 해당 {{method}} 커넥터를 구성해야 합니다.',
};

export default Object.freeze(sign_in_experiences);
