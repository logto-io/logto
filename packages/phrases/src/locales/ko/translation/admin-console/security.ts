const security = {
  page_title: '보안',
  title: '보안',
  subtitle: '정교한 공격에 대한 고급 보호를 구성합니다.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: '비밀번호 정책',
    blocklist: '차단 목록',
    general: '일반',
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
    enable_captcha: 'CAPTCHA 활성화',
    enable_captcha_description:
      '회원가입, 로그인, 비밀번호 복구 흐름에 대해 CAPTCHA 검증을 활성화합니다.',
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
    domain: '도메인 (선택사항)',
    domain_placeholder: 'www.google.com (기본값) 또는 recaptcha.net',
    recaptcha_key_id: 'reCAPTCHA 키 ID',
    recaptcha_api_key: '프로젝트의 API 키',
    deletion_description: '이 CAPTCHA 제공자를 삭제하시겠습니까?',
    captcha_deleted: 'CAPTCHA 제공자가 성공적으로 삭제되었습니다',
    setup_captcha: 'CAPTCHA 설정',
    mode: '인증 모드',
    mode_invisible: '보이지 않음',
    mode_checkbox: '체크박스',
    mode_notice:
      '인증 모드는 Google Cloud Console의 reCAPTCHA 키 설정에서 정의됩니다. 여기서 모드를 변경하려면 일치하는 키 유형이 필요합니다.',
  },
  password_policy: {
    password_requirements: '비밀번호 요구사항',
    password_requirements_description:
      '사용자 자격 증명 탈취 및 약한 비밀번호 공격을 방어하기 위해 비밀번호 요구사항을 강화하세요.',
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
    restricted_phrases: '보안에 좋지 않은 구문',
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
  },
  sentinel_policy: {
    card_title: '식별자 잠금',
    card_description:
      '잠금은 기본 설정으로 모든 사용자에게 제공되며, 더 많은 제어를 위해 사용자 정의할 수 있습니다.\n\n여러 번의 인증 실패 시도 (예: 연속적으로 잘못된 비밀번호 또는 인증 코드) 후에 식별자를 임시로 잠가 강제 접근을 방지합니다.',
    enable_sentinel_policy: {
      title: '잠금 경험 사용자 정의',
      description:
        '잠금 전 최대 실패 로그인 시도 횟수, 잠금 지속 시간 및 즉각적인 수동 잠금 해제의 사용자 정의를 허용합니다.',
    },
    max_attempts: {
      title: '최대 실패 시도 횟수',
      description: '최대 로그인 시도 실패 횟수에 도달하면 식별자를 임시로 잠급니다.',
      error_message: '최대 실패 시도 횟수는 0보다 커야 합니다.',
    },
    lockout_duration: {
      title: '잠금 지속 시간 (분)',
      description: '최대 실패 시도 한도를 초과한 후 일정 시간 동안 로그인을 차단합니다.',
      error_message: '잠금 지속 시간은 최소 1분 이상이어야 합니다.',
    },
    manual_unlock: {
      title: '수동 잠금 해제',
      description: '사용자의 신원을 확인하고 식별자를 입력하여 즉시 사용자를 잠금 해제합니다.',
      unblock_by_identifiers: '식별자로 차단 해제',
      modal_description_1:
        '여러 번의 로그인/가입 시도 실패로 인해 식별자가 일시적으로 잠겼습니다. 보안을 위해 잠금 기간 후 접근이 자동으로 복원됩니다.',
      modal_description_2:
        ' 사용자의 신원을 확인하고 비인가 접근 시도가 없는 경우에만 수동으로 잠금을 해제하십시오.',
      placeholder: '식별자 입력 (이메일 주소 / 전화 번호 / 사용자 이름)',
      confirm_button_text: '지금 잠금 해제',
      success_toast: '성공적으로 잠금 해제되었습니다',
      duplicate_identifier_error: '식별자가 이미 추가되었습니다',
      empty_identifier_error: '최소 하나의 식별자를 입력하세요',
    },
  },
  blocklist: {
    card_title: '이메일 차단 목록',
    card_description: '높은 위험 또는 원치 않는 이메일 주소를 차단하여 사용자 기반을 제어합니다.',
    disposable_email: {
      title: '일회용 이메일 주소 차단',
      description:
        '일회용 또는 임시 이메일 주소를 사용한 가입 시도를 거부하도록 활성화하여 스팸을 방지하고 사용자 품질을 향상시킬 수 있습니다.',
    },
    email_subaddressing: {
      title: '이메일 서브주소 차단',
      description:
        '이용하여 가입 시도를 거부하도록 활성화하면 더하기 기호 (+) 및 추가 문자가 있는 이메일 서브주소에서 등록 시도 (예: user+alias@foo.com)를 거부할 수 있습니다.',
    },
    custom_email_address: {
      title: '사용자 정의 이메일 주소 차단',
      description:
        '등록하거나 UI를 통해 연결할 수 없는 특정 이메일 도메인 또는 이메일 주소를 추가합니다.',
      placeholder: '차단된 이메일 주소 또는 도메인 입력 (예: bar@example.com, @example.com)',
      duplicate_error: '이미 추가된 이메일 주소 또는 도메인입니다',
      invalid_format_error:
        '유효한 이메일 주소(bar@example.com) 또는 도메인(@example.com)이어야 합니다',
    },
  },
};

export default Object.freeze(security);
