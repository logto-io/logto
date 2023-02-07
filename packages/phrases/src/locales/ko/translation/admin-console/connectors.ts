const connectors = {
  title: '연동',
  subtitle: '연동을 통해 비밀번호 없는 로그인이나 소셜 로그인을 제공해 보세요.',
  create: '소셜 연동 추가',
  config_sie_notice:
    '새로운 연동이 설정되었어요. 다음 링크에서 설정을 마무리해 주세요. <a>{{link}}</a>.',
  config_sie_link_text: '로그인 경험',
  tab_email_sms: '이메일/SMS 연동',
  tab_social: '소셜 연동',
  connector_name: '연동 이름',
  connector_type: '종류',
  connector_status: '로그인 경험',
  connector_status_in_use: '사용 중',
  connector_status_not_in_use: '사용 중이 아님',
  not_in_use_tip: {
    content:
      '사용 중이 아님은 로그인 환경에서 이 로그인 방법을 사용하지 않았음을 의미해요. <a>{{link}}</a> 이 로그인 방법을 추가해주세요.',
    go_to_sie: '로그인 경험으로 가서',
  },
  social_connector_eg: '예) Google, Facebook, Github',
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
    subtitle: '단계별 가이드를 따라, 연동해 주세요.',
    connector_setting: '연동 설정',
    name: '연동 이름',
    name_tip: '다음과 같이 연동 이름이 출력돼요. "{{name}}으로 계속하기".',
    logo: '연동 로고 URL',
    logo_placeholder: 'https://your.cdn.domain/logo.png',
    logo_tip: '이 이미지는 연동 버튼에 보여질 거에요.',
    logo_dark: '연동 로고 URL (다크 모드)',
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png',
    logo_dark_tip:
      'Admin Console의 로그인 경험에서 다크 모드를 위한 로고를 활성화한 후 다크 모드용 연동 로고를 설정해 주세요.',
    logo_dark_collapse: '최소화',
    logo_dark_show: '다크 모드를 위한 로고 설정 보이기',
    target: '연동 ID 대상',
    target_tip: '연동의 고유 식별자.',
    target_tooltip:
      'Logto의 소셜 연동에서의 "목표"는 소셜 정보의 원천을 뜻해요. Logto의 디자인은 충돌을 피하기 위해서 같은 "목표"를 허용하지 않아요. 연동을 추가한 후에는 값을 변경할 수 없으므로 주의해주세요. <a>자세히 알아보기</a>',
    config: '여기에 JSON을 입력',
    sync_profile: '프로필 정보 동기화',
    sync_profile_only_at_sign_up: '회원가입할 때 동기화',
    sync_profile_each_sign_in: '로그인할 때마다 동기화',
    sync_profile_tip: '이름과 아바타와 같은 기본적인 사용자 프로필을 동기화해요.',
  },
  platform: {
    universal: 'Universal',
    web: 'Web',
    native: 'Native',
  },
  add_multi_platform: ' 다양한 플랫폼 지원, 플랫폼을 선택해주세요.',
  drawer_title: '연동 가이드',
  drawer_subtitle: '연동하기 위해 가이드를 따라 주세요.',
  unknown: '알 수 없는 연동',
};

export default connectors;
