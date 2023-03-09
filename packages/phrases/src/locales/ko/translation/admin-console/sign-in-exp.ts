const sign_in_exp = {
  title: '로그인 경험',
  description: '로그인 화면을 브랜드에 맞게 커스터마이징하고 실시간으로 확인해 보세요.',
  tabs: {
    branding: '브랜딩',
    sign_up_and_sign_in: '회원가입/로그인',
    others: '기타',
  },
  welcome: {
    title: 'Customize sign-in experience', // UNTRANSLATED
    description:
      'Get started fast with your first sign-in setup. This guide walks you through all the necessary settings.', // UNTRANSLATED
    get_started: '시작하기',
    apply_remind: '이 계정이 관리하는 모든 앱의 로그인 경험이 수정되는 것을 주의해 주세요.',
  },
  color: {
    title: '색상',
    primary_color: '브랜드 색상',
    dark_primary_color: '브랜드 색상 (다크 모드)',
    dark_mode: '다크 모드 활성화',
    dark_mode_description: 'Logto가 브랜드 색상에 알맞게 자동으로 다크 모드 테마를 생성해요.',
    dark_mode_reset_tip: '브랜드 색상에 알맞게 다크 모드 색상 재생성',
    reset: '재생성',
  },
  branding: {
    title: '브랜딩 영역',
    ui_style: '스타일',
    favicon: 'Browser favicon', // UNTRANSLATED
    logo_image_url: '앱 로고 이미지 URL',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: '앱 로고 이미지 URL (다크 모드)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
  },
  sign_up_and_sign_in: {
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
      authentication_description: '선택된 모든 작업들은 사용자가 모두 마무리 해야 해요.',
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
        '설정된 필수 ID에 따라서, 사용자가 소셜 연동을 통해 회원가입, 로그인을 할 수 있어요.',
      add_social_connector: '소셜 연동으로',
      set_up_hint: {
        not_in_list: '리스트에 없나요?',
        set_up_more: '설정하기',
        go_to: '다른 소셜 연동으로',
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
  },
  others: {
    terms_of_use: {
      title: '이용 약관',
      terms_of_use: '이용 약관',
      terms_of_use_placeholder: 'https://your.terms.of.use/',
      terms_of_use_tip: '이용 약관 URL',
      privacy_policy: '개인정보 처리방침',
      privacy_policy_placeholder: 'https://your.privacy.policy/',
      privacy_policy_tip: '개인정보 처리방침 URL',
    },
    languages: {
      title: '언어',
      enable_auto_detect: '자동 감지 활성화',
      description:
        '사용자의 언어 설정을 감지하고, 해당 언어로 자동으로 변경해요. 직접 번역하여 새로운 언어를 추가할 수도 있어요.',
      manage_language: '언어 관리',
      default_language: '기본 언어',
      default_language_description_auto:
        '사용자의 언어를 지원하지 않을 경우, 기본 언어로 사용자에게 보여줘요.',
      default_language_description_fixed:
        '자동 감지가 꺼져있을 경우, 기본 언어로만 사용자에게 보여줘요. 더욱 나은 경험을 위해, 자동 감지를 켜 주세요.',
    },
    manage_language: {
      title: '언어 관리',
      subtitle:
        '언어와 번역을 추가하여 제품 경험을 현지화해요. 사용자의 기여를 기본 언어로 설정할 수 있어요.',
      add_language: '언어 추가',
      logto_provided: 'Logto 제공',
      key: '키',
      logto_source_values: 'Logto 소스 값',
      custom_values: '사용자 정의 값',
      clear_all_tip: '모든 값 삭제',
      unsaved_description: '이 페이지를 벗어날 경우, 변경점이 적용되지 않아요.',
      deletion_tip: '언어 삭제',
      deletion_title: '추가된 언어를 삭제할까요?',
      deletion_description: '삭제된 후에 사용자들이 더 이상 해당 언어로 볼 수 없어요.',
      default_language_deletion_title: '기본 언어는 삭제할 수 없어요.',
      default_language_deletion_description:
        '{{language}} 언어는 기본 언어로 설정되어 있어요. 기본 언어를 변경한 후에 삭제할 수 있어요.',
    },
    advanced_options: {
      title: '고급 옵션',
      enable_user_registration: '회원가입 활성화',
      enable_user_registration_description:
        '사용자 등록을 활성화하거나 비활성화해요. 비활성화된 후에도 사용자를 관리 콘솔에서 추가할 수 있지만 사용자는 더 이상 로그인 UI를 통해 계정을 설정할 수 없어요.',
    },
  },
  setup_warning: {
    no_connector_sms:
      'SMS 연동 설정이 아직 없어요. SMS 연동 구성을 완료할 때까지 로그인할 수 없어요. <a>{{link}}</a> "연동"으로',
    no_connector_email:
      '이메일 연동 설정이 아직 없어요. 이메일 연동 구성을 완료할 때까지 로그인할 수 없어요. <a>{{link}}</a> "연동"으로',
    no_connector_social:
      '소셜 연동 설정이 아직 없어요. 소셜 연동 구성을 완료할 때까지 로그인할 수 없어요. <a>{{link}}</a> "연동"으로',
    no_added_social_connector:
      '보다 많은 소셜 연동들을 설정하여, 고객에게 보다 나은 경험을 제공해보세요.',
    setup_link: '설정',
  },
  save_alert: {
    description:
      '새 로그인 및 회원가입 방법을 추가하고 있어요. 모든 사용자가 새 설정의 영향을 받을 수 있어요. 정말로 추가할까요?',
    before: '이전',
    after: '이후',
    sign_up: '회원가입',
    sign_in: '로그인',
    social: '소셜',
  },
  preview: {
    title: '로그인 화면 미리보기',
    live_preview: 'Live preview', // UNTRANSLATED
    live_preview_tip: 'Save to preview changes', // UNTRANSLATED
    native: 'Native',
    desktop_web: 'Desktop 웹',
    mobile_web: 'Mobile 웹',
  },
};

export default sign_in_exp;
