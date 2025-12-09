const entity = {
  invalid_input: '입력이 잘못되었습니다. 값 목록은 비어 있을 수 없습니다.',
  value_too_long: '값의 길이가 너무 길어서 제한을 초과했어요.',
  create_failed: '{{name}} 생성을 실패하였어요.',
  db_constraint_violated: '데이터베이스 제약 조건 위반.',
  not_exists: '{{name}}는 존재하지 않아요.',
  not_exists_with_id: '{{id}} ID를 가진 {{name}}는 존재하지 않아요.',
  not_found: '리소스가 존재하지 않아요.',
  relation_foreign_key_not_found:
    '하나 이상의 외래 키를 찾을 수 없어요. 입력을 확인하고 참조된 모든 엔티티가 있는지 확인해주세요.',
  unique_integrity_violation: '엔티티가 이미 존재해요. 입력을 확인하고 다시 시도해주세요.',
};

export default Object.freeze(entity);
