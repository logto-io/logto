const errors = {
  request: {
    invalid_input: '입력된 값이 유효하지 않아요. {{details}}',
    general: '요청 중에 오류가 발생했어요.',
  },
  auth: {
    authorization_header_missing: '인증 헤더가 존재하지 않아요.',
    authorization_token_type_not_supported: '해당 인증 방법을 지원하지 않아요.',
    unauthorized: '인증되지 않았어요. 로그인 정보와 범위를 확인해 주세요.',
    forbidden: '접근이 금지되었어요. 로그인 권한과 역할을 확인해 주세요.',
    expected_role_not_found:
      '예상되는 역할을 찾을 수 없어요. 해당 사용자의 권한 또는 역할을 확인해 주세요.',
    jwt_sub_missing: 'JWT에서 `sub`를 찾을 수 없어요.',
    require_re_authentication: '보호된 작업을 수행하려면 재인증이 필요해요.',
  },
  guard: {
    invalid_input: '{{type}} 요청 타입은 유효하지 않아요.',
    invalid_pagination: '요청의 Pagination 값이 유효하지 않아요.',
    can_not_get_tenant_id: 'Unable to get tenant id from request.', // UNTRANSLATED
    file_size_exceeded: 'File size exceeded.', // UNTRANSLATED
    mime_type_not_allowed: 'MIME type is not allowed.', // UNTRANSLATED
  },
  oidc: {
    aborted: 'End 사용자가 상호 작용을 중단했어요.',
    invalid_scope: '{{scope}} 범위를 지원하지 않아요.',
    invalid_scope_plural: '{{scopes}} 범위들을 지원하지 않아요.',
    invalid_token: '유효하지 않은 토큰이 제공되었어요.',
    invalid_client_metadata: '유효하지 않은 클라이언트 메타데이터가 제공되었어요.',
    insufficient_scope: '요청된 {{scopes}} 범위에서 Access 토큰을 찾을 수 없어요.',
    invalid_request: '요청이 유효하지 않아요.',
    invalid_grant: '승인 요청이 유효하지 않아요.',
    invalid_redirect_uri: '`redirect_uri`가 등록된 클라이언트의 `redirect_uris`와 일치하지 않아요.',
    access_denied: '접근이 금지되었어요.',
    invalid_target: '유효하지 않은 리소스 표시예요.',
    unsupported_grant_type: '지원하지 않는 `grant_type` 요청이에요.',
    unsupported_response_mode: '지원하지 않는 `response_mode` 요청이에요.',
    unsupported_response_type: '지원하지 않은 `response_type` 요청이에요.',
    provider_error: 'OIDC 내부 오류: {{message}}.',
  },
  user: {
    username_already_in_use: '이 사용자 이름은 다른 사람이 이미 사용 중이에요.',
    email_already_in_use: '이 이메일은 다른 계정에서 이미 사용 중이에요.',
    phone_already_in_use: '이 휴대전화번호는 다른 계정에서 이미 사용 중이에요.',
    invalid_email: '유효하지 않은 이메일이에요.',
    invalid_phone: '유효하지 않은 휴대전화번호예요.',
    email_not_exist: '이메일 주소가 아직 등록되지 않았어요.',
    phone_not_exist: '휴대전화번호가 아직 등록되지 않았어요.',
    identity_not_exist: '소셜 계정이 아직 등록되지 않았어요.',
    identity_already_in_use: '소셜 계정이 이미 등록되어 있어요.',
    social_account_exists_in_profile: 'You have already associated this social account.', // UNTRANSLATED
    cannot_delete_self: '자기 자신을 삭제할 수 없어요.',
    sign_up_method_not_enabled: '이 회원가입 방법은 활성화되어있지 않아요.',
    sign_in_method_not_enabled: '이 로그인 방법은 활성화되어있지 않아요.',
    same_password: '새로운 비밀번호는 이전 비밀번호와 같으면 안 돼요.',
    password_required_in_profile: '로그인 전에 비밀번호를 설정해야 해요.',
    new_password_required_in_profile: '새로운 비밀번호를 설정해야 해요.',
    password_exists_in_profile: '이미 비밀번호가 설정되어 있어요.',
    username_required_in_profile: '로그인 전에 사용자 이름을 설정해야 해요.',
    username_exists_in_profile: '이미 사용자 이름이 설정되어 있어요.',
    email_required_in_profile: '로그인 전에 이메일 주소를 설정해야 해요.',
    email_exists_in_profile: '이미 이메일 주소가 설정되어 있어요.',
    phone_required_in_profile: '로그인 전에 휴대전화번호를 설정해야 해요.',
    phone_exists_in_profile: '이미 휴대전화번호가 설정되어 있어요.',
    email_or_phone_required_in_profile:
      '로그인 전에 이메일 주소 또는 휴대전화번호를 설정해야 해요.',
    suspended: '이 계정은 일시 정지되었어요.',
    user_not_exist: '{{identifier}}의 사용자가 아직 등록되지 않았어요.',
    missing_profile: '로그인 전에 추가 정보를 제공해야 해요.',
    role_exists: '역할 ID {{roleId}}은/는 이미 이 사용자에게 할당되어 있어요.',
  },
  password: {
    unsupported_encryption_method: '{{name}} 암호화 방법을 지원하지 않아요.',
    pepper_not_found: '비밀번호 Pepper를 찾을 수 없어요. Core 환경설정을 확인해 주세요.',
  },
  session: {
    not_found: '세션을 찾을 수 없어요. 다시 로그인해 주세요.',
    invalid_credentials: '유효하지 않은 로그인 정보예요. 입력된 값을 다시 확인해 주세요.',
    invalid_sign_in_method: '현재 로그인 방법을 지원하지 않아요.',
    invalid_connector_id: '소셜 ID {{connectorId}}를 찾을 수 없어요.',
    insufficient_info: '로그인 정보가 충분하지 않아요.',
    connector_id_mismatch: '연동 ID가 세션 정보와 일치하지 않아요.',
    connector_session_not_found: '연동 세션을 찾을 수 없어요. 다시 로그인해 주세요.',
    verification_session_not_found:
      '검증을 실패했어요. 검증 과정을 다시 시작하고 다시 시도해 주세요.',
    verification_expired:
      '연결 시간이 초과되었어요. 검증을 다시 시작하고, 계정이 안전한지 확인해 주세요.',
    unauthorized: '로그인을 먼저 해 주세요.',
    unsupported_prompt_name: '지원하지 않는 Prompt 이름이에요.',
    forgot_password_not_enabled: '비밀번호 찾기가 활성화되어있지 않아요.',
    verification_failed:
      '인증이 성공적으로 완료되지 않았어요. 처음부터 다시 인증 과정을 거쳐 주세요.',
    connector_validation_session_not_found: '연동 세션 유효성 검증을 위한 토큰을 찾을 수 없어요.',
    identifier_not_found: '사용자 식별자를 찾을 수 없어요. 처음부터 다시 로그인을 시도해 주세요.',
    interaction_not_found: '인터렉션 세션을 찾을 수 없어요. 처음부터 다시 세션을 시작해 주세요.',
  },
  connector: {
    general: '커넥터에서 오류가 발생했습니다: {{errorDescription}}',
    not_found: '{{type}} 값을 가진 연동 종류를 찾을 수 없어요.',
    not_enabled: '연동이 활성화되지 않았어요.',
    invalid_metadata: '연동 메타데이터가 유효하지 않아요.',
    invalid_config_guard: '연동 설정 데이터가 유효하지 않아요.',
    unexpected_type: '예상하지 않은 연동 종류에요.',
    invalid_request_parameters: '잘못된 요청 파라미터가 있어요.',
    insufficient_request_parameters: '요청 데이터에서 일부 정보가 없어요.',
    invalid_config: '연동 설정이 유효하지 않아요.',
    invalid_response: '연동 응답이 유효하지 않아요.',
    template_not_found: '연동 예제 설정을 찾을 수 없어요.',
    not_implemented: '{{method}}은 아직 구현되지 않았어요.',
    social_invalid_access_token: '연동 서비스의 Access 토큰이 유효하지 않아요.',
    invalid_auth_code: '연동 서비스의 Auth 코드가 유효하지 않아요.',
    social_invalid_id_token: '연동 서비스의 ID 토큰이 유효하지 않아요.',
    authorization_failed: '사용자의 인증 과정이 성공적으로 마무리되지 않았어요.',
    social_auth_code_invalid: 'Access 토큰을 가져올 수 없어요. Authorization 코드를 확인해 주세요.',
    more_than_one_sms: 'SMS 서비스는 1개만 연동되어야 해요.',
    more_than_one_email: '이메일 서비스는 1개만 연동되어야 해요.',
    more_than_one_connector_factory:
      'Found multiple connector factories (with id {{connectorIds}}), you may uninstall unnecessary ones.', // UNTRANSLATED
    db_connector_type_mismatch: '종류가 일치하지 않은 연동 서비스가 DB에 존재해요.',
    not_found_with_connector_id: '주어진 연동 ID로 연동 설정을 찾을 수 없어요.',
    multiple_instances_not_supported: '선택된 연동 기준으로 여러 인스턴스를 생성할 수 없어요.',
    invalid_type_for_syncing_profile: '소셜 연동만 사용자 프로파일을 동기화 할 수 있어요.',
    can_not_modify_target: '연동 목표를 수정할 수 없어요.',
    should_specify_target: "'목표'를 반드시 지정해야 해요.",
    multiple_target_with_same_platform: '같은 목표와 플랫폼에 여러 소셜 연동을 가질 수 없어요.',
    cannot_overwrite_metadata_for_non_standard_connector:
      '이 연동의 메타데이터를 덮어쓸 수 없어요.',
  },
  verification_code: {
    phone_email_empty: '전화번호와 이메일이 모두 비어 있어요.',
    not_found: '인증 코드를 찾을 수 없어요. 인증 코드를 먼저 요청하세요.',
    phone_mismatch: '전화번호가 맞지 않아요. 새 인증 코드를 요청해 주세요.',
    email_mismatch: '이메일이 맞지 않아요. 새 인증 코드를 요청해 주세요.',
    code_mismatch: '인증 코드가 일치하지 않아요.',
    expired: '인증 코드가 만료되었어요. 새 인증 코드를 요청해 주세요.',
    exceed_max_try: '인증 코드 재시도 한도에 도달했어요. 새 인증 코드를 요청해 주세요.',
  },
  sign_in_experiences: {
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
  },
  localization: {
    cannot_delete_default_language: '{{languageTag}} 언어는 기본 언어이므로 삭제할 수 없어요.',
    invalid_translation_structure:
      '유효하지 않은 데이터 스키마예요. 입력된 값을 다시 확인해 주세요.',
  },
  swagger: {
    invalid_zod_type: '유효하지 않은 Zod 종류에요. Route Guard 설정을 확인해 주세요.',
    not_supported_zod_type_for_params:
      '지원되지 않는 Zod 종류예요. Route Guard 설정을 확인해 주세요.',
  },
  entity: {
    create_failed: '{{name}} 생성을 실패하였어요.',
    not_exists: '{{name}}는 존재하지 않아요.',
    not_exists_with_id: '{{id}} ID를 가진 {{name}}는 존재하지 않아요.',
    not_found: '리소스가 존재하지 않아요.',
  },
  log: {
    invalid_type: '로그 종류가 유효하지 않아요.',
  },
  role: {
    name_in_use: '역할 이름 {{name}}이/가 이미 사용 중이에요.',
    scope_exists: '범위 ID {{scopeId}}이/가 이미 이 역할에 추가되어 있어요.',
    user_exists: '사용자 ID {{userId}}이/가 이미 이 역할에 추가되어 있어요.',
    default_role_missing:
      '기본 역할 이름의 일부가 데이터베이스에 존재하지 않아요. 먼저 역할을 생성해 주세요.',
    internal_role_violation:
      'You may be trying to update or delete an internal role which is forbidden by Logto. If you are creating a new role, try another name that does not start with "#internal:".', // UNTRANSLATED
  },
  scope: {
    name_exists: '범위 이름 {{name}}이/가 이미 사용 중이에요.',
    name_with_space: '범위 이름에 공백을 포함할 수 없어요.',
  },
  storage: {
    not_configured: 'Storage provider is not configured.', // UNTRANSLATED
    missing_parameter: 'Missing parameter {{parameter}} for storage provider.', // UNTRANSLATED
    upload_error: 'Failed to upload file to the storage provider.', // UNTRANSLATED
  },
};

export default errors;
