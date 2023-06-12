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
  delete_modal: {
    title: '테넌트 삭제',
    description_line1:
      '환경 접미사 "<span>{{tag}}</span>"이(가) 붙은 "<span>{{name}}</span>" 테넌트를 삭제하시겠습니까? 이 작업은 실행 취소할 수 없으며, 모든 데이터 및 계정 정보가 영구적으로 삭제됩니다.',
    description_line2:
      '계정을 삭제하기 전에 도움이 필요할 수 있습니다. <span><a>이메일로 연락</a></span>해주시면 도움을 드리겠습니다.',
    description_line3:
      '삭제하려는 테넌트 이름 "<span>{{name}}</span>"을(를) 입력하여 확인하십시오.',
    delete_button: '영구 삭제',
  },
  tenant_created: "테넌트 '{{name}}'가(이) 성공적으로 만들어졌습니다.",
};

export default tenants;
