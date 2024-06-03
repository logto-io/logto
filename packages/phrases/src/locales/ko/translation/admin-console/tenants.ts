const tenants = {
  title: '설정',
  description: '테넌트 설정을 효율적으로 관리하고 도메인을 사용자 정의합니다.',
  tabs: {
    settings: '설정',
    members: '멤버',
    domains: '도메인',
    subscription: '구독 및 청구',
    billing_history: '청구 내역',
  },
  settings: {
    title: '설정',
    description: '테넌트 이름 설정 및 호스팅된 데이터 영역 및 테넌트 유형을 확인합니다.',
    tenant_id: '테넌트 ID',
    tenant_name: '테넌트 이름',
    tenant_region: '데이터 호스팅 영역',
    tenant_region_tip: '당신의 테넌트 자원은 {{region}}에 호스팅됩니다. <a>자세히 알아보기</a>',
    environment_tag_development: '개발',
    environment_tag_production: '프로드',
    tenant_type: '테넌트 유형',
    development_description:
      '테스트 용이며 프로덕션에서 사용하지 마십시오. 구독이 필요하지 않습니다. 모든 프로 기능이 있지만 로그인 배너와 같은 제한이 있습니다. <a>더 알아보기</a>',
    production_description:
      '최종 사용자가 사용하는 앱을 위한 것으로 유료 구독이 필요할 수 있습니다. <a>더 알아보기</a>',
    tenant_info_saved: '테넌트 정보가 성공적으로 저장되었습니다.',
  },
  full_env_tag: {
    development: '개발',
    production: '프로드',
  },
  deletion_card: {
    title: '삭제',
    tenant_deletion: '테넌트 삭제',
    tenant_deletion_description:
      '테넌트를 삭제하면 관련된 모든 사용자 데이터와 설정이 영구적으로 삭제됩니다. 신중하게 진행해주십시오.',
    tenant_deletion_button: '테넌트 삭제',
  },
  leave_tenant_card: {
    title: '나가기',
    leave_tenant: '테넌트 나가기',
    leave_tenant_description:
      '테넌트에 속한 모든 리소스는 그대로 유지되지만 해당 테넌트에 더 이상 액세스할 수 없습니다.',
    last_admin_note: '테넌트에서 나가려면 최소 한 명 이상의 관리자가 있어야 합니다.',
  },
  create_modal: {
    title: '테넌트 만들기',
    tenant_usage_purpose: '이 테넌트를 사용하는 목적은 무엇입니까?',
    development_description:
      '테스트 용으로만 사용하고 프로덕션에서 사용하지 마십시오. 구독이 필요하지 않습니다.',
    development_hint: '로그인 배너와 같은 제한이 있지만 모든 프로 기능이 있습니다.',
    production_description: '최종 사용자가 사용하기 위한 것으로 유료 구독이 필요할 수 있습니다.',
    available_plan: '사용 가능한 요금제:',
    create_button: '테넌트 만들기',
    tenant_name_placeholder: '내 테넌트',
  },
  dev_tenant_migration: {
    title: '사용자 정의 테넌트로 전환하여 Pro 기능을 무료로 이용할 수 있습니다!',
    affect_title: '이로 인한 영향은?',
    hint_1:
      '우리는 이전의 <strong>환경 태그</strong>를 <strong>“개발”</strong> 및 <strong>“프로드”</strong> 두 가지 새 테넌트 유형으로 대체합니다.',
    hint_2:
      '원활한 전환과 기능의 중단 없이 모든 초기 생성 된 테넌트가 이전 구독과 함께 <strong>프로드</strong> 테넌트 유형으로 상승합니다.',
    hint_3: '걱정 마세요. 다른 설정은 그대로 유지됩니다.',
    about_tenant_type: '테넌트 유형 정보',
  },
  delete_modal: {
    title: '테넌트 삭제',
    description_line1:
      '테넌트 "<span>{{name}}</span>" 을(를) 환경 접미사 태그 "<span>{{tag}}</span>" 와 함께 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며 모든 데이터 및 테넌트 정보가 영구적으로 삭제됩니다.',
    description_line2:
      '테넌트 삭제 전에 도움을 받을 수도 있습니다. <span><a>이메일을 통해 문의하십시오</a></span>',
    description_line3: '확인하려는 테넌트 이름 "<span>{{name}}</span>" 을(를) 입력하십시오.',
    delete_button: '영구 삭제',
    cannot_delete_title: '이 테넌트를 삭제할 수 없습니다',
    cannot_delete_description:
      '죄송합니다. 현재이 테넌트를 삭제할 수 없습니다. 무료 플랜에 있고 미결제 청구서가 없는지 확인하십시오.',
  },
  leave_tenant_modal: {
    description: '이 테넌트를 나가시겠습니까?',
    leave_button: '나가기',
  },
  tenant_landing_page: {
    title: '아직 테넌트를 만들지 않았습니다.',
    description:
      'Logto 를 사용하여 프로젝트를 구성하려면 새 테넌트를 만드세요. 로그아웃하거나 계정을 삭제하려면 오른쪽 상단 모서리에있는 아바타 버튼을 클릭하세요.',
    create_tenant_button: '테넌트 만들기',
  },
  status: {
    mau_exceeded: 'MAU 초과',
    suspended: '정지됨',
    overdue: '만료됨',
  },
  tenant_suspended_page: {
    title: '테넌트 정지. 접근을 복구하려면 문의하세요.',
    description_1:
      '매우 유감스럽게도 테넌트 계정이 일시적으로 정지되었으며, MAU 한도 초과, 연체된 결제 또는 다른 무단 조치 등 부적절한 사용으로 인한 것입니다.',
    description_2:
      '자세한 설명이 필요한 경우, 우려 사항이 있거나 기능을 완전히 복원하고 테넌트를 차단 해제하려면 바로 연락 주시기 바랍니다.',
  },
};

export default Object.freeze(tenants);
