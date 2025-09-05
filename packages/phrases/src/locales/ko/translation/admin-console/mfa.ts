const mfa = {
  title: '다중 인증',
  description: '다중 인증을 추가하여 로그인 경험의 보안을 강화하세요.',
  factors: '요소',
  multi_factors: '다중 요소',
  multi_factors_description: '사용자는 2단계 인증을 위해 활성화된 요소 중 하나를 확인해야 합니다.',
  totp: '인증기 앱 OTP',
  otp_description: 'Google Authenticator 등을 연결하여 일회용 암호를 확인합니다.',
  webauthn: 'WebAuthn(패스키)',
  webauthn_description:
    '브라우저에서 지원하는 방법으로 확인합니다: 생체 인식, 휴대폰 스캔 또는 보안 키 등.',
  webauthn_native_tip: '네이티브 애플리케이션에서는 WebAuthn이 지원되지 않습니다.',
  webauthn_domain_tip:
    'WebAuthn은 공개 키를 특정 도메인에 바인딩합니다. 서비스 도메인을 수정하면 기존 패스키를 사용한 사용자의 인증이 차단됩니다.',
  backup_code: '백업 코드',
  backup_code_description:
    '사용자가 어떤 MFA 방법을 설정한 후에 10개의 일회용 백업 코드를 생성합니다.',
  backup_code_setup_hint: '사용자가 위의 MFA 요소를 확인할 수 없는 경우 백업 옵션을 사용하세요.',
  backup_code_error_hint:
    '백업 코드를 사용하려면 성공적인 사용자 인증을 위해 적어도 하나 이상의 MFA 방법이 필요합니다.',
  email_verification_code: '이메일 인증 코드',
  email_verification_code_description: '이메일 주소를 연결하여 인증 코드를 받고 검증하세요.',
  phone_verification_code: 'SMS 인증 코드',
  phone_verification_code_description: '전화번호를 연결하여 SMS 인증 코드를 받고 검증하세요.',
  policy: '정책',
  policy_description: '로그인 및 가입 플로우에 대한 MFA 정책을 설정합니다.',
  two_step_sign_in_policy: '로그인 시 2단계 인증 정책',
  user_controlled: '사용자는 자체적으로 MFA를 활성화 또는 비활성화할 수 있습니다',
  user_controlled_tip:
    '사용자는 처음 로그인 또는 가입 시에 MFA 설정을 건너 뛰거나 계정 설정에서 활성화/비활성화할 수 있습니다.',
  mandatory: '사용자는 항상 로그인 시 MFA 사용이 필요합니다',
  mandatory_tip:
    '사용자는 처음 로그인 또는 가입 시에 MFA를 설정하고 모든 향후 로그인에서 그것을 사용해야 합니다.',
  require_mfa: 'MFA 필요',
  require_mfa_label:
    '애플리케이션에 액세스하기 위해 2단계 인증을 필수로 만들려면 이것을 활성화하세요. 비활성화하면 사용자가 스스로 MFA 사용 여부를 결정할 수 있습니다.',
  set_up_prompt: 'MFA 설정 프롬프트',
  no_prompt: '사용자에게 MFA 설정을 요청하지 않습니다',
  prompt_at_sign_in_and_sign_up:
    '등록 중에 사용자에게 MFA 설정을 요청합니다 (건너뛸 수 있으며, 한 번만 요청됩니다)',
  prompt_only_at_sign_in:
    '등록 후 다음 로그인 시도 시 사용자에게 MFA 설정을 요청합니다 (건너뛸 수 있으며, 한 번만 요청됩니다)',
  set_up_organization_required_mfa_prompt:
    '조직이 MFA를 활성화 한 후 사용자를 위한 MFA 설정 프롬프트',
  prompt_at_sign_in_no_skip: '다음 로그인에 사용자에게 MFA 설정을 요청합니다 (건너뛰기 불가)',
  email_primary_method_tip:
    '이메일 인증 코드는 이미 주 로그인 방법입니다. 보안을 유지하기 위해 MFA로 재사용할 수 없습니다.',
  phone_primary_method_tip:
    'SMS 인증 코드는 이미 주 로그인 방법입니다. 보안을 유지하기 위해 MFA로 재사용할 수 없습니다.',
  no_email_connector_warning:
    '이메일 커넥터가 아직 설정되지 않았습니다. 구성을 완료하기 전에는 사용자가 MFA에 이메일 인증 코드를 사용할 수 없습니다. "커넥터"에서 <a>{{link}}</a>하세요.',
  no_sms_connector_warning:
    'SMS 커넥터가 아직 설정되지 않았습니다. 구성을 완료하기 전에는 사용자가 MFA에 SMS 인증 코드를 사용할 수 없습니다. "커넥터"에서 <a>{{link}}</a>하세요.',
  no_email_connector_error:
    '이메일 커넥터 없이는 이메일 인증 코드 MFA를 활성화할 수 없습니다. 먼저 이메일 커넥터를 구성해주세요.',
  no_sms_connector_error:
    'SMS 커넥터 없이는 SMS 인증 코드 MFA를 활성화할 수 없습니다. 먼저 SMS 커넥터를 구성해주세요.',
  setup_link: '설정',
};

export default Object.freeze(mfa);
