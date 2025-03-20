const security = {
  page_title: '보안',
  title: '보안',
  subtitle: '정교한 공격에 대한 고급 보호를 구성합니다.',
  bot_protection: {
    title: '봇 보호',
    description:
      '자동화된 위협을 차단하기 위해 회원가입, 로그인 및 비밀번호 복구 시 CAPTCHA를 활성화합니다.',
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'CAPTCHA 제공업체를 선택하고 통합을 설정합니다.',
      add: 'CAPTCHA 추가',
    },
    settings: '설정',
    captcha_required_flows: 'CAPTCHA 필요 흐름',
    sign_up: '회원가입',
    sign_in: '로그인',
    forgot_password: '비밀번호 찾기',
  },
  create_captcha: {
    setup_captcha: 'CAPTCHA 설정',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'Google의 엔터프라이즈급 CAPTCHA 솔루션은 고급 위협 감지 및 상세한 보안 분석을 제공하여 웹사이트를 사기 활동으로부터 보호합니다.',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'Cloudflare의 스마트 CAPTCHA 대안으로, 시각적 퍼즐 없이 원활한 사용자 경험을 보장하면서 비침투적인 봇 보호를 제공합니다.',
    },
  },
  captcha_details: {
    back_to_security: '보안으로 돌아가기',
    page_title: 'CAPTCHA 세부사항',
    check_readme: 'README 확인',
    options_change_captcha: 'CAPTCHA 제공자 변경',
    connection: '연결',
    description: '캡차 연결을 구성합니다.',
    site_key: '사이트 키',
    secret_key: '비밀 키',
    project_id: '프로젝트 ID',
    deletion_description: '이 CAPTCHA 제공자를 삭제하시겠습니까?',
    captcha_deleted: 'CAPTCHA 제공자가 성공적으로 삭제되었습니다',
    setup_captcha: 'CAPTCHA 설정',
  },
};

export default Object.freeze(security);
