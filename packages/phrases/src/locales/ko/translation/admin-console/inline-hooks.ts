const inline_hooks = {
  page_title: '인라인 훅',
  title: '인라인 훅',
  subtitle: '인증 흐름의 특정 지점에서 사용자 지정 코드를 실행하여 Logto 동작을 확장합니다.',
  details_page_title: '{{name}}',
  status: {
    not_configured: '구성되지 않음',
    configured: '구성됨',
    enabled: '활성화됨',
    disabled: '비활성화됨',
  },
  hooks: {
    post_first_factor_verification: {
      name: '첫 번째 인증 요소 확인 후',
      description:
        '첫 번째 인증 요소가 확인된 후 로그인 절차가 계속되기 전에 사용자 지정 로직을 실행합니다.',
    },
    post_sign_in: {
      name: '로그인 후',
      description: '사용자가 성공적으로 로그인한 후 사용자 지정 로직을 실행합니다.',
    },
  },
  data_source_tab: '데이터 소스',
  test_tab: '테스트 컨텍스트',
  settings_tab: '설정',
  event_data: {
    title: '이벤트 페이로드',
    subtitle: '`event` 입력 매개변수로 인증 이벤트 데이터를 사용합니다.',
  },
  result_data: {
    title: '훅 결과',
    subtitle: '이 훅 유형에 대해 Logto가 이해할 수 있는 결과 객체를 반환합니다.',
  },
  environment_variables: {
    title: '환경 변수 설정',
    subtitle: '민감한 정보를 환경 변수에 저장합니다.',
    input_field_title: '환경 변수 추가',
    sample_code: '인라인 훅 핸들러에서 환경 변수에 접근하는 예시:',
  },
  fetch_external_data: {
    title: '외부 데이터 가져오기',
    subtitle: '훅 스크립트에서 외부 API를 호출합니다.',
    description: '`fetch` 함수로 외부 API를 호출하고 데이터를 훅 결과에 포함합니다. 예시:',
  },
  settings: {
    title: '설정',
    subtitle: '훅 활성화 여부와 런타임 오류 처리 방식을 제어합니다.',
    enabled: {
      title: '훅 활성화',
      description: '인증 이벤트가 트리거될 때 이 스크립트를 실행합니다.',
    },
    on_execution_error: {
      title: '스크립트 오류 시',
      description: '스크립트 실행 실패 시 Logto의 동작을 선택합니다.',
      block: '인증 흐름 차단',
      allow: '인증 흐름 계속 허용',
      post_first_factor_description:
        '이 스크립트가 실패하면 Logto는 항상 잘못된 자격 증명을 거부하여 비밀번호 검증을 우회할 수 없도록 합니다.',
    },
  },
  test_context: {
    subtitle: '테스트 실행 시 사용할 모의 이벤트 페이로드를 조정합니다.',
    input_field_title: '이벤트 샘플 JSON',
  },
  script: {
    title: '스크립트',
    restore: '기본값으로 복원',
    restored: '복원됨',
  },
  tester: {
    run_button: '테스트 실행',
    result_title: '테스트 결과',
  },
  form_error: {
    invalid_json: '잘못된 JSON 형식',
  },
  security_warning: {
    title: '보안 경고',
    description:
      '이 훅으로 프로비저닝된 사용자는 이메일 차단 목록, SSO 전용 도메인, 가입 비활성화 모드, 등록 필수 프로필 검사 등 등록 전용 제한을 우회합니다. 기존 사용자의 프로필 및 비밀번호 쓰기도 MFA 완료 전에 발생합니다.',
  },
  delete_modal_title: '인라인 훅 삭제',
  delete_modal_content:
    '이 인라인 훅을 삭제하시겠습니까? 인증 흐름에서 이 스크립트가 더 이상 실행되지 않습니다.',
  deleted: '인라인 훅이 삭제되었습니다',
  created: '인라인 훅이 생성되었습니다',
  saved: '인라인 훅이 저장되었습니다',
};

export default Object.freeze(inline_hooks);
