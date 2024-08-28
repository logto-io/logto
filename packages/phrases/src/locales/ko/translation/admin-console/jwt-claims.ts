const jwt_claims = {
  title: '사용자 정의 JWT',
  description:
    '액세스 토큰에 포함할 사용자 정의 JWT 클레임을 설정하세요. 이러한 클레임은 추가 정보를 응용 프로그램에 전달하는 데 사용될 수 있습니다.',
  user_jwt: {
    card_title: '사용자용',
    card_field: '사용자 액세스 토큰',
    card_description: '액세스 토큰 발급 시 사용자별 데이터 추가.',
    for: '사용자용',
  },
  machine_to_machine_jwt: {
    card_title: 'M2M용',
    card_field: '기기 간 토큰',
    card_description: '기기 간 토큰 발급 시 추가 데이터 추가.',
    for: 'M2M용',
  },
  code_editor_title: '{{$token}} 클레임을 사용자화',
  custom_jwt_create_button: '사용자 정의 클레임 추가',
  custom_jwt_item: '사용자 정의 클레임 {{$for}}',
  delete_modal_title: '사용자 정의 클레임 삭제',
  delete_modal_content: '사용자 정의 클레임을 삭제하시겠습니까?',
  clear: '지우기',
  cleared: '지움',
  restore: '기본값으로 복원',
  restored: '복원됨',
  data_source_tab: '데이터 소스',
  test_tab: '테스트 컨텍스트',
  jwt_claims_description: '기본 클레임은 JWT에 자동으로 추가되며 재정의할 수 없습니다.',
  user_data: {
    title: '사용자 데이터',
    subtitle: '`data.user` 입력 매개변수를 사용하여 중요한 사용자 정보 제공.',
  },
  token_data: {
    title: '토큰 데이터',
    subtitle: '현재 액세스 토큰 페이로드에 대한 `token` 입력 매개변수 사용.',
  },
  fetch_external_data: {
    title: '외부 데이터 가져오기',
    subtitle: '외부 API에서 데이터 직접 클레임에 통합.',
    description:
      '`fetch` 함수를 사용하여 외부 API를 호출하고 해당 데이터를 사용자 정의 클레임에 포함시킵니다. 예시: ',
  },
  environment_variables: {
    title: '환경 변수 설정',
    subtitle: '중요 정보를 저장하기 위해 환경 변수를 사용하세요.',
    input_field_title: '환경 변수 추가',
    sample_code: '사용자 정의 JWT 클레임 핸들러에서 환경 변수에 접근하는 방법. 예시: ',
  },
  jwt_claims_hint:
    '사용자 정의 클레임을 50KB 미만으로 제한하세요. 기본 JWT 클레임은 토큰에 자동으로 포함되며 재정의할 수 없습니다.',
  tester: {
    subtitle: '테스트를 위해 모의 토큰 및 사용자 데이터 조정.',
    run_button: '테스트 실행',
    result_title: '테스트 결과',
  },
  form_error: {
    invalid_json: '잘못된 JSON 형식',
  },
};

export default Object.freeze(jwt_claims);
