import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: '로그인 경험',
  page_title_with_account: '로그인 및 계정',
  title: '로그인 및 계정',
  description: '인증 흐름과 UI 를 사용자 지정하고 실시간으로 기본 제공 경험을 미리 볼 수 있습니다.',
  tabs: {
    branding: '브랜딩',
    sign_up_and_sign_in: '회원가입/로그인',
    collect_user_profile: '사용자 프로필 수집',
    account_center: '계정 센터',
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
    organization_logo_and_favicon: '조직 로고 및 파비콘',
    hide_logto_branding: 'Logto 브랜딩 숨기기',
    hide_logto_branding_description:
      '"Powered by Logto" 문구를 제거하고 깔끔하고 전문적인 로그인 경험에서 브랜드만 돋보이게 하세요.',
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
  account_center: {
    title: '계정 센터',
    description: 'Logto API로 계정 센터 플로우를 사용자 지정하세요.',
    enable_account_api: 'Account API 활성화',
    enable_account_api_description:
      'Account API를 활성화하여 맞춤형 계정 센터를 구축하고, Logto 관리 API 없이도 최종 사용자에게 직접 API 접근을 제공합니다.',
    field_options: {
      off: '끄기',
      edit: '편집',
      read_only: '읽기 전용',
      enabled: '활성화됨',
      disabled: '비활성화됨',
    },
    sections: {
      account_security: {
        title: '계정 보안',
        description:
          'Account API 접근을 관리해 사용자가 애플리케이션에 로그인한 뒤 자신의 신원 정보와 인증 요소를 확인하거나 수정할 수 있도록 합니다. 이러한 보안 관련 변경을 진행하기 전에 사용자는 본인 확인을 완료하고 유효 기간 10분의 검증 기록 ID를 받아야 합니다.',
        groups: {
          identifiers: {
            title: '식별자',
          },
          authentication_factors: {
            title: '인증 요소',
          },
        },
      },
      user_profile: {
        title: '사용자 프로필',
        description:
          'Account API 접근을 관리해 사용자가 로그인 후 기본 또는 사용자 지정 프로필 데이터를 확인하거나 수정할 수 있도록 합니다.',
        groups: {
          profile_data: {
            title: '프로필 데이터',
          },
        },
      },
      secret_vault: {
        title: '비밀 보관소',
        description:
          '소셜 및 엔터프라이즈 커넥터를 위해 서드파티 액세스 토큰을 안전하게 저장해 해당 API를 호출합니다(예: Google 캘린더에 일정 추가).',
        third_party_token_storage: {
          title: '서드파티 토큰',
          third_party_access_token_retrieval: '서드파티 액세스 토큰 가져오기',
          third_party_token_tooltip:
            '토큰을 저장하려면 해당 소셜 또는 엔터프라이즈 커넥터 설정에서 이 옵션을 활성화하세요.',
          third_party_token_description:
            'Account API를 활성화하면 서드파티 토큰 가져오기가 자동으로 활성화됩니다.',
        },
      },
    },
    fields: {
      email: '이메일 주소',
      phone: '전화번호',
      social: '소셜 식별자',
      password: '비밀번호',
      mfa: '다중 요소 인증',
      mfa_description: '사용자가 계정 센터에서 MFA 방법을 관리하도록 허용합니다.',
      username: '사용자 이름',
      name: '이름',
      avatar: '아바타',
      profile: '프로필',
      profile_description: '구조화된 프로필 속성에 대한 접근을 제어합니다.',
      custom_data: '사용자 정의 데이터',
      custom_data_description: '사용자에 저장된 사용자 정의 JSON 데이터에 대한 접근을 제어합니다.',
    },
    webauthn_related_origins: 'WebAuthn 관련 오리진',
    webauthn_related_origins_description:
      'Account API를 통해 패스키를 등록할 수 있도록 허용된 프런트엔드 애플리케이션 도메인을 추가하세요.',
    webauthn_related_origins_error: '오리진은 https:// 또는 http:// 로 시작해야 합니다',
    prebuilt_ui: {
      /** UNTRANSLATED */
      title: 'INTEGRATE PREBUILT UI',
      /** UNTRANSLATED */
      description:
        'Quickly integrate out-of-the-box verification and security setting flows with prebuilt UI.',
      /** UNTRANSLATED */
      flows_title: 'Integrate out-of-the-box security setting flows',
      /** UNTRANSLATED */
      flows_description:
        'Combine your domain with the route to form your account setting URL (e.g., https://auth.foo.com/account/email). Optionally add a `redirect=` URL parameter to return users to your app after successfully updating.',
      tooltips: {
        /** UNTRANSLATED */
        email: 'Update your primary email address',
        /** UNTRANSLATED */
        phone: 'Update your primary phone number',
        /** UNTRANSLATED */
        username: 'Update your username',
        /** UNTRANSLATED */
        password: 'Set a new password',
        /** UNTRANSLATED */
        authenticator_app: 'Set up a new authenticator app for multi-factor authentication',
        /** UNTRANSLATED */
        passkey_add: 'Register a new passkey',
        /** UNTRANSLATED */
        passkey_manage: 'Manage your existing passkeys or add new ones',
        /** UNTRANSLATED */
        backup_codes_generate: 'Generate a new set of 10 backup codes',
        /** UNTRANSLATED */
        backup_codes_manage: 'View your available backup codes or generate new ones',
      },
      /** UNTRANSLATED */
      customize_note: "Don't want the out-of-the-box experience? You can fully",
      /** UNTRANSLATED */
      customize_link: 'customize your flows with the Account API instead.',
    },
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'SMS 연동 설정이 아직 없어요. 이 구성을 완료하기 전에는 사용자가 이 로그인 방식으로 로그인 할 수 없어요. "연동 설정"에서 <a>{{link}}</a>하세요.',
    no_connector_email:
      '이메일 연동 설정이 아직 없어요. 이 구성을 완료하기 전에는 사용자가 이 로그인 방식으로 로그인 할 수 없어요. "연동 설정"에서 <a>{{link}}</a>하세요.',
    no_connector_social:
      '아직 소셜 커넥터를 설정하지 않았습니다. 소셜 로그인 방법을 적용하려면 먼저 커넥터를 추가하십시오. "커넥터"에서 <a>{{link}}</a>을(를) 확인하십시오.',
    no_connector_email_account_center:
      '이메일 커넥터가 아직 설정되지 않았습니다. <a>"이메일 및 SMS 커넥터"</a>에서 설정하세요.',
    no_connector_sms_account_center:
      'SMS 커넥터가 아직 설정되지 않았습니다. <a>"이메일 및 SMS 커넥터"</a>에서 설정하세요.',
    no_connector_social_account_center:
      '소셜 커넥터가 아직 설정되지 않았습니다. <a>"소셜 커넥터"</a>에서 설정하세요.',
    no_mfa_factor: '아직 MFA 팩터가 설정되지 않았습니다. <a>{{link}}</a>에서 설정하세요.',
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
    forgot_password_migration_notice:
      '사용자 정의 방법을 지원하도록 비밀번호 찾기 확인을 업그레이드했습니다. 이전에는 이메일 및 SMS 커넥터에 의해 자동으로 결정되었습니다. 업그레이드를 완료하려면 <strong>확인</strong>을 클릭하세요.',
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
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
