const organization = {
  require_membership: '사용자는 조직의 구성원이어야 합니다.',
  default_organization_missing:
    '일부 기본 조직이 데이터베이스에 존재하지 않습니다. 조직을 먼저 생성해주세요',
  default_organization_role_missing:
    '일부 기본 조직 역할이 데이터베이스에 없습니다. 먼저 조직 역할을 만드십시오',
};

export default Object.freeze(organization);
