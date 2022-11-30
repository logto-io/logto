const connectors = {
  title: '연동',
  subtitle: '비밀번호 없이 또는 소셜 로그인을 제공하여 보다 나은 경험을 위해 연동해주세요.',
  create: '소셜 연동 추가',
  config_sie_notice: 'You’ve set up connectors. Make sure to configure it in <a>{{link}}</a>.', // UNTRANSLATED
  config_sie_link_text: 'sign in experience', // UNTRANSLATED
  tab_email_sms: '이메일/SMS 연동',
  tab_social: '소셜 연동',
  connector_name: '연동 이름',
  connector_type: '종류',
  connector_status: '로그인 경험',
  connector_status_in_use: '사용 중',
  connector_status_not_in_use: '사용 중이 아님',
  not_in_use_tip: {
    content:
      'Not in use means your sign in experience hasn’t used this sign in method. <a>{{link}}</a> to add this sign in method. ', // UNTRANSLATED
    go_to_sie: 'Go to sign in experience', // UNTRANSLATED
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
    subtitle: '단계별 가이드를 따라, 연동해주세요.',
    connector_setting: 'Connector setting', // UNTRANSLATED
    name: 'Connector name', // UNTRANSLATED
    name_tip: 'Connector button’s name will display as "Continue with {{Connector Name}}".', // UNTRANSLATED
    logo: 'Connector logo URL', // UNTRANSLATED
    logo_placelholder: 'https://your.cdn.domain/logo.png', // UNTRANSLATED
    logo_tip: 'The logo image will also display on the connector button.', // UNTRANSLATED
    logo_dark: 'Connector logo URL (Dark mode)', // UNTRANSLATED
    logo_dark_placelholder: 'https://your.cdn.domain/logo.png', // UNTRANSLATED
    logo_dark_tip:
      'This will be used when opening “Enable dark mode” in the setting of sign in experience.', // UNTRANSLATED
    logo_dark_collapse: 'Collapse', // UNTRANSLATED
    logo_dark_show: 'Show "Logo for dark mode"', // UNTRANSLATED
    target: 'Connector identity target', // UNTRANSLATED
    target_tip: 'A unique identifier for the connector.', // UNTRANSLATED
    config: 'Enter your JSON here', // UNTRANSLATED
  },
  platform: {
    universal: 'Universal',
    web: 'Web',
    native: 'Native',
  },
  add_multi_platform: ' 다양한 플랫폼 지원, 플랫폼을 선택해주세요.',
  drawer_title: '연동 가이드',
  drawer_subtitle: '연동하기 위해 가이드를 따라주세요.',
};

export default connectors;
