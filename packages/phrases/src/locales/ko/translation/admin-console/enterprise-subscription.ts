const enterprise_subscription = {
  page_title: '구독',
  title: '구독 관리',
  subtitle: '다중 테넌트 구독 및 청구 내역을 관리하기 위한 것입니다.',
  tab: {
    subscription: '구독',
    billing_history: '청구 내역',
  },
  subscription: {
    title: '구독',
    description: '사용량을 쉽게 추적하고 다음 청구서를 확인하며 원본 계약서를 검토하세요.',
    enterprise_plan_title: '엔터프라이즈 플랜',
    enterprise_plan_description:
      '이것은 당신의 엔터프라이즈 플랜 구독이며 이 할당량은 테넌트들 간에 공유됩니다. 사용량 업데이트가 약간 지연될 수 있습니다.',
    add_on_title: '사용량에 따른 추가 요금',
    add_on_description:
      '이것은 계약 혹은 Logto의 표준 사용량에 따른 요금에 기반한 추가 요금 아이템입니다. 실제 사용량에 따라 청구됩니다.',
    included: '포함됨',
    over_quota: '할당 초과',
    basic_plan_column_title: {
      product: '제품',
      usage: '사용량',
      quota: '할당량',
    },
    add_on_column_title: {
      product: '제품',
      unit_price: '단가',
      quantity: '수량',
      total_price: '합계',
    },
    add_on_sku_price: '${{price}}/월',
    private_region_title: '프라이빗 클라우드 인스턴스 ({{regionName}})',
    shared_cross_tenants: '테넌트에 걸쳐 있음',
  },
  user_subscriptions: {
    description: '선택한 테넌트와 관계없이 개인 구독 및 Enterprise 계약 할당량을 확인하세요.',
    personal_title: '개인 구독',
    personal_description: '과거 구독을 포함하여 계정에 청구되는 구독입니다.',
    enterprise_description:
      'Console SSO 할당량은 계약에 따라 정해지며 권한이 있는 관리자 간에 공유됩니다. 개인 구독은 별도로 청구됩니다.',
    allowance: '계약 할당량',
    quantity_price: '수량 × 단가',
    billing_period: '청구 기간',
    connectors: 'Console SSO 커넥터',
    no_connectors: '커넥터 없음',
    list_price_note:
      '표시 단가에는 세금, 할인 및 일할 계산 조정이 포함되지 않습니다. 다음 청구액이나 결제 금액이 아닙니다.',
    proration_note:
      'Console SSO 추가 및 삭제에 따른 일할 계산 조정은 정기 청구서에 반영됩니다. 마지막 유료 커넥터를 삭제하면 구독이 취소되고 정산됩니다.',
    overdue_note:
      '연속 3개 청구 기간 동안 미납되고 재시도가 소진되면 결제 수금이 일시 중지되고 유료 Console SSO 커넥터가 삭제됩니다. 결제 정보를 업데이트해도 설정은 복원되지 않습니다. 도움이 필요하면 문의하세요.',
    cancel_on: '{{date}}에 취소 예정',
    other_product: '기타 구독',
    status: {
      active: '활성',
      trialing: '체험 중',
      past_due: '연체',
      unpaid: '미납',
      canceled: '취소됨',
      incomplete: '미완료',
      incomplete_expired: '만료됨',
      paused: '일시 중지됨',
    },
  },
};

export default Object.freeze(enterprise_subscription);
