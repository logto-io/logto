const role = {
  name_in_use: '역할 이름 {{name}}이/가 이미 사용 중이에요.',
  scope_exists: '범위 ID {{scopeId}}이/가 이미 이 역할에 추가되어 있어요.',
  management_api_scopes_not_assignable_to_user_role: '用户角色无法分配管理 API 范围。',
  user_exists: '사용자 ID {{userId}}이/가 이미 이 역할에 추가되어 있어요.',
  application_exists: '애플리케이션 ID {{applicationId}} 가 이미 이 역할에 추가되어 있어요.',
  default_role_missing:
    '기본 역할 이름의 일부가 데이터베이스에 존재하지 않아요. 먼저 역할을 생성해 주세요.',
  internal_role_violation:
    '내부 역할 위반: Logto에서 금지되는 내부 역할을 업데이트하거나 삭제하려고 할 수 있습니다. 새 역할을 만드는 경우 "#internal:"으로 시작하지 않는 다른 이름을 시도해보세요.',
};

export default Object.freeze(role);
