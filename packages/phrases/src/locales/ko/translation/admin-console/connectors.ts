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
  demo_tip:
    'The demo connector is designed exclusively for demonstration purposes and is not recommended for deployment in a production environment.', // UNTRANSLATED
  connector_type: '종류',
  connector_status: '로그인 경험',
  connector_status_in_use: '사용 중',
  connector_status_not_in_use: '사용 중이 아님',
  not_in_use_tip: {
    content:
      '사용 중이 아님은 로그인 환경에서 이 로그인 방법을 사용하지 않았음을 의미해요. <a>{{link}}</a> 이 로그인 방법을 추가해주세요.',
    go_to_sie: '로그인 경험으로 가서',
  },
  placeholder_title: 'Social connector', // UNTRANSLATED
  placeholder_description:
    'Logto has provided many widely used social sign-in connectors meantime you can create your own with standard protocols.', // UNTRANSLATED
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
    general_setting: 'General settings', // UNTRANSLATED
    parameter_configuration: 'Parameter configuration', // UNTRANSLATED
    test_connection: 'Test connection', // UNTRANSLATED
    name: 'Name for social sign-in button', // UNTRANSLATED
    name_placeholder: 'Enter name for social sign-in button', // UNTRANSLATED
    name_tip: '다음과 같이 연동 이름이 출력돼요. "{{name}}으로 계속하기".',
    logo: '연동 로고 URL',
    logo_placeholder: 'https://your.cdn.domain/logo.png',
    logo_tip: '이 이미지는 연동 버튼에 보여질 거에요.',
    logo_dark: 'Logo URL for social sign-in button (Dark mode)', // UNTRANSLATED
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png',
    logo_dark_tip:
      'Admin Console의 로그인 경험에서 다크 모드를 위한 로고를 활성화한 후 다크 모드용 연동 로고를 설정해 주세요.',
    logo_dark_collapse: '최소화',
    logo_dark_show: '다크 모드를 위한 로고 설정 보이기',
    target: '연동 ID 대상',
    target_placeholder: 'Enter connector identity provider name', // UNTRANSLATED
    target_tip:
      'The value of “IdP name” can be a unique identifier string to distinguish your social identifies. This setting cannot be changed after the connector is built.', // UNTRANSLATED
    target_tooltip:
      'Logto의 소셜 연동에서의 "목표"는 소셜 정보의 원천을 뜻해요. Logto의 디자인은 충돌을 피하기 위해서 같은 "목표"를 허용하지 않아요. 연동을 추가한 후에는 값을 변경할 수 없으므로 주의해주세요. <a>자세히 알아보기</a>',
    target_conflict:
      'The IdP name entered matches the existing <span>name</span>. Using the same idp name may cause unexpected sign-in behavior where users may access the same account through two different connectors.', // UNTRANSLATED
    target_conflict_line2:
      'If you\'d like to replace the current connector with the same identity provider and allow previous users to sign in without registering again, please delete the <span>name</span> connector and create a new one with the same "IdP name".', // UNTRANSLATED
    target_conflict_line3:
      'If you\'d like to connect to a different identity provider, please modify the "IdP name" and proceed.', // UNTRANSLATED
    config: '여기에 JSON을 입력',
    sync_profile: '프로필 정보 동기화',
    sync_profile_only_at_sign_up: '회원가입할 때 동기화',
    sync_profile_each_sign_in: '로그인할 때마다 동기화',
    sync_profile_tip: '이름과 아바타와 같은 기본적인 사용자 프로필을 동기화해요.',
    callback_uri: 'Callback URI', // UNTRANSLATED
    callback_uri_description:
      "Also called redirect URI, is the URI in Logto where users will be sent back after social authorization, copy and paste to the social provider's config page.", // UNTRANSLATED
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
