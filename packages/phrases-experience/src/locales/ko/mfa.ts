const mfa = {
  totp: '인증 앱 OTP',
  webauthn: '패스키',
  backup_code: '백업 코드',
  email_verification_code: '이메일 인증 코드',
  phone_verification_code: 'SMS 인증 코드',
  link_totp_description: '예: Google Authenticator 등',
  link_webauthn_description: '기기 또는 USB 하드웨어 연결',
  link_backup_code_description: '백업 코드 생성',
  link_email_verification_code_description: '이메일 주소 연결',
  link_email_2fa_description: '2단계 인증을 위한 이메일 주소 연결',
  link_phone_verification_code_description: '전화번호 연결',
  link_phone_2fa_description: '2단계 인증을 위한 전화번호 연결',
  verify_totp_description: '앱에 일회용 코드 입력',
  verify_webauthn_description: '기기 또는 USB 하드웨어 확인',
  verify_backup_code_description: '저장한 백업 코드 붙여넣기',
  verify_email_verification_code_description: '이메일로 전송된 코드 입력',
  verify_phone_verification_code_description: '휴대폰으로 전송된 코드 입력',
  add_mfa_factors: '2단계 인증 추가',
  add_mfa_description:
    '2단계 인증이 활성화되었습니다. 안전한 로그인을 위해 두 번째 인증 방법을 선택하세요.',
  verify_mfa_factors: '2단계 인증 확인',
  verify_mfa_description:
    '이 계정에 대해 2단계 인증이 활성화되었습니다. 신원을 확인하는 두 번째 방법을 선택하세요.',
  add_authenticator_app: '인증 앱 추가',
  step: '단계 {{step, number}}: {{content}}',
  scan_qr_code: '이 QR 코드 스캔',
  scan_qr_code_description:
    'Google Authenticator, Duo Mobile, Authy 등의 인증 앱으로 다음 QR 코드를 스캔하세요.',
  qr_code_not_available: 'QR 코드를 스캔할 수 없나요?',
  copy_and_paste_key: '키 복사 및 붙여넣기',
  copy_and_paste_key_description:
    '다음 키를 Google Authenticator, Duo Mobile, Authy 등의 인증 앱에 복사하여 붙여넣으세요.',
  want_to_scan_qr_code: 'QR 코드를 스캔하고 싶나요?',
  enter_one_time_code: '일회용 코드 입력',
  enter_one_time_code_link_description: '인증 앱에서 생성된 6자리 확인 코드를 입력하세요.',
  enter_one_time_code_description:
    '이 계정에서는 2단계 인증이 활성화되었습니다. 연결된 인증 앱에 표시된 일회용 코드를 입력하세요.',
  link_another_mfa_factor: '다른 방법으로 전환',
  save_backup_code: '백업 코드 저장',
  save_backup_code_description:
    '다른 방법으로 2단계 인증 중 문제가 발생하면 이러한 백업 코드 중 하나를 사용하여 계정에 액세스할 수 있습니다. 각 코드는 한 번만 사용할 수 있습니다.',
  backup_code_hint: '반드시 복사하고 안전한 곳에 저장하세요.',
  enter_a_backup_code: '백업 코드 입력',
  enter_backup_code_description: '2단계 인증이 초기에 활성화될 때 저장한 백업 코드를 입력하세요.',
  create_a_passkey: '패스키 생성',
  create_passkey_description:
    '기기 바이오메트릭스, 보안 키(예: YubiKey) 또는 기타 사용 가능한 방법을 사용하여 패스키를 등록하세요.',
  try_another_verification_method: '다른 방법으로 확인해보세요',
  verify_via_passkey: '패스키로 확인',
  verify_via_passkey_description:
    '디바이스 비밀번호 또는 바이오메트릭스, QR 코드 스캔 또는 YubiKey와 같은 USB 보안 키 사용하여 패스키로 확인하세요.',
  secret_key_copied: '비밀 키가 복사되었습니다.',
  backup_code_copied: '백업 코드가 복사되었습니다.',
  webauthn_not_ready: 'WebAuthn이 아직 준비되지 않았습니다. 나중에 다시 시도하세요.',
  webauthn_not_supported: '이 브라우저에서는 WebAuthn이 지원되지 않습니다.',
  webauthn_failed_to_create: '생성 실패. 다시 시도하세요.',
  webauthn_failed_to_verify: '확인 실패. 다시 시도하세요.',
};

export default Object.freeze(mfa);
