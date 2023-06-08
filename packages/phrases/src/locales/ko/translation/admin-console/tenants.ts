const tenants = {
  create_modal: {
    title: '테넌트 만들기',
    subtitle: '자원 및 사용자를 분리하기 위한 새 테넌트를 만드세요.',
    create_button: '테넌트 만들기',
    tenant_name: '테넌트 이름',
    tenant_name_placeholder: '내 테넌트',
    environment_tag: '환경 태그',
    environment_tag_description:
      '태그를 사용하여 테넌트 사용 환경을 구분하세요. 각 태그 내의 서비스는 동일하여 일관성을 보장합니다.',
    environment_tag_development: '개발',
    environment_tag_staging: '스테이징',
    environment_tag_production: '프로덕션',
  },
  tenant_created: "테넌트 '{{name}}'가(이) 성공적으로 만들어졌습니다.",
};

export default tenants;
