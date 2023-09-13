const mfa = {
  title: '다중 인증',
  description: '로그인 경험의 보안을 강화하기 위해 다중 인증을 추가하세요.',
  factors: '요소',
  multi_factors: '다중 요소',
  multi_factors_description:
    '사용자는 두 단계 인증을 위해 활성화된 요소 중 하나를 확인해야 합니다.',
  totp: 'Authenticator 앱 OTP',
  otp_description: 'Google Authenticator 등을 연결하여 일회용 암호를 확인합니다.',
  webauthn: 'WebAuthn',
  webauthn_description:
    'WebAuthn은 YubiKey를 포함한 사용자 장치를 확인하기 위해 패스키를 사용합니다.',
  backup_code: '백업 코드',
  backup_code_description: '한 번의 인증에 사용할 수 있는 고유한 10개의 코드를 생성합니다.',
  backup_code_setup_hint: '독립적으로 활성화할 수 없는 백업 인증 요소:',
  backup_code_error_hint:
    'MFA에 백업 코드를 사용하려면 다른 요소도 활성화되어 있어야 하며 사용자의 로그인이 성공적으로 이루어지도록 합니다.',
  policy: '정책',
  two_step_sign_in_policy: '로그인 시 이중 인증 정책',
  two_step_sign_in_policy_description: '로그인 시 앱 전체에서 이중 인증 요구 사항을 정의합니다.',
  user_controlled: '사용자 제어',
  user_controlled_description:
    '기본적으로 비활성화되어 있으며 필수 사항은 아니지만 사용자는 개별적으로 활성화할 수 있습니다.',
  mandatory: '필수',
  mandatory_description: '모든 사용자에 대한 모든 로그인에서 MFA가 필요합니다.',
  unlock_reminder:
    '보안을 확인하려면 유료 플랜으로 업그레이드하여 MFA를 잠금 해제하십시오. 도움이 필요하면 언제든지 <a>문의하십시오</a>.',
  view_plans: '플랜 보기',
};

export default Object.freeze(mfa);
