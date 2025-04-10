const password_policy = {
  password_requirements: '비밀번호 요구사항',
  minimum_length: '최소 길이',
  minimum_length_description: 'NIST는 <a>최소 8자리</a>를 권장합니다.',
  minimum_length_error: '최소 길이는 {{min}} ~ {{max}}(포함) 사이여야 합니다.',
  minimum_required_char_types: '최소 필요 문자 유형',
  minimum_required_char_types_description:
    '문자 유형: 대문자(A-Z), 소문자(a-z), 숫자(0-9), 특수 기호({{symbols}}).',
  password_rejection: '비밀번호 거부',
  compromised_passwords: '위험한 비밀번호',
  breached_passwords: '유출된 비밀번호',
  breached_passwords_description: '이전에 유출된 비밀번호를 거부합니다.',
  restricted_phrases: '보안속에 좋지 않은 구구절',
  restricted_phrases_tooltip:
    '3글자 이상의 다른 글자와 함께 조합하지 않는 한 이러한 구문을 피하세요.',
  repetitive_or_sequential_characters: '반복된 혹은 순차적인 문자',
  repetitive_or_sequential_characters_description: '예: "AAAA", "1234", "abcd" 등.',
  user_information: '사용자 정보',
  user_information_description: '예: 이메일 주소, 전화 번호, 사용자 이름 등.',
  custom_words: '사용자 정의 단어',
  custom_words_description:
    '컨텍스트에 따라 맞춤형 단어입니다. 대소문자를 구분하지 않으며, 한 줄에 하나씩 작성하세요.',
  custom_words_placeholder: '서비스 이름, 회사 이름 등.',
};

const security = {
  page_title: '보안',
  title: '보안',
  subtitle: '정교한 공격에 대한 고급 보호를 구성합니다.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: '비밀번호 정책',
  },
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
  password_policy,
};

export default Object.freeze(security);
