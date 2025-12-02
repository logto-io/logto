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
    verification_title: '전화 인증 코드를 입력',
    verification_description: '인증 코드가 전화번호 {{phone_number}}(으)로 전송되었습니다.',
    success: '기본 전화번호가 연결되었습니다.',
    verification_required: '인증이 만료되었습니다. 다시 신원을 확인해주세요.',
  },
  username: {
    title: 'Set username',
    description: 'Username must contain only letters, numbers, and underscores.',
    success: 'Username updated successfully.',
  },

  code_verification: {
    send: '인증 코드 보내기',
    resend: '코드 다시 보내기',
    resend_countdown: '아직 받지 못하셨나요? {{seconds}}초 후에 다시 보내세요.',
  },

  email_verification: {
    title: '이메일 확인',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: '이메일 주소',
    send: '인증 코드 보내기',
    description:
      '인증 코드가 이메일 {{email}}(으)로 전송되었습니다. 코드를 입력해 계속 진행하세요.',
    resend: '코드 다시 보내기',
    resend_countdown: '아직 받지 못하셨나요? {{seconds}}초 후에 다시 보내세요.',
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
    resend: '코드 다시 보내기',
    resend_countdown: '아직 받지 못하셨나요? {{seconds}}초 후에 다시 보내세요.',
    error_send_failed: '인증 코드를 보내지 못했습니다. 잠시 후 다시 시도해주세요.',
    error_verify_failed: '인증에 실패했습니다. 코드를 다시 입력해주세요.',
    error_invalid_code: '인증 코드가 잘못되었거나 만료되었습니다.',
  },
  update_success: {
    default: {
      title: '업데이트 완료',
      description: '변경 사항이 성공적으로 저장되었습니다.',
    },
    email: {
      title: '이메일 주소가 업데이트되었습니다!',
      description: '계정의 이메일 주소가 성공적으로 변경되었습니다.',
    },
    phone: {
      title: '전화번호가 업데이트되었습니다!',
      description: '계정의 전화번호가 성공적으로 변경되었습니다.',
    },
    username: {
      title: 'Username updated!',
      description: "Your account's username has been successfully changed.",
    },
  },
};

export default Object.freeze(account_center);
