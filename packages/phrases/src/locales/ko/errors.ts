const errors = {
  request: {
    invalid_input: 'Input is invalid. {{details}}', // UNTRANSLATED
  },
  auth: {
    authorization_header_missing: '인증 헤더가 존재하지 않아요.',
    authorization_token_type_not_supported: '해당 인증 방법을 지원하지 않아요.',
    unauthorized: '인증되지 않았어요. 로그인 정보와 범위를 확인해주세요.',
    forbidden: '접근이 금지되었어요. 로그인 권한와 직책을 확인해주세요.',
    expected_role_not_found:
      'Expected role not found. Please check your user roles and permissions.',
    jwt_sub_missing: 'JWT에서 `sub`를 찾을 수 없어요.',
    require_re_authentication: 'Re-authentication is required to perform a protected action.', // UNTRANSLATED
  },
  guard: {
    invalid_input: '{{type}} 요청 타입은 유효하지 않아요.',
    invalid_pagination: '요청의 Pagination 값이 유효하지 않아요.',
  },
  oidc: {
    aborted: 'End 사용자가 상호 작용을 중단했어요.',
    invalid_scope: '{{scope}} 범위를 지원하지 않아요.',
    invalid_scope_plural: '{{scopes}} 범위들을 지원하지 않아요.',
    invalid_token: '유요하지 않은 토큰이 제공되었어요.',
    invalid_client_metadata: '유효하지 않은 클라이언트 메타데이터가 제공되었어요.',
    insufficient_scope: '요청된 {{scopes}} 범위에서 Access 토큰을 찾을 수 없어요.',
    invalid_request: '요청이 유효하지 않아요.',
    invalid_grant: '승인 요청이 유효하지 않아요.',
    invalid_redirect_uri: '`redirect_uri`가 등록된 클라이언트의 `redirect_uris`와 일치하지 않아요.',
    access_denied: '접근이 금지되었어요.',
    invalid_target: '유요하지 않은 리소스 표시에요..',
    unsupported_grant_type: '지원하지 않는 `grant_type` 요청이에요.',
    unsupported_response_mode: '지원하지 않는 `response_mode` 요청이에요.',
    unsupported_response_type: '지원하지 않은 `response_type` 요청이에요.',
    provider_error: 'OIDC 내부 오류: {{message}}.',
  },
  user: {
    username_already_in_use: 'This username is already in use.', // UNTRANSLATED
    email_already_in_use: 'This email is associated with an existing account.', // UNTRANSLATED
    phone_already_in_use: 'This phone number is associated with an existing account.', // UNTRANSLATED
    invalid_email: '유효하지 않은 이메일이예요.',
    invalid_phone: '유효하지 않은 휴대전화번호에요',
    email_not_exist: '이메일 주소가 아직 등록되지 않았어요.',
    phone_not_exist: '휴대전화번호가 아직 등록되지 않았어요.',
    identity_not_exist: '소셜 계정이 아직 등록되지 않았어요.',
    identity_already_in_use: '소셜 계정이 이미 등록되있어요.',
    invalid_role_names: '직책 명({{roleNames}})이 유효하지 않아요.',
    cannot_delete_self: 'You cannot delete yourself.', // UNTRANSLATED
    sign_up_method_not_enabled: 'This sign-up method is not enabled.', // UNTRANSLATED
    sign_in_method_not_enabled: 'This sign-in method is not enabled.', // UNTRANSLATED
    same_password: 'New password cannot be the same as your old password.', // UNTRANSLATED
    password_required_in_profile: 'You need to set a password before signing-in.', // UNTRANSLATED
    new_password_required_in_profile: 'You need to set a new password.', // UNTRANSLATED
    password_exists_in_profile: 'Password already exists in your profile.', // UNTRANSLATED
    username_required_in_profile: 'You need to set a username before signing-in.', // UNTRANSLATED
    username_exists_in_profile: 'Username already exists in your profile.', // UNTRANSLATED
    email_required_in_profile: 'You need to add an email address before signing-in.', // UNTRANSLATED
    email_exists_in_profile: 'Your profile has already associated with an email address.', // UNTRANSLATED
    phone_required_in_profile: 'You need to add a phone number before signing-in.', // UNTRANSLATED
    phone_exists_in_profile: 'Your profile has already associated with a phone number.', // UNTRANSLATED
    email_or_phone_required_in_profile:
      'You need to add an email address or phone number before signing-in.', // UNTRANSLATED
    suspended: 'This account is suspended.', // UNTRANSLATED
    user_not_exist: 'User with {{ identifier }} does not exist.', // UNTRANSLATED,
    missing_profile: 'You need to provide additional info before signing-in.', // UNTRANSLATED
  },
  password: {
    unsupported_encryption_method: '{{name}} 암호화 방법을 지원하지 않아요.',
    pepper_not_found: '비밀번호 Pepper를 찾을 수 없어요. Core 환경설정을 확인해주세요.',
  },
  session: {
    not_found: '세션을 찾을 수 없어요. 다시 로그인해주세요.',
    invalid_credentials: '유효하지 않은 로그인 정보예요. 입력된 값을 다시 확인해주세요.',
    invalid_sign_in_method: '현재 로그인 방법을 지원하지 않아요.',
    invalid_connector_id: '소셜 ID {{connectorId}}를 찾을 수 없어요..',
    insufficient_info: '로그인 정보가 충분하지 않아요.',
    connector_id_mismatch: '연동 ID가 세션 정보와 일치하지 않아요.',
    connector_session_not_found: '연동 세션을 찾을 수 없어요. 다시 로그인해주세요.',
    verification_session_not_found:
      'The verification was not successful. Restart the verification flow and try again.', // UNTRANSLATED
    verification_expired:
      'The connection has timed out. Verify again to ensure your account safety.', // UNTRANSLATED
    unauthorized: '로그인을 먼저 해주세요.',
    unsupported_prompt_name: '지원하지 않는 Prompt 이름이예요.',
    forgot_password_not_enabled: 'Forgot password is not enabled.', // UNTRANSLATED
    verification_failed:
      'The verification was not successful. Restart the verification flow and try again.', // UNTRANSLATED
  },
  connector: {
    general: '연동 중에 알 수 없는 오류가 발생했어요. {{errorDescription}}',
    not_found: '{{type}} 값을 가진 연동 종류를 찾을 수 없어요.',
    not_enabled: '연동이 활성화 되지 않았어요.',
    invalid_metadata: "The connector's metadata is invalid.", // UNTRANSLATED
    invalid_config_guard: "The connector's config guard is invalid.", // UNTRANSLATED
    unexpected_type: "The connector's type is unexpected.", // UNTRANSLATED
    invalid_request_parameters: 'The request is with wrong input parameter(s).', // UNTRANSLATED
    insufficient_request_parameters: '요청 데이터에서 일부 정보가 없어요.',
    invalid_config: '연동 설정이 유효하지 않아요.',
    invalid_response: '연동 응답이 유효하지 않아요.',
    template_not_found: '연동 예제 설정을 찾을 수 없어요.',
    not_implemented: '{{method}}은 아직 구현되지 않았어요.',
    social_invalid_access_token: '연동 서비스의 Access 토큰이 유효하지 않아요.',
    invalid_auth_code: '연동 서비스의 Auth 코드가 유효하지 않아요.',
    social_invalid_id_token: '연동 서비스의 ID 토큰이 유효하지 않아요.',
    authorization_failed: '사용자의 인증 과정이 성공적으로 마무리되지 않았어요.',
    social_auth_code_invalid: 'Access 토큰을 가져올 수 없어요. Authorization 코드를 확인해주세요.',
    more_than_one_sms: '연동된 SMS 서비스가 1개 이상이여야 해요.',
    more_than_one_email: '연동된 이메일 서비스가 1개 이상이여야 해요.',
    db_connector_type_mismatch: '종류가 일치하지 않은 연동 서비스가 DB에 존재해요.',
    not_found_with_connector_id: 'Can not find connector with given standard connector id.', // UNTRANSLATED
    multiple_instances_not_supported:
      'Can not create multiple instance with picked standard connector.', // UNTRANSLATED
    invalid_type_for_syncing_profile: 'You can only sync user profile with social connectors.', // UNTRANSLATED
    can_not_modify_target: 'The connector target can not be modified.', // UNTRANSLATED
    multiple_target_with_same_platform:
      'You can not have multiple social connectors that have same target and platform.', // UNTRANSLATED
  },
  passcode: {
    phone_email_empty: '휴대전화번호 그리고 이메일이 비어있어요.',
    not_found: '비밀번호를 찾을 수 없어요. 비밀번호를 먼저 보내주세요.',
    phone_mismatch: '휴대전화번호가 일치하지 않아요. 새로운 비밀번호를 요청해주세요.',
    email_mismatch: '이메일이 일치하지 않아요. 새로운 비밀번호를 요청해주세요.',
    code_mismatch: '비밀번호가 유효하지 않아요.',
    expired: '비밀번호가 만료되었어요. 새로운 비밀번호를 요청해주세요.',
    exceed_max_try: '해당 비밀번호는 인증 횟수를 초과하였어요. 새로운 비밀번호를 요청해주세요.',
  },
  sign_in_experiences: {
    empty_content_url_of_terms_of_use:
      '이용약관 URL이 비어있어요. 이용약관이 활성화되어있다면, 이용약관 URL를 설정해주세요.',
    empty_logo: '로고 URL을 입력해주세요.',
    empty_slogan: '브랜딩 슬로건이 비어있어요. 슬로건을 사용한다면, 내용을 설정해주세요.',
    empty_social_connectors: '연동된 소셜이 없어요. 소셜 로그인을 사용한다면, 연동해주세요.',
    enabled_connector_not_found: '활성된 {{type}} 연동을 찾을 수 없어요.',
    not_one_and_only_one_primary_sign_in_method:
      '반드시 하나의 메인 로그인 방법이 설정되어야 해요. 입력된 값을 확인해주세요.',
    username_requires_password: 'Must enable set a password for username sign up identifier.', // UNTRANSLATED
    passwordless_requires_verify: 'Must enable verify for email/phone sign up identifier.', // UNTRANSLATED
    miss_sign_up_identifier_in_sign_in: 'Sign in methods must contain the sign up identifier.', // UNTRANSLATED
    password_sign_in_must_be_enabled:
      'Password sign in must be enabled when set a password is required in sign up.', // UNTRANSLATED
    code_sign_in_must_be_enabled:
      'Verification code sign in must be enabled when set a password is not required in sign up.', // UNTRANSLATED
    unsupported_default_language: 'This language - {{language}} is not supported at the moment.', // UNTRANSLATED
    at_least_one_authentication_factor: 'You have to select at least one authentication factor.', // UNTRANSLATED
  },
  localization: {
    cannot_delete_default_language:
      '{{languageTag}} is set as your default language and can’t be deleted.', // UNTRANSLATED
    invalid_translation_structure: 'Invalid data schemas. Please check your input and try again.', // UNTRANSLATED
  },
  swagger: {
    invalid_zod_type: '유요하지 않은 Zod 종류에요. Route Guard 설정을 확인해주세요.',
    not_supported_zod_type_for_params:
      '지원되지 않는 Zod 종류예요. Route Guard 설정을 확인해주세요.',
  },
  entity: {
    create_failed: '{{name}} 생성을 실패하였어요..',
    not_exists: '{{name}}는 존재하지 않아요.',
    not_exists_with_id: '{{id}} ID를 가진 {{name}}는 존재하지 않아요.',
    not_found: '리소스가 존재하지 않아요.',
  },
  log: {
    invalid_type: 'The log type is invalid.', // UNTRANSLATED
  },
};

export default errors;
