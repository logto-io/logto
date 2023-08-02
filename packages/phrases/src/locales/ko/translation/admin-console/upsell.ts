const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: '플랜 업그레이드',
  compare_plans: '플랜 비교',
  get_started: {
    title: '무료 플랜으로 원활한 신원 확인 여정을 시작하세요!',
    description:
      '무료 플랜은 사이드 프로젝트나 시험용으로 Logto를 시도하기에 완벽합니다. 팀에 Logto의 기능을 모두 활용하려면 업그레이드하여 프리미엄 기능에 무제한으로 접근하세요: 무제한 MAU 사용, 기기 간 통합, RBAC 관리, 장기간 감사 로그 등. <a>모든 플랜 보기</a>',
  },
  create_tenant: {
    title: '테넌트 플랜 선택하기',
    description:
      'Logto는 성장 중인 기업을 위해 혁신적이고 저렴한 가격으로 디자인된 경쟁력 있는 플랜 옵션을 제공합니다. <a>더 알아보기</a>',
    base_price: '기본 가격',
    monthly_price: '{{value, number}}/월',
    mau_unit_price: 'MAU 단가',
    view_all_features: '모든 기능 보기',
    select_plan: '<name/> 선택',
    free_tenants_limit: '최대 {{count, number}}개 무료 테넌트',
    free_tenants_limit_other: '최대 {{count, number}}개 무료 테넌트',
    most_popular: '가장 인기 있는 플랜',
    upgrade_success: '<name/>으로 업그레이드 성공!',
  },
  paywall: {
    applications:
      '<planName/>의 {{count, number}}개 애플리케이션 제한에 도달했습니다. 팀의 요구를 충족하기 위해 플랜을 업그레이드하십시오. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
    applications_other:
      '<planName/>의 {{count, number}}개 애플리케이션 제한에 도달했습니다. 팀의 요구를 충족하기 위해 플랜을 업그레이드하십시오. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
    machine_to_machine_feature:
      '유료 플랜으로 업그레이드하여 기계 간 애플리케이션을 생성하고 모든 프리미엄 기능에 액세스하세요. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
    machine_to_machine:
      '<planName/>의 {{count, number}}개 기계 간 애플리케이션 제한에 도달했습니다. 팀의 요구를 충족하기 위해 플랜을 업그레이드하십시오. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
    machine_to_machine_other:
      '<planName/>의 {{count, number}}개 기계 간 애플리케이션 제한에 도달했습니다. 팀의 요구를 충족하기 위해 플랜을 업그레이드하십시오. 도움이 필요하면 <a>문의</a>해 주시기 바랍니다.',
    resources:
      '<planName/>의 {{count, number}}개 API 리소스 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    resources_other:
      '<planName/>의 {{count, number}}개 API 리소스 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    scopes_per_resource:
      '<planName/>의 {{count, number}}개 API 리소스 당 권한 한도에 도달했습니다. 확장을 위해 지금 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    scopes_per_resource_other:
      '<planName/>의 {{count, number}}개 API 리소스 당 권한 한도에 도달했습니다. 확장을 위해 지금 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    custom_domain:
      '유료 플랜으로 업그레이드하여 사용자 정의 도메인 기능과 다양한 프리미엄 혜택을 해제하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    social_connectors:
      '<planName/>의 {{count, number}}개 소셜 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    social_connectors_other:
      '<planName/>의 {{count, number}}개 소셜 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    standard_connectors_feature:
      '유료 플랜으로 업그레이드하여 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있으며, 무제한 소셜 커넥터 및 모든 프리미엄 기능에 액세스할 수 있습니다. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    standard_connectors:
      '<planName/>의 {{count, number}}개 소셜 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    standard_connectors_other:
      '<planName/>의 {{count, number}}개 소셜 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 플랜을 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    standard_connectors_pro:
      '<planName/>의 {{count, number}}개 표준 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 엔터프라이즈 플랜으로 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    standard_connectors_pro_other:
      '<planName/>의 {{count, number}}개 표준 커넥터 한도에 도달했습니다. 팀의 요구를 충족시키기 위해 엔터프라이즈 플랜으로 업그레이드하고 OIDC, OAuth 2.0, SAML 프로토콜을 사용하여 고유한 커넥터를 생성할 수 있도록 하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    roles:
      '<planName/>의 {{count, number}}개 역할 한도에 도달했습니다. 플랜을 업그레이드하여 추가 역할과 권한을 추가하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    roles_other:
      '<planName/>의 {{count, number}}개 역할 한도에 도달했습니다. 플랜을 업그레이드하여 추가 역할과 권한을 추가하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    scopes_per_role:
      '<planName/>의 {{count, number}}개 역할 당 권한 한도에 도달했습니다. 플랜을 업그레이드하여 추가 역할과 권한을 추가하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    scopes_per_role_other:
      '<planName/>의 {{count, number}}개 역할 당 권한 한도에 도달했습니다. 플랜을 업그레이드하여 추가 역할과 권한을 추가하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    hooks:
      '<planName/>의 {{count, number}}개 웹훅 한도에 도달했습니다. 더 많은 웹훅을 생성하려면 플랜을 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
    hooks_other:
      '<planName/>의 {{count, number}}개 웹훅 한도에 도달했습니다. 더 많은 웹훅을 생성하려면 플랜을 업그레이드하세요. 도움이 필요하면 <a>문의하기</a>로 연락 주세요.',
  },
  mau_exceeded_modal: {
    title: 'MAU 한도를 초과했습니다. 플랜을 업그레이드하세요.',
    notification:
      '현재 MAU가 <planName/>의 한도를 초과했습니다. 로그토 서비스 중단을 피하기 위해 프리미엄으로 플랜을 업그레이드하세요.',
    update_plan: '플랜 업데이트',
  },
  payment_overdue_modal: {
    title: '청구서 지불 연체',
    notification:
      '이런! 테넌트 <span>{{name}}</span>의 청구서 결제에 실패했습니다. Logto 서비스 중단을 피하기 위해 즉시 청구서를 지불하십시오.',
    unpaid_bills: '미납 청구서',
    update_payment: '지불 업데이트',
  },
};

export default upsell;
