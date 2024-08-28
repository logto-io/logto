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
    'Too many attempts in a short time. Please try again {{relativeTime}}.',
  unauthorized: '로그인을 먼저 해 주세요.',
  unsupported_prompt_name: '지원하지 않는 Prompt 이름이에요.',
  forgot_password_not_enabled: '비밀번호 찾기가 활성화되어있지 않아요.',
  verification_failed:
    '인증이 성공적으로 완료되지 않았어요. 처음부터 다시 인증 과정을 거쳐 주세요.',
  connector_validation_session_not_found: '연동 세션 유효성 검증을 위한 토큰을 찾을 수 없어요.',
  identifier_not_found: '사용자 식별자를 찾을 수 없어요. 처음부터 다시 로그인을 시도해 주세요.',
  interaction_not_found: '인터랙션 세션을 찾을 수 없어요. 처음부터 다시 세션을 시작해 주세요.',
  not_supported_for_forgot_password: 'This operation is not supported for forgot password.',
  mfa: {
    require_mfa_verification: 'Mfa verification is required to sign in.',
    mfa_sign_in_only: 'Mfa is only available for sign-in interaction.',
    pending_info_not_found: 'Pending MFA info not found, please initiate MFA first.',
    invalid_totp_code: 'Invalid TOTP code.',
    webauthn_verification_failed: 'WebAuthn verification failed.',
    webauthn_verification_not_found: 'WebAuthn verification not found.',
    bind_mfa_existed: 'MFA already exists.',
    backup_code_can_not_be_alone: 'Backup code can not be the only MFA.',
    backup_code_required: 'Backup code is required.',
    invalid_backup_code: 'Invalid backup code.',
    mfa_policy_not_user_controlled: 'MFA policy is not user controlled.',
  },
  sso_enabled: '이 이메일로는 SSO가 활성화되어 있어요. SSO로 로그인해 주세요.',
};

export default Object.freeze(session);
