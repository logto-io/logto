import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: '로그인 경험',
  title: '로그인 경험',
  description: '로그인 화면을 브랜드에 맞게 사용자화하고 실시간으로 확인해 보세요.',
  tabs: {
    branding: '브랜딩',
    sign_up_and_sign_in: '회원가입/로그인',
    content: '내용',
    password_policy: '암호 정책',
  },
  welcome: {
    title: '로그인 경험 사용자화',
    description:
      '첫 로그인 설정으로 빠르게 시작하세요. 이 가이드가 필요한 모든 설정에 대해 안내할 거예요.',
    get_started: '시작하기',
    apply_remind: '이 계정이 관리하는 모든 앱의 로그인 경험이 수정되는 것을 주의해 주세요.',
  },
  color: {
    title: '색상',
    primary_color: '브랜드 색상',
    dark_primary_color: '브랜드 색상 (다크 모드)',
    dark_mode: '다크 모드 활성화',
    dark_mode_description: 'Logto가 브랜드 색상에 알맞게 자동으로 다크 모드 테마를 생성해요.',
    dark_mode_reset_tip: '브랜드 색상에 알맞게 다크 모드 색상',
    reset: '재생성',
  },
  branding: {
    title: '브랜딩 영역',
    ui_style: '스타일',
    favicon: '파비콘',
    logo_image_url: '앱 로고 이미지 URL',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: '앱 로고 이미지 URL (다크 모드)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    logo_image: '앱 로고',
    dark_logo_image: '앱 로고 (다크 모드)',
    logo_image_error: '앱 로고: {{error}}',
    favicon_error: '파비콘: {{error}}',
  },
  custom_css: {
    title: '사용자 정의 CSS',
    css_code_editor_title: '사용자 정의 CSS로 UI 개인화',
    css_code_editor_description1: '사용자 정의 CSS의 예시를 확인하세요.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: '더 알아보기',
    css_code_editor_content_placeholder:
      '사용자 정의 CSS를 입력하여 원하는 대로 스타일을 조정할 수 있어요. 창의성을 표현하고 UI를 돋보이게 만드세요.',
  },
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      'SMS 연동 설정이 아직 없어요. 이 구성을 완료하기 전에는 사용자가 이 로그인 방식으로 로그인 할 수 없어요. "연동 설정"에서 <a>{{link}}</a>하세요.',
    no_connector_email:
      '이메일 연동 설정이 아직 없어요. 이 구성을 완료하기 전에는 사용자가 이 로그인 방식으로 로그인 할 수 없어요. "연동 설정"에서 <a>{{link}}</a>하세요.',
    no_connector_social:
      '아직 소셜 커넥터를 설정하지 않았습니다. 소셜 로그인 방법을 적용하려면 먼저 커넥터를 추가하십시오. "커넥터"에서 <a>{{link}}</a>을(를) 확인하십시오.',
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
    live_preview: '실시간 미리보기',
    live_preview_tip: '저장하여 변경 사항 미리보기',
    native: '네이티브',
    desktop_web: '데스크톱 웹',
    mobile_web: '모바일 웹',
    desktop: '데스크톱',
    mobile: '모바일',
  },
};

export default Object.freeze(sign_in_exp);
