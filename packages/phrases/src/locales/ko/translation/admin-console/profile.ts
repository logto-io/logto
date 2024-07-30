const profile = {
  page_title: '계정 설정',
  title: '계정 설정',
  description: '계정 보안을 위해 여기에서 계정 설정을 변경하고 개인 정보를 관리하세요.',
  settings: {
    title: '프로필 설정',
    profile_information: '프로필 정보',
    avatar: '아바타',
    name: '이름',
    username: '사용자 이름',
  },
  link_account: {
    title: '계정 연동',
    email_sign_in: '이메일 로그인',
    email: '이메일',
    social_sign_in: '소셜 로그인',
    link_email: '이메일 연동',
    link_email_subtitle: '이메일을 연결하여 로그인하거나 계정을 복구할 때 도움을 받으세요.',
    email_required: '이메일 입력 필요',
    invalid_email: '잘못된 이메일 주소',
    identical_email_address: '입력한 이메일 주소가 현재 이메일 주소와 동일해요.',
    anonymous: '익명',
  },
  password: {
    title: '비밀번호 및 보안',
    password: '비밀번호',
    password_setting: '비밀번호 설정',
    new_password: '새 비밀번호',
    confirm_password: '비밀번호 확인',
    enter_password: '현재 비밀번호를 입력하세요',
    enter_password_subtitle:
      '계정 보안을 위해 본인 확인을 해주세요. 변경하기 전에 현재 비밀번호를 입력해주세요.',
    set_password: '비밀번호 설정',
    verify_via_password: '비밀번호로 인증',
    show_password: '비밀번호 보이기',
    required: '비밀번호 필요',
    do_not_match: '비밀번호가 일치하지 않아요. 다시 시도해 주세요.',
  },
  code: {
    enter_verification_code: '인증 코드 입력',
    enter_verification_code_subtitle: '인증 코드가 <strong>{{target}}</strong>(으)로 발송되었어요.',
    verify_via_code: '인증 코드로 인증하기',
    resend: '인증 코드 재전송',
    resend_countdown: '{{countdown}}초 후 재전송',
  },
  delete_account: {
    title: '계정 삭제',
    label: '계정 삭제',
    description:
      '계정을 삭제하면 모든 개인 정보, 사용자 데이터 및 설정이 삭제돼요. 이 작업은 되돌릴 수 없어요.',
    button: '계정 삭제',
    p: {
      has_issue:
        '계정을 삭제하려고 하신다니 유감이에요. 계정을 삭제하기 전에 다음 문제를 해결해야 해요.',
      after_resolved:
        '문제를 해결한 후 계정을 삭제할 수 있어요. 도움이 필요하면 주저하지 말고 연락 주세요.',
      check_information:
        '계정을 삭제하려고 하신다니 유감이에요. 진행하기 전에 다음 정보를 주의 깊게 확인해주세요.',
      remove_all_data:
        '계정을 삭제하면 Logto Cloud 에서 당신에 대한 모든 데이터가 영구적으로 삭제돼요. 중요한 데이터를 백업해주세요.',
      confirm_information:
        '위의 정보가 예상한 것인지 확인해주세요. 계정을 삭제하면 복구할 수 없어요.',
      has_admin_role: '다음 테넌트에서 관리자로 지정되어 있기 때문에, 계정과 함께 삭제될 거예요:',
      has_admin_role_other:
        '다음 테넌트에서 관리자로 지정되어 있기 때문에, 계정과 함께 삭제될 거예요:',
      quit_tenant: '다음 테넌트를 나가려고 합니다:',
      quit_tenant_other: '다음 테넌트를 나가려고 합니다:',
    },
    issues: {
      paid_plan: '다음 테넌트는 유료 플랜을 가지고 있으므로, 구독을 먼저 취소해야 해요:',
      paid_plan_other: '다음 테넌트들은 유료 플랜을 가지고 있으므로, 구독을 먼저 취소해야 해요:',
      subscription_status: '다음 테넌트는 구독 상태에 문제가 있어요:',
      subscription_status_other: '다음 테넌트들은 구독 상태에 문제가 있어요:',
      open_invoice: '다음 테넌트는 미결제 청구서가 있어요:',
      open_invoice_other: '다음 테넌트들은 미결제 청구서가 있어요:',
    },
    error_occurred: '오류가 발생했어요',
    error_occurred_description: '계정을 삭제하는 동안 문제가 발생했어요:',
    request_id: '요청 ID: {{requestId}}',
    try_again_later:
      '나중에 다시 시도해주세요. 문제가 지속되면 요청 ID 와 함께 Logto 팀에 문의하세요.',
    final_confirmation: '최종 확인',
    about_to_start_deletion: '삭제 과정을 시작하려하고 있으며 이 작업은 되돌릴 수 없어요.',
    permanently_delete: '영구적으로 삭제',
  },
  set: '설정',
  change: '변경',
  link: '연결',
  unlink: '연결 해제',
  not_set: '설정 안 됨',
  change_avatar: '아바타 변경',
  change_name: '이름 변경',
  change_username: '사용자 이름 변경',
  set_name: '이름 설정',
  email_changed: '이메일이 변경되었어요.',
  password_changed: '비밀번호가 변경되었어요.',
  updated: '{{target}}이/가 수정되었어요.',
  linked: '{{target}}이/가 연결되었어요.',
  unlinked: '{{target}}이/가 연결 해제되었어요.',
  email_exists_reminder:
    '이메일 {{email}}은/는 이미 존재하는 계정에 연결되어 있어요. 다른 이메일을 연결하세요.',
  unlink_confirm_text: '연결 해제',
  unlink_reminder:
    '연결을 해제하면 사용자들이 <span></span> 계정으로 로그인하지 못할 거예요. 정말로 진행할까요?',
};

export default Object.freeze(profile);
