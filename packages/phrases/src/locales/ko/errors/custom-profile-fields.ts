const custom_profile_fields = {
  entity_not_exists_with_names: '주어진 이름과 일치하는 엔티티를 찾을 수 없습니다: {{names}}',
  invalid_min_max_input: '최소값과 최대값 입력이 올바르지 않습니다.',
  invalid_default_value: '기본값이 올바르지 않습니다.',
  invalid_options: '필드 옵션이 올바르지 않습니다.',
  invalid_regex_format: '정규식 형식이 올바르지 않습니다.',
  invalid_address_components: '주소 구성 요소가 올바르지 않습니다.',
  invalid_fullname_components: '이름 구성 요소가 올바르지 않습니다.',
  invalid_sub_component_type: '하위 구성 요소 유형이 올바르지 않습니다.',
  name_exists: '해당 이름의 필드가 이미 존재합니다.',
  conflicted_sie_order: 'Sign-in Experience 용 필드 순서 값이 충돌합니다.',
  invalid_name: '필드 이름이 올바르지 않습니다. 대소문자를 구분하며, 문자 또는 숫자만 허용됩니다.',
  name_conflict_sign_in_identifier:
    '필드 이름이 올바르지 않습니다. 예약된 로그인 식별자 키: {{name}}.',
  name_conflict_built_in_prop:
    '필드 이름이 올바르지 않습니다. 예약된 내장 사용자 프로필 속성 이름: {{name}}.',
  name_conflict_custom_data:
    '필드 이름이 올바르지 않습니다. 예약된 사용자 정의 데이터 키: {{name}}.',
  name_required: '필드 이름은 필수입니다.',
};

export default Object.freeze(custom_profile_fields);
