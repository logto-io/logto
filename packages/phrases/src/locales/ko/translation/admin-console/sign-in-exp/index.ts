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
    dark_mode_description: 'Logto 가 브랜드 색상에 알맞게 자동으로 다크 모드 테마를 생성해요.',
    dark_mode_reset_tip: '브랜드 색상에 알맞게 다크 모드 색상',
    reset: '재생성',
  },
  branding: {
    title: '브랜딩 영역',
    ui_style: '스타일',
    with_light: '{{value}}',
    with_dark: '{{value}} (다크)',
    app_logo_and_favicon: '앱 로고 및 파비콘',
    company_logo_and_favicon: '회사 로고 및 파비콘',
  },
  branding_uploads: {
    app_logo: {
      title: '앱 로고',
      url: '앱 로고 URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '앱 로고: {{error}}',
    },
    company_logo: {
      title: '회사 로고',
      url: '회사 로고 URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '회사 로고: {{error}}',
    },
    organization_logo: {
      title: '이미지 업로드',
      url: '조직 로고 URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '조직 로고: {{error}}',
    },
    connector_logo: {
      title: '이미지 업로드',
      url: '커넥터 로고 URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '커넥터 로고: {{error}}',
    },
    favicon: {
      title: '파비콘',
      url: '파비콘 URL',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: '파비콘: {{error}}',
    },
  },
  custom_ui: {
    title: '커스텀 UI',
    css_code_editor_title: '커스텀 CSS',
    css_code_editor_description1: '커스텀 CSS 예제를 확인하세요.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: '더 알아보기',
    css_code_editor_content_placeholder:
      '커스텀 CSS 를 입력하여 스타일을 정확한 사양에 맞게 조정하세요. 창의력을 발휘하여 UI 를 돋보이게 만드세요.',
    bring_your_ui_title: 'UI 가져오기',
    bring_your_ui_description:
      'Logto 가미리 제공하는 UI 를 나만의 코드로 대체하기 위해 압축 패키지 (.zip)를 업로드하세요. <a>더 알아보기</a>',
    preview_with_bring_your_ui_description:
      '커스텀 UI 자산이 성공적으로 업로드되어 현재 제공되고 있습니다. 따라서 기본 제공 미리보기 창이 비활성화되었습니다.\n개인화된 로그인 UI 를 테스트하려면 "실시간 미리보기" 버튼을 클릭하여 새 브라우저 탭에서 엽니다.',
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
