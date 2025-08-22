const session = {
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
  verification_blocked_too_many_attempts:
    '짧은 시간 안에 너무 많은 시도가 있었어요. {{relativeTime}} 후에 다시 시도해 주세요.',
  unauthorized: '로그인을 먼저 해 주세요.',
  unsupported_prompt_name: '지원하지 않는 Prompt 이름이에요.',
  forgot_password_not_enabled: '비밀번호 찾기가 활성화되어있지 않아요.',
  verification_failed:
    '인증이 성공적으로 완료되지 않았어요. 처음부터 다시 인증 과정을 거쳐 주세요.',
  connector_validation_session_not_found: '연동 세션 유효성 검증을 위한 토큰을 찾을 수 없어요.',
  csrf_token_mismatch: 'CSRF 토큰이 일치하지 않아요.',
  identifier_not_found: '사용자 식별자를 찾을 수 없어요. 처음부터 다시 로그인을 시도해 주세요.',
  interaction_not_found: '인터랙션 세션을 찾을 수 없어요. 처음부터 다시 세션을 시작해 주세요.',
  invalid_interaction_type:
    '현재 상호 작용에는 이 작업이 지원되지 않습니다. 새 세션을 시작해 주세요.',
  not_supported_for_forgot_password: '이 작업은 비밀번호 찾기를 지원하지 않아요.',
  identity_conflict: 'ID 불일치가 감지되었어요. 다른 ID로 진행하기 위해 새 세션을 시작해 주세요.',
  identifier_not_verified:
    '제공된 식별자 {{identifier}}가 확인되지 않았습니다. 이 식별자에 대한 검증 기록을 생성하고 검증 과정을 완료해 주세요.',
  mfa: {
    require_mfa_verification: 'MFA 인증이 필요해요.',
    mfa_sign_in_only: 'MFA는 로그인 인터랙션에서만 사용할 수 있어요.',
    pending_info_not_found: '대기 중인 MFA 정보를 찾을 수 없어요. 먼저 MFA를 시작해 주세요.',
    invalid_totp_code: '유효하지 않은 TOTP 코드예요.',
    webauthn_verification_failed: 'WebAuthn 인증에 실패했어요.',
    webauthn_verification_not_found: 'WebAuthn 인증 정보를 찾을 수 없어요.',
    bind_mfa_existed: 'MFA가 이미 존재해요.',
    backup_code_can_not_be_alone: '백업 코드는 단독으로 존재할 수 없어요.',
    backup_code_required: '백업 코드가 필요해요.',
    invalid_backup_code: '유효하지 않은 백업 코드예요.',
    mfa_policy_not_user_controlled: 'MFA 정책은 사용자가 제어할 수 없어요.',
    mfa_factor_not_enabled: 'MFA 요소가 활성화되지 않았습니다.',
    suggest_additional_mfa:
      '보안을 강화하기 위해 다른 MFA 방법을 추가하는 것을 권장합니다. 이 단계는 건너뛰고 계속할 수 있습니다.',
  },
  sso_enabled: '이 이메일로는 SSO가 활성화되어 있어요. SSO로 로그인해 주세요.',
  captcha_required: 'Captcha 가 필요해요.',
  captcha_failed: 'Captcha 인증에 실패했어요.',
  email_blocklist: {
    disposable_email_validation_failed: '이메일 주소 유효성 검사에 실패했어요.',
    invalid_email: '유효하지 않은 이메일 주소예요.',
    email_subaddressing_not_allowed: '이메일 서브어드레싱은 허용되지 않아요.',
    email_not_allowed: '이메일 주소 "{{email}}" 는 제한되어 있어요. 다른 주소를 선택해 주세요.',
  },
  google_one_tap: {
    cookie_mismatch: 'Google One Tap 쿠키가 일치하지 않아요.',
    invalid_id_token: '유효하지 않은 Google ID 토큰이에요.',
    unverified_email: '확인되지 않은 이메일 주소예요.',
  },
};

export default Object.freeze(session);
