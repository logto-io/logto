const connectors = {
  page_title: '연동',
  title: '연동',
  subtitle: '연동을 통해 비밀번호 없는 로그인이나 소셜 로그인을 제공해 보세요.',
  create: '소셜 연동 추가',
  config_sie_notice:
    '새로운 연동이 설정되었어요. 다음 링크에서 설정을 마무리해 주세요. <a>{{link}}</a>.',
  config_sie_link_text: '로그인 경험',
  tab_email_sms: '이메일/SMS 연동',
  tab_social: '소셜 연동',
  connector_name: '연동 이름',
  demo_tip:
    '이 데모 연동에 허용되는 최대 메시지 수는 100개로 제한되며 실제 운영 환경에서의 배포에는 권장되지 않아요.',
  social_demo_tip:
    '데모 연동은 데모 전용으로 설계되었으며 실제 운영 환경에 배포하는 것은 권장되지 않습니다.',
  connector_type: '종류',
  connector_status: '로그인 경험',
  connector_status_in_use: '사용 중',
  connector_status_not_in_use: '사용 중이 아님',
  not_in_use_tip: {
    content:
      '사용 중이 아님은 로그인 환경에서 이 로그인 방법을 사용하지 않았음을 의미해요. <a>{{link}}</a> 이 로그인 방법을 추가해주세요.',
    go_to_sie: '로그인 경험으로 가서',
  },
  placeholder_title: '소셜 연동',
  placeholder_description:
    'Logto는 널리 사용되는 다양한 소셜 로그인 커넥터를 제공하고 있으며, 표준 프로토콜을 사용하여 자신만의 커넥터를 만들 수도 있어요.',
  save_and_done: '저장 및 완료',
  type: {
    email: '이메일 연동',
    sms: 'SMS 연동',
    social: '소셜 연동',
  },
  setup_title: {
    email: '이메일 연동 설정',
    sms: 'SMS 연동 설정',
    social: '소셜 연동 추가 및 설정',
  },
  guide: {
    subtitle: '단계별 가이드를 따라 연동해 주세요.',
    general_setting: '일반 설정',
    parameter_configuration: '매개변수 설정',
    test_connection: '연결 테스트',
    name: '소셜 로그인 버튼 이름',
    name_placeholder: '소셜 로그인 버튼 이름을 입력하세요',
    name_tip: '다음과 같이 연동 이름이 출력돼요. "{{name}}으로 계속하기".',
    logo: '연동 로고 URL',
    logo_placeholder: 'https://your.cdn.domain/logo.png',
    logo_tip: '이 이미지는 연동 버튼에 보여질 거에요.',
    logo_dark: '소셜 로그인에 사용될 로고 URL (다크 모드)',
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png',
    logo_dark_tip:
      '관리자 콘솔의 로그인 경험에서 다크 모드를 위한 로고를 활성화한 후 다크 모드용 연동 로고를 설정해 주세요.',
    logo_dark_collapse: '최소화',
    logo_dark_show: '다크 모드를 위한 로고 설정 보이기',
    target: '연동 ID 공급자',
    target_placeholder: '연동 ID 공급자 이름을 입력하세요',
    target_tip: '"IdP 이름"의 값은 소셜 식별자를 구분하기 위한 고유 식별자 문자열이 될 수 있어요.',
    target_tip_standard:
      '"IdP 이름"의 값은 소셜 식별자를 구분하기 위한 고유 식별자 문자열이 될 수 있어요. 이 설정은 연동이 만들어진 후에는 변경할 수 없어요.',
    target_tooltip:
      'Logto의 소셜 연동에서의 "공급자"는 소셜 정보의 원천을 뜻해요. Logto의 디자인은 충돌을 피하기 위해서 같은 "공급자"를 허용하지 않아요. 연동을 추가한 후에는 값을 변경할 수 없으므로 주의해주세요. <a>자세히 알아보기</a>',
    target_conflict:
      '입력한 IdP 이름이 기존 <span>name</span>과 일치해요. 동일한 IdP 이름을 사용하면 사용자가 두 개의 다른 커넥터를 통해 동일한 계정에 액세스할 수 있는 예기치 않은 로그인 동작이 발생할 수 있어요.',
    target_conflict_line2:
      '현재 연동을 동일한 ID 공급자로 바꾸고 이전 사용자가 다시 등록하지 않고도 로그인할 수 있도록 하려면 <span>name</span> 커넥터를 삭제하고 동일한 "IdP 이름"으로 새 커넥터를 만드세요.',
    target_conflict_line3: '다른 ID 공급자에 연결하려면 "IdP 이름"을 수정한 후 계속 진행하세요.',
    config: '여기에 JSON을 입력',
    sync_profile: '프로필 정보 동기화',
    sync_profile_only_at_sign_up: '회원가입할 때 동기화',
    sync_profile_each_sign_in: '로그인할 때마다 동기화',
    sync_profile_tip: '이름과 아바타와 같은 기본적인 사용자 프로필을 동기화해요.',
    callback_uri: 'Callback URI',
    callback_uri_description:
      '리다이렉트 URI라고도 불려요. 사용자의 소셜 인증 이후 되돌아올 Logto URI예요. 소셜 공급자의 설정 페이지에 붙여넣으세요.',
    acs_url: '단언 소비 서비스 URL',
  },
  platform: {
    universal: '일반',
    web: '웹',
    native: '네이티브',
  },
  add_multi_platform: ' 다양한 플랫폼 지원, 플랫폼을 선택해주세요.',
  drawer_title: '연동 가이드',
  drawer_subtitle: '연동하기 위해 가이드를 따라 주세요.',
  unknown: '알 수 없는 연동',
  standard_connectors: '기본 커넥터',
};

export default Object.freeze(connectors);
