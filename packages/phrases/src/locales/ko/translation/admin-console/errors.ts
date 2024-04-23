const errors = {
  something_went_wrong: '알 수 없는 오류가 발생했어요.',
  page_not_found: '페이지를 찾을 수 없어요.',
  unknown_server_error: '서버에서 알 수 없는 오류가 발생했어요.',
  empty: '데이터 없음',
  missing_total_number: 'Total-Number를 응답 해더에서 찾을 수 없어요.',
  invalid_uri_format: 'URI 형식이 유효하지 않음',
  invalid_origin_format: 'URI origin 형식이 유효하지 않음',
  invalid_json_format: 'JSON 형식이 유효하지 않음',
  invalid_regex: '잘못된 정규 표현식',
  invalid_error_message_format: '오류 메세지 형식이 유효하지 않아요.',
  required_field_missing: '{{field}}을/를 입력해 주세요.',
  required_field_missing_plural: '최소 1개의 {{field}}을/를 입력해야 해요.',
  more_details: '자세히',
  username_pattern_error:
    '아이디는 반드시 문자, 숫자, _ 만으로 이루어져야 하며, 숫자로 시작하면 안 돼요.',
  email_pattern_error: '이메일 형식이 유효하지 않아요.',
  phone_pattern_error: '전화번호 형식이 유효하지 않아요.',
  insecure_contexts: '비보안 연결(non-HTTPS)는 지원하지 않아요.',
  unexpected_error: '알 수 없는 오류가 발생했어요.',
  not_found: '404 찾을 수 없음',
  create_internal_role_violation:
    'Logto에 의해 금지된 내부 역할을 생성하려고 하고 있어요. "#internal:"로 시작하지 않는 다른 이름을 사용하세요.',
  should_be_an_integer: '정수이어야 합니다.',
  number_should_be_between_inclusive: '숫자는 {{min}} 이상 {{max}} 이하이어야 합니다.',
};

export default Object.freeze(errors);
