const account_center = {
  header: {
    title: '계정 센터',
  },
  home: {
    title: '페이지를 찾을 수 없음',
    description: '이 페이지는 사용할 수 없습니다.',
  },
  verification: {
    title: '보안 인증',
    description: '계정 보안을 위해 본인인지 확인하세요. 신원을 인증할 방법을 선택해 주세요.',
    error_send_failed: '인증 코드를 보내지 못했습니다. 잠시 후 다시 시도해주세요.',
    error_invalid_code: '인증 코드가 잘못되었거나 만료되었습니다.',
    error_verify_failed: '인증에 실패했습니다. 코드를 다시 입력해주세요.',
    verification_required: '인증이 만료되었습니다. 다시 신원을 확인해주세요.',
    try_another_method: '다른 방법으로 인증하기',
  },
  password_verification: {
    title: '비밀번호 확인',
    description: '계정 보안을 위해 비밀번호를 입력해 본인임을 확인하세요.',
    error_failed: '인증에 실패했습니다. 비밀번호를 확인해주세요.',
  },
  verification_method: {
    password: {
      name: '비밀번호',
      description: '비밀번호를 확인하세요',
    },
    email: {
      name: '이메일 인증 코드',
      description: '인증 코드를 이메일로 보내기',
    },
    phone: {
      name: '전화 인증 코드',
      description: '인증 코드를 전화번호로 보내기',
    },
  },
  email: {
    title: '이메일 연결',
    description: '이메일을 연결해 로그인하거나 계정 복구에 활용하세요.',
    verification_title: '이메일 인증 코드를 입력',
    verification_description: '인증 코드가 이메일 {{email_address}}(으)로 전송되었습니다.',
    success: '기본 이메일이 연결되었습니다.',
    verification_required: '인증이 만료되었습니다. 다시 신원을 확인해주세요.',
  },
  phone: {
    title: '전화번호 연결',
    description: '로그인하거나 계정 복구에 사용할 전화번호를 연결하세요.',
    verification_title: 'SMS 인증 코드를 입력',
    verification_description: '인증 코드가 전화번호 {{phone_number}}(으)로 전송되었습니다.',
    success: '기본 전화번호가 연결되었습니다.',
    verification_required: '인증이 만료되었습니다. 다시 신원을 확인해주세요.',
  },
  username: {
    title: '사용자 이름 설정',
    description: '사용자 이름은 문자, 숫자, 밑줄(_)만 사용할 수 있습니다.',
    success: '사용자 이름이 성공적으로 업데이트되었습니다.',
  },
  password: {
    title: '비밀번호 설정',
    description: '계정을 안전하게 보호할 새 비밀번호를 만들어 주세요.',
    success: '비밀번호가 성공적으로 업데이트되었습니다.',
  },

  code_verification: {
    send: '인증 코드 보내기',
    resend: '아직 받지 못하셨나요? <a>인증 코드 다시 보내기</a>',
    resend_countdown: '아직 받지 못하셨나요?<span> {{seconds}}초 후에 다시 보낼 수 있습니다</span>',
  },

  email_verification: {
    title: '이메일 확인',
    prepare_description: '계정 보안을 위해 본인인지 확인하세요. 인증 코드를 이메일로 보냅니다.',
    email_label: '이메일 주소',
    send: '인증 코드 보내기',
    description:
      '인증 코드가 이메일 {{email}}(으)로 전송되었습니다. 코드를 입력해 계속 진행하세요.',
    resend: '아직 받지 못하셨나요? <a>인증 코드 다시 보내기</a>',
    resend_countdown: '아직 받지 못하셨나요?<span> {{seconds}}초 후에 다시 보낼 수 있습니다</span>',
    error_send_failed: '인증 코드를 보내지 못했습니다. 잠시 후 다시 시도해주세요.',
    error_verify_failed: '인증에 실패했습니다. 코드를 다시 입력해주세요.',
    error_invalid_code: '인증 코드가 잘못되었거나 만료되었습니다.',
  },
  phone_verification: {
    title: '전화번호 확인',
    prepare_description: '계정 보안을 위해 본인인지 확인하세요. 인증 코드를 전화로 보내겠습니다.',
    phone_label: '전화번호',
    send: '인증 코드 보내기',
    description:
      '인증 코드가 전화번호 {{phone}}(으)로 전송되었습니다. 코드를 입력해 계속 진행하세요.',
    resend: '아직 받지 못하셨나요? <a>인증 코드 다시 보내기</a>',
    resend_countdown: '아직 받지 못하셨나요?<span> {{seconds}}초 후에 다시 보낼 수 있습니다</span>',
    error_send_failed: '인증 코드를 보내지 못했습니다. 잠시 후 다시 시도해주세요.',
    error_verify_failed: '인증에 실패했습니다. 코드를 다시 입력해주세요.',
    error_invalid_code: '인증 코드가 잘못되었거나 만료되었습니다.',
  },
  mfa: {
    totp_already_added: '이미 인증 앱을 추가했습니다. 먼저 기존 앱을 제거하십시오.',
    totp_not_enabled: '인증 앱이 활성화되지 않았습니다. 관리자에게 문의하여 활성화하십시오.',
    backup_code_already_added:
      '이미 활성 백업 코드가 있습니다. 새 코드를 생성하기 전에 사용하거나 제거하십시오.',
    backup_code_not_enabled:
      '백업 코드가 활성화되지 않았습니다. 관리자에게 문의하여 활성화하십시오.',
    backup_code_requires_other_mfa: '백업 코드를 사용하려면 다른 MFA 방법을 먼저 설정해야 합니다.',
    passkey_not_enabled: '패스키가 활성화되지 않았습니다. 관리자에게 문의하여 활성화하세요.',
  },
  update_success: {
    default: {
      title: '업데이트되었습니다!',
      description: '귀하의 정보가 업데이트되었습니다.',
    },
    email: {
      title: '이메일 업데이트됨!',
      description: '이메일 주소가 성공적으로 업데이트되었습니다.',
    },
    phone: {
      title: '전화번호 업데이트됨!',
      description: '전화번호가 성공적으로 업데이트되었습니다.',
    },
    username: {
      title: '사용자 이름 변경됨!',
      description: '사용자 이름이 성공적으로 업데이트되었습니다.',
    },

    password: {
      title: '비밀번호 변경됨!',
      description: '비밀번호가 성공적으로 업데이트되었습니다.',
    },
    totp: {
      title: '인증 앱 추가됨!',
      description: '인증 앱이 계정에 성공적으로 연결되었습니다.',
    },
    backup_code: {
      title: '백업 코드가 생성되었습니다!',
      description: '백업 코드가 저장되었습니다. 안전한 곳에 보관하십시오.',
    },
    backup_code_deleted: {
      title: '백업 코드가 삭제되었습니다!',
      description: '백업 코드가 계정에서 삭제되었습니다.',
    },
    passkey: {
      title: '패스키가 추가되었습니다!',
      description: '패스키가 계정에 성공적으로 연결되었습니다.',
    },
    passkey_deleted: {
      title: '패스키가 삭제되었습니다!',
      description: '패스키가 계정에서 삭제되었습니다.',
    },
    social: {
      title: '소셜 계정 연결됨!',
      description: '소셜 계정이 성공적으로 연결되었습니다.',
    },
  },
  backup_code: {
    title: '백업 코드',
    description:
      '2단계 인증에 문제가 있는 경우 이 백업 코드 중 하나를 사용하여 계정에 액세스할 수 있습니다. 각 코드는 한 번만 사용할 수 있습니다.',
    copy_hint: '복사하여 안전한 곳에 보관하세요.',
    generate_new_title: '새 백업 코드 생성',
    generate_new: '새 백업 코드 생성',
    delete_confirmation_title: '백업 코드 삭제',
    delete_confirmation_description: '이 백업 코드를 삭제하면 더 이상 인증에 사용할 수 없습니다.',
  },
  passkey: {
    title: '패스키',
    added: '추가됨: {{date}}',
    last_used: '마지막 사용: {{date}}',
    never_used: '사용 안 함',
    unnamed: '이름 없는 패스키',
    renamed: '패스키 이름이 변경되었습니다.',
    add_another_title: '다른 패스키 추가',
    add_another_description:
      '기기 생체 인증, 보안 키(예: YubiKey) 또는 기타 사용 가능한 방법을 사용하여 패스키를 등록하세요.',
    add_passkey: '패스키 추가',
    delete_confirmation_title: '패스키 삭제',
    delete_confirmation_description:
      '"{{name}}"을(를) 삭제하시겠습니까? 이 패스키로 더 이상 로그인할 수 없습니다.',
    rename_passkey: '패스키 이름 변경',
    rename_description: '이 패스키의 새 이름을 입력하세요.',
  },
};

export default Object.freeze(account_center);
