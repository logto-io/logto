const entity = {
  invalid_input: '입력이 잘못되었습니다. 값 목록은 비어 있을 수 없습니다.',
  create_failed: '{{name}} 생성을 실패하였어요.',
  db_constraint_violated: '데이터베이스 제약 조건 위반.',
  not_exists: '{{name}}는 존재하지 않아요.',
  not_exists_with_id: '{{id}} ID를 가진 {{name}}는 존재하지 않아요.',
  not_found: '리소스가 존재하지 않아요.',
};

export default Object.freeze(entity);
