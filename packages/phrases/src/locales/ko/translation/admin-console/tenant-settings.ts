const tenant_settings = {
  title: '테넌트 설정',
  description: '계정 보안을 위해 여기서 계정 설정 및 개인 정보를 관리하세요.',
  tabs: {
    settings: '설정',
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
};

export default tenant_settings;
