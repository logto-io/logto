const sign_up_and_sign_in = {
  identifiers_email: '이메일 주소',
  identifiers_phone: '휴대전화번호',
  identifiers_username: '사용자 이름',
  identifiers_email_or_sms: '이메일 주소 또는 휴대전화번호',
  identifiers_none: '해당 없음',
  and: '그리고',
  or: '또는',
  sign_up: {
    title: '회원가입',
    sign_up_identifier: '회원가입 ID',
    identifier_description: '새 계정을 만들 때 모든 선택한 회원가입 식별자가 필요합니다.',
    sign_up_authentication: '회원가입 인증 설정',
    verification_tip:
      '사용자는 회원가입 시 인증 코드를 입력하여 설정한 이메일 또는 전화번호를 인증해야 합니다.',
    authentication_description: '선택된 모든 작업들은 사용자가 모두 마무리해야 해요.',
    set_a_password_option: '비밀번호 생성',
    verify_at_sign_up_option: '회원가입 인증',
    social_only_creation_description: '(이것은 소셜 전용 계정 생성에 적용돼요.)',
  },
  sign_in: {
    title: '로그인',
    sign_in_identifier_and_auth: '로그인을 위한 ID 그리고 인증 설정',
    description: '사용자는 주어진 옵션 중에 아무 방법으로 로그인할 수 있어요. ',
    add_sign_in_method: '로그인 방법 추가',
    add_sign_up_method: '회원가입 방법 추가',
    password_auth: '비밀번호',
    verification_code_auth: '인증 코드',
    auth_swap_tip: '아래 옵션을 변경하여 흐름에 가장 먼저 나타나는 옵션을 설정할 수 있어요.',
    require_auth_factor: '반드시 최소 하나의 인증 방법을 선택해야 해요.',
    forgot_password_verification_method: '비밀번호 찾기 인증 방법',
    forgot_password_description:
      '사용자는 사용 가능한 인증 방법을 사용하여 비밀번호를 재설정할 수 있습니다.',
    add_verification_method: '인증 방법 추가',
    email_verification_code: '이메일 인증 코드',
    phone_verification_code: '전화 인증 코드',
  },
  social_sign_in: {
    title: '소셜 로그인',
    social_sign_in: '소셜 로그인',
    description:
      '설정된 필수 ID에 따라서 사용자가 소셜 연동을 통해 회원가입, 로그인을 할 수 있어요.',
    add_social_connector: '소셜 연동으로',
    set_up_hint: {
      not_in_list: '리스트에 없나요?',
      set_up_more: '다른 소셜 연동',
      go_to: '을 설정해 보세요.',
    },
    automatic_account_linking: '자동 계정 연결',
    automatic_account_linking_label:
      '활성화되면 사용자가 새 시스템에서 소셜 ID로 로그인할 때 동일한 식별자(예: 이메일)를 가지고 있는 기존 계정이 하나만 있을 경우 Logto가 사용자에게 계정 연결을 요청하는 대신 자동으로 소셜 ID와 계정을 연결합니다.',
  },
  tip: {
    set_a_password: '사용자 이름에 대한 고유한 암호 집합은 필수예요.',
    verify_at_sign_up:
      '현재 확인된 이메일만 지원해요. 유효성 검사가 없는 경우 사용자 기반에 품질이 낮은 전자 메일 주소가 많이 포함되어 있을 수 있어요.',
    password_auth:
      '회원가입 중에 비밀번호를 설정하는 옵션을 사용으로 설정했기 때문에 이 옵션은 필수예요.',
    verification_code_auth:
      '가입 시 인증 코드를 제공하는 옵션만 활성화했기 때문에 이것은 필수예요. 회원가입에서 비밀번호 설정이 허용되면 이 옵션을 취소할 수 있어요.',
    email_mfa_enabled:
      '이메일 인증 코드는 이미 MFA에 사용되고 있어 주 인증 방법으로 재사용할 수 없습니다.',
    phone_mfa_enabled:
      '전화 인증 코드는 이미 MFA에 사용되고 있어 주 인증 방법으로 재사용할 수 없습니다.',
    delete_sign_in_method: '{{identifier}}를 필수 ID로 설정했기 때문에 이 옵션은 필수예요.',
    password_disabled_notification:
      '\'사용자 이름으로 회원가입할 때 "비밀번호 생성" 옵션이 비활성화되어 있어 사용자가 로그인하지 못할 수 있습니다. 저장을 진행하시겠습니까?\'',
  },
  advanced_options: {
    title: '고급 옵션',
    enable_single_sign_on: 'Enterprise Single Sign-On (SSO) 활성화',
    enable_single_sign_on_description:
      '회사 신원 정보와 함께 Single Sign-On을 사용하여 애플리케이션에 로그인할 수 있도록 합니다.',
    single_sign_on_hint: {
      prefix: '다음 위치로 이동: ',
      link: '"기업 SSO"',
      suffix: '영역에서 사업체 커넥터를 추가 설정하세요.',
    },
    enable_user_registration: '사용자 등록 활성화',
    enable_user_registration_description:
      '사용자 등록을 활성화하거나 비활성화합니다. 비활성화된 경우 사용자는 관리 콘솔에서는 추가할 수 있지만 사용자는 더 이상 로그인 UI를 통해 계정을 설정할 수 없습니다.',
    unknown_session_redirect_url: '알 수 없는 세션 리다이렉트 URL',
    unknown_session_redirect_url_tip:
      '때때로 Logto는 로그인 페이지에서 사용자의 세션을 인식하지 못할 수 있어요. 예를 들어 세션이 만료되었거나 사용자가 로그인 링크를 즐겨찾기하거나 공유한 경우입니다. 기본적으로는 "알 수 없는 세션" 404 오류가 나타납니다. 사용자 경험을 향상시키기 위해, 대체 URL을 설정하여 사용자들이 다시 앱으로 리다이렉트되어 인증을 재시작할 수 있게 하세요.',
  },
};

export default Object.freeze(sign_up_and_sign_in);
