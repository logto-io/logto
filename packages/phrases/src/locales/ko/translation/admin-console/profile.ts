const profile = {
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
    enter_password: '비밀번호를 입력하세요',
    enter_password_subtitle: '계정 보안을 보호하기 위해 본인임을 인증하세요.',
    set_password: '비밀번호 설정',
    verify_via_password: '비밀번호로 인증',
    show_password: '비밀번호 보이기',
    required: '비밀번호 필요',
    min_length: '비밀번호는 최소 {{min}} 글자여야 해요.',
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
    dialog_paragraph_1:
      '계정을 삭제하시게 되어 유감입니다. 계정을 삭제하면 사용자 정보, 로그, 설정을 포함한 모든 데이터가 영구적으로 삭제되며, 이 작업은 되돌릴 수 없어요. 따라서 계속 진행하기 전에 중요한 데이터를 백업해 두세요.',
    dialog_paragraph_2:
      '계정 삭제 절차를 진행하려면 "Account Deletion Request"라는 제목으로 지원팀에 <a>메일</a>을 보내주세요. 당신의 모든 데이터가 시스템에서 올바르게 삭제될 수 있도록 도와드릴게요.',
    dialog_paragraph_3:
      'Logto Cloud를 선택해 주셔서 감사합니다. 추가 질문이나 우려 사항이 있으시면 언제든지 문의해 주세요.',
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
  email_changed: '이메일이 변경되었어요!',
  password_changed: '비밀번호가 변경되었어요!',
  updated: '{{target}}이/가 수정되었어요!',
  linked: '{{target}}이/가 연결되었어요!',
  unlinked: '{{target}}이/가 연결 해제되었어요!',
  email_exists_reminder:
    '이메일 {{email}}은/는 이미 존재하는 계정에 연결되어 있어요. 다른 이메일을 연결하세요.',
  unlink_confirm_text: '연결 해제',
  unlink_reminder:
    '연결을 해제하면 사용자들이 <span></span> 계정으로 로그인하지 못할 거예요. 정말로 진행할까요?',
};

export default profile;
