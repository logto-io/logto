const subscription = {
  free_plan: '무료 플랜',
  free_plan_description: '사이드 프로젝트 및 초기 Logto 평가에 적합합니다. 신용카드 불필요합니다.',
  hobby_plan: '취미 플랜',
  hobby_plan_description: '개인 개발자나 개발 환경에 적합합니다.',
  pro_plan: '프로 플랜',
  pro_plan_description: 'Logto를 사용하여 무료로 업그레이드할 수 있습니다.',
  enterprise: '기업',
  current_plan: '현재 플랜',
  current_plan_description:
    '현재 플랜입니다. 플랜 사용량, 다음 결제 정보를 확인하고 원하는 상위 플랜으로 업그레이드할 수 있습니다.',
  plan_usage: '플랜 사용량',
  plan_cycle: '플랜 주기: {{period}}. 사용량은 {{renewDate}}에 갱신됩니다.',
  next_bill: '다음 결제',
  next_bill_hint: '계산 관련 자세한 정보는 이 <a>글</a>을 참고하십시오.',
  next_bill_tip:
    '다음 달의 기준 가격 및 다양한 티어의 MAU 단가로 사용량을 곱한 비용이 포함된 다가오는 결제입니다.',
  manage_payment: '결제 관리',
  overfill_quota_warning:
    '할당량 한도에 도달하였습니다. 문제를 방지하기 위해 플랜을 업그레이드하세요.',
  upgrade_pro: '프로로 업그레이드',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    '결제 문제가 발생했습니다. 이전 주기에 대해 ${{price, number}}을 처리할 수 없습니다. Logto 서비스 중단을 피하려면 결제 정보를 업데이트하세요.',
  downgrade: '다운그레이드',
  current: '현재',
  buy_now: '지금 구매',
  contact_us: '문의하기',
  quota_table: {
    quota: {
      title: '할당량',
      tenant_limit: '테넌트 한도',
      base_price: '기본 가격',
      mau_unit_price: '* MAU 단가',
      mau_limit: 'MAU 한도',
    },
    application: {
      title: '애플리케이션',
      total: '전체',
      m2m: '기계 간',
    },
    resource: {
      title: 'API 리소스',
      resource_count: '리소스 개수',
      scopes_per_resource: '리소스 당 권한',
    },
    branding: {
      title: '브랜딩',
      custom_domain: '사용자 지정 도메인',
    },
    user_authn: {
      title: '사용자 인증',
      omni_sign_in: '옴니 간편 로그인',
      built_in_email_connector: '내장 이메일 연결자',
      social_connectors: '소셜 연결자',
      standard_connectors: '표준 연결자',
    },
    roles: {
      title: '역할',
      roles: '역할',
      scopes_per_role: '역할 당 권한',
    },
    audit_logs: {
      title: '감사 로그',
      retention: '유지 기간',
    },
    hooks: {
      title: '훅',
      amount: '개수',
    },
    support: {
      title: '지원',
      community: '커뮤니티',
      customer_ticket: '고객 지원 요청',
      premium: '프리미엄',
    },
    mau_unit_price_footnote:
      '* 실제로 사용한 리소스에 따라 단가가 변동할 수 있으며, Logto는 단가 변동에 대해 설명할 권한을 갖습니다.',
    unlimited: '무제한',
    contact: '문의하기',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '${{value, number}}/월',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '${{value, number}}/MAU',
    days_one: '{{count, number}}일',
    days_other: '{{count, number}}일',
    add_on: '애드온',
  },
  downgrade_form: {
    allowed_title: '정말 다운그레이드하시겠습니까?',
    allowed_description: '{{plan}}으로 다운그레이드하면 다음 혜택을 더 이상 사용할 수 없습니다.',
    not_allowed_title: '다운그레이드가 허용되지 않습니다',
    not_allowed_description:
      '{{plan}}으로 다운그레이드하기 전에 다음 요구 사항을 충족하는지 확인하세요. 요구 사항을 충족하게 되면 다운그레이드가 가능해집니다.',
    confirm_downgrade: '그래도 다운그레이드',
  },
};

export default subscription;
