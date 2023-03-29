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
    identifier_description:
      '회원가입 ID는 계정을 생성하기 위해 필수이며, 회원가입 화면에서 반드시 포함되어야 해요.',
    sign_up_authentication: '회원가입 인증 설정',
    authentication_description: '선택된 모든 작업들은 사용자가 모두 마무리해야 해요.',
    set_a_password_option: '비밀번호 생성',
    verify_at_sign_up_option: '회원가입 인증',
    social_only_creation_description: '(이것은 소셜 전용 계정 생성에 적용돼요.)',
  },
  sign_in: {
    title: '로그인',
    sign_in_identifier_and_auth: '로그인을 위한 ID 그리고 인증 설정',
    description:
      '사용자는 주어진 옵션 중에 아무 방법으로 로그인할 수 있어요. 주어진 옵션을 드래그하여 조절해 주세요.',
    add_sign_in_method: '로그인 방법 추가',
    password_auth: '비밀번호',
    verification_code_auth: '인증 코드',
    auth_swap_tip: '아래 옵션을 변경하여 흐름에 가장 먼저 나타나는 옵션을 설정할 수 있어요.',
    require_auth_factor: '반드시 최소 하나의 인증 방법을 선택해야 해요.',
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
  },
  tip: {
    set_a_password: '사용자 이름에 대한 고유한 암호 집합은 필수예요.',
    verify_at_sign_up:
      '현재 확인된 이메일만 지원해요. 유효성 검사가 없는 경우 사용자 기반에 품질이 낮은 전자 메일 주소가 많이 포함되어 있을 수 있어요.',
    password_auth:
      '회원가입 중에 비밀번호를 설정하는 옵션을 사용으로 설정했기 때문에 이 옵션은 필수예요.',
    verification_code_auth:
      '가입 시 인증 코드를 제공하는 옵션만 활성화했기 때문에 이것은 필수예요. 회원가입에서 비밀번호 설정이 허용되면 이 옵션을 취소할 수 있어요.',
    delete_sign_in_method: '{{identifier}}를 필수 ID로 설정했기 때문에 이 옵션은 필수예요.',
  },
};

export default sign_up_and_sign_in;
