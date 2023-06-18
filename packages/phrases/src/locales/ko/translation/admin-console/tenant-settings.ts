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
      '태그가 다른 서비스는 동일합니다. 환경을 구분하는 데 팀을 돕는 접미사로 기능합니다.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: '세입자 정보가 성공적으로 저장되었습니다.',
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
