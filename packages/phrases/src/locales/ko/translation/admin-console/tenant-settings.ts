const tenant_settings = {
  title: '설정',
  description: '테넌트 설정을 효율적으로 관리하고 도메인을 사용자 정의합니다.',
  tabs: {
    settings: '설정',
    domains: '도메인',
  },
  settings: {
    title: '설정',
    tenant_id: '테넌트 ID',
    tenant_name: '테넌트 이름',
    environment_tag: '환경 태그',
    environment_tag_description:
      '태그는 서비스를 변경하지 않습니다. 단지 다양한 환경을 구별하는 데 도움을 줍니다.',
    environment_tag_development: '개발',
    environment_tag_staging: '스테이징',
    environment_tag_production: '프로드',
    tenant_info_saved: '세입자 정보가 성공적으로 저장되었습니다.',
  },
  deletion_card: {
    title: '삭제',
    tenant_deletion: '테넌트 삭제',
    tenant_deletion_description:
      '테넌트를 삭제하면 관련된 모든 사용자 데이터와 설정이 영구적으로 삭제됩니다. 신중하게 진행해주십시오.',
    tenant_deletion_button: '테넌트 삭제',
  },
};

export default tenant_settings;
