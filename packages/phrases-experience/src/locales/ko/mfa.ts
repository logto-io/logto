const mfa = {
  totp: '인증 앱 OTP',
  webauthn: '패스 키',
  backup_code: '백업 코드',
  link_totp_description: 'Google Authenticator 등 연결',
  link_webauthn_description: '기기 또는 USB 하드웨어 연결',
  link_backup_code_description: '백업 코드 생성',
  verify_totp_description: '앱에 일회용 코드 입력',
  verify_webauthn_description: '기기 또는 USB 하드웨어 확인',
  verify_backup_code_description: '저장한 백업 코드 붙여넣기',
  add_mfa_factors: '2단계 인증 추가',
  add_mfa_description:
    '2단계 인증이 활성화되었습니다. 안전한 계정 로그인을 위한 두 번째 인증 방법을 선택하세요.',
  verify_mfa_factors: '2단계 인증',
  verify_mfa_description:
    '이 계정에는 2단계 인증이 활성화되었습니다. 신원을 확인할 두 번째 방법을 선택하세요.',
  add_authenticator_app: '인증 앱 추가',
  step: '단계 {{step, number}}: {{content}}',
  scan_qr_code: '이 QR 코드 스캔',
  scan_qr_code_description:
    'Google Authenticator, Duo Mobile, Authy 등과 같은 인증 앱을 사용하여이 QR 코드를 스캔하세요.',
  qr_code_not_available: 'QR 코드를 스캔할 수 없나요?',
  copy_and_paste_key: '키 복사 및 붙여넣기',
  copy_and_paste_key_description:
    '아래의 키를 Google Authenticator, Duo Mobile, Authy 등과 같은 인증 앱에 붙여넣으세요.',
  want_to_scan_qr_code: 'QR 코드를 스캔하고 싶나요?',
  enter_one_time_code: '일회용 코드 입력',
  enter_one_time_code_link_description: '인증 앱에서 생성된 6 자리 확인 코드를 입력하세요.',
  enter_one_time_code_description:
    '이 계정에는 2단계 인증이 활성화되었습니다. 연결된 인증 앱에서 표시되는 일회용 코드를 입력하세요.',
  link_another_mfa_factor: '다른 2단계 인증 연결',
  save_backup_code: '백업 코드 저장',
  save_backup_code_description:
    '다른 방법으로 2단계 인증 중 문제가 발생하는 경우 이러한 백업 코드 중 하나를 사용하여 계정에 액세스할 수 있습니다. 각 코드는 한 번만 사용할 수 있습니다.',
  backup_code_hint: '복사하고 안전한 장소에 저장해야 합니다.',
  enter_backup_code_description: '2단계 인증이 처음에 활성화될 때 저장한 백업 코드를 입력하세요.',
  create_a_passkey: '패스키 생성',
  create_passkey_description:
    '디바이스 비밀번호 또는 생체 인증, QR 코드 스캔 또는 YubiKey와 같은 USB 보안 키를 사용하여 확인할 패스키를 등록하세요.',
  name_your_passkey: '패스키 이름 지정',
  name_passkey_description:
    '이 디바이스를 2단계 인증을 위해 성공적으로 확인했습니다. 여러 개의 키를 가지고 있는 경우 구분하기 위해 이름을 사용자 정의하세요.',
  try_another_verification_method: '다른 확인 방법 시도',
  verify_via_passkey: '패스키를 사용하여 확인',
  verify_via_passkey_description:
    '디바이스 비밀번호 또는 생체 인증, QR 코드 스캔 또는 YubiKey와 같은 USB 보안 키를 사용하여 확인하기 위해 패스키를 사용하세요.',
  secret_key_copied: '비밀 키 복사됨.',
  backup_code_copied: '백업 코드 복사됨.',
};

export default Object.freeze(mfa);
