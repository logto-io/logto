const user_details = {
  page_title: '사용자 세부 정보',
  back_to_users: '사용자 관리로 돌아가기',
  created_title: '새로운 사용자가 생성되었어요.',
  created_guide: '사용자가 로그인하는데 도움이 되는 정보를 확인해보세요.',
  created_email: '이메일 주소:',
  created_phone: '휴대전화 번호:',
  created_username: '사용자 이름:',
  created_password: '비밀번호:',
  menu_delete: '삭제',
  delete_description: '이 사용자를 영원히 삭제할까요? 이 행동은 취소될 수 없어요.',
  deleted: '해당 사용자가 성공적으로 삭제되었어요.',
  reset_password: {
    reset_title: '정말로 비밀번호를 초기화 할까요?',
    generate_title: '비밀번호를 생성하시겠습니까?',
    content: '정말로 비밀번호를 초기화 할까요? 이 행동은 취소될 수 없어요.',
    reset_complete: '해당 사용자의 비밀번호가 성공적으로 초기화 되었어요.',
    generate_complete: '비밀번호가 생성되었습니다',
    new_password: '새로운 비밀번호:',
    password: '비밀번호:',
  },
  tab_settings: '설정',
  tab_roles: '사용자 역할',
  tab_logs: '사용자 기록',
  tab_organizations: '조직',
  authentication: '인증',
  authentication_description:
    '각 사용자는 모든 사용자 정보를 포함하는 프로파일을 가지고 있어요. 프로파일은 기본 데이터, 소셜 ID, 사용자 정의 데이터로 구성되어 있어요.',
  user_profile: '사용자 프로필',
  field_email: '이메일 주소',
  field_phone: '휴대전화 번호',
  field_username: '사용자 이름',
  field_password: '비밀번호',
  field_name: '이름',
  field_avatar: '아바타 이미지 URL',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: '사용자 정의 데이터',
  field_custom_data_tip:
    '사용자 정의 색상 및 언어와 같은 미리 정의되지 않은 추가적인 사용자의 정보를 의미해요.',
  field_profile: '프로필',
  field_profile_tip:
    '사용자 속성에 포함되지 않은 추가 OpenID Connect 표준 클레임입니다. 모든 알 수 없는 속성은 제거됩니다. 자세한 내용은 <a>프로필 속성 참조</a>를 참조하세요.',
  field_connectors: '연동된 소셜',
  field_sso_connectors: '기업 연결',
  custom_data_invalid: '사용자 정의 데이터는 반드시 유효한 JSON 객체여야 해요.',
  profile_invalid: '프로필은 유효한 JSON 객체여야 해요',
  password_already_set: '비밀번호가 이미 설정되었습니다',
  no_password_set: '비밀번호가 설정되지 않았습니다',
  connectors: {
    connectors: '연동',
    user_id: '사용자 ID',
    remove: '삭제',
    connected: '이 사용자는 여러 소셜 연동에 연결되어 있어요.',
    not_connected: '이 사용자는 아직 소셜에 연동되지 않았아요.',
    deletion_confirmation: '기존 <name/> 신원을 제거하고 있습니다. 계속 진행하시겠습니까?',
  },
  sso_connectors: {
    connectors: '연결',
    enterprise_id: '기업 ID',
    connected: '이 사용자는 단일 로그인을 위한 여러 기업 신원 제공자에 연결되어 있어요.',
    not_connected: '이 사용자는 단일 로그인을 위한 어떤 기업 신원 제공자에도 연결되어 있지 않아요.',
  },
  mfa: {
    field_name: '다단계 인증',
    field_description: '이 사용자는 2단계 인증 요소를 활성화했습니다.',
    name_column: '다단계 인증',
    field_description_empty: '이 사용자는 2단계 인증 요소를 활성화하지 않았습니다.',
    deletion_confirmation:
      '기존의 2단계 인증에서 <name/>을(를) 제거하고 있습니다. 계속 진행하시겠습니까?',
  },
  suspended: '정지됨',
  suspend_user: '사용자 정지',
  suspend_user_reminder:
    '이 사용자를 정지하시겠습니까? 사용자는 앱에 로그인할 수 없으며 현재 액세스 토큰이 만료된 후 새 액세스 토큰을 얻을 수 없게 됩니다. 또한 이 사용자가 수행한 모든 API 요청이 실패합니다.',
  suspend_action: '정지',
  user_suspended: '사용자가 정지되었습니다.',
  reactivate_user: '사용자 재활성화',
  reactivate_user_reminder:
    '이 사용자를 다시 활성화하시겠습니까? 이렇게 하면이 사용자에 대한 로그인 시도가 허용됩니다.',
  reactivate_action: '재활성화',
  user_reactivated: '사용자가 재활성화되었습니다.',
  roles: {
    name_column: '사용자 역할',
    description_column: '설명',
    assign_button: '역할 할당',
    delete_description:
      '이 행동은 사용자에게서 이 역할을 삭제할 거예요. 역할은 그대로 존재하지만, 이 사용자에게 더 이상 할당되지 않아요.',
    deleted: '{{name}}이/가 성공적으로 이 사용자에게서 제거되었어요.',
    assign_title: '{{name}}에게 역할 할당',
    assign_subtitle: '이름, 설명 또는 역할 ID로 검색하여 적절한 사용자 역할을 찾으세요.',
    assign_role_field: '역할 할당',
    role_search_placeholder: '역할 이름으로 검색',
    added_text: '{{value, number}}이/가 추가되었어요',
    assigned_user_count: '사용자 {{value, number}}명',
    confirm_assign: '역할 할당',
    role_assigned: '역할을 성공적으로 할당했어요',
    search: '역할 이름, 설명, ID로 검색',
    empty: '역할 없음',
  },
  warning_no_sign_in_identifier:
    '사용자는 로그인 식별자(사용자 이름, 이메일, 전화 번호 또는 소셜) 중 적어도 하나를 갖고 로그인해야 합니다. 계속 하시겠습니까?',
  personal_access_tokens: {
    title: '개인 액세스 토큰',
    title_other: '개인 액세스 토큰들',
    title_short: '토큰',
    empty: '사용자에게 개인 액세스 토큰이 없습니다.',
    create: '새로운 토큰 생성',
    tip: '개인 액세스 토큰(PAT)은 사용자가 자격 증명과 상호작용 로그인을 사용하지 않고 액세스 토큰을 부여할 수 있는 안전한 방법을 제공합니다. 이는 CI/CD, 스크립트 또는 프로그램으로 리소스에 접근해야 하는 애플리케이션에 유용합니다.',
    value: '값',
    created_at: '생성 시각',
    expires_at: '만료 시각',
    never: '만료되지 않음',
    create_new_token: '새로운 토큰 생성',
    delete_confirmation: '이 작업은 되돌릴 수 없습니다. 이 토큰을 정말 삭제하시겠습니까?',
    expired: '만료됨',
    expired_tooltip: '이 토큰은 {{date}}에 만료되었습니다.',
    create_modal: {
      title: '개인 액세스 토큰 생성',
      expiration: '만료',
      expiration_description: '토큰은 {{date}}에 만료됩니다.',
      expiration_description_never:
        '토큰은 절대 만료되지 않습니다. 보안을 강화하기 위해 만료 날짜를 설정할 것을 권장합니다.',
      days: '{{count}} 일',
      days_other: '{{count}} 일',
      created: '토큰 {{name}}이/가 성공적으로 생성되었습니다.',
    },
    edit_modal: {
      title: '개인 액세스 토큰 편집',
      edited: '토큰 {{name}}이/가 성공적으로 편집되었습니다.',
    },
  },
  connections: {
    /** UNTRANSLATED */
    title: 'Connection',
    /** UNTRANSLATED */
    description:
      'The user links third-party accounts for social sign-in, enterprise SSO, or resources access.',
    /** UNTRANSLATED */
    token_status_column: 'Token status',
    token_status: {
      /** UNTRANSLATED */
      active: 'Active',
      /** UNTRANSLATED */
      expired: 'Expired',
      /** UNTRANSLATED */
      inactive: 'Inactive',
      /** UNTRANSLATED */
      not_applicable: 'Not applicable',
      /** UNTRANSLATED */
      available: 'Available',
      /** UNTRANSLATED */
      not_available: 'Not available',
    },
  },
};

export default Object.freeze(user_details);
