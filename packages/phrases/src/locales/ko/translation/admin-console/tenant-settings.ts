const tenant_settings = {
  title: '설정',
  description: '계정 보안을 위해 여기서 계정 설정 및 개인 정보를 관리하세요.',
  tabs: {
    settings: '설정',
    domains: '도메인',
  },
  profile: {
    title: '프로필 설정',
    tenant_id: '테넌트 ID',
    tenant_name: '테넌트 이름',
    environment_tag: '환경 태그',
    environment_tag_description:
      '태그를 사용하여 테넌트 사용 환경을 구분합니다. 각 태그에 대한 서비스는 동일하므로 일관성이 유지됩니다.',
    environment_tag_development: '개발',
    environment_tag_staging: '스테이징',
    environment_tag_production: '프로덕션',
  },
  deletion_card: {
    title: '삭제',
    tenant_deletion: '테넌트 삭제',
    tenant_deletion_description:
      '계정을 삭제하면 개인 정보, 사용자 데이터 및 구성이 모두 제거됩니다. 이 작업은 실행 취소할 수 없습니다.',
    tenant_deletion_button: '테넌트 삭제',
  },
};

export default tenant_settings;
