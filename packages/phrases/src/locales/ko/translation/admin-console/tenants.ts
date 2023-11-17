const tenants = {
  title: '설정',
  description: '테넌트 설정을 효율적으로 관리하고 도메인을 사용자 정의합니다.',
  tabs: {
    settings: '설정',
    domains: '도메인',
    subscription: '구독 및 청구',
    billing_history: '청구 내역',
  },
  settings: {
    title: '설정',
    /** UNTRANSLATED */
    description: 'Set the tenant name and view your data hosted region and tenant type.',
    tenant_id: '테넌트 ID',
    tenant_name: '테넌트 이름',
    tenant_region: '데이터 호스팅 영역',
    tenant_region_tip: '당신의 테넌트 자원은 {{region}}에 호스팅됩니다. <a>자세히 알아보기</a>',
    environment_tag: '환경 태그',
    environment_tag_description:
      '태그는 서비스를 변경하지 않습니다. 단지 다양한 환경을 구별하는 데 도움을 줍니다.',
    environment_tag_development: '개발',
    environment_tag_staging: '스테이징',
    environment_tag_production: '프로드',
    /** UNTRANSLATED */
    tenant_type: 'Tenant type',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required. It has all the pro features but has limitations like a sign-in banner. <a>Learn more</a>",
    /** UNTRANSLATED */
    production_description:
      'Intended for apps that are being used by end-users and may require a paid subscription. <a>Learn more</a>',
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
  create_modal: {
    title: '테넌트 만들기',
    subtitle_deprecated: '자원 및 사용자를 분리하기 위한 새 테넌트를 만드세요.',
    subtitle:
      '분리된 리소스와 사용자를 가진 새 테넌트를 만듭니다. 데이터가 호스팅되는 지역 및 테넌트 유형은 생성 후에 수정할 수 없습니다.',
    tenant_usage_purpose: '이 테넌트를 사용하는 목적은 무엇입니까?',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required.",
    /** UNTRANSLATED */
    development_hint: 'It has all the pro features but has limitations like a sign-in banner.',
    /** UNTRANSLATED */
    production_description: 'For use by end-users and may require a paid subscription.',
    available_plan: '사용 가능한 요금제:',
    create_button: '테넌트 만들기',
    tenant_name_placeholder: '내 테넌트',
  },
  notification: {
    allow_pro_features_title:
      '이제 개발 테넌트에서 <span>Logto Pro의 모든 기능</span>에 액세스할 수 있습니다!',
    allow_pro_features_description: '완전히 무료이며 평생 무료로 이용할 수 있습니다!',
    explore_all_features: '모든 기능 살펴보기',
    impact_title: '이게 나에게 어떤 영향을 미칠까요?',
    staging_env_hint:
      '테넌트 라벨이 "<strong>스테이징</strong>"에서 "<strong>프로드</strong>"로 업데이트되었지만, 이 변경으로 현재 설정에 영향을주지는 않습니다.',
    paid_tenant_hint_1:
      'Logto Hobby 플랜에 가입하면 이전의 "<strong>개발</strong>" 테넌트 태그가 "<strong>프로드</strong>"로 전환되며 현재 설정에는 영향을 주지 않습니다.',
    paid_tenant_hint_2:
      '아직 개발 중이면 새로운 개발 테넌트를 만들어 더 많은 프로 기능에 액세스할 수 있습니다.',
    paid_tenant_hint_3:
      '프로덕션 단계이거나 프로덕션 환경에서는 특정 플랜에 가입해야 하므로이 시점에서 할 일이 없습니다.',
    paid_tenant_hint_4: '도움이 필요하면 언제든지 문의해주세요! Logto 선택해 주셔서 감사합니다!',
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
    cannot_delete_title: '이 테넌트를 삭제할 수 없습니다',
    cannot_delete_description:
      '죄송합니다. 현재이 테넌트를 삭제할 수 없습니다. 무료 플랜에 있고 미결제 청구서가 없는지 확인하십시오.',
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
  signing_keys: {
    title: '서명 키',
    description: '테넌트 내의 서명 키를 안전하게 관리합니다.',
    type: {
      private_key: 'OIDC 개인 키',
      cookie_key: 'OIDC 쿠키 키',
    },
    private_keys_in_use: '사용 중인 개인 키',
    cookie_keys_in_use: '사용 중인 쿠키 키',
    rotate_private_keys: '개인 키 회전',
    rotate_cookie_keys: '쿠키 키 회전',
    rotate_private_keys_description:
      '이 작업은 새로운 개인 서명 키를 생성하고 현재 키를 회전시키고 이전 키를 삭제합니다. 현재 키로 서명 된 JWT 토큰은 삭제하거나 다른 회전할 때까지 유효합니다.',
    rotate_cookie_keys_description:
      '이 작업은 새 쿠키 키를 생성하고 현재 키를 회전하며 이전 키를 삭제합니다. 현재 키로 서명 된 쿠키는 삭제하거나 다른 회전할 때까지 유효합니다.',
    select_private_key_algorithm: '새 개인 키의 서명 키 알고리즘 선택',
    rotate_button: '회전',
    table_column: {
      id: 'ID',
      status: '상태',
      algorithm: '서명 키 알고리즘',
    },
    status: {
      current: '현재',
      previous: '이전',
    },
    reminder: {
      rotate_private_key:
        '정말 <strong>OIDC 개인 키</strong>를 회전하시겠습니까? 새로 발급 된 JWT 토큰은 새 키로 서명됩니다. 기존 JWT 토큰은 회전할 때까지 유효합니다.',
      rotate_cookie_key:
        '정말 <strong>OIDC 쿠키 키</strong>를 회전하시겠습니까? 로그인 세션에서 생성 된 새로운 쿠키는 새 쿠키 키로 서명됩니다. 기존 쿠키는 회전할 때까지 유효합니다.',
      delete_private_key:
        '정말 <strong>OIDC 개인 키</strong>를 삭제하시겠습니까? 이전에 개인 서명 키로 서명 된 기존 JWT 토큰은 더 이상 유효하지 않게 됩니다.',
      delete_cookie_key:
        '정말 <strong>OIDC 쿠키 키</strong>를 삭제하시겠습니까? 이전에 이 쿠키 키로 서명 된 로그인 세션은 더 이상 유효하지 않게 될 것입니다. 이 사용자들에게는 다시 인증이 필요합니다.',
    },
    messages: {
      rotate_key_success: '서명 키가 성공적으로 회전되었습니다.',
      delete_key_success: '키가 성공적으로 삭제되었습니다.',
    },
  },
};

export default Object.freeze(tenants);
